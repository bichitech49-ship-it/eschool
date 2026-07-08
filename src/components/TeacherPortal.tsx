import React, { useState, useEffect } from "react";
import { 
  Users, BookOpen, Clipboard, Save, ArrowLeft, School, Check, AlertTriangle
} from "lucide-react";
import { Student, Teacher, SchoolClass, Subject, GradeRecord } from "../types";

interface TeacherPortalProps {
  onBack: () => void;
}

export default function TeacherPortal({ onBack }: TeacherPortalProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);

  // Selection states
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // Grade Inputs State
  // key: studentId, value: { ca1, ca2, exam }
  const [inputScores, setInputScores] = useState<{ [studentId: string]: { ca1: string; ca2: string; exam: string } }>({});
  const [isSaving, setIsSaving] = useState<string | null>(null); // studentId of what is currently saving
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const fetchInitialData = async () => {
    try {
      const [resT, resC, resSub, resS, resG] = await Promise.all([
        fetch("/api/teachers"),
        fetch("/api/classes"),
        fetch("/api/subjects"),
        fetch("/api/students"),
        fetch("/api/grades")
      ]);
      if (resT.ok) {
        const tList: Teacher[] = await resT.json();
        setTeachers(tList);
        // Default to first teacher for ease of demonstration
        if (tList.length > 0 && !selectedTeacher) {
          setSelectedTeacher(tList[0]);
        }
      }
      if (resC.ok) setClasses(await resC.json());
      if (resSub.ok) setSubjects(await resSub.json());
      if (resS.ok) setStudents(await resS.json());
      if (resG.ok) setGrades(await resG.json());
    } catch (err) {
      console.error("Error loading teacher portal data:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // When teacher, class, or subject changes, pre-fill the score inputs
  useEffect(() => {
    if (!selectedClassId || !selectedSubjectId) return;
    
    const prefill: typeof inputScores = {};
    const filteredStudents = students.filter(s => s.classId === selectedClassId);
    
    filteredStudents.forEach(stud => {
      const existingGrade = grades.find(g => 
        g.studentId === stud.id && 
        g.subjectId === selectedSubjectId && 
        g.term === "First Term"
      );
      prefill[stud.id] = {
        ca1: existingGrade ? String(existingGrade.ca1) : "0",
        ca2: existingGrade ? String(existingGrade.ca2) : "0",
        exam: existingGrade ? String(existingGrade.exam) : "0"
      };
    });
    setInputScores(prefill);
  }, [selectedClassId, selectedSubjectId, grades, students]);

  // When selected teacher changes, auto-select their first assigned class and subject
  useEffect(() => {
    if (selectedTeacher) {
      if (selectedTeacher.assignedClasses.length > 0) {
        setSelectedClassId(selectedTeacher.assignedClasses[0]);
      }
      if (selectedTeacher.assignedSubjects.length > 0) {
        setSelectedSubjectId(selectedTeacher.assignedSubjects[0]);
      }
    }
  }, [selectedTeacher]);

  const handleScoreChange = (studentId: string, field: 'ca1' | 'ca2' | 'exam', value: string) => {
    setInputScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveScore = async (studentId: string) => {
    const scores = inputScores[studentId];
    if (!scores) return;

    // Validate ranges
    const ca1Num = Number(scores.ca1) || 0;
    const ca2Num = Number(scores.ca2) || 0;
    const examNum = Number(scores.exam) || 0;

    if (ca1Num < 0 || ca1Num > 15) {
      alert("CA 1 score must be between 0 and 15");
      return;
    }
    if (ca2Num < 0 || ca2Num > 15) {
      alert("CA 2 score must be between 0 and 15");
      return;
    }
    if (examNum < 0 || examNum > 70) {
      alert("Exam score must be between 0 and 70");
      return;
    }

    setIsSaving(studentId);
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          subjectId: selectedSubjectId,
          classId: selectedClassId,
          ca1: ca1Num,
          ca2: ca2Num,
          exam: examNum,
          term: "First Term",
          session: "2025/2026"
        })
      });

      if (res.ok) {
        setSaveSuccess(studentId);
        // Refresh grades ledger from DB
        const resG = await fetch("/api/grades");
        if (resG.ok) setGrades(await resG.json());

        setTimeout(() => {
          setSaveSuccess(null);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(null);
    }
  };

  // Filter students based on selected class
  const classStudents = students.filter(s => s.classId === selectedClassId);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded-lg transition mr-1 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white rotate-45"></div>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">Teacher Portal</h1>
            <p className="text-[10px] text-slate-400 font-mono">Results Compilation & Assessment Workspace</p>
          </div>
        </div>
        
        {/* Quick Teacher Switcher */}
        {selectedTeacher && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold">Active Teacher:</span>
            <select 
              value={selectedTeacher.id}
              onChange={(e) => {
                const teach = teachers.find(t => t.id === e.target.value);
                if (teach) setSelectedTeacher(teach);
              }}
              className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-1.5 rounded focus:outline-none focus:border-blue-500"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Step 1: Selection Cards */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Assigned Class</label>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {selectedTeacher?.assignedClasses.map(cid => {
                const classObj = classes.find(c => c.id === cid);
                const isSelected = selectedClassId === cid;
                return (
                  <button
                    key={cid}
                    onClick={() => setSelectedClassId(cid)}
                    className={`p-3 text-xs font-semibold rounded-xl border text-center transition cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm' 
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {classObj ? classObj.name : cid}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Subject Assessment</label>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {selectedTeacher?.assignedSubjects.map(sid => {
                const subObj = subjects.find(s => s.id === sid);
                const isSelected = selectedSubjectId === sid;
                return (
                  <button
                    key={sid}
                    onClick={() => setSelectedSubjectId(sid)}
                    className={`p-3 text-xs font-semibold rounded-xl border text-center transition cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm' 
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {subObj ? subObj.name : sid}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Assessment compiling panel */}
        {selectedClassId && selectedSubjectId ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Continuous Assessment Sheet — <span className="text-blue-600">
                    {classes.find(c => c.id === selectedClassId)?.name}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Compiling scores for subject: <span className="font-semibold text-slate-700">{subjects.find(s => s.id === selectedSubjectId)?.name}</span>
                </p>
              </div>

              {/* Range Help banner */}
              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-[10px] text-slate-500 font-medium space-x-4 flex">
                <span>CA 1 Max: 15</span>
                <span>CA 2 Max: 15</span>
                <span>Exam Max: 70</span>
                <span className="font-bold text-slate-700">Total: 100</span>
              </div>
            </div>

            {/* Students Scores Input Sheet */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-3">Admission No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3 text-center">CA 1 (Max 15)</th>
                    <th className="p-3 text-center">CA 2 (Max 15)</th>
                    <th className="p-3 text-center">Exam (Max 70)</th>
                    <th className="p-3 text-center">Compiled Total</th>
                    <th className="p-3 text-center">WAEC Grade</th>
                    <th className="p-3 text-right">Commit / Save</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {classStudents.map(stud => {
                    const studentGrade = grades.find(g => 
                      g.studentId === stud.id && 
                      g.subjectId === selectedSubjectId && 
                      g.term === "First Term"
                    );

                    const inputs = inputScores[stud.id] || { ca1: "0", ca2: "0", exam: "0" };

                    // Live compiled total as the teacher types
                    const typingTotal = (Number(inputs.ca1) || 0) + (Number(inputs.ca2) || 0) + (Number(inputs.exam) || 0);

                    return (
                      <tr key={stud.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-600">{stud.admissionNo}</td>
                        <td className="p-3 font-semibold text-slate-800">{stud.name}</td>
                        
                        {/* CA 1 input */}
                        <td className="p-3 text-center">
                          <input 
                            type="number" min="0" max="15"
                            value={inputs.ca1}
                            onChange={(e) => handleScoreChange(stud.id, 'ca1', e.target.value)}
                            className="w-16 text-center text-xs p-2 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-mono font-semibold"
                          />
                        </td>

                        {/* CA 2 input */}
                        <td className="p-3 text-center">
                          <input 
                            type="number" min="0" max="15"
                            value={inputs.ca2}
                            onChange={(e) => handleScoreChange(stud.id, 'ca2', e.target.value)}
                            className="w-16 text-center text-xs p-2 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-mono font-semibold"
                          />
                        </td>

                        {/* Exam input */}
                        <td className="p-3 text-center">
                          <input 
                            type="number" min="0" max="70"
                            value={inputs.exam}
                            onChange={(e) => handleScoreChange(stud.id, 'exam', e.target.value)}
                            className="w-20 text-center text-xs p-2 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-mono font-semibold"
                          />
                        </td>

                        {/* Live Total */}
                        <td className="p-3 text-center font-mono font-bold text-sm">
                          <span className={typingTotal >= 50 ? 'text-blue-600 font-bold' : 'text-slate-700'}>
                            {typingTotal}
                          </span>
                        </td>

                        {/* Current Saved WAEC Grade Badge */}
                        <td className="p-3 text-center">
                          {studentGrade ? (
                            <div className="space-y-0.5">
                              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-bold">
                                {studentGrade.grade}
                              </span>
                              <span className="block text-[8px] text-slate-400 font-mono font-medium tracking-tight">({studentGrade.remark})</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px] font-mono">Not Rated</span>
                          )}
                        </td>

                        {/* Save Action */}
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleSaveScore(stud.id)}
                            disabled={isSaving === stud.id}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer transition ${
                              saveSuccess === stud.id 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                            }`}
                          >
                            {saveSuccess === stud.id ? (
                              <><Check className="w-4 h-4" /> Saved</>
                            ) : isSaving === stud.id ? (
                              "Saving..."
                            ) : (
                              <><Save className="w-3.5 h-3.5" /> Commit</>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {classStudents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">No students admitted in this class yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-800">
              <Clipboard className="w-5 h-5 mt-0.5 text-amber-700 shrink-0" />
              <div>
                <h4 className="font-bold">Term Broad-Sheet Compiling Guidelines</h4>
                <p className="mt-1 leading-relaxed">
                  Make sure to commit (click "Commit") each student's assessment scores independently. The system aggregates values, assigns corresponding WAEC-standard codes, and compiles they into student profiles so that parents and children can review results instantly inside their personal portals.
                </p>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-medium space-y-2">
            <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs">Select your assigned class and subject above to open continuous assessment compiling sheets.</p>
          </div>
        )}

      </main>
    </div>
  );
}

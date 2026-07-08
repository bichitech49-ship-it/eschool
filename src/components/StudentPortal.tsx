import React, { useState, useEffect } from "react";
import { 
  User, Award, BookOpen, Clock, CreditCard, ChevronRight, CheckCircle, 
  XCircle, Printer, School, ArrowLeft, RefreshCw, BarChart2, Star, FileText
} from "lucide-react";
import { Student, SchoolClass, Subject, GradeRecord, CBTQuiz, CBTQuizAttempt, FeeInvoice } from "../types";
import ReportSheetPreview from "./ReportSheetPreview";

interface StudentPortalProps {
  onBack: () => void;
}

export default function StudentPortal({ onBack }: StudentPortalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [quizzes, setQuizzes] = useState<CBTQuiz[]>([]);
  const [attempts, setAttempts] = useState<CBTQuizAttempt[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);

  // Active Tab
  const [activeSubTab, setActiveSubTab] = useState<'results' | 'cbt' | 'billing'>('results');

  // Report Card Modal State
  const [showReportPreview, setShowReportPreview] = useState(false);

  // CBT Test State
  const [activeQuiz, setActiveQuiz] = useState<CBTQuiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: number }>({});
  const [quizTimer, setQuizTimer] = useState(0);
  const [quizSubmittedResult, setQuizSubmittedResult] = useState<CBTQuizAttempt | null>(null);

  const fetchInitialData = async () => {
    try {
      const [resS, resC, resSub, resG, resQ, resA, resI] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/classes"),
        fetch("/api/subjects"),
        fetch("/api/grades"),
        fetch("/api/quizzes"),
        fetch("/api/attempts"),
        fetch("/api/invoices")
      ]);
      if (resS.ok) {
        const sList: Student[] = await resS.json();
        setStudents(sList);
        if (sList.length > 0 && !selectedStudent) {
          setSelectedStudent(sList[0]);
        }
      }
      if (resC.ok) setClasses(await resC.json());
      if (resSub.ok) setSubjects(await resSub.json());
      if (resG.ok) setGrades(await resG.json());
      if (resQ.ok) setQuizzes(await resQ.json());
      if (resA.ok) setAttempts(await resA.json());
      if (resI.ok) setInvoices(await resI.json());
    } catch (err) {
      console.error("Error loading student portal data:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Timer loop for CBT exams
  useEffect(() => {
    if (!activeQuiz || quizTimer <= 0) {
      if (activeQuiz && quizTimer === 0) {
        handleAutoSubmitQuiz();
      }
      return;
    }
    const timerId = setTimeout(() => {
      setQuizTimer(quizTimer - 1);
    }, 1000);
    return () => clearTimeout(timerId);
  }, [quizTimer, activeQuiz]);

  // Compute student-specific details
  const studentClass = classes.find(c => c.id === selectedStudent?.classId);
  const studentGrades = grades.filter(g => g.studentId === selectedStudent?.id);
  const studentInvoice = invoices.find(inv => inv.studentId === selectedStudent?.id);
  const studentQuizzes = quizzes.filter(q => q.classId === selectedStudent?.classId);
  const studentAttempts = attempts.filter(att => att.studentId === selectedStudent?.id);

  // Smart calculations for Position and Aggregate Average
  // We look at all students in the same class, find their total score across all subjects, 
  // then sort to find this student's class position!
  const getPositionDetails = () => {
    if (!selectedStudent || !selectedStudent.classId) return { position: "N/A", classAverage: 0, studentAverage: 0 };
    
    // Find all students in this class
    const classMates = students.filter(s => s.classId === selectedStudent.classId);
    
    // Compile total scores for each classmate
    const classmatesTotals = classMates.map(mate => {
      const mateGrades = grades.filter(g => g.studentId === mate.id && g.classId === selectedStudent.classId);
      const totalSum = mateGrades.reduce((sum, g) => sum + g.total, 0);
      const avg = mateGrades.length > 0 ? totalSum / mateGrades.length : 0;
      return { studentId: mate.id, totalSum, avg };
    });

    // Sort classmates by totalSum descending
    classmatesTotals.sort((a, b) => b.totalSum - a.totalSum);

    // Find index of selected student
    const rankIndex = classmatesTotals.findIndex(x => x.studentId === selectedStudent.id);
    const position = rankIndex !== -1 ? `${rankIndex + 1}${getOrdinalSuffix(rankIndex + 1)}` : "N/A";

    const selectedTotals = classmatesTotals.find(x => x.studentId === selectedStudent.id);
    const studentAverage = selectedTotals ? selectedTotals.avg : 0;

    // Calculate class average
    const classAverageSum = classmatesTotals.reduce((sum, x) => sum + x.avg, 0);
    const classAverage = classmatesTotals.length > 0 ? classAverageSum / classmatesTotals.length : 0;

    return {
      position,
      studentAverage,
      classAverage
    };
  };

  const getOrdinalSuffix = (num: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const { position, studentAverage, classAverage } = getPositionDetails();

  // CBT Handlers
  const handleStartQuiz = (quiz: CBTQuiz) => {
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setQuizTimer(quiz.durationMinutes * 60);
    setQuizSubmittedResult(null);
  };

  const handleSelectAnswer = (qId: string, optionIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [qId]: optionIndex
    }));
  };

  const handleAutoSubmitQuiz = () => {
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || !selectedStudent) return;

    // Calculate score
    let score = 0;
    activeQuiz.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswerIndex) {
        score++;
      }
    });

    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          quizId: activeQuiz.id,
          score,
          totalQuestions: activeQuiz.questions.length
        })
      });

      if (res.ok) {
        const attemptResult: CBTQuizAttempt = await res.json();
        setQuizSubmittedResult(attemptResult);
        setActiveQuiz(null);
        // Refresh attempts ledger
        const resA = await fetch("/api/attempts");
        if (resA.ok) setAttempts(await resA.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white py-4 px-6 flex justify-between items-center shadow-md border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="hover:bg-slate-800 text-blue-400 hover:text-white p-2 rounded-lg transition mr-1 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white rotate-45"></div>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">Student Portal</h1>
            <p className="text-[10px] text-slate-400 font-mono">My Terminal Academic Workspace</p>
          </div>
        </div>

        {/* Student selector switcher */}
        {selectedStudent && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold">Active Student:</span>
            <select 
              value={selectedStudent.id}
              onChange={(e) => {
                const stud = students.find(s => s.id === e.target.value);
                if (stud) {
                  setSelectedStudent(stud);
                  setQuizSubmittedResult(null);
                  setActiveQuiz(null);
                }
              }}
              className="bg-slate-800 border border-slate-700 focus:border-blue-500 text-white text-xs px-3 py-1.5 rounded focus:outline-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({classes.find(c => c.id === s.classId)?.name || s.classId})</option>
              ))}
            </select>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Profile Card & Highlight Summary */}
        {selectedStudent && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm grid md:grid-cols-3 gap-6 items-center">
            {/* Bio Column */}
            <div className="flex items-center gap-4 border-r border-slate-100 pr-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-slate-900 text-base leading-tight">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-500 font-mono tracking-wide font-medium">{selectedStudent.admissionNo}</p>
                <span className="inline-block bg-blue-50 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded">
                  {studentClass?.name || selectedStudent.classId}
                </span>
              </div>
            </div>

            {/* Attendance & Stats */}
            <div className="space-y-2 border-r border-slate-100 pr-6">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
                <span className="font-bold text-blue-600">{selectedStudent.attendanceRate}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${selectedStudent.attendanceRate}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium font-mono leading-tight">Minimum required rate for session: 85%</p>
            </div>

            {/* Term Summary Block */}
            <div className="flex justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class Position</span>
                <span className="text-xl font-bold text-slate-900 font-display flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {position}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Mark</span>
                <span className="text-xl font-bold text-slate-900 font-display">{studentAverage.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class Average</span>
                <span className="text-xl font-bold text-slate-900 font-display">{classAverage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tabs Navigation */}
        <div className="flex border-b border-slate-200 gap-4">
          <button 
            onClick={() => setActiveSubTab('results')}
            className={`pb-3 text-xs font-bold tracking-wider uppercase border-b-2 transition cursor-pointer ${
              activeSubTab === 'results' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Terminal Report Card
          </button>
          <button 
            onClick={() => setActiveSubTab('cbt')}
            className={`pb-3 text-xs font-bold tracking-wider uppercase border-b-2 transition cursor-pointer ${
              activeSubTab === 'cbt' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            CBT Exam Board ({studentQuizzes.length})
          </button>
          <button 
            onClick={() => setActiveSubTab('billing')}
            className={`pb-3 text-xs font-bold tracking-wider uppercase border-b-2 transition cursor-pointer ${
              activeSubTab === 'billing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Fees & Billing
          </button>
        </div>

        {/* Tab 1: Terminal Report Card Sheet */}
        {activeSubTab === 'results' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-5">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Official Progress Report Sheet</h3>
                <p className="text-xs text-slate-500">First Term Assessment Review — 2025/2026 Academic Session</p>
              </div>
              <button 
                onClick={() => setShowReportPreview(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-blue-500/10 cursor-pointer animate-pulse"
              >
                <Printer className="w-4 h-4" /> Preview & Download Report PDF
              </button>
            </div>

            {/* Results Grades Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4">Subject Name</th>
                    <th className="p-4 text-center">CA 1 Score (Max 15)</th>
                    <th className="p-4 text-center">CA 2 Score (Max 15)</th>
                    <th className="p-4 text-center">Exam Score (Max 70)</th>
                    <th className="p-4 text-center">Compiled Mark (100)</th>
                    <th className="p-4 text-center">Grade Standard</th>
                    <th className="p-4 text-right">Teacher Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {studentGrades.map(g => {
                    const subjectObj = subjects.find(s => s.id === g.subjectId);
                    return (
                      <tr key={g.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-semibold text-slate-800">{subjectObj ? subjectObj.name : g.subjectId}</td>
                        <td className="p-4 text-center font-mono">{g.ca1}</td>
                        <td className="p-4 text-center font-mono">{g.ca2}</td>
                        <td className="p-4 text-center font-mono">{g.exam}</td>
                        <td className="p-4 text-center font-mono font-bold text-sm text-slate-900">{g.total}</td>
                        <td className="p-4 text-center">
                          <span className="bg-blue-50 text-blue-800 font-bold text-xs px-2.5 py-1 rounded">
                            {g.grade}
                          </span>
                        </td>
                        <td className="p-4 text-right text-slate-500 italic font-normal">{g.remark}</td>
                      </tr>
                    );
                  })}
                  {studentGrades.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">No termly result records compiled yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary details bottom sheet */}
            <div className="bg-blue-50/40 border border-blue-100 p-5 rounded-xl flex items-start gap-3">
              <Award className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-blue-950">Principal's Summary Advice</h4>
                <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
                  Tunde shows commendable efforts this term. An outstanding grade in Mathematics ({studentGrades.find(g => g.subjectId === 'math')?.total || 83}%) proves excellent logical capability. Continue practicing active study models to maintain these standards across general subject sheets in successive terms.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: CBT Testing Board */}
        {activeSubTab === 'cbt' && (
          <div className="space-y-6">
            
            {/* Active Running Test Console */}
            {activeQuiz ? (
              <div className="bg-white border border-blue-300 rounded-2xl shadow-md p-6 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold uppercase font-mono">Exam in Progress</span>
                    <h3 className="font-display font-bold text-slate-900 text-base mt-1">{activeQuiz.title}</h3>
                  </div>

                  <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl flex items-center gap-2 text-rose-700 font-mono font-bold text-sm">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span>
                      {Math.floor(quizTimer / 60)}:{String(quizTimer % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Questions render */}
                <div className="space-y-6">
                  {activeQuiz.questions.map((q, idx) => (
                    <div key={q.id} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-800">Question {idx + 1}: {q.text}</p>
                      
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, oIdx) => {
                          const isChecked = quizAnswers[q.id] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleSelectAnswer(q.id, oIdx)}
                              className={`p-3 text-xs font-semibold rounded-lg border text-left flex items-center justify-between transition cursor-pointer ${
                                isChecked 
                                  ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold' 
                                  : 'bg-white border-slate-200 hover:bg-slate-100/50 text-slate-700'
                              }`}
                            >
                              <span>{opt}</span>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isChecked ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                              }`}>
                                {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleSubmitQuiz}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-lg shadow-md cursor-pointer"
                  >
                    Finish & Submit Examination
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Available CBT list */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-slate-900">Available Exams & Quizzes</h3>
                      <p className="text-xs text-slate-500">Take examinations designed for your class.</p>
                    </div>
 
                    <div className="space-y-3">
                      {studentQuizzes.map(q => {
                        const hasTaken = studentAttempts.find(att => att.quizId === q.id);
                        return (
                          <div key={q.id} className="p-4 border border-slate-100 rounded-xl flex justify-between items-center bg-slate-50/50 hover:bg-white hover:shadow-md transition">
                            <div className="space-y-1">
                              <span className="text-[10px] text-blue-600 font-bold uppercase font-mono">{subjects.find(sub => sub.id === q.subjectId)?.name || q.subjectId}</span>
                              <h4 className="text-xs font-bold text-slate-800">{q.title}</h4>
                              <div className="flex gap-4 text-[10px] text-slate-400 font-mono font-medium">
                                <span>Duration: {q.durationMinutes} mins</span>
                                <span>Questions: {q.questions.length} Questions</span>
                              </div>
                            </div>
 
                            {hasTaken ? (
                              <div className="text-right">
                                <span className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-bold block">Submitted</span>
                                <span className="text-[10px] font-semibold text-blue-600 mt-1 block">Score: {hasTaken.score}/{hasTaken.totalQuestions}</span>
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleStartQuiz(q)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1 cursor-pointer"
                              >
                                Launch Exam <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Performance Analytics sidebar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900">Exam Results Archive</h3>
                    <p className="text-[11px] text-slate-500 font-medium">History of Computer Based Tests submitted.</p>
                  </div>

                  <div className="space-y-2">
                    {studentAttempts.map(att => {
                      const quizObj = quizzes.find(q => q.id === att.quizId);
                      const pct = Math.round((att.score / att.totalQuestions) * 100);
                      return (
                        <div key={att.id} className="p-3 border border-slate-50 bg-slate-50/50 rounded-lg flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-400 font-mono block">{att.takenAt.split("T")[0]}</span>
                            <h4 className="text-[11px] font-bold text-slate-700 truncate max-w-[140px]">{quizObj ? quizObj.title : att.quizId}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-blue-600">{att.score}/{att.totalQuestions}</span>
                            <span className="block text-[9px] text-slate-400 font-mono">({pct}%)</span>
                          </div>
                        </div>
                      );
                    })}
                    {studentAttempts.length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs font-medium space-y-2">
                        <Clock className="w-6 h-6 text-slate-300 mx-auto" />
                        <p>No examinations taken yet.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Quiz submitted visual details */}
            {quizSubmittedResult && (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 text-center space-y-4 max-w-xl mx-auto">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-emerald-950 text-base">Examination Submitted Successfully!</h4>
                  <p className="text-xs text-emerald-700">Your score has been registered on the server.</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-100 inline-block">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Compiled Score</span>
                  <span className="text-3xl font-display font-bold text-emerald-600">
                    {quizSubmittedResult.score} / {quizSubmittedResult.totalQuestions}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                    ({Math.round((quizSubmittedResult.score / quizSubmittedResult.totalQuestions) * 100)}% Grade Point)
                  </span>
                </div>

                <button 
                  onClick={() => setQuizSubmittedResult(null)}
                  className="block mx-auto text-xs font-bold text-emerald-800 hover:underline"
                >
                  Return to CBT Board
                </button>
              </div>
            )}

          </div>
        )}

        {/* Tab 3: Fees & Billing Invoices */}
        {activeSubTab === 'billing' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">Invoices & Financial Summary</h3>
              <p className="text-xs text-slate-500">Track and pay termly school billing invoices securely.</p>
            </div>

            {studentInvoice ? (
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Invoice card (col 1) */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider font-mono">School Fees invoice</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        studentInvoice.status === 'Paid' ? 'bg-blue-600 text-white' :
                        studentInvoice.status === 'Partially Paid' ? 'bg-amber-500 text-white' :
                        'bg-rose-500 text-white'
                      }`}>{studentInvoice.status}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold block">Total Invoiced Amount</span>
                      <span className="text-2xl font-bold font-display">₦{studentInvoice.amount.toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 border-t border-slate-800 pt-3">
                      <div>
                        <span>Paid amount</span>
                        <span className="block text-white font-mono font-bold">₦{studentInvoice.paidAmount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span>Pending Balance</span>
                        <span className="block text-white font-mono font-bold">₦{studentInvoice.balance.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-500 font-mono pt-6">Invoice Due Date: {studentInvoice.dueDate}</p>
                </div>

                {/* Payments Ledger list (cols 2) */}
                <div className="md:col-span-2 border border-slate-100 rounded-xl p-4 sm:p-6 space-y-4 bg-slate-50/50">
                  <h4 className="font-display font-semibold text-slate-800 text-sm">Receipts & Payment History</h4>
                  
                  <div className="space-y-2">
                    {studentInvoice.payments.map(pay => (
                      <div key={pay.id} className="bg-white border border-slate-50 p-3 rounded-lg flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[9px] text-slate-400 font-semibold">{pay.reference}</span>
                          <span className="block font-semibold text-slate-700">{pay.paymentMethod}</span>
                          <span className="block text-[9px] text-slate-400 font-mono">{pay.date}</span>
                        </div>
                        <div className="text-right space-y-1">
                          <span className="font-mono font-bold text-slate-900 block">₦{pay.amount.toLocaleString()}</span>
                          <span className="bg-blue-50 text-blue-800 text-[8px] font-bold px-1.5 py-0.5 rounded">SUCCESS</span>
                        </div>
                      </div>
                    ))}
                    {studentInvoice.payments.length === 0 && (
                      <div className="text-center py-12 text-slate-400 text-xs font-medium">No payments received for this invoice yet. Payments can be authorized from Admin Portal.</div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">No fee invoices found for your profile.</div>
            )}
          </div>
        )}

      </main>

      {showReportPreview && selectedStudent && (
        <ReportSheetPreview 
          student={selectedStudent}
          classes={classes}
          subjects={subjects}
          grades={grades}
          students={students}
          onClose={() => setShowReportPreview(false)}
        />
      )}
    </div>
  );
}

import React from "react";
import { X, Printer, Download, Award, Calendar, CheckSquare, User, FileText, CheckCircle2 } from "lucide-react";
import { Student, SchoolClass, Subject, GradeRecord } from "../types";

interface ReportSheetPreviewProps {
  student: Student;
  classes: SchoolClass[];
  subjects: Subject[];
  grades: GradeRecord[];
  students: Student[];
  onClose: () => void;
}

export default function ReportSheetPreview({ 
  student, 
  classes, 
  subjects, 
  grades, 
  students, 
  onClose 
}: ReportSheetPreviewProps) {
  
  // Find current student's class
  const studentClass = classes.find(c => c.id === student.classId);
  
  // Get all grades for this student
  const studentGrades = grades.filter(g => g.studentId === student.id);
  
  // Filter other classmates to do ranks and averages
  const classmates = students.filter(s => s.classId === student.classId);
  
  // Calculate rankings and averages
  const getRankDetails = () => {
    if (classmates.length === 0) return { position: "1st", classAverage: 0, studentAverage: 0, totalScore: 0, maxPossible: 0 };
    
    const totalsList = classmates.map(mate => {
      const mateGrades = grades.filter(g => g.studentId === mate.id && g.classId === student.classId);
      const totalSum = mateGrades.reduce((sum, g) => sum + g.total, 0);
      const avg = mateGrades.length > 0 ? totalSum / mateGrades.length : 0;
      return { studentId: mate.id, totalSum, avg, count: mateGrades.length };
    });
    
    // Sort descending by average
    totalsList.sort((a, b) => b.avg - a.avg);
    
    const rankIndex = totalsList.findIndex(x => x.studentId === student.id);
    const positionNum = rankIndex !== -1 ? rankIndex + 1 : 1;
    
    // Format ordinal suffix
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    
    const currentTotals = totalsList.find(x => x.studentId === student.id);
    const totalScore = currentTotals ? currentTotals.totalSum : 0;
    const studentAverage = currentTotals ? Math.round(currentTotals.avg * 10) / 10 : 0;
    
    const classAvgSum = totalsList.reduce((sum, x) => sum + x.avg, 0);
    const classAverage = totalsList.length > 0 ? Math.round((classAvgSum / totalsList.length) * 10) / 10 : 0;
    
    const maxPossible = (currentTotals ? currentTotals.count : 0) * 100;

    return {
      position: getOrdinal(positionNum),
      classAverage,
      studentAverage,
      totalScore,
      maxPossible
    };
  };

  const { position, classAverage, studentAverage, totalScore, maxPossible } = getRankDetails();

  // Pseudo-stable ratings for Affective Traits based on student id
  const getTraitRating = (traitSeed: string, min = 3, max = 5) => {
    let hash = 0;
    const str = student.id + traitSeed;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const val = Math.abs(hash % (max - min + 1)) + min;
    return val;
  };

  const traits = [
    { name: "Punctuality & Promptness", value: getTraitRating("punctual", 3, 5) },
    { name: "Personal Neatness & Hygiene", value: getTraitRating("neat", 4, 5) },
    { name: "Honesty & Reliability", value: getTraitRating("honest", 3, 5) },
    { name: "Politeness & Consideration", value: getTraitRating("polite", 4, 5) },
    { name: "Relationship with Peers", value: getTraitRating("peers", 3, 5) },
    { name: "Attentiveness in Class", value: getTraitRating("attentiveness", 3, 5) },
    { name: "Leadership & Responsibility", value: getTraitRating("leadership", 2, 5) },
    { name: "Spirit of Cooperation", value: getTraitRating("cooperation", 4, 5) }
  ];

  // Helper for rendering rating stars/bars
  const renderRatingMeter = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(num => (
          <div 
            key={num} 
            className={`w-5 h-2 rounded-sm border transition-all ${
              num <= rating 
                ? 'bg-blue-600 border-blue-600 print:bg-blue-600 print:border-blue-600' 
                : 'bg-slate-100 border-slate-200 print:bg-slate-100 print:border-slate-200'
            }`}
          />
        ))}
      </div>
    );
  };

  // Trigger print dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 sm:p-6 md:p-10 print:p-0 print:bg-white print:static print:overflow-visible">
      
      {/* Outer Card with controls at top */}
      <div className="bg-slate-100 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/80 print:shadow-none print:border-none print:rounded-none print:bg-white print:w-full">
        
        {/* Controls - Hidden during Printing */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center print:hidden shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="font-display font-bold text-sm tracking-tight">Report Sheet PDF Engine & Print Centre</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Download / Print PDF
            </button>
            <button 
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl transition cursor-pointer"
              aria-label="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Report Sheet Body */}
        <div className="bg-white p-8 sm:p-12 space-y-8 print:p-0 print:m-0 print:shadow-none">
          
          {/* 1. Official Letterhead Header */}
          <div className="border-b-4 border-double border-blue-950 pb-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6 print:border-blue-950 print:pb-6 print:flex-row print:justify-between print:text-left print:gap-4">
            <div className="flex items-center gap-4 flex-col md:flex-row print:flex-row">
              <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-700/10 shrink-0 print:w-16 print:h-16 print:bg-blue-700 print:shadow-none print:rounded-xl">
                <div className="w-8 h-8 border-4 border-white rotate-45"></div>
              </div>
              <div className="space-y-1">
                <h2 className="font-display font-black text-2xl tracking-tight text-slate-900 leading-none">
                  EDU<span className="text-blue-600">PORTAL</span> NIGERIA
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                  Continuous Assessment Academic Record Sheet
                </p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                  Yaba Technology Hub, Herbert Macaulay Way, Lagos, Nigeria<br />
                  <span className="font-mono text-[10px]">support@eschool-ng.com • +234 812 345 6789</span>
                </p>
              </div>
            </div>
            
            <div className="text-center md:text-right font-mono space-y-1 bg-slate-50 border border-slate-100 p-3 rounded-xl min-w-[180px] print:bg-transparent print:border-none print:p-0 print:text-right print:min-w-0">
              <span className="bg-blue-100 text-blue-900 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider block w-fit mx-auto md:ml-auto print:inline-block">
                OFFICIAL RECORD
              </span>
              <p className="text-xs font-bold text-slate-800 mt-1">Ref: {student.admissionNo}</p>
              <p className="text-[9px] text-slate-400 font-medium">Session: 2025/2026</p>
              <p className="text-[9px] text-slate-400 font-medium">Term: First Term</p>
            </div>
          </div>

          {/* 2. Student Information Metadata Panel */}
          <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl print:bg-transparent print:border-slate-300 print:p-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-3 border-b border-slate-200 pb-1.5 print:mb-2">
              Student Profile & Class Records
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-xs print:grid-cols-4 print:gap-y-3">
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Full Name</span>
                <span className="font-bold text-slate-800">{student.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Admission Number</span>
                <span className="font-bold font-mono text-slate-900">{student.admissionNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Class / Stream</span>
                <span className="font-bold text-blue-700">{studentClass?.name || student.classId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Attendance Rate</span>
                <span className="font-bold text-emerald-600">{student.attendanceRate}% Attendance</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Class Position</span>
                <span className="font-extrabold text-blue-800 text-sm font-display">{position} of {classmates.length}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Student Average</span>
                <span className="font-bold text-slate-800">{studentAverage}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Class Average</span>
                <span className="font-bold text-slate-800">{classAverage}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Total Marks Obtained</span>
                <span className="font-bold text-slate-800">{totalScore} / {maxPossible}</span>
              </div>
            </div>
          </div>

          {/* 3. Terminal Academic Score Board */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-2 print:border-slate-300">
              Terminal Subject Performance Assessment
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl print:border-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 print:bg-slate-50 print:border-slate-300">
                    <th className="p-3">Subject Name</th>
                    <th className="p-3 text-center">CA 1 (15)</th>
                    <th className="p-3 text-center">CA 2 (15)</th>
                    <th className="p-3 text-center">Exam (70)</th>
                    <th className="p-3 text-center">Total (100)</th>
                    <th className="p-3 text-center">Grade</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                  {studentGrades.map(g => {
                    const subjectObj = subjects.find(s => s.id === g.subjectId);
                    const isPass = g.total >= 40;
                    return (
                      <tr key={g.id} className="hover:bg-slate-50/50 print:hover:bg-transparent">
                        <td className="p-3 font-semibold text-slate-900">{subjectObj ? subjectObj.name : g.subjectId}</td>
                        <td className="p-3 text-center font-mono text-slate-500">{g.ca1}</td>
                        <td className="p-3 text-center font-mono text-slate-500">{g.ca2}</td>
                        <td className="p-3 text-center font-mono text-slate-500">{g.exam}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-900 text-sm">{g.total}</td>
                        <td className="p-3 text-center font-bold">
                          <span className={`px-2 py-0.5 rounded font-mono text-xs ${
                            g.grade.startsWith('A') || g.grade.startsWith('B')
                              ? 'text-blue-700 bg-blue-50 print:text-blue-900 print:bg-transparent'
                              : g.grade.startsWith('C')
                              ? 'text-slate-700 bg-slate-50 print:text-slate-800 print:bg-transparent'
                              : 'text-rose-700 bg-rose-50 print:text-rose-900 print:bg-transparent'
                          }`}>
                            {g.grade}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                            isPass ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {isPass ? "PASS" : "FAIL"}
                          </span>
                        </td>
                        <td className="p-3 text-right text-slate-500 italic font-normal">{g.remark}</td>
                      </tr>
                    );
                  })}
                  {studentGrades.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                        No examination records found for this termly reporting sheet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Behavioral Ratings and Legend Layout */}
          <div className="grid md:grid-cols-12 gap-8 items-start print:grid-cols-12 print:gap-4">
            
            {/* Traits (8 columns) */}
            <div className="md:col-span-7 space-y-3 print:col-span-7">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-1.5 print:border-slate-300">
                Affective Development & Behavioral Appraisal
              </h4>
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/40 print:border-slate-300 print:bg-transparent">
                {traits.map(t => (
                  <div key={t.name} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600 print:text-slate-800">{t.name}</span>
                    {renderRatingMeter(t.value)}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend & Grading Key (5 columns) */}
            <div className="md:col-span-5 space-y-3 print:col-span-5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-1.5 print:border-slate-300">
                Grading Key Legend
              </h4>
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 grid grid-cols-2 gap-2 text-[10px] font-mono print:border-slate-300 print:bg-transparent">
                <div>
                  <span className="font-bold text-blue-700">A1 Excellent:</span> 75 - 100
                </div>
                <div>
                  <span className="font-bold text-blue-700">B2 V. Good:</span> 70 - 74
                </div>
                <div>
                  <span className="font-bold text-blue-700">B3 Good:</span> 65 - 69
                </div>
                <div>
                  <span className="font-bold text-slate-700">C4 Credit:</span> 60 - 64
                </div>
                <div>
                  <span className="font-bold text-slate-700">C5 Credit:</span> 55 - 59
                </div>
                <div>
                  <span className="font-bold text-slate-700">C6 Credit:</span> 50 - 54
                </div>
                <div>
                  <span className="font-bold text-slate-600">D7 Pass:</span> 45 - 49
                </div>
                <div>
                  <span className="font-bold text-slate-600">E8 Pass:</span> 40 - 44
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-rose-600">F9 Fail:</span> 0 - 39
                </div>
              </div>
            </div>

          </div>

          {/* 5. Remarks & Principal Seal Authority Block */}
          <div className="border-t border-slate-200 pt-6 grid md:grid-cols-2 gap-8 print:border-slate-300 print:pt-4 print:grid-cols-2 print:gap-4">
            
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Class Teacher's Appraisal & Comments
                </h4>
                <p className="text-xs text-slate-700 border-b border-slate-200 border-dashed pb-3 leading-relaxed print:text-slate-900 print:border-slate-300">
                  {studentAverage >= 75 
                    ? "An outstanding performance! The student shows phenomenal grasp of logical and analytical subjects. Maintain this high academic rigor."
                    : studentAverage >= 50
                    ? "A commendable and passing standard of assessment. With consistent study schedules and targeted revisions, an upgrade is highly possible."
                    : "The student needs critical academic support and intensive monitoring on assignments and practice sheets in the succeeding term."
                  }
                </p>
              </div>
              
              <div className="flex justify-between items-end pt-4">
                <div>
                  <div className="h-6 font-display italic text-sm text-slate-400">Emeka Obi</div>
                  <div className="w-36 border-t border-slate-400 font-mono text-[9px] text-slate-400 uppercase tracking-wider pt-1">
                    Teacher's Signature
                  </div>
                </div>
                <div className="text-slate-400 font-mono text-[9px]">Date: 10/12/2025</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Principal's General Council Assessment
                </h4>
                <p className="text-xs text-slate-700 border-b border-slate-200 border-dashed pb-3 leading-relaxed print:text-slate-900 print:border-slate-300">
                  {studentAverage >= 75 
                    ? "Approved with distinction. Commendable behavioral index. Bestowed standard first-class honor certificates of performance."
                    : studentAverage >= 50
                    ? "Approved and promoted. Continue striving for peak potential in subsequent semesters."
                    : "The student has been recommended for academic tutoring programs prior to next promotional assessments."
                  }
                </p>
              </div>

              <div className="flex justify-between items-end pt-4">
                <div className="relative">
                  {/* Pseudo School stamp */}
                  <div className="absolute -top-10 left-12 w-16 h-16 rounded-full border-4 border-blue-600/20 flex items-center justify-center font-display font-bold text-[8px] uppercase rotate-12 text-blue-600/30 select-none print:border-blue-600/20 print:text-blue-600/30">
                    <div className="text-center leading-none">
                      APPROVED<br />EDUPORTAL
                    </div>
                  </div>
                  <div className="h-6 font-display italic text-sm text-slate-400">Principal</div>
                  <div className="w-36 border-t border-slate-400 font-mono text-[9px] text-slate-400 uppercase tracking-wider pt-1">
                    Principal's Approval Seal
                  </div>
                </div>
                <div className="text-slate-400 font-mono text-[9px]">Date: 12/12/2025</div>
              </div>
            </div>

          </div>

          {/* 6. Legal / Regulatory Bottom Disclaimer - Print Footer */}
          <div className="text-center text-[9px] text-slate-400 font-medium font-mono border-t border-slate-100 pt-6 print:border-slate-300 print:pt-4">
            Official assessment record of EDUPORTAL NG. All records compiled in accordance with standard NERDC curriculum frameworks. For verification, please call support center or scan official barcode directories.
          </div>

        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect } from "react";
import { 
  User, Link, Search, CreditCard, Bell, Mail, ArrowLeft, School, 
  CheckCircle, ShieldCheck, Heart, Award, Star, MessageSquare, Printer
} from "lucide-react";
import { Student, SchoolClass, Subject, GradeRecord, FeeInvoice, Announcement } from "../types";
import ReportSheetPreview from "./ReportSheetPreview";

interface ParentPortalProps {
  onBack: () => void;
}

export default function ParentPortal({ onBack }: ParentPortalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [notices, setNotices] = useState<Announcement[]>([]);

  // Linked Child State
  const [linkedChild, setLinkedChild] = useState<Student | null>(null);
  const [searchAdmNo, setSearchAdmNo] = useState("");
  const [searchError, setSearchError] = useState("");

  // Report Card Modal State
  const [showReportPreview, setShowReportPreview] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [resS, resC, resSub, resG, resI, resN] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/classes"),
        fetch("/api/subjects"),
        fetch("/api/grades"),
        fetch("/api/invoices"),
        fetch("/api/announcements")
      ]);
      if (resS.ok) {
        const sList: Student[] = await resS.json();
        setStudents(sList);
        // Pre-link first student (Tunde Bakare) to avoid blank-screen landing on demo launch
        if (sList.length > 0) {
          setLinkedChild(sList[0]);
        }
      }
      if (resC.ok) setClasses(await resC.json());
      if (resSub.ok) setSubjects(await resSub.json());
      if (resG.ok) setGrades(await resG.json());
      if (resI.ok) setInvoices(await resI.json());
      if (resN.ok) setNotices(await resN.json());
    } catch (err) {
      console.error("Error loading parent portal data:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleLinkChild = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    const found = students.find(s => s.admissionNo.trim().toUpperCase() === searchAdmNo.trim().toUpperCase());
    if (found) {
      setLinkedChild(found);
      setSearchAdmNo("");
    } else {
      setSearchError("No student found with that Admission Number. Please verify format (e.g., ES/2026/001).");
    }
  };

  // Linked child data compiling
  const childClass = classes.find(c => c.id === linkedChild?.classId);
  const childGrades = grades.filter(g => g.studentId === linkedChild?.id);
  const childInvoice = invoices.find(inv => inv.studentId === linkedChild?.id);
  const parentNotices = notices.filter(n => n.category === 'Parents' || n.category === 'General');

  // Class Position & Average Logic
  const getPositionDetails = () => {
    if (!linkedChild) return { position: "N/A", studentAverage: 0 };
    
    const classMates = students.filter(s => s.classId === linkedChild.classId);
    const classmatesTotals = classMates.map(mate => {
      const mateGrades = grades.filter(g => g.studentId === mate.id && g.classId === linkedChild.classId);
      const totalSum = mateGrades.reduce((sum, g) => sum + g.total, 0);
      const avg = mateGrades.length > 0 ? totalSum / mateGrades.length : 0;
      return { studentId: mate.id, totalSum, avg };
    });

    classmatesTotals.sort((a, b) => b.totalSum - a.totalSum);
    const rankIndex = classmatesTotals.findIndex(x => x.studentId === linkedChild.id);
    const position = rankIndex !== -1 ? `${rankIndex + 1}${getOrdinalSuffix(rankIndex + 1)}` : "N/A";
    const selectedTotals = classmatesTotals.find(x => x.studentId === linkedChild.id);
    const studentAverage = selectedTotals ? selectedTotals.avg : 0;

    return { position, studentAverage };
  };

  const getOrdinalSuffix = (num: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const { position, studentAverage } = getPositionDetails();

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
            <h1 className="font-display font-bold text-lg leading-tight">Parent Portal</h1>
            <p className="text-[10px] text-slate-400 font-mono">Real-Time Academic Tracker & Receipts Portal</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs block font-semibold text-slate-200">Linked Account</span>
          <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Parent View</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Row 1: Search & Link Child (Always available) */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm grid md:grid-cols-2 gap-6 items-center">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
              <Link className="w-4 h-4 text-blue-600" /> Link Your Child Account
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Enter your child's unique admission number provided on their physical fee invoice or circular sheet to download reports.
            </p>
          </div>

          <form onSubmit={handleLinkChild} className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" required
                  value={searchAdmNo}
                  onChange={(e) => setSearchAdmNo(e.target.value)}
                  placeholder="e.g. ES/2026/001"
                  className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 rounded-xl transition cursor-pointer"
              >
                Track Child
              </button>
            </div>
            {searchError && <p className="text-[10px] font-bold text-rose-600">{searchError}</p>}
          </form>
        </div>

        {/* Linked child content */}
        {linkedChild ? (
          <div className="space-y-6">
            
            {/* Child Profile Banner */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                  <User className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-display font-bold text-slate-900 text-base">{linkedChild.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">Admission No: {linkedChild.admissionNo} | Gender: {linkedChild.gender}</p>
                  <span className="inline-block bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1">
                    Class: {childClass?.name}
                  </span>
                </div>
              </div>

              {/* Attendance Block */}
              <div className="space-y-2 w-full md:w-48">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">Child's Attendance</span>
                  <span className="font-bold text-blue-600">{linkedChild.attendanceRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${linkedChild.attendanceRate}%` }}></div>
                </div>
                <p className="text-[9px] text-slate-400 font-medium">Synced today at 8:00 AM</p>
              </div>

              {/* Position and aggregate */}
              <div className="flex gap-6">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Aggregate Position</span>
                  <span className="text-lg font-bold text-slate-900 font-display flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {position}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Average Score</span>
                  <span className="text-lg font-bold text-slate-900 font-display">{studentAverage.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Split layout: Academic reports vs Invoices and notices */}
            <div className="grid lg:grid-cols-12 gap-6">
              
              {/* Report card compiler (cols 8) */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">Academic Progress Record Sheet</h3>
                    <p className="text-xs text-slate-500">Current First Term Continuous Assessment breakdown.</p>
                  </div>
                  <button 
                    onClick={() => setShowReportPreview(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Reportsheet Preview & PDF
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                        <th className="p-3">Subject</th>
                        <th className="p-3 text-center">CA 1 (15)</th>
                        <th className="p-3 text-center">CA 2 (15)</th>
                        <th className="p-3 text-center">Exam (70)</th>
                        <th className="p-3 text-center">Total (100)</th>
                        <th className="p-3 text-right">WAEC Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {childGrades.map(g => {
                        const subjectObj = subjects.find(s => s.id === g.subjectId);
                        return (
                          <tr key={g.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-800">{subjectObj ? subjectObj.name : g.subjectId}</td>
                            <td className="p-3 text-center font-mono">{g.ca1}</td>
                            <td className="p-3 text-center font-mono">{g.ca2}</td>
                            <td className="p-3 text-center font-mono">{g.exam}</td>
                            <td className="p-3 text-center font-mono font-bold">{g.total}</td>
                            <td className="p-3 text-right">
                              <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                {g.grade}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {childGrades.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">No results compiled for your child yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Billing Invoice & Notices (cols 4) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* School fee invoice status */}
                {childInvoice ? (
                  <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <h4 className="font-display font-semibold text-xs text-slate-400">School Invoices Summary</h4>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        childInvoice.status === 'Paid' ? 'bg-blue-600 text-white' : 'bg-rose-500 text-white'
                      }`}>{childInvoice.status}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block">Total Term Fees Invoiced</span>
                      <span className="text-xl font-bold font-display">₦{childInvoice.amount.toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                      <div>
                        <span>Amount Paid</span>
                        <span className="block text-white font-mono font-bold">₦{childInvoice.paidAmount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span>Balance Due</span>
                        <span className="block text-white font-mono font-bold text-rose-400">₦{childInvoice.balance.toLocaleString()}</span>
                      </div>
                    </div>

                    {childInvoice.balance > 0 && (
                      <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-[10px] text-amber-300 font-medium">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                        <span>Bring cash receipt to administration to credit.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs font-medium">No fee invoices found.</div>
                )}

                {/* Circular announcements */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="border-b border-slate-50 pb-2 flex justify-between items-center">
                    <h4 className="font-display font-semibold text-slate-900 text-sm">Parents circulars</h4>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono">PTA News</span>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto">
                    {parentNotices.map(n => (
                      <div key={n.id} className="p-3 border border-slate-50 bg-slate-50/50 rounded-lg space-y-1.5 hover:bg-slate-50 transition">
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                          <span>{n.category}</span>
                          <span>{n.date}</span>
                        </div>
                        <h5 className="font-bold text-slate-800 text-[11px] leading-tight">{n.title}</h5>
                        <p className="text-[10px] text-slate-500 leading-normal line-clamp-3">{n.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-medium space-y-2">
            <User className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs">Link your child's profile using their unique Admission Number (e.g. ES/2026/001) to begin tracking reports.</p>
          </div>
        )}

      </main>

      {showReportPreview && linkedChild && (
        <ReportSheetPreview 
          student={linkedChild}
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

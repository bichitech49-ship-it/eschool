import React, { useState, useEffect } from "react";
import { 
  Users, BookOpen, CreditCard, Bell, Mail, Plus, Trash2, 
  DollarSign, Check, Eye, School, ShieldAlert, ArrowLeft, Printer
} from "lucide-react";
import { Student, Teacher, SchoolClass, Subject, FeeInvoice, Announcement, ContactMessage, GradeRecord } from "../types";
import ReportSheetPreview from "./ReportSheetPreview";

interface AdminPortalProps {
  onBack: () => void;
}

export default function AdminPortal({ onBack }: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'fees' | 'notices' | 'inquiries'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);

  // Report Card Modal State
  const [activeReportStudent, setActiveReportStudent] = useState<Student | null>(null);

  // Form States
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "", gender: "Male", classId: "", parentName: "", parentEmail: "", parentPhone: ""
  });

  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: "", email: "", phone: "", qualification: "", assignedClasses: [] as string[], assignedSubjects: [] as string[]
  });

  const [showAddNotice, setShowAddNotice] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: "", content: "", category: "General" as 'General' | 'Parents' | 'Teachers' | 'Students'
  });

  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");

  // Fetch all DB details
  const fetchAll = async () => {
    try {
      const [resS, resT, resC, resSub, resI, resN, resInq, resG] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/teachers"),
        fetch("/api/classes"),
        fetch("/api/subjects"),
        fetch("/api/invoices"),
        fetch("/api/announcements"),
        fetch("/api/contact"),
        fetch("/api/grades")
      ]);
      if (resS.ok) setStudents(await resS.json());
      if (resT.ok) setTeachers(await resT.json());
      if (resC.ok) setClasses(await resC.json());
      if (resSub.ok) setSubjects(await resSub.json());
      if (resI.ok) setInvoices(await resI.json());
      if (resN.ok) setNotices(await resN.json());
      if (resInq.ok) setInquiries(await resInq.json());
      if (resG.ok) setGrades(await resG.json());
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Form Handlers
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.classId) return;
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent)
      });
      if (res.ok) {
        setShowAddStudent(false);
        setNewStudent({ name: "", gender: "Male", classId: "", parentName: "", parentEmail: "", parentPhone: "" });
        fetchAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.email) return;
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeacher)
      });
      if (res.ok) {
        setShowAddTeacher(false);
        setNewTeacher({ name: "", email: "", phone: "", qualification: "", assignedClasses: [], assignedSubjects: [] });
        fetchAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newNotice, author: "School Administrator" })
      });
      if (res.ok) {
        setShowAddNotice(false);
        setNewNotice({ title: "", content: "", category: "General" });
        fetchAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentAmount) return;
    try {
      const res = await fetch(`/api/invoices/${selectedInvoice.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(paymentAmount), paymentMethod })
      });
      if (res.ok) {
        setSelectedInvoice(null);
        setPaymentAmount("");
        fetchAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to withdraw this student and delete all linked invoices and grades?")) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
      if (res.ok) fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (res.ok) fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkInquiryRead = async (id: string) => {
    try {
      const res = await fetch(`/api/contact/${id}/read`, { method: "PUT" });
      if (res.ok) fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Financial calculations
  const totalRevenueCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstandingBalance = invoices.reduce((sum, inv) => sum + inv.balance, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
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
            <h1 className="font-display font-bold text-lg leading-tight">Admin Portal</h1>
            <p className="text-[10px] text-slate-400 font-mono">EDUPORTAL NG Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs block font-semibold text-slate-100">Super Administrator</span>
            <span className="text-[9px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded font-mono uppercase">System Operator</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between hover:border-blue-300 transition-all">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</span>
              <h3 className="text-2xl font-bold text-slate-900 font-display">{students.length}</h3>
            </div>
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Users className="w-6 h-6" /></div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between hover:border-blue-300 transition-all">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Teachers</span>
              <h3 className="text-2xl font-bold text-slate-900 font-display">{teachers.length}</h3>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl"><BookOpen className="w-6 h-6" /></div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between hover:border-blue-300 transition-all">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue Collected</span>
              <h3 className="text-lg sm:text-xl font-bold text-emerald-600 font-display">₦{totalRevenueCollected.toLocaleString()}</h3>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><DollarSign className="w-6 h-6" /></div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between hover:border-blue-300 transition-all">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Fees</span>
              <h3 className="text-lg sm:text-xl font-bold text-rose-600 font-display">₦{totalOutstandingBalance.toLocaleString()}</h3>
            </div>
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl"><CreditCard className="w-6 h-6" /></div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex flex-wrap gap-1 shadow-sm">
          <button 
            onClick={() => { setActiveTab('students'); setSelectedInvoice(null); }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'students' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Students Register
          </button>
          <button 
            onClick={() => { setActiveTab('teachers'); setSelectedInvoice(null); }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'teachers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Staff Directory
          </button>
          <button 
            onClick={() => { setActiveTab('fees'); }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'fees' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Fees & Collections
          </button>
          <button 
            onClick={() => { setActiveTab('notices'); setSelectedInvoice(null); }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'notices' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            School Noticeboard
          </button>
          <button 
            onClick={() => { setActiveTab('inquiries'); setSelectedInvoice(null); }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'inquiries' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Inquiries Box ({inquiries.filter(i => !i.isRead).length})
          </button>
        </div>

        {/* Tab 1: Students */}
        {activeTab === 'students' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Student Directory</h3>
                <p className="text-xs text-slate-500">View and admit new students into classes.</p>
              </div>
              <button 
                onClick={() => setShowAddStudent(!showAddStudent)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Admit New Student
              </button>
            </div>

            {showAddStudent && (
              <form onSubmit={handleAddStudent} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Admission Information</h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Student Name</label>
                    <input 
                      type="text" required
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      placeholder="e.g. Samuel Adegboyega"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Gender</label>
                    <select 
                      value={newStudent.gender}
                      onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as 'Male' | 'Female' })}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Assign Class</label>
                    <select 
                      required
                      value={newStudent.classId}
                      onChange={(e) => setNewStudent({ ...newStudent, classId: e.target.value })}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Choose Class --</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Parent Name</label>
                    <input 
                      type="text"
                      value={newStudent.parentName}
                      onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                      placeholder="e.g. Alhaji Adegboyega"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Parent Email</label>
                    <input 
                      type="email"
                      value={newStudent.parentEmail}
                      onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })}
                      placeholder="e.g. parent@example.com"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Parent Phone</label>
                    <input 
                      type="tel"
                      value={newStudent.parentPhone}
                      onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                      placeholder="e.g. +234 80..."
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddStudent(false)}
                    className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Register & Admit Student
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4">Admission No</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Class</th>
                    <th className="p-4">Parent Details</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {students.map(s => {
                    const studentClass = classes.find(c => c.id === s.classId);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-mono font-bold text-slate-900">{s.admissionNo}</td>
                        <td className="p-4 font-semibold text-slate-800">{s.name}</td>
                        <td className="p-4">{studentClass ? studentClass.name : s.classId}</td>
                        <td className="p-4">
                          <span className="block font-medium">{s.parentName}</span>
                          <span className="block text-[10px] text-slate-500">{s.parentPhone}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-semibold">{s.status}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button 
                              onClick={() => setActiveReportStudent(s)}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                              title="Preview & Print Report Card"
                            >
                              <Printer className="w-3.5 h-3.5" /> Report Sheet
                            </button>
                            <button 
                              onClick={() => handleDeleteStudent(s.id)}
                              className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1.5 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">No students registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Teachers */}
        {activeTab === 'teachers' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Academic Staff Directory</h3>
                <p className="text-xs text-slate-500">Manage academic instructors, classes and subject allocations.</p>
              </div>
              <button 
                onClick={() => setShowAddTeacher(!showAddTeacher)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Register Teacher
              </button>
            </div>

            {showAddTeacher && (
              <form onSubmit={handleAddTeacher} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Teacher Information</h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Full Name</label>
                    <input 
                      type="text" required
                      value={newTeacher.name}
                      onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                      placeholder="e.g. Mrs. Ngozi Alabi"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Email Address</label>
                    <input 
                      type="email" required
                      value={newTeacher.email}
                      onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                      placeholder="e.g. ngozi.alabi@eschool-ng.com"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Qualification</label>
                    <input 
                      type="text"
                      value={newTeacher.qualification}
                      onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })}
                      placeholder="e.g. B.Sc. Ed. Biology"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Assign Classes (Hold Ctrl/Cmd to select multiple)</label>
                    <select 
                      multiple
                      value={newTeacher.assignedClasses}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions).map(opt => (opt as HTMLOptionElement).value);
                        setNewTeacher({ ...newTeacher, assignedClasses: options });
                      }}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg h-24"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Assign Subjects (Hold Ctrl/Cmd to select multiple)</label>
                    <select 
                      multiple
                      value={newTeacher.assignedSubjects}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions).map(opt => (opt as HTMLOptionElement).value);
                        setNewTeacher({ ...newTeacher, assignedSubjects: options });
                      }}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg h-24"
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddTeacher(false)}
                    className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Register & Allocate Teacher
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4">Teacher Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Qualification</th>
                    <th className="p-4">Allocated Classes</th>
                    <th className="p-4">Allocated Subjects</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {teachers.map(t => {
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-semibold text-slate-800">{t.name}</td>
                        <td className="p-4 text-slate-600 font-mono">{t.email}</td>
                        <td className="p-4">{t.qualification}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {t.assignedClasses.map(cid => {
                              const cname = classes.find(c => c.id === cid)?.name || cid;
                              return <span key={cid} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">{cname}</span>;
                            })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {t.assignedSubjects.map(sid => {
                              const sname = subjects.find(s => s.id === sid)?.name || sid;
                              return <span key={sid} className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-medium">{sname}</span>;
                            })}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDeleteTeacher(t.id)}
                            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1.5 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {teachers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">No teachers registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Fees & Collections */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            
            {/* Split layout: Invoices List vs Recording Payment */}
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Invoices register list (cols 2) */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">Termly Fee Invoices</h3>
                  <p className="text-xs text-slate-500 font-medium">Track term billing status and view payments history.</p>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Invoice Fee</th>
                        <th className="p-3 text-emerald-600">Paid</th>
                        <th className="p-3 text-rose-600">Outstanding</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Collect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700">
                      {invoices.map(inv => {
                        const studentName = students.find(s => s.id === inv.studentId)?.name || inv.studentId;
                        return (
                          <tr key={inv.id} className={`hover:bg-slate-50/50 ${selectedInvoice?.id === inv.id ? 'bg-emerald-50/30' : ''}`}>
                            <td className="p-3 font-semibold text-slate-800">{studentName}</td>
                            <td className="p-3 font-mono font-medium">₦{inv.amount.toLocaleString()}</td>
                            <td className="p-3 font-mono text-emerald-600 font-semibold">₦{inv.paidAmount.toLocaleString()}</td>
                            <td className="p-3 font-mono text-rose-600 font-semibold">₦{inv.balance.toLocaleString()}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                                inv.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>{inv.status}</span>
                            </td>
                            <td className="p-3 text-right">
                              {inv.balance > 0 ? (
                                <button 
                                  onClick={() => setSelectedInvoice(inv)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition"
                                >
                                  Record Pay
                                </button>
                              ) : (
                                <span className="text-emerald-600 font-bold text-[10px] flex items-center justify-end gap-1"><Check className="w-3.5 h-3.5" /> Fully Paid</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Collect payment sidebar card (col 1) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit">
                {selectedInvoice ? (
                  <form onSubmit={handleRegisterPayment} className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-display font-bold text-sm text-slate-900">Record Fee Collection</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Record cash, card or bank transfer payment.</p>
                    </div>

                    <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Student Name</span>
                      <span className="text-xs font-bold text-slate-800">
                        {students.find(s => s.id === selectedInvoice.studentId)?.name || selectedInvoice.studentId}
                      </span>
                      <div className="flex justify-between items-center text-[11px] text-slate-600 pt-2 border-t border-slate-100/50 mt-2 font-mono">
                        <span>Invoice: ₦{selectedInvoice.amount.toLocaleString()}</span>
                        <span className="font-bold text-rose-600">Balance: ₦{selectedInvoice.balance.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Payment Amount (₦)</label>
                      <input 
                        type="number" required
                        max={selectedInvoice.balance}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder={`Max: ${selectedInvoice.balance}`}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Payment Method</label>
                      <select 
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      >
                        <option value="Bank Transfer">Direct Bank Transfer</option>
                        <option value="Card">ATM Debit Card</option>
                        <option value="Cash">Cash Deposit</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setSelectedInvoice(null)}
                        className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-2.5 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-lg cursor-pointer text-center"
                      >
                        Submit Receipt
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12 text-slate-400 space-y-3 font-medium">
                    <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs">Select a student from the ledger to record a manual fee payment or print receipt.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Tab 4: School Noticeboard */}
        {activeTab === 'notices' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">School Noticeboard Manager</h3>
                <p className="text-xs text-slate-500">Publish guidelines, notices and circular sheets.</p>
              </div>
              <button 
                onClick={() => setShowAddNotice(!showAddNotice)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Publish Announcement
              </button>
            </div>

            {showAddNotice && (
              <form onSubmit={handleAddNotice} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Write Announcement</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Announcement Title</label>
                    <input 
                      type="text" required
                      value={newNotice.title}
                      onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                      placeholder="e.g. End of Term Examination Timetable"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Target Category Group</label>
                    <select 
                      value={newNotice.category}
                      onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value as any })}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                    >
                      <option value="General">General (Everyone)</option>
                      <option value="Parents">Parents Group Only</option>
                      <option value="Teachers">Teachers Group Only</option>
                      <option value="Students">Students Group Only</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Announcement Body Content</label>
                  <textarea 
                    required rows={4}
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    placeholder="Write detailed announcements here..."
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddNotice(false)}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Publish Circular
                  </button>
                </div>
              </form>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {notices.map(n => (
                <div key={n.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-3 relative flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        n.category === 'General' ? 'bg-blue-100 text-blue-800' :
                        n.category === 'Parents' ? 'bg-amber-100 text-amber-800' :
                        n.category === 'Teachers' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-violet-100 text-violet-800'
                      }`}>{n.category}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
                    </div>
                    <h4 className="font-display font-bold text-slate-800 text-sm leading-snug">{n.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{n.content}</p>
                  </div>
                  <div className="border-t border-slate-100/80 pt-3 mt-4 flex justify-between items-center text-[10px] font-medium text-slate-400">
                    <span>Published by: {n.author}</span>
                    <button 
                      onClick={() => handleDeleteNotice(n.id)}
                      className="text-rose-600 hover:text-rose-800"
                    >
                      Delete Notice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Inquiries Box */}
        {activeTab === 'inquiries' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">Visitor Inquiries Box</h3>
              <p className="text-xs text-slate-500">Messages sent via the public website landing contact form.</p>
            </div>

            <div className="space-y-4">
              {inquiries.map(inq => (
                <div key={inq.id} className={`p-4 border rounded-xl space-y-3 transition ${inq.isRead ? 'bg-white border-slate-100 opacity-75' : 'bg-emerald-50/20 border-emerald-100'}`}>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{inq.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{inq.email} | {inq.phone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-mono">{inq.date}</span>
                      {!inq.isRead && (
                        <button 
                          onClick={() => handleMarkInquiryRead(inq.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded transition cursor-pointer"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-50 p-3 rounded-lg font-medium">{inq.message}</p>
                </div>
              ))}
              {inquiries.length === 0 && (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Mail className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs">No customer contact inquiries received yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {activeReportStudent && (
        <ReportSheetPreview 
          student={activeReportStudent}
          classes={classes}
          subjects={subjects}
          grades={grades}
          students={students}
          onClose={() => setActiveReportStudent(null)}
        />
      )}
    </div>
  );
}

import React, { useState } from "react";
import { 
  School, Award, CreditCard, Shield, Users, BookOpen, 
  MessageSquare, ChevronRight, CheckCircle, Mail, Phone, MapPin, Send 
} from "lucide-react";

interface LandingPageProps {
  onLoginClick: (role: 'admin' | 'teacher' | 'student' | 'parent') => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });
      if (res.ok) {
        setSubmitted(true);
        setContactForm({ name: "", email: "", phone: "", message: "" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-100 py-2 px-4 text-center text-xs font-medium tracking-wide border-b border-slate-800">
        🇳🇬 Leading Web-Based School Portal in Nigeria — Supporting WAEC, NECO & Primary Grading Standards.
      </div>

      {/* Main Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white rotate-45"></div>
            </div>
            <div>
              <span className="font-display font-bold text-2xl tracking-tight text-slate-800">
                EDU<span className="text-blue-600">PORTAL</span> NG
              </span>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider -mt-1 uppercase">Smart School Portal</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <a href="#portals" className="hover:text-blue-600 transition">Interactive Portals</a>
            <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
            <a href="#contact" className="hover:text-blue-600 transition">Contact Us</a>
          </nav>

          <div className="flex items-center gap-3">
            <a 
              href="#portals" 
              className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-center text-sm"
              id="header-login-btn"
            >
              Portal Login
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-slate-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Col */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                Award Winning System 2024
              </div>
              
              <h1 className="font-display font-extrabold text-5xl sm:text-6xl text-slate-900 leading-tight tracking-tight">
                Smart Schooling <br/>
                <span className="text-blue-600">Simplified.</span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                The most comprehensive school management software in Nigeria. Manage results, fees, attendance, and admissions from a single, secure dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <a 
                  href="#portals"
                  className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-center"
                >
                  Launch Demo Portals
                </a>
                <a 
                  href="#contact"
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-base font-semibold px-8 py-4 rounded-full transition text-center"
                >
                  Request Customized Demo
                </a>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200">
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">1,240+</h3>
                  <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-tighter">Active Schools</p>
                </div>
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">84,000+</h3>
                  <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-tighter">Students Managed</p>
                </div>
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">15M+</h3>
                  <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-tighter">Records Secure</p>
                </div>
              </div>
            </div>

            {/* Right Col - Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-3xl rotate-3 scale-95 opacity-10 blur-xl"></div>
              <div className="relative bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold text-blue-600 font-mono tracking-wider uppercase">Nigerian Standard Grading</span>
                  <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-bold">WAEC Standard</span>
                </div>

                {/* Simulated Report Card Snippet */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700">Tunde Bakare (JSS 1)</span>
                    <span className="text-slate-500 text-[10px]">First Term 25/26</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-600 p-2 bg-white border border-slate-100 rounded">
                      <span>Mathematics</span>
                      <div className="flex gap-4 font-mono font-medium">
                        <span>CA: 25/30</span>
                        <span>Exam: 58/70</span>
                        <span className="font-bold text-blue-600">A1 (83%)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-600 p-2 bg-white border border-slate-100 rounded">
                      <span>English Language</span>
                      <div className="flex gap-4 font-mono font-medium">
                        <span>CA: 21/30</span>
                        <span>Exam: 52/70</span>
                        <span className="font-bold text-indigo-600">B2 (73%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
                  <Award className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-900">Automated Position Engine</h4>
                    <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                      Instantly calculates first/second/third positions in class based on cumulative termly aggregates with customized remarks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              One Portal, Infinite Possibilities
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Ditch the paper registers and manual spreadsheet compilations. Our cloud portal provides specialized tools for all stakeholders in your school ecosystem.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 border border-slate-200 hover:border-blue-300 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition duration-200 space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-900">Result Compiler</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Enter CA1, CA2, and exam scores effortlessly. The system automatically computes totals, percentages, grades (A1 to F9), averages, and positions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 border border-slate-200 hover:border-blue-300 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition duration-200 space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-900">Fees & Invoicing</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Generate termly fee invoices automatically based on class. Parents receive alerts, pay securely, and print standard payment receipts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 border border-slate-200 hover:border-blue-300 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition duration-200 space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-900">Interactive CBT Engine</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Teachers design objective exams or mock tests. Students take the online quizzes inside their dashboard with automated timers and instant grading.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 border border-slate-200 hover:border-blue-300 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition duration-200 space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-900">Student & Staff Directories</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Manage personal information, admission status, class allocations, subjects, and daily class attendance charts with instant admin reports.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 border border-slate-200 hover:border-blue-300 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition duration-200 space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-900">Parent-Teacher Bridge</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Enable instant parent-teacher feedback loops. Parents link their child's account to track results, attendance patterns, and message administrators.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 border border-slate-200 hover:border-blue-300 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition duration-200 space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-900">Notice Boards & Newsletters</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Publish school circulars, exam timetables, holiday announcements, and event calendars targeted specifically to teachers, parents, or students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Portals Selector (Geometric Balanced layout) */}
      <section id="portals" className="py-20 bg-slate-100 border-t border-b border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest rounded-full">Live Demo Environment</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Access Your Role-Based Portal
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Switch roles with a single click to see how EDUPORTAL NG coordinates administrative duties, term assessment compiles, and parent-linked reports.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Admin Portal Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 group transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </div>
                  <span className="text-xs font-bold text-slate-400">ADMIN</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800">School Admin</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Manage profiles, allocate classes, configure subjects, publish notice boards, and review payment collections.
                </p>
              </div>
              <button 
                onClick={() => onLoginClick('admin')}
                className="mt-6 w-full py-2.5 border border-slate-900 text-slate-900 rounded-lg font-semibold hover:bg-slate-900 hover:text-white transition cursor-pointer text-center text-xs"
              >
                Admin Login
              </button>
            </div>

            {/* Teacher Portal Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 group transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                  </div>
                  <span className="text-xs font-bold text-slate-400">STAFF</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800">Teacher Workspace</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Record daily student attendance, type first-term assessments, and automatically compile Broad Sheets.
                </p>
              </div>
              <button 
                onClick={() => onLoginClick('teacher')}
                className="mt-6 w-full py-2.5 border border-slate-900 text-slate-900 rounded-lg font-semibold hover:bg-slate-900 hover:text-white transition cursor-pointer text-center text-xs"
              >
                Teacher Login
              </button>
            </div>

            {/* Student Portal Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 group transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  </div>
                  <span className="text-xs font-bold text-slate-400">STUDENT</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800">Student Portal</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Take CBT tests with real-time timers, review grades instantly, and inspect pending termly invoices.
                </p>
              </div>
              <button 
                onClick={() => onLoginClick('student')}
                className="mt-6 w-full py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold transition cursor-pointer text-center text-xs shadow-md shadow-blue-100"
              >
                Enter Portal
              </button>
            </div>

            {/* Parent Portal Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 group transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11M5 11V9a2 2 0 012-2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <span className="text-xs font-bold text-slate-400">PARENT</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800">Parent Tracker</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Link your child's profile via admission codes to track reports, attendance, and clear termly balances.
                </p>
              </div>
              <button 
                onClick={() => onLoginClick('parent')}
                className="mt-6 w-full py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold transition cursor-pointer text-center text-xs shadow-md shadow-blue-100"
              >
                Enter Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Mimicking Nigerian School Rates) */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Flexible Plans Tailored for Your School

            </h2>
            <p className="text-slate-600 text-base">
              Pricing is simple, per student per term, allowing you to scale up or down as your enrollment changes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan 1 */}
            <div className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold font-mono text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded">Bronze / Basic</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-display text-slate-900">₦250</span>
                  <span className="text-xs text-slate-500">/ student / term</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Perfect for small nursery or primary schools launching their first digital portal.</p>
                <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-600" /> Student Profile Directory</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-600" /> Standard Results Compilation</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-600" /> Digital Circular Board</div>
                </div>
              </div>
              <a href="#contact" className="mt-8 block text-center border border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-700 text-xs font-semibold py-3 rounded-xl transition">
                Select Basic Plan
              </a>
            </div>

            {/* Plan 2 - Recommended */}
            <div className="bg-white border-2 border-blue-500 p-8 rounded-2xl flex flex-col justify-between shadow-md relative scale-105">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Popular Choice
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold font-mono text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded">Silver / Standard</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-display text-slate-900">₦500</span>
                  <span className="text-xs text-slate-500">/ student / term</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Designed for growing primary and secondary schools needing robust billing & CBT.</p>
                <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-600" /> Everything in Bronze</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-600" /> Fee Invoicing & Payment Tracker</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-600" /> Online CBT & Assessments</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-600" /> Parent-Teacher Messenger</div>
                </div>
              </div>
              <a href="#contact" className="mt-8 block text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-3 rounded-xl transition shadow-md shadow-blue-200">
                Select Standard Plan
              </a>
            </div>

            {/* Plan 3 */}
            <div className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold font-mono text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded">Gold / Premium</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-display text-slate-900">₦800</span>
                  <span className="text-xs text-slate-500">/ student / term</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Full-fledged enterprise suite for premium high schools with biometric & SMS plans.</p>
                <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-600" /> Everything in Standard</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-600" /> Automated SMS Alert Broadcasts</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-600" /> White-labelled Portal Domain</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-600" /> Dedicated Account Representative</div>
                </div>
              </div>
              <a href="#contact" className="mt-8 block text-center border border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-700 text-xs font-semibold py-3 rounded-xl transition">
                Select Premium Plan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Inquiry Section */}
      <section id="contact" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* Left Col Info */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight">
                Let's Transform Your School Management
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Have questions about custom features, pricing discounts for high-volume enrollments, or need assistance importing student registers? We are here to help.
              </p>

              <div className="space-y-4 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Phone className="w-4 h-4" /></div>
                  <span>+234 812 345 6789</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Mail className="w-4 h-4" /></div>
                  <span>support@eschool-ng.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><MapPin className="w-4 h-4" /></div>
                  <span>Yaba Technology Hub, Herbert Macaulay Way, Lagos, Nigeria</span>
                </div>
              </div>
            </div>

            {/* Right Col Contact Form */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm">
              <h3 className="font-display font-bold text-lg text-slate-900 mb-6">Send an Inquiry</h3>
              
              {submitted ? (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-blue-600 mx-auto animate-pulse" />
                  <h4 className="font-semibold text-blue-900">Message Received Successfully!</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Thank you for reaching out. An administrative representative will respond to your email or call within 24 hours.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-xs text-blue-800 hover:underline cursor-pointer"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="e.g. Kola Adesina"
                        className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                      <input 
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="e.g. 08034567890"
                        className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="e.g. schoolname@example.com"
                      className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Inquiry Message</label>
                    <textarea 
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Detail your request or the name of your school..."
                      className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold py-3.5 rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? "Submitting Inquiry..." : (
                      <>
                        Submit Inquiry <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white rotate-45"></div>
              </div>
              <span className="font-display font-bold text-xl text-white">EDU<span className="text-blue-500">PORTAL</span> NG</span>
            </div>
            <p className="text-xs">© 2026 EDUPORTAL Nigeria. All Rights Reserved. Empowering digital schools.</p>
          </div>
          <div className="pt-8 flex flex-wrap justify-center sm:justify-start gap-8 text-xs font-medium">
            <a href="#features" className="hover:text-blue-400 transition">Features</a>
            <a href="#portals" className="hover:text-blue-400 transition">Portals</a>
            <a href="#pricing" className="hover:text-blue-400 transition">Pricing</a>
            <a href="#contact" className="hover:text-blue-400 transition">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

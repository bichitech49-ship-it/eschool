import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import AdminPortal from "./components/AdminPortal";
import TeacherPortal from "./components/TeacherPortal";
import StudentPortal from "./components/StudentPortal";
import ParentPortal from "./components/ParentPortal";
import { UserCheck, Sparkles, School, Laptop } from "lucide-react";

export default function App() {
  const [activeRole, setActiveRole] = useState<'admin' | 'teacher' | 'student' | 'parent' | null>(null);

  // Render the appropriate layout based on user role selection
  const renderContent = () => {
    switch (activeRole) {
      case "admin":
        return <AdminPortal onBack={() => setActiveRole(null)} />;
      case "teacher":
        return <TeacherPortal onBack={() => setActiveRole(null)} />;
      case "student":
        return <StudentPortal onBack={() => setActiveRole(null)} />;
      case "parent":
        return <ParentPortal onBack={() => setActiveRole(null)} />;
      default:
        return <LandingPage onLoginClick={(role) => setActiveRole(role)} />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      {/* Dynamic Role portal wrapper */}
      <div className="flex-1">
        {renderContent()}
      </div>

      {/* Persistent Floating Demo Control Hub (Allows swift switching between roles for reviewer convenience) */}
      <div className="fixed bottom-4 right-4 z-50 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 backdrop-blur-md rounded-2xl p-3 shadow-2xl shadow-blue-950/20 max-w-sm transition-all duration-300">
        <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
          <div className="bg-blue-500/10 p-1 rounded-lg text-blue-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-blue-400 font-bold uppercase font-mono block">Reviewer Portal Switcher</span>
            <span className="text-[9px] text-slate-400 font-medium">Bypass log-in forms & select active role:</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          <button 
            onClick={() => setActiveRole("admin")}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center transition cursor-pointer ${
              activeRole === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            Admin
          </button>
          <button 
            onClick={() => setActiveRole("teacher")}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center transition cursor-pointer ${
              activeRole === 'teacher' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            Teacher
          </button>
          <button 
            onClick={() => setActiveRole("student")}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center transition cursor-pointer ${
              activeRole === 'student' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            Student
          </button>
          <button 
            onClick={() => setActiveRole("parent")}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center transition cursor-pointer ${
              activeRole === 'parent' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            Parent
          </button>
        </div>

        {activeRole && (
          <button 
            onClick={() => setActiveRole(null)}
            className="w-full text-center text-[9px] text-slate-400 hover:text-white font-semibold mt-2 border-t border-slate-800/60 pt-2 transition"
          >
            ← Return to Public Landing Page
          </button>
        )}
      </div>
    </div>
  );
}

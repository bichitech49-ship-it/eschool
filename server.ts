import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  SchoolClass, Subject, Student, Teacher, 
  GradeRecord, CBTQuiz, CBTQuizAttempt, 
  FeeInvoice, Announcement, ContactMessage 
} from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database / File Storage
const DB_FILE = path.join(process.cwd(), "db.json");

interface Database {
  classes: SchoolClass[];
  subjects: Subject[];
  students: Student[];
  teachers: Teacher[];
  grades: GradeRecord[];
  quizzes: CBTQuiz[];
  attempts: CBTQuizAttempt[];
  invoices: FeeInvoice[];
  announcements: Announcement[];
  contactMessages: ContactMessage[];
}

// Initial Seed Data
const DEFAULT_DB: Database = {
  classes: [
    { id: "pri-5", name: "Primary 5 Gold", feeAmount: 120000 },
    { id: "jss-1", name: "JSS 1 Blue", feeAmount: 150000 },
    { id: "sss-3", name: "SSS 3 Science", feeAmount: 180000 }
  ],
  subjects: [
    { id: "math", name: "Mathematics" },
    { id: "english", name: "English Language" },
    { id: "science", name: "Basic Science & Technology" },
    { id: "civic", name: "Civic Education" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" }
  ],
  students: [
    {
      id: "student-1",
      name: "Tunde Bakare",
      admissionNo: "ES/2026/001",
      gender: "Male",
      classId: "jss-1",
      parentName: "Chioma Bakare",
      parentEmail: "chioma.bakare@example.com",
      parentPhone: "+234 801 234 5678",
      status: "Active",
      attendanceRate: 94
    },
    {
      id: "student-2",
      name: "Amina Bello",
      admissionNo: "ES/2026/002",
      gender: "Female",
      classId: "jss-1",
      parentName: "Alhaji Bello",
      parentEmail: "amina.parents@example.com",
      parentPhone: "+234 802 234 5678",
      status: "Active",
      attendanceRate: 98
    },
    {
      id: "student-3",
      name: "Chinedu Okafor",
      admissionNo: "ES/2026/003",
      gender: "Male",
      classId: "pri-5",
      parentName: "Emeka Okafor",
      parentEmail: "chinedu.parents@example.com",
      parentPhone: "+234 803 234 5678",
      status: "Active",
      attendanceRate: 90
    },
    {
      id: "student-4",
      name: "Funmi Adebayo",
      admissionNo: "ES/2026/004",
      gender: "Female",
      classId: "sss-3",
      parentName: "Segun Adebayo",
      parentEmail: "funmi.parents@example.com",
      parentPhone: "+234 804 234 5678",
      status: "Active",
      attendanceRate: 96
    }
  ],
  teachers: [
    {
      id: "teacher-1",
      name: "Mr. Emeka Obi",
      email: "emeka.obi@eschool-ng.com",
      phone: "+234 805 123 4567",
      qualification: "B.Sc. Ed. Mathematics",
      assignedClasses: ["jss-1", "sss-3"],
      assignedSubjects: ["math", "physics"]
    },
    {
      id: "teacher-2",
      name: "Mrs. Funke Alao",
      email: "funke.alao@eschool-ng.com",
      phone: "+234 805 234 5678",
      qualification: "M.Ed. English Literature",
      assignedClasses: ["jss-1", "pri-5"],
      assignedSubjects: ["english", "civic"]
    }
  ],
  grades: [
    // Pre-populate JSS 1 Math & English records
    {
      id: "grade-1",
      studentId: "student-1", // Tunde
      subjectId: "math",
      classId: "jss-1",
      term: "First Term",
      session: "2025/2026",
      ca1: 12,
      ca2: 13,
      exam: 58,
      total: 83,
      grade: "A1",
      remark: "Excellent"
    },
    {
      id: "grade-2",
      studentId: "student-1", // Tunde
      subjectId: "english",
      classId: "jss-1",
      term: "First Term",
      session: "2025/2026",
      ca1: 10,
      ca2: 11,
      exam: 52,
      total: 73,
      grade: "B2",
      remark: "Very Good"
    },
    {
      id: "grade-3",
      studentId: "student-2", // Amina
      subjectId: "math",
      classId: "jss-1",
      term: "First Term",
      session: "2025/2026",
      ca1: 14,
      ca2: 15,
      exam: 65,
      total: 94,
      grade: "A1",
      remark: "Excellent"
    },
    {
      id: "grade-4",
      studentId: "student-2", // Amina
      subjectId: "english",
      classId: "jss-1",
      term: "First Term",
      session: "2025/2026",
      ca1: 12,
      ca2: 12,
      exam: 55,
      total: 79,
      grade: "A1",
      remark: "Excellent"
    },
    {
      id: "grade-5",
      studentId: "student-3", // Chinedu
      subjectId: "science",
      classId: "pri-5",
      term: "First Term",
      session: "2025/2026",
      ca1: 8,
      ca2: 9,
      exam: 45,
      total: 62,
      grade: "C4",
      remark: "Good"
    },
    {
      id: "grade-6",
      studentId: "student-4", // Funmi
      subjectId: "physics",
      classId: "sss-3",
      term: "First Term",
      session: "2025/2026",
      ca1: 13,
      ca2: 12,
      exam: 61,
      total: 86,
      grade: "A1",
      remark: "Excellent"
    }
  ],
  quizzes: [
    {
      id: "quiz-1",
      title: "First Term General Mathematics Mock Exam",
      subjectId: "math",
      classId: "jss-1",
      durationMinutes: 10,
      questions: [
        {
          id: "q1",
          text: "What is the Roman Numeral representation of 99?",
          options: ["XCIX", "IC", "XCX", "LXXXXIX"],
          correctAnswerIndex: 0
        },
        {
          id: "q2",
          text: "Find the Lowest Common Multiple (LCM) of 12, 18 and 24.",
          options: ["36", "48", "72", "144"],
          correctAnswerIndex: 2
        },
        {
          id: "q3",
          text: "Express 0.00345 in standard form.",
          options: ["3.45 x 10^-3", "34.5 x 10^-4", "3.45 x 10^-4", "0.345 x 10^-2"],
          correctAnswerIndex: 0
        },
        {
          id: "q4",
          text: "If 2x - 5 = 11, what is the value of x?",
          options: ["3", "6", "8", "16"],
          correctAnswerIndex: 2
        }
      ]
    },
    {
      id: "quiz-2",
      title: "Basic Science Weekly Assessment on Ecosystems",
      subjectId: "science",
      classId: "pri-5",
      durationMinutes: 5,
      questions: [
        {
          id: "q5",
          text: "Which of the following is a non-living component of an ecosystem?",
          options: ["Plants", "Insects", "Water", "Bacteria"],
          correctAnswerIndex: 2
        },
        {
          id: "q6",
          text: "Green plants are called ______ in a food chain because they make their own food.",
          options: ["Consumers", "Decomposers", "Producers", "Herbivores"],
          correctAnswerIndex: 2
        }
      ]
    }
  ],
  attempts: [],
  invoices: [
    {
      id: "inv-1",
      studentId: "student-1",
      term: "First Term 2025/2026",
      amount: 150000,
      paidAmount: 150000,
      balance: 0,
      status: "Paid",
      dueDate: "2026-02-15",
      payments: [
        {
          id: "p-1",
          amount: 150000,
          paymentMethod: "Bank Transfer",
          reference: "TXN/ES/1089201",
          date: "2026-01-10"
        }
      ]
    },
    {
      id: "inv-2",
      studentId: "student-2",
      term: "First Term 2025/2026",
      amount: 150000,
      paidAmount: 100000,
      balance: 50000,
      status: "Partially Paid",
      dueDate: "2026-02-15",
      payments: [
        {
          id: "p-2",
          amount: 100000,
          paymentMethod: "Card",
          reference: "TXN/ES/2019482",
          date: "2026-01-15"
        }
      ]
    },
    {
      id: "inv-3",
      studentId: "student-3",
      term: "First Term 2025/2026",
      amount: 120000,
      paidAmount: 0,
      balance: 120000,
      status: "Unpaid",
      dueDate: "2026-02-15",
      payments: []
    },
    {
      id: "inv-4",
      studentId: "student-4",
      term: "First Term 2025/2026",
      amount: 180000,
      paidAmount: 180000,
      balance: 0,
      status: "Paid",
      dueDate: "2026-02-15",
      payments: [
        {
          id: "p-3",
          amount: 180000,
          paymentMethod: "Bank Transfer",
          reference: "TXN/ES/9384729",
          date: "2026-01-08"
        }
      ]
    }
  ],
  announcements: [
    {
      id: "ann-1",
      title: "Resumption Notice for First Term 2025/2026 Session",
      content: "We are pleased to inform all students, staff, and parents that the first term of the 2025/2026 academic session will commence on Monday, September 8th, 2025. Please ensure all uniforms and materials are ready, and fee payments are cleared.",
      date: "2025-08-15",
      category: "General",
      author: "School Administrator"
    },
    {
      id: "ann-2",
      title: "Inaugural PTA Meeting for the Session",
      content: "The Parent-Teacher Association (PTA) meeting holds on Saturday, October 4th, 2025, at the School Multipurpose Hall. Main agenda includes safety protocols, bus routing, and the upcoming sports week. Attendance is highly encouraged.",
      date: "2025-09-10",
      category: "Parents",
      author: "PTA Chairman"
    },
    {
      id: "ann-3",
      title: "Staff Development & Lesson Plan Submission",
      content: "All academic staff are required to submit their termly lesson plans and curriculum trackers by Friday, September 12th. Note that our training workshop on Interactive Whiteboards holds this Wednesday at 2:00 PM.",
      date: "2025-09-02",
      category: "Teachers",
      author: "Vice Principal (Academic)"
    }
  ],
  contactMessages: [
    {
      id: "msg-1",
      name: "Tega Daniel",
      email: "tegadaniel@example.com",
      phone: "+2348123456789",
      message: "Hello, I want to inquire about secondary school admission fees for my ward who is entering JS1. Does the fee cover books and computer labs?",
      date: "2026-06-20",
      isRead: false
    }
  ]
};

// Load database from file or initialize
let db: Database = { ...DEFAULT_DB };

function readDatabase(): Database {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading database file, using fallback:", err);
  }
  return DEFAULT_DB;
}

function writeDatabase(data: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database file:", err);
  }
}

// Initial load
db = readDatabase();
// Sync initial save
writeDatabase(db);

// Helper function to calculate WAEC grade and remark
function calculateWaecGrade(total: number): { grade: string; remark: string } {
  if (total >= 75) return { grade: "A1", remark: "Excellent" };
  if (total >= 70) return { grade: "B2", remark: "Very Good" };
  if (total >= 65) return { grade: "B3", remark: "Good" };
  if (total >= 60) return { grade: "C4", remark: "Credit" };
  if (total >= 55) return { grade: "C5", remark: "Credit" };
  if (total >= 50) return { grade: "C6", remark: "Credit" };
  if (total >= 45) return { grade: "D7", remark: "Pass" };
  if (total >= 40) return { grade: "E8", remark: "Pass" };
  return { grade: "F9", remark: "Fail" };
}

// ==================== REST API ENDPOINTS ====================

// 1. Classes & Subjects
app.get("/api/classes", (req, res) => {
  res.json(db.classes);
});

app.get("/api/subjects", (req, res) => {
  res.json(db.subjects);
});

// 2. Students
app.get("/api/students", (req, res) => {
  res.json(db.students);
});

app.post("/api/students", (req, res) => {
  const newStudent: Student = {
    id: `student-${Date.now()}`,
    name: req.body.name,
    admissionNo: req.body.admissionNo || `ES/2026/0${db.students.length + 10}`,
    gender: req.body.gender || "Male",
    classId: req.body.classId,
    parentName: req.body.parentName || "Parent",
    parentEmail: req.body.parentEmail || "",
    parentPhone: req.body.parentPhone || "",
    status: req.body.status || "Active",
    attendanceRate: req.body.attendanceRate || 100
  };

  db.students.push(newStudent);

  // Generate automated fee invoice for this student based on class
  const classObj = db.classes.find(c => c.id === newStudent.classId);
  const classFee = classObj ? classObj.feeAmount : 100000;
  const newInvoice: FeeInvoice = {
    id: `inv-${Date.now()}`,
    studentId: newStudent.id,
    term: "First Term 2025/2026",
    amount: classFee,
    paidAmount: 0,
    balance: classFee,
    status: "Unpaid",
    dueDate: "2026-02-15",
    payments: []
  };
  db.invoices.push(newInvoice);

  writeDatabase(db);
  res.status(201).json(newStudent);
});

app.put("/api/students/:id", (req, res) => {
  const index = db.students.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    db.students[index] = { ...db.students[index], ...req.body };
    writeDatabase(db);
    res.json(db.students[index]);
  } else {
    res.status(404).json({ error: "Student not found" });
  }
});

app.delete("/api/students/:id", (req, res) => {
  db.students = db.students.filter(s => s.id !== req.params.id);
  db.grades = db.grades.filter(g => g.studentId !== req.params.id);
  db.invoices = db.invoices.filter(i => i.studentId !== req.params.id);
  writeDatabase(db);
  res.json({ success: true });
});

// 3. Teachers
app.get("/api/teachers", (req, res) => {
  res.json(db.teachers);
});

app.post("/api/teachers", (req, res) => {
  const newTeacher: Teacher = {
    id: `teacher-${Date.now()}`,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || "",
    qualification: req.body.qualification || "N.C.E / B.Ed",
    assignedClasses: req.body.assignedClasses || [],
    assignedSubjects: req.body.assignedSubjects || []
  };
  db.teachers.push(newTeacher);
  writeDatabase(db);
  res.status(201).json(newTeacher);
});

app.put("/api/teachers/:id", (req, res) => {
  const index = db.teachers.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    db.teachers[index] = { ...db.teachers[index], ...req.body };
    writeDatabase(db);
    res.json(db.teachers[index]);
  } else {
    res.status(404).json({ error: "Teacher not found" });
  }
});

app.delete("/api/teachers/:id", (req, res) => {
  db.teachers = db.teachers.filter(t => t.id !== req.params.id);
  writeDatabase(db);
  res.json({ success: true });
});

// 4. Grades
app.get("/api/grades", (req, res) => {
  res.json(db.grades);
});

app.post("/api/grades", (req, res) => {
  const { studentId, subjectId, classId, ca1, ca2, exam, term, session } = req.body;
  
  const scoreCa1 = Number(ca1) || 0;
  const scoreCa2 = Number(ca2) || 0;
  const scoreExam = Number(exam) || 0;
  const total = scoreCa1 + scoreCa2 + scoreExam;
  const { grade, remark } = calculateWaecGrade(total);

  // Check if grading already exists for student + subject + term + session
  const existingIndex = db.grades.findIndex(g => 
    g.studentId === studentId && 
    g.subjectId === subjectId && 
    g.term === term && 
    g.session === session
  );

  const gradeObj: GradeRecord = {
    id: existingIndex !== -1 ? db.grades[existingIndex].id : `grade-${Date.now()}`,
    studentId,
    subjectId,
    classId,
    term: term || "First Term",
    session: session || "2025/2026",
    ca1: scoreCa1,
    ca2: scoreCa2,
    exam: scoreExam,
    total,
    grade,
    remark
  };

  if (existingIndex !== -1) {
    db.grades[existingIndex] = gradeObj;
  } else {
    db.grades.push(gradeObj);
  }

  writeDatabase(db);
  res.json(gradeObj);
});

// 5. CBT Quizzes & Attempts
app.get("/api/quizzes", (req, res) => {
  res.json(db.quizzes);
});

app.post("/api/quizzes", (req, res) => {
  const newQuiz: CBTQuiz = {
    id: `quiz-${Date.now()}`,
    title: req.body.title,
    subjectId: req.body.subjectId,
    classId: req.body.classId,
    durationMinutes: Number(req.body.durationMinutes) || 15,
    questions: req.body.questions || []
  };
  db.quizzes.push(newQuiz);
  writeDatabase(db);
  res.status(201).json(newQuiz);
});

app.delete("/api/quizzes/:id", (req, res) => {
  db.quizzes = db.quizzes.filter(q => q.id !== req.params.id);
  writeDatabase(db);
  res.json({ success: true });
});

app.get("/api/attempts", (req, res) => {
  res.json(db.attempts);
});

app.post("/api/attempts", (req, res) => {
  const newAttempt: CBTQuizAttempt = {
    id: `attempt-${Date.now()}`,
    studentId: req.body.studentId,
    quizId: req.body.quizId,
    score: Number(req.body.score),
    totalQuestions: Number(req.body.totalQuestions),
    takenAt: new Date().toISOString()
  };
  db.attempts.push(newAttempt);
  writeDatabase(db);
  res.status(201).json(newAttempt);
});

// 6. Invoices & Fees Payments
app.get("/api/invoices", (req, res) => {
  res.json(db.invoices);
});

app.post("/api/invoices/:id/pay", (req, res) => {
  const invoiceId = req.params.id;
  const payAmount = Number(req.body.amount);
  const paymentMethod = req.body.paymentMethod || "Bank Transfer";
  
  if (!payAmount || payAmount <= 0) {
    return res.status(400).json({ error: "Invalid payment amount" });
  }

  const invoiceIndex = db.invoices.findIndex(inv => inv.id === invoiceId);
  if (invoiceIndex === -1) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  const invoice = db.invoices[invoiceIndex];
  if (invoice.balance <= 0) {
    return res.status(400).json({ error: "Invoice is already fully paid" });
  }

  const actAmount = Math.min(payAmount, invoice.balance);
  const newPayment = {
    id: `p-${Date.now()}`,
    amount: actAmount,
    paymentMethod,
    reference: `TXN/ES/${Math.floor(1000000 + Math.random() * 9000000)}`,
    date: new Date().toISOString().split("T")[0]
  };

  invoice.payments.push(newPayment);
  invoice.paidAmount += actAmount;
  invoice.balance = invoice.amount - invoice.paidAmount;

  if (invoice.balance === 0) {
    invoice.status = "Paid";
  } else {
    invoice.status = "Partially Paid";
  }

  writeDatabase(db);
  res.json({ invoice, payment: newPayment });
});

// 7. Announcements
app.get("/api/announcements", (req, res) => {
  res.json(db.announcements);
});

app.post("/api/announcements", (req, res) => {
  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    title: req.body.title,
    content: req.body.content,
    date: new Date().toISOString().split("T")[0],
    category: req.body.category || "General",
    author: req.body.author || "School Administrator"
  };
  db.announcements.unshift(newAnn);
  writeDatabase(db);
  res.status(201).json(newAnn);
});

app.delete("/api/announcements/:id", (req, res) => {
  db.announcements = db.announcements.filter(a => a.id !== req.params.id);
  writeDatabase(db);
  res.json({ success: true });
});

// 8. Contact Messages
app.get("/api/contact", (req, res) => {
  res.json(db.contactMessages);
});

app.post("/api/contact", (req, res) => {
  const newMsg: ContactMessage = {
    id: `msg-${Date.now()}`,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || "",
    message: req.body.message,
    date: new Date().toISOString().split("T")[0],
    isRead: false
  };
  db.contactMessages.push(newMsg);
  writeDatabase(db);
  res.status(201).json(newMsg);
});

app.put("/api/contact/:id/read", (req, res) => {
  const index = db.contactMessages.findIndex(m => m.id === req.params.id);
  if (index !== -1) {
    db.contactMessages[index].isRead = true;
    writeDatabase(db);
    res.json(db.contactMessages[index]);
  } else {
    res.status(404).json({ error: "Message not found" });
  }
});


// ==================== VITE DEVELOPMENT & PRODUCTION INTEGRATION ====================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

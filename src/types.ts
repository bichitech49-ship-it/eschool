export interface SchoolClass {
  id: string;
  name: string;
  feeAmount: number;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  admissionNo: string;
  gender: 'Male' | 'Female';
  classId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  status: 'Active' | 'Suspended' | 'Withdrawn';
  attendanceRate: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  assignedClasses: string[]; // SchoolClass IDs
  assignedSubjects: string[]; // Subject IDs
}

export interface GradeRecord {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  term: string;
  session: string;
  ca1: number; // max 15
  ca2: number; // max 15
  exam: number; // max 70
  total: number; // ca1 + ca2 + exam
  grade: string; // A1, B2, B3, C4, C5, C6, D7, E8, F9
  remark: string;
}

export interface CBTQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface CBTQuiz {
  id: string;
  title: string;
  subjectId: string;
  classId: string;
  durationMinutes: number;
  questions: CBTQuestion[];
}

export interface CBTQuizAttempt {
  id: string;
  studentId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  takenAt: string;
}

export interface FeePayment {
  id: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  date: string;
}

export interface FeeInvoice {
  id: string;
  studentId: string;
  term: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: 'Paid' | 'Partially Paid' | 'Unpaid';
  dueDate: string;
  payments: FeePayment[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'General' | 'Parents' | 'Teachers' | 'Students';
  author: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  isRead: boolean;
}

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, onSnapshot, query, orderBy, getDoc, serverTimestamp } from "firebase/firestore";
import { Trophy, GraduationCap, Edit3, Calculator, Zap, CheckCircle, XCircle, Loader, Heart, Crown, Search, ShieldCheck, ArrowRight, Medal, Grid, User } from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ACCURATE STUDENT DATABASE ---
const STUDENT_DB = [
  "Aditya Govindarajan", "Ashwani Kumar", "Devansh Tyagi", "Vartika Chaudhary", "Vansh Kumar", 
  "Shruti Agarwal", "Pankaj Bhatt", "Mohan Kumar", "Shubham Kumar", "Harsh Kumar", 
  "Arpit Saharawat", "Aman Kumar", "Vishwashikha Patel", "Vivek Azad", "Udit Sharma", 
  "Sheetal Singh", "Retika Sharma", "Naitik Bansal", "Astha Prasad", "Vishu Tyagi", 
  "Deepak Singh", "Riya Tyagi", "Khushi Jain", "Aman Kumar Singh", "Nigam Kumar", 
  "Sandeep Kumar Goswami", "Deepanshu Shalot", "Priyanshu Sharma", "Deepanshu Sharma", "Aanchal", 
  "Rupanjali Kumari", "Anubhav Chaudhary", "Divyanshu Tyagi", "Aman Tyagi", "Shivam Kumar", 
  "Ansh Kumar Sharma", "Shubham Kumar", "Ansh Mudgal", "Nigam Kumar", "Kashish", 
  "Harshit Malik", "Arpit Kumar", "Shubham Sharma", "Sachin", "Muskan Raj", 
  "Anant Vikal", "Ansh Jain", "Himanshu Tyagi", "Kartikay Tyagi", "Prabhakar Kumar", 
  "Ritesh Raushan", "Shashi Shekhar", "Jitendra Kumar", "Jyoti", "Divyanshu Kumar Arya", 
  "Deepanshu Sharma", "Shyam Kumar", "Surya Yadav", "Rishu"
];

const SUBJECTS_CORE = [
  { id: 'java', name: 'Object Oriented Programming Using Java', credits: 4, badge: 'Java Guru', icon: '☕' },
  { id: 'dsa', name: 'Data Structures and Algorithms', credits: 4, badge: 'Algo Wizard', icon: '🔄' },
  { id: 'dbms', name: 'Database Technology', credits: 4, badge: 'Data Keeper', icon: '🗄️' },
  { id: 'cyber', name: 'Cyber Security', credits: 2, badge: 'Mr. Robot', icon: '🔒' },
  { id: 'mining', name: 'Data Mining Techniques', credits: 4, badge: 'Data Miner', icon: '⛏️' },
];

const ELECTIVES = [
  { id: 'awt', name: 'Advanced Web Technology', credits: 4, badge: 'Full Stack', icon: '🌐' },
  { id: 'std', name: 'Software Testing and Development', credits: 4, badge: 'Bug Hunter', icon: '🐛' },
];

const GRADE_POINTS = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0 };
const GRADE_COLORS = {
  'O': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/50 hover:bg-yellow-400/20',
  'A+': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/50 hover:bg-emerald-400/20',
  'A': 'text-green-400 bg-green-400/10 border-green-400/50 hover:bg-green-400/20',
  'B+': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/50 hover:bg-cyan-400/20',
  'B': 'text-blue-400 bg-blue-400/10 border-blue-400/50 hover:bg-blue-400/20',
  'C': 'text-orange-400 bg-orange-400/10 border-orange-400/50 hover:bg-orange-400/20',
  'F': 'text-red-400 bg-red-400/10 border-red-400/50 hover:bg-red-400/20',
};

// --- Components ---

const Toast = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[150] w-[90%] max-w-sm flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-top-4 duration-300 ${
      type === 'error' ? 'bg-red-900/90 border-red-500/50 text-white' : 'bg-emerald-900/90 border-emerald-500/50 text-white'
    }`}>
      {type === 'error' ? <XCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
      <span className="text-sm font-semibold leading-tight">{message}</span>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // App State
  const [step, setStep] = useState('login'); 
  const [loginData, setLoginData] = useState({ name: '', regNo: '', studentIndex: -1 });
  const [grades, setGrades] = useState(() => {
    const defaults = {};
    [...SUBJECTS_CORE, ...ELECTIVES].forEach(sub => defaults[sub.id] = 'A');
    return defaults;
  });
  const [elective, setElective] = useState(ELECTIVES[0].id);
  const [calculatedCGPA, setCalculatedCGPA] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editCount, setEditCount] = useState(0);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // --- SECURITY GUARD: PREVENT "00" HACK ---
  useEffect(() => {
    // If a user is on the subjects or result screen, but has no valid index (-1),
    // it means they bypassed the login. Kick them out.
    if ((step === 'subjects' || step === 'result') && loginData.studentIndex === -1) {
      setStep('login');
      setToast({ show: true, message: 'Session invalid. Please login again.', type: 'error' });
    }
  }, [step, loginData.studentIndex]);

  // --- History Handling ---
  useEffect(() => {
    window.history.replaceState({ step: 'login' }, '');
    const handlePopState = (event) => {
      setStep(event.state?.step || 'login');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newStep) => {
    window.history.pushState({ step: newStep }, '');
    setStep(newStep);
  };

  // --- Auth & Data ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error(e);
      }
    };
    initAuth();
    onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', 'srm-mca-core', 'public', 'data', 'leaderboard'), orderBy('cgpa', 'desc'));
    return onSnapshot(q, (snap) => setLeaderboard(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  // --- Logic ---
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const liveCGPA = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    const allSubjects = [...SUBJECTS_CORE, ELECTIVES.find(e => e.id === elective)];
    allSubjects.forEach(sub => {
      totalPoints += (GRADE_POINTS[grades[sub.id]] * sub.credits);
      totalCredits += sub.credits;
    });
    return (totalPoints / totalCredits).toFixed(2);
  }, [grades, elective]);

  const classStats = useMemo(() => {
    if (leaderboard.length === 0) return { avg: 0, topPercent: 0 };
    const total = leaderboard.reduce((acc, curr) => acc + curr.cgpa, 0);
    const avg = (total / leaderboard.length).toFixed(2);
    const suffix = (loginData.studentIndex + 1).toString().padStart(2, '0');
    const myRegNo = `RA25322410300${suffix}`;
    const myRankIndex = leaderboard.findIndex(u => u.regNo === myRegNo);
    const topPercent = myRankIndex !== -1 ? Math.ceil(((myRankIndex + 1) / leaderboard.length) * 100) : 0;
    return { avg, topPercent };
  }, [leaderboard, loginData.studentIndex]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return STUDENT_DB
      .map((name, index) => ({ name, index }))
      .filter(item => item.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        if (aName.startsWith(q) && !bName.startsWith(q)) return -1;
        if (!aName.startsWith(q) && bName.startsWith(q)) return 1;
        return aName.localeCompare(bName);
      });
  }, [searchQuery]);

  const handleStudentSelect = (student) => {
    setLoginData({ name: student.name, regNo: '', studentIndex: student.index });
    setSearchQuery(student.name);
    setErrors({});
  };

  const handleLoginSubmit = async () => {
    setErrors({});
    if (!loginData.name || loginData.studentIndex === -1) {
      setErrors({ name: "Please select your name" });
      return;
    }
    const suffix = (loginData.studentIndex + 1).toString().padStart(2, '0');
    const expectedRegNo = `RA25322410300${suffix}`;
    const userInputRegNo = `RA25322410300${loginData.regNo}`.trim().toUpperCase();

    if (userInputRegNo !== expectedRegNo) {
      setErrors({ regNo: "Incorrect Digits" });
      showToast("Verification Failed", "error");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'artifacts', 'srm-mca-core', 'public', 'data', 'leaderboard', expectedRegNo);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCalculatedCGPA(data.cgpa);
        setEditCount(data.editCount || 0);
        if (data.grades) setGrades(data.grades);
        if (data.elective) setElective(data.elective);
        navigateTo('result');
        showToast(`Welcome back, ${data.name.split(' ')[0]}!`);
      } else {
        navigateTo('subjects');
      }
    } catch (e) {
      navigateTo('subjects');
    } finally {
      setLoading(false);
    }
  };

  const calculateAndPublish = async () => {
    // --- SECURITY GUARD: DOUBLE CHECK ---
    if (!loginData.name || loginData.studentIndex === -1) {
        setToast({ show: true, message: 'Security Error: User not identified', type: 'error' });
        setStep('login');
        return;
    }

    setLoading(true);
    setCalculatedCGPA(liveCGPA);
    const suffix = (loginData.studentIndex + 1).toString().padStart(2, '0');
    const finalRegNo = `RA25322410300${suffix}`;
    try {
      const docData = {
        name: loginData.name,
        regNo: finalRegNo,
        cgpa: parseFloat(liveCGPA),
        grades: grades,
        elective: elective,
        timestamp: serverTimestamp(),
        editCount: editCount
      };
      await setDoc(doc(db, 'artifacts', 'srm-mca-core', 'public', 'data', 'leaderboard', finalRegNo), docData);
      navigateTo('result');
      showToast("Result Published Successfully!");
    } catch (error) {
      console.error(error);
      showToast("Error saving data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (editCount >= 1) {
      showToast("Edit limit reached (Max 1)", "error");
      return;
    }
    setEditCount(prev => prev + 1);
    const suffix = (loginData.studentIndex + 1).toString().padStart(2, '0');
    const finalRegNo = `RA25322410300${suffix}`;
    try {
      await setDoc(doc(db, 'artifacts', 'srm-mca-core', 'public', 'data', 'leaderboard', finalRegNo), { editCount: editCount + 1 }, { merge: true });
      navigateTo('subjects');
    } catch(e) {
      console.error(e);
    }
  };

  const getRank = () => {
    const suffix = (loginData.studentIndex + 1).toString().padStart(2, '0');
    const myRegNo = `RA25322410300${suffix}`;
    const idx = leaderboard.findIndex(u => u.regNo === myRegNo);
    return idx !== -1 ? idx + 1 : '-';
  };

  if (loading && !user) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      <p className="text-slate-400 text-sm font-medium animate-pulse">Initializing Dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col overflow-hidden">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 via-slate-900/50 to-slate-950" />
          <div className="absolute -top-[20%] -right-[20%] w-[80%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="hidden lg:block absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      {/* --- HEADER --- */}
      <header className="px-6 py-4 relative z-20 flex items-center justify-between backdrop-blur-md bg-slate-950/80 border-b border-white/5 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight text-white mb-0.5">SRM Result</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">MCA Core • 2025</p>
          </div>
        </div>
        
        {/* Step Indicator (Desktop Only) */}
        {step !== 'login' && (
           <div className="hidden md:flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-white/5">
              <div className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${step === 'subjects' ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>Subjects</div>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <div className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${step === 'result' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'}`}>Leaderboard</div>
           </div>
        )}
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden w-full">
        
        {/* === LOGIN STEP === */}
        {step === 'login' && (
          <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Side: Hero (Desktop) / Header (Mobile) */}
              <div className="text-center lg:text-left space-y-6 animate-fade-in-up">
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-900 border border-slate-800 shadow-2xl relative group">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                  <Crown className="w-10 h-10 text-yellow-500 relative z-10" />
                </div>
                <div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                    Class Rank <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Leaderboard</span>
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
                    Join the official MCA Core class leaderboard. Enter your details to calculate your CGPA and see where you stand among your peers.
                    </p>
                </div>
                
                {/* Stats Preview */}
                <div className="hidden lg:flex items-center gap-8 pt-4 border-t border-white/5">
                    <div>
                        <div className="text-2xl font-bold text-white">{STUDENT_DB.length}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Students</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{leaderboard.length}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Results Live</div>
                    </div>
                </div>
              </div>

              {/* Right Side: Login Form */}
              <div className="w-full max-w-md mx-auto bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="space-y-6">
                  {/* 1. NAME INPUT */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 ml-1">
                      Identify Yourself
                    </label>
                    <div className="relative w-full group">
                      <div className="absolute left-4 top-0 bottom-0 flex items-center justify-center pointer-events-none">
                        <Search className={`w-4 h-4 transition-colors ${ searchQuery ? 'text-blue-400' : 'text-slate-500' }`} />
                      </div>
                      
                      {searchQuery && (
                        <button 
                          onClick={() => { setSearchQuery(''); setLoginData({ name: '', regNo: '', studentIndex: -1 }); }}
                          className="absolute right-4 top-0 bottom-0 flex items-center justify-center"
                        >
                          <XCircle className="w-4 h-4 text-slate-500 hover:text-white transition-colors" />
                        </button>
                      )}

                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (loginData.name && e.target.value !== loginData.name) {
                            setLoginData({ name: '', regNo: '', studentIndex: -1 });
                          }
                        }}
                        placeholder="Search your name..." 
                        className={`w-full bg-slate-950/50 border ${ errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-blue-500' } rounded-xl pl-11 pr-11 h-14 text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-base font-medium`}
                      />
                    </div>

                    {/* SUGGESTIONS DROPDOWN */}
                    {searchQuery && !loginData.name && filteredStudents.length > 0 && (
                      <div className="absolute left-0 right-0 z-[50] mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-[240px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                        {filteredStudents.map((s) => (
                          <button
                            key={s.index}
                            onClick={() => handleStudentSelect(s)}
                            className="w-full px-4 py-3 hover:bg-blue-600/10 cursor-pointer text-left border-b border-slate-800 last:border-0 transition-colors flex justify-between items-center group"
                          >
                            <span className="text-slate-300 group-hover:text-white font-medium text-sm truncate pr-4">
                              {s.name}
                            </span>
                            <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-slate-600 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors">
                              Select
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. REGISTRATION INPUT */}
                  <div className={`transition-all duration-300 ${loginData.name ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none blur-sm'}`}>
                    <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 ml-1">
                      Verify ID (Last 2 Digits)
                    </label>
                    <div className={`flex w-full bg-slate-950/50 border ${ errors.regNo ? 'border-red-500/50' : 'border-slate-800' } rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500/50 transition-all h-14`}>
                      <div className="h-full bg-slate-900/50 border-r border-slate-800 px-4 flex items-center justify-center">
                        <span className="text-slate-500 font-mono text-xs tracking-tighter">RA25322410300</span>
                      </div>
                      <div className="flex-1 relative h-full">
                        <input 
                          type="tel" 
                          placeholder="XX"
                          maxLength={2}
                          value={loginData.regNo}
                          onChange={(e) => setLoginData({ ...loginData, regNo: e.target.value })}
                          className="w-full h-full bg-transparent border-none px-4 text-white text-left font-bold tracking-widest outline-none text-lg font-mono placeholder:text-slate-800"
                        />
                      </div>
                    </div>
                    {errors.regNo && (
                      <div className="flex items-center gap-2 mt-2 text-red-400 text-xs font-medium animate-pulse ml-1">
                        <ShieldCheck className="w-3 h-3" /> {errors.regNo}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleLoginSubmit}
                    disabled={!loginData.name || loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 h-14 rounded-xl font-bold text-base transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mt-4"
                  >
                    {loading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Check Result <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === SUBJECTS STEP === */}
        {step === 'subjects' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden w-full max-w-7xl mx-auto px-4 lg:px-6">
            
            {/* Live Stats Bar */}
            <div className="py-4 flex-shrink-0 z-20">
              <div className="bg-gradient-to-r from-slate-900 to-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 lg:px-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Status</div>
                        <div className="text-white font-medium text-sm sm:text-base">{loginData.name}</div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3 bg-slate-950/50 rounded-xl px-4 py-2 border border-white/5 w-full sm:w-auto justify-between sm:justify-start">
                    <span className="text-xs text-slate-400 font-bold uppercase mr-2">Calculated CGPA</span>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 leading-none">
                        {liveCGPA}
                    </span>
                 </div>
              </div>
            </div>

            {/* Scrollable Form Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Core Subjects */}
                {SUBJECTS_CORE.map((sub) => (
                  <div key={sub.id} className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                         <span className="text-2xl group-hover:scale-110 transition-transform duration-300 filter grayscale group-hover:grayscale-0">{sub.icon}</span>
                         <div>
                            <h3 className="text-sm font-bold text-slate-200 leading-snug">{sub.name}</h3>
                            <div className="text-[10px] text-slate-500 mt-0.5">{sub.badge}</div>
                         </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800 whitespace-nowrap">
                        {sub.credits} Credits
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                      {Object.keys(GRADE_POINTS).map(g => (
                        <button 
                          key={g} 
                          onClick={() => setGrades({...grades, [sub.id]: g})}
                          className={`h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                            grades[sub.id] === g 
                              ? GRADE_COLORS[g] + ' shadow-lg scale-105 ring-1 ring-inset ring-white/10' 
                              : 'bg-slate-950 text-slate-600 hover:bg-slate-800'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Elective Card */}
                <div className="bg-indigo-900/10 border border-indigo-500/30 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap className="w-32 h-32 text-indigo-500 rotate-12" />
                  </div>
                  
                  <div className="relative z-10 mb-4">
                     <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 block flex items-center gap-2">
                        <Zap className="w-3 h-3" /> Select Elective
                     </label>
                     <div className="flex flex-col gap-2">
                        {ELECTIVES.map(ele => (
                        <button 
                            key={ele.id} 
                            onClick={() => setElective(ele.id)}
                            className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                                elective === ele.id 
                                ? 'bg-indigo-500/20 border-indigo-500/50' 
                                : 'bg-slate-950/50 border-slate-800/50 hover:bg-slate-900 hover:border-slate-700'
                            }`}
                        >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${elective === ele.id ? 'border-indigo-400' : 'border-slate-600'}`}>
                            {elective === ele.id && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                            </div>
                            <span className={`text-xs font-bold ${elective === ele.id ? 'text-white' : 'text-slate-400'}`}>
                                {ele.name}
                            </span>
                        </button>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 relative z-10 pt-2 border-t border-indigo-500/20">
                    {Object.keys(GRADE_POINTS).map(g => (
                      <button 
                        key={g} 
                        onClick={() => setGrades({...grades, [elective]: g})}
                        className={`h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                            grades[elective] === g 
                            ? GRADE_COLORS[g] 
                            : 'bg-slate-950/50 text-slate-600 hover:bg-slate-900/80'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Action */}
            <div className="py-4 z-20 w-full md:w-1/2 lg:w-1/3 mx-auto">
              <button 
                onClick={calculateAndPublish} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-900/30 h-14 rounded-xl font-bold text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Lock Result & View Rank'}
              </button>
            </div>
          </div>
        )}

        {/* === RESULT STEP (SPLIT VIEW) === */}
        {step === 'result' && (
          <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden w-full">
            
            {/* LEFT SIDE: Scorecard (Fixed/Sticky on Desktop) */}
            <div className="w-full lg:w-[400px] xl:w-[450px] bg-slate-950 lg:border-r border-white/5 flex flex-col p-6 z-20 shrink-0 overflow-y-auto lg:overflow-visible">
                <div className="space-y-6">
                    {/* Scorecard Component */}
                    <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-900 p-6 sm:p-8 rounded-[2rem] shadow-2xl text-center relative overflow-hidden border border-white/10 group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                        
                        <div className="relative z-10">
                            <div className="inline-block px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-4 backdrop-blur-md">
                                <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest flex items-center gap-1.5">
                                    <CheckCircle className="w-3 h-3" /> Official Score
                                </span>
                            </div>
                            
                            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight tracking-tight text-wrap break-words">
                                {loginData.name}
                            </h2>
                            <div className="text-blue-200/60 text-xs font-mono mb-6">{loginData.regNo}</div>

                            <div className="flex items-baseline justify-center gap-2 mb-8 scale-110">
                                <span className="text-7xl sm:text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
                                    {calculatedCGPA}
                                </span>
                                <span className="text-xl font-bold text-blue-200 opacity-80">CGPA</span>
                            </div>

                            <div className="bg-slate-950/30 backdrop-blur-md rounded-2xl p-4 flex divide-x divide-white/10 border border-white/10">
                                <div className="flex-1 px-2">
                                    <div className="text-2xl font-black text-white mb-0.5">#{getRank()}</div>
                                    <div className="text-[10px] uppercase text-blue-200 font-bold tracking-wider opacity-70">Class Rank</div>
                                </div>
                                <div className="flex-1 px-2">
                                    <div className="text-2xl font-black text-white mb-0.5">{classStats.topPercent}%</div>
                                    <div className="text-[10px] uppercase text-blue-200 font-bold tracking-wider opacity-70">Percentile</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="grid grid-cols-2 gap-4">
                         <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                            <User className="w-6 h-6 text-slate-500 mb-2" />
                            <div className="text-2xl font-bold text-white">{STUDENT_DB.length}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Total Class</div>
                         </div>
                         <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                            <Trophy className="w-6 h-6 text-yellow-500 mb-2" />
                            <div className="text-2xl font-bold text-white">{leaderboard.length}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Participants</div>
                         </div>
                    </div>

                    {editCount < 1 ? (
                        <button onClick={handleEdit} className="w-full h-12 flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 hover:border-blue-500 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all text-sm font-bold group">
                            <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
                            Fix a Mistake (1 Left)
                        </button>
                    ) : (
                        <div className="w-full h-12 flex items-center justify-center gap-2 bg-slate-900/50 text-slate-600 rounded-xl border border-slate-900 text-sm font-bold cursor-not-allowed">
                            <Edit3 className="w-4 h-4 opacity-50" /> Score Locked
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE: Leaderboard (Scrollable) */}
            <div className="flex-1 bg-slate-950 flex flex-col min-h-0 relative">
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-950 to-transparent z-10 pointer-events-none" />
                
                {/* Header */}
                <div className="px-6 py-6 flex items-center justify-between shrink-0 border-b border-white/5 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-500/10 p-2 rounded-lg">
                            <Grid className="text-yellow-500 w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Class Leaderboard</h3>
                            <p className="text-xs text-slate-500 font-medium">Live Rankings Updates</p>
                        </div>
                    </div>
                    {/* Search in Leaderboard could go here */}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 py-4">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 max-w-7xl mx-auto">
                        {leaderboard.map((student, idx) => {
                            const isMe = student.regNo === `RA25322410300${(loginData.studentIndex+1).toString().padStart(2,'0')}`;
                            
                            // Visual logic for Top 3
                            let rankColor = 'text-slate-500';
                            let rankBg = 'bg-slate-900/40 hover:bg-slate-800/40';
                            let rankBorder = 'border-slate-800/60';
                            let rankIcon = null;

                            if (idx === 0) { // Gold
                                rankColor = 'text-yellow-400';
                                rankBg = isMe ? 'bg-blue-900/30' : 'bg-gradient-to-r from-yellow-500/10 to-transparent';
                                rankBorder = 'border-yellow-500/30';
                                rankIcon = <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
                            } else if (idx === 1) { // Silver
                                rankColor = 'text-slate-300';
                                rankBg = isMe ? 'bg-blue-900/30' : 'bg-gradient-to-r from-slate-400/10 to-transparent';
                                rankBorder = 'border-slate-400/20';
                                rankIcon = <Medal className="w-4 h-4 text-slate-300" />;
                            } else if (idx === 2) { // Bronze
                                rankColor = 'text-amber-600';
                                rankBg = isMe ? 'bg-blue-900/30' : 'bg-gradient-to-r from-amber-600/10 to-transparent';
                                rankBorder = 'border-amber-600/20';
                                rankIcon = <Medal className="w-4 h-4 text-amber-600" />;
                            } else if (isMe) {
                                rankColor = 'text-blue-400';
                                rankBg = 'bg-blue-600/10';
                                rankBorder = 'border-blue-500/50';
                            }

                            return (
                                <div key={student.regNo} className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${rankBg} ${rankBorder} ${isMe ? 'shadow-[0_0_20px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/30' : ''}`}>
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-full font-bold text-sm ${idx < 3 ? 'bg-slate-900 border border-white/5 shadow-inner' : 'bg-transparent text-slate-600'}`}>
                                            {rankIcon ? rankIcon : <span>{idx + 1}</span>}
                                        </div>
                                        <div className="min-w-0 flex flex-col">
                                            <span className={`text-sm sm:text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis ${isMe ? 'text-white' : (idx < 3 ? 'text-white' : 'text-slate-300 group-hover:text-slate-200')}`}>
                                                {student.name}
                                            </span>
                                            {isMe && <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">You</span>}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                         {/* Simple Bar Chart Visualization for CGPA */}
                                         <div className="hidden sm:flex flex-col items-end gap-1 w-24">
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${idx === 0 ? 'bg-yellow-500' : isMe ? 'bg-blue-500' : 'bg-slate-600'}`} 
                                                    style={{ width: `${(student.cgpa / 10) * 100}%` }}
                                                />
                                            </div>
                                         </div>

                                        <div className={`font-mono font-bold text-sm px-3 py-1.5 rounded-lg flex-shrink-0 ${isMe ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : (idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800')}`}>
                                            {student.cgpa.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="h-12"></div>
                </div>
            </div>

          </div>
        )}

      </main>

      {/* --- FOOTER --- */}
      <footer className="py-3 text-center border-t border-white/5 bg-slate-950 relative z-20 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
         <div className="flex items-center justify-center gap-1.5 hover:text-slate-400 transition-colors cursor-default">
            <span>Designed by Shiva</span>
            <Heart className="w-2.5 h-2.5 text-red-900 fill-red-900" />
         </div>
      </footer>

      <style>{`
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }

        /* Animation */
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}



import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDoc,
  serverTimestamp 
} from "firebase/firestore";
import { 
  Trophy, 
  GraduationCap,
  Edit3,
  Calculator,
  Zap,
  CheckCircle,
  XCircle,
  Loader,
  Heart,
  Crown,
  Search,
  ShieldCheck,
  ArrowRight,
  Medal
} from 'lucide-react';

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
  { id: 'java', name: 'Object Oriented Programming Using Java', credits: 4, badge: 'Java Guru' },
  { id: 'dsa', name: 'Data Structures and Algorithms', credits: 4, badge: 'Algo Wizard' },
  { id: 'dbms', name: 'Database Technology', credits: 4, badge: 'Data Keeper' },
  { id: 'cyber', name: 'Cyber Security', credits: 2, badge: 'Mr. Robot' },
  { id: 'mining', name: 'Data Mining Techniques', credits: 4, badge: 'Data Miner' },
];

const ELECTIVES = [
  { id: 'awt', name: 'Advanced Web Technology', credits: 4, badge: 'Full Stack' },
  { id: 'std', name: 'Software Testing and Development', credits: 4, badge: 'Bug Hunter' },
];

const GRADE_POINTS = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0 };
const GRADE_COLORS = {
  'O': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/50',
  'A+': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/50',
  'A': 'text-green-400 bg-green-400/10 border-green-400/50',
  'B+': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/50',
  'B': 'text-blue-400 bg-blue-400/10 border-blue-400/50',
  'C': 'text-orange-400 bg-orange-400/10 border-orange-400/50',
  'F': 'text-red-400 bg-red-400/10 border-red-400/50',
};

// --- Toast Component ---
const Toast = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-xs flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-top-4 duration-300 ${type === 'error' ? 'bg-red-900/90 border-red-500/50 text-white' : 'bg-emerald-900/90 border-emerald-500/50 text-white'}`}>
      {type === 'error' ? <XCircle className="w-5 h-5 flex-shrink-0 text-red-400" /> : <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />}
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
  const resultRef = useRef(null);

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
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) { console.error(e); } };
    initAuth();
    onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
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
    const topPercent = myRankIndex !== -1 
        ? Math.ceil(((myRankIndex + 1) / leaderboard.length) * 100) 
        : 0;

    return { avg, topPercent };
  }, [leaderboard, loginData.studentIndex]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return [];
    return STUDENT_DB.map((name, index) => ({ name, index }))
      .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
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
    } catch (e) { navigateTo('subjects'); } finally { setLoading(false); }
  };

  const calculateAndPublish = async () => {
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
    } catch (error) { console.error(error); showToast("Error saving data", "error"); } finally { setLoading(false); }
  };

  const handleEdit = async () => {
    if (editCount >= 1) { showToast("Edit limit reached (Max 1)", "error"); return; }
    setEditCount(prev => prev + 1);
    const suffix = (loginData.studentIndex + 1).toString().padStart(2, '0');
    const finalRegNo = `RA25322410300${suffix}`;
    try {
        await setDoc(doc(db, 'artifacts', 'srm-mca-core', 'public', 'data', 'leaderboard', finalRegNo), { editCount: editCount + 1 }, { merge: true });
        navigateTo('subjects');
    } catch(e) { console.error(e); }
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
        <p className="text-slate-400 text-sm font-medium animate-pulse">Loading System...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col items-center">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
      
      {/* Max Width Wrapper */}
      <div className="w-full max-w-lg mx-auto flex-grow flex flex-col relative overflow-hidden bg-slate-950 shadow-2xl min-h-screen sm:min-h-0 sm:h-screen sm:my-0">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 via-slate-900/50 to-slate-950 pointer-events-none" />
        <div className="absolute -top-[20%] -right-[20%] w-[80%] h-[50%] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* --- HEADER --- */}
        <header className="px-5 py-4 relative z-10 flex items-center justify-between backdrop-blur-sm bg-slate-950/50 sticky top-0 sm:static border-b border-white/5 sm:border-none">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                   <GraduationCap className="text-white w-5 h-5" />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-none tracking-tight text-white mb-0.5">SRM Result</h1>
                    <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">MCA Core • 2025</p>
                </div>
            </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
          
          {/* === LOGIN STEP === */}
          {step === 'login' && (
            <div className="flex-1 flex flex-col overflow-y-auto px-5 pb-6 pt-2">
              <div className="text-center mb-8 mt-4 animate-fade-in-up">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-slate-900 border border-slate-800 shadow-xl mb-4 relative group">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                    <Crown className="w-8 h-8 text-yellow-500 relative z-10" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Rank Check</h2>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">Join the official class leaderboard. Verify your identity to proceed.</p>
              </div>

              <div className="w-full space-y-5 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                
                {/* 1. NAME INPUT */}
                <div className="relative">
                    <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 ml-1">Search Your Name</label>
                    <div className="relative w-full group">
                        <div className="absolute left-4 top-0 bottom-0 flex items-center justify-center pointer-events-none">
                            <Search className={`w-4 h-4 transition-colors ${searchQuery ? 'text-blue-400' : 'text-slate-500'}`} />
                        </div>
                        {searchQuery && (
                           <button onClick={() => { setSearchQuery(''); setLoginData({name: '', regNo: '', studentIndex: -1}); }} className="absolute right-4 top-0 bottom-0 flex items-center justify-center">
                              <XCircle className="w-4 h-4 text-slate-500 hover:text-white transition-colors" />
                           </button>
                        )}
                        <input 
                          type="text" 
                          value={searchQuery} 
                          onChange={(e) => { 
                             setSearchQuery(e.target.value); 
                             if(loginData.name && e.target.value !== loginData.name) setLoginData({name: '', regNo: '', studentIndex: -1}); 
                          }} 
                          placeholder="Ex: Aditya..." 
                          className={`w-full bg-slate-900/80 border ${errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-blue-500'} rounded-xl pl-11 pr-11 h-14 text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-base font-medium shadow-inner`} 
                        />
                    </div>

                    {/* SUGGESTIONS */}
                    {searchQuery && !loginData.name && filteredStudents.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-50 max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                            {filteredStudents.map((s) => (
                                <button key={s.index} onClick={() => handleStudentSelect(s)} className="w-full px-4 py-3 hover:bg-blue-600/10 cursor-pointer text-left border-b border-slate-800 last:border-0 transition-colors flex justify-between items-center group">
                                    <span className="text-slate-300 group-hover:text-white font-medium text-sm truncate pr-4">{s.name}</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors">Select</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* 2. REGISTRATION INPUT */}
                {loginData.name && (
                    <div className="animate-fade-in-up">
                         <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 ml-1">Verify ID (Last 2 Digits)</label>
                         
                         <div className={`flex w-full bg-slate-900/80 border ${errors.regNo ? 'border-red-500/50' : 'border-slate-800'} rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500/50 transition-all h-14 shadow-inner relative`}>
                            {/* Prefix Visual */}
                            <div className="h-full bg-slate-800/50 border-r border-slate-700/50 px-3 flex items-center justify-center">
                                <span className="text-slate-500 font-mono text-xs tracking-tighter">RA25322410300</span>
                            </div>
                            
                            {/* Input Area */}
                            <div className="flex-1 relative h-full bg-slate-900/50">
                                <input 
                                  type="tel" 
                                  placeholder="XX" 
                                  maxLength={2}
                                  value={loginData.regNo} 
                                  onChange={(e) => setLoginData({...loginData, regNo: e.target.value})} 
                                  className="w-full h-full bg-transparent border-none px-3 text-white text-left font-bold tracking-widest outline-none text-lg font-mono placeholder:text-slate-700" 
                                />
                            </div>
                         </div>
                         
                         {errors.regNo && (
                             <div className="flex items-center gap-2 mt-2 text-red-400 text-xs font-medium animate-pulse ml-1">
                                 <ShieldCheck className="w-3 h-3" /> {errors.regNo}
                             </div>
                         )}
                    </div>
                )}
                
                <div className="pt-2">
                    <button 
                        onClick={handleLoginSubmit} 
                        disabled={!loginData.name || loading} 
                        className="w-full bg-white text-slate-950 hover:bg-blue-50 shadow-[0_0_20px_rgba(255,255,255,0.1)] h-14 rounded-xl font-bold text-base transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                        {loading ? <Loader className="w-5 h-5 animate-spin text-slate-950" /> : <>Check Result <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </div>

              </div>
            </div>
          )}

          {/* === SUBJECTS STEP === */}
          {step === 'subjects' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Sticky Header Stats */}
                <div className="px-5 pb-2 pt-0 flex-shrink-0 z-20">
                    <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl flex items-center justify-between">
                        <div>
                            <div className="text-[10px] text-slate-400 font-medium mb-0.5">Live CGPA</div>
                            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 leading-none">{liveCGPA}</div>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                            <Calculator className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Scrollable Form */}
                <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 custom-scrollbar">
                    {SUBJECTS_CORE.map((sub) => (
                        <div key={sub.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xs font-bold text-slate-200 leading-snug pr-2">{sub.name}</h3>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 whitespace-nowrap">{sub.credits} Credits</span>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {Object.keys(GRADE_POINTS).map(g => (
                                    <button 
                                        key={g} 
                                        onClick={() => setGrades({...grades, [sub.id]: g})} 
                                        className={`h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${grades[sub.id] === g ? GRADE_COLORS[g] + ' shadow-md scale-105 ring-1 ring-inset ring-white/10' : 'bg-slate-950 text-slate-600 hover:bg-slate-800'}`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {/* Elective Section */}
                    <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><Zap className="w-20 h-20 text-indigo-500 rotate-12" /></div>
                        <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-3 block relative z-10">Select Elective</label>
                        
                        <div className="flex flex-col gap-2 mb-4 relative z-10">
                            {ELECTIVES.map(ele => (
                                <button 
                                    key={ele.id} 
                                    onClick={() => setElective(ele.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left group ${elective === ele.id ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-slate-950/50 border-slate-800/50 hover:bg-slate-900'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${elective === ele.id ? 'border-indigo-400' : 'border-slate-600'}`}>
                                        {elective === ele.id && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                                    </div>
                                    <span className={`text-xs font-bold ${elective === ele.id ? 'text-white' : 'text-slate-400'}`}>{ele.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 relative z-10">
                            {Object.keys(GRADE_POINTS).map(g => (
                                <button 
                                    key={g} 
                                    onClick={() => setGrades({...grades, [elective]: g})} 
                                    className={`h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${grades[elective] === g ? GRADE_COLORS[g] : 'bg-slate-950/50 text-slate-600 hover:bg-slate-900/80'}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-2 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-20">
                    <button 
                        onClick={calculateAndPublish} 
                        disabled={loading} 
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-900/50 h-12 rounded-xl font-bold text-base transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading ? 'Saving...' : 'Lock Result'}
                    </button>
                </div>
            </div>
          )}

          {/* === RESULT STEP === */}
          {step === 'result' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden" ref={resultRef}>
                
                {/* Scrollable Content Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    
                    {/* Top Section Padding */}
                    <div className="px-5 pt-2 pb-6 space-y-5 flex-shrink-0">
                        
                        {/* Scorecard */}
                        <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800 p-6 rounded-[1.5rem] shadow-2xl text-center relative overflow-hidden border border-white/10 shrink-0">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            
                            <div className="relative z-10">
                                <div className="inline-block px-2.5 py-0.5 bg-white/10 rounded-full border border-white/10 mb-3 backdrop-blur-md">
                                    <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Official Scorecard</span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-white mb-4 leading-tight tracking-tight text-wrap break-words">{loginData.name}</h2>
                                
                                <div className="flex items-baseline justify-center gap-2 mb-6">
                                    <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter drop-shadow-xl">{calculatedCGPA}</span>
                                    <span className="text-lg font-bold text-blue-200 opacity-80">CGPA</span>
                                </div>
                                
                                <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 flex divide-x divide-white/10 border border-white/10">
                                    <div className="flex-1 px-2">
                                        <div className="text-xl font-bold text-white mb-0.5">#{getRank()}</div>
                                        <div className="text-[10px] uppercase text-blue-200 font-bold tracking-wider opacity-70">Class Rank</div>
                                    </div>
                                    <div className="flex-1 px-2">
                                        <div className="text-xl font-bold text-white mb-0.5">{classStats.topPercent}%</div>
                                        <div className="text-[10px] uppercase text-blue-200 font-bold tracking-wider opacity-70">Batch Percentile</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="w-full">
                            {editCount < 1 ? (
                                <button onClick={handleEdit} className="w-full h-11 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all text-xs sm:text-sm font-bold group">
                                    <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Fix a Mistake (1 Left)
                                </button>
                            ) : (
                                <div className="w-full h-11 flex items-center justify-center gap-2 bg-slate-900/50 text-slate-600 rounded-xl border border-slate-900 text-xs sm:text-sm font-bold cursor-not-allowed">
                                    <Edit3 className="w-4 h-4 opacity-50" /> Score Locked
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LEADERBOARD SECTION (Fills remaining space) */}
                    <div className="flex-1 bg-slate-900 border-t border-slate-800 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col min-h-0 overflow-hidden">
                        
                        {/* Leaderboard Header */}
                        <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
                             <div className="flex items-center gap-2">
                                 <div className="bg-yellow-500/10 p-1.5 rounded-lg">
                                     <Trophy className="text-yellow-500 w-4 h-4" />
                                 </div>
                                 <h3 className="font-bold text-base text-white">Toppers List</h3>
                             </div>
                             <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">{leaderboard.length} Students</span>
                        </div>

                        {/* SCROLLABLE LIST AREA */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-20">
                            
                            {/* THE LIST (UNIFIED COLUMN) */}
                            <div className="space-y-2.5">
                                {leaderboard.map((student, idx) => {
                                    const isMe = student.regNo === `RA25322410300${(loginData.studentIndex+1).toString().padStart(2,'0')}`;
                                    
                                    // Visual logic for Top 3
                                    let rankColor = 'text-slate-500';
                                    let rankBg = 'bg-slate-800/30';
                                    let rankBorder = 'border-slate-800';
                                    let rankIcon = null;

                                    if (idx === 0) { // Gold
                                        rankColor = 'text-yellow-400';
                                        rankBg = isMe ? 'bg-blue-900/30' : 'bg-gradient-to-r from-yellow-900/10 to-transparent';
                                        rankBorder = 'border-yellow-500/20';
                                        rankIcon = <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />;
                                    } else if (idx === 1) { // Silver
                                        rankColor = 'text-slate-300';
                                        rankBg = isMe ? 'bg-blue-900/30' : 'bg-slate-800/40';
                                        rankBorder = 'border-slate-400/20';
                                        rankIcon = <Medal className="w-3.5 h-3.5 text-slate-300" />;
                                    } else if (idx === 2) { // Bronze
                                        rankColor = 'text-amber-600';
                                        rankBg = isMe ? 'bg-blue-900/30' : 'bg-amber-900/10';
                                        rankBorder = 'border-amber-700/20';
                                        rankIcon = <Medal className="w-3.5 h-3.5 text-amber-600" />;
                                    } else if (isMe) {
                                        rankColor = 'text-blue-400';
                                        rankBg = 'bg-blue-500/10';
                                        rankBorder = 'border-blue-500/50';
                                    }

                                    return (
                                        <div key={student.regNo} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${rankBg} ${rankBorder} ${isMe ? 'shadow-[0_0_15px_rgba(59,130,246,0.15)]' : ''}`}>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 rounded-full ${idx < 3 ? 'bg-slate-900/50 border border-white/5' : ''}`}>
                                                    {rankIcon ? rankIcon : <span className={`text-xs font-bold ${rankColor}`}>#{idx + 1}</span>}
                                                </div>
                                                <div className="min-w-0 flex flex-col">
                                                    <span className={`text-xs sm:text-sm font-bold whitespace-normal leading-tight text-wrap break-words pr-2 ${isMe ? 'text-white' : (idx < 3 ? 'text-white' : 'text-slate-300')}`}>
                                                        {student.name}
                                                    </span>
                                                    {isMe && <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider mt-0.5">You</span>}
                                                </div>
                                            </div>
                                            <div className={`font-mono font-bold text-xs px-2.5 py-1 rounded-lg flex-shrink-0 ml-2 ${isMe ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : (idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' : 'bg-slate-900 text-slate-400')}`}>
                                                {student.cgpa.toFixed(2)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Padding for footer */}
                            <div className="h-8"></div>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </main>

        {/* --- FOOTER --- */}
        <footer className="py-3 text-center border-t border-white/5 bg-slate-950 relative z-20">
            <a href="https://github.com/shivaarajput" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest">
                <span>Designed by Shiva</span>
                <Heart className="w-2.5 h-2.5 text-red-900 fill-red-900" />
            </a>
        </footer>
      </div>

      <style>{`
        /* Custom Scrollbar for sleek look */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }

        /* Animation Keyframes */
        @keyframes fade-in-up { 
            0% { opacity: 0; transform: translateY(20px) scale(0.98); } 
            100% { opacity: 1; transform: translateY(0) scale(1); } 
        } 
        .animate-fade-in-up { animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}



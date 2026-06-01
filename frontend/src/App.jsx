import React, { useState, useEffect, useMemo } from "react";
import {
  Trophy, GraduationCap, Edit3, Calculator, Zap, CheckCircle,
  XCircle, Loader, Heart, Crown, Search, Medal, User,
  LogOut, Sparkles, TrendingUp, Target, Star, Flame,
  BookOpen, BarChart3, Award
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://srm-result-backend.vercel.app/api";

const SUBJECTS_CORE = [
  { id: "python",       name: "Data Analysis Using Python",              credits: 4, badge: "Python Master",    icon: "🐍", color: "from-blue-500 to-cyan-500"      },
  { id: "optimization", name: "Optimization Techniques",                 credits: 4, badge: "Problem Solver",   icon: "📈", color: "from-emerald-500 to-teal-500"    },
  { id: "aos",          name: "Advanced Operating System",               credits: 4, badge: "System Architect", icon: "💻", color: "from-orange-500 to-red-500"       },
  { id: "aiml",         name: "AI and Machine Learning",                 credits: 4, badge: "AI Engineer",      icon: "🤖", color: "from-purple-500 to-pink-500"      },
  { id: "iot",          name: "Internet of Things (IoT)",                credits: 4, badge: "IoT Innovator",    icon: "🌐", color: "from-indigo-500 to-blue-500"      },
  { id: "softskills",   name: "Soft Skills and Verbal Mastery",          credits: 2, badge: "Communicator",     icon: "🎤", color: "from-rose-500 to-pink-500"        }
];

const ELECTIVES = [
  { id: "dvt", name: "Data Visualization Techniques", credits: 4, badge: "Data Artist", icon: "📊", color: "from-violet-500 to-purple-500" }
];

const GRADE_POINTS = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, F: 0 };

const GRADE_COLORS = {
  O:    "text-yellow-300  bg-yellow-500/20  border-yellow-400/50",
  "A+": "text-emerald-300 bg-emerald-500/20 border-emerald-400/50",
  A:    "text-green-300   bg-green-500/20   border-green-400/50",
  "B+": "text-sky-300     bg-sky-500/20     border-sky-400/50",
  B:    "text-blue-300    bg-blue-500/20    border-blue-400/50",
  C:    "text-orange-300  bg-orange-500/20  border-orange-400/50",
  F:    "text-red-300     bg-red-500/20     border-red-400/50"
};

const RANK_META = [
  { medal: "🥇", label: "Gold",   bg: "from-yellow-500/30 to-amber-500/20",  border: "border-yellow-500/50", text: "text-yellow-300",  numText: "text-yellow-200",  barH: "h-28", numSize: "text-4xl" },
  { medal: "🥈", label: "Silver", bg: "from-slate-400/30 to-slate-300/20",   border: "border-slate-400/50",  text: "text-slate-300",   numText: "text-slate-200",   barH: "h-20", numSize: "text-3xl" },
  { medal: "🥉", label: "Bronze", bg: "from-amber-700/30 to-amber-600/20",   border: "border-amber-600/50",  text: "text-amber-400",   numText: "text-amber-200",   barH: "h-14", numSize: "text-2xl" }
];

/* ─── Toast ─────────────────────────────────────────────────────── */
const Toast = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border text-sm font-semibold max-w-sm w-[90%] ${
      type === "error"
        ? "bg-red-500/20 border-red-400/40 text-red-200"
        : "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
    }`}>
      {type === "error"
        ? <XCircle className="w-4 h-4 flex-shrink-0" />
        : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
      {message}
    </div>
  );
};

/* ─── Main App ───────────────────────────────────────────────────── */
export default function App() {
  const [loading, setLoading]           = useState(true);
  const [token, setToken]               = useState(() => localStorage.getItem("token"));
  const [student, setStudent]           = useState(() => {
    const s = localStorage.getItem("student");
    return s ? JSON.parse(s) : null;
  });
  const [step, setStep]                 = useState("login");
  const [loginData, setLoginData]       = useState({ email: "", regNo: "" });
  const [grades, setGrades]             = useState(() => {
    const d = {};
    [...SUBJECTS_CORE, ...ELECTIVES].forEach(s => { d[s.id] = "A"; });
    return d;
  });
  const [elective, setElective]         = useState("dvt");
  const [calculatedCGPA, setCalculatedCGPA] = useState(0);
  const [editCount, setEditCount]       = useState(0);
  const [leaderboard, setLeaderboard]   = useState([]);
  const [searchQuery, setSearchQuery]   = useState("");
  const [errors, setErrors]             = useState({});
  const [toast, setToast]               = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => setToast({ show: true, message, type });
  const navigateTo = (page) => { window.history.pushState({ page }, "", ""); setStep(page); };

  /* History */
  useEffect(() => {
    window.history.replaceState({ page: "login" }, "");
    const handle = e => setStep(e.state?.page || "login");
    window.addEventListener("popstate", handle);
    return () => window.removeEventListener("popstate", handle);
  }, []);

  /* Load leaderboard */
  const loadLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/results/leaderboard`);
      const data = await res.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadLeaderboard(); }, []);

  /* Restore session */
  useEffect(() => {
    const restore = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch(`${API_URL}/results/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data) {
          setCalculatedCGPA(data.cgpa);
          setGrades(data.grades);
          setElective(data.elective);
          setEditCount(data.editCount || 0);
          setStep("result");
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("student");
        setToken(null);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [token]);

  /* Auth guard */
  useEffect(() => {
    if ((step === "subjects" || step === "result") && !student) {
      setStep("login");
      showToast("Please login first", "error");
    }
  }, [step, student]);

  /* Live CGPA */
  const liveCGPA = useMemo(() => {
    let pts = 0, creds = 0;
    const all = [...SUBJECTS_CORE, ELECTIVES.find(e => e.id === elective)].filter(Boolean);
    all.forEach(sub => {
      pts   += (GRADE_POINTS[grades[sub.id]] ?? 0) * sub.credits;
      creds += sub.credits;
    });
    return creds > 0 ? (pts / creds).toFixed(2) : "0.00";
  }, [grades, elective]);

  const classStats = useMemo(() => {
    if (!student || leaderboard.length === 0) return { avg: "0.00", topPercent: 0 };
    const total = leaderboard.reduce((acc, cur) => acc + Number(cur.cgpa), 0);
    const avg = (total / leaderboard.length).toFixed(2);
    const myIdx = leaderboard.findIndex(u => u.regNo === student.regNo);
    const pct = myIdx !== -1
      ? Math.ceil(((leaderboard.length - myIdx - 1) / leaderboard.length) * 100)
      : 0;
    return { avg, topPercent: pct };
  }, [leaderboard, student]);

  const getRank = () => {
    if (!student) return "-";
    const idx = leaderboard.findIndex(i => i.regNo === student.regNo);
    return idx !== -1 ? idx + 1 : "-";
  };

  const filteredLeaderboard = useMemo(() => {
    if (!searchQuery.trim()) return leaderboard;
    const q = searchQuery.toLowerCase().trim();
    return leaderboard.filter(i =>
      (i.name  && i.name.toLowerCase().includes(q)) ||
      (i.regNo && i.regNo.toLowerCase().includes(q))
    );
  }, [leaderboard, searchQuery]);

  /* Login */
  const handleLoginSubmit = async () => {
    setErrors({});
    if (!loginData.email || !loginData.regNo) {
      showToast("Email and Registration Number required", "error"); return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email.trim().toLowerCase(),
          regNo: loginData.regNo.trim().toUpperCase()
        })
      });
      const data = await res.json();
      if (!data.success) { showToast(data.message || "Invalid credentials", "error"); return; }

      localStorage.setItem("token", data.token);
      localStorage.setItem("student", JSON.stringify(data.student));
      setToken(data.token);
      setStudent(data.student);

      const resultRes = await fetch(`${API_URL}/results/me`, {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      const result = await resultRes.json();

      if (result && result.cgpa) {
        setCalculatedCGPA(result.cgpa);
        if (result.grades)  setGrades(result.grades);
        if (result.elective) setElective(result.elective);
        setEditCount(result.editCount || 0);
        navigateTo("result");
        showToast(`Welcome back, ${data.student.name.split(" ")[0]}!`);
      } else {
        navigateTo("subjects");
      }
    } catch (err) {
      console.error(err); showToast("Unable to login", "error");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("student");
    setToken(null); setStudent(null); setStep("login");
  };

  /* Publish */
  const calculateAndPublish = async () => {
    if (!student) { showToast("Please login again", "error"); return; }
    setLoading(true);
    try {
      const newEditCount = editCount + 1;
      const payload = { name: student.name, cgpa: Number(liveCGPA), grades, elective, editCount: newEditCount };
      const res = await fetch(`${API_URL}/results`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCalculatedCGPA(Number(liveCGPA));
      setEditCount(newEditCount);
      await loadLeaderboard();
      navigateTo("result");
      showToast("Result published successfully!");
    } catch (err) {
      console.error(err); showToast("Unable to save result", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ── Initial loading splash ───────────────────────────── */
  if (loading && !student) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-medium tracking-wide">Loading…</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col overflow-hidden relative">

      <Toast
        show={toast.show} message={toast.message} type={toast.type}
        onClose={() => setToast(p => ({ ...p, show: false }))}
      />

      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-cyan-600/10 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="px-5 py-3.5 relative z-20 flex items-center justify-between backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-60" />
            <div className="relative bg-slate-950 p-2 rounded-lg">
              <GraduationCap className="text-blue-400 w-5 h-5" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-base text-white leading-tight">SRM Academic Portal</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">MCA Excellence · 2025</p>
          </div>
        </div>

        {student && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
              {student.name.charAt(0)}
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white leading-tight">{student.name.split(" ")[0]}</p>
              <p className="text-[10px] text-slate-500">{student.regNo}</p>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 relative z-10 overflow-hidden">

        {/* ═══════════════ LOGIN ════════════════════════════════ */}
        {step === "login" && (
          <div className="flex items-center justify-center min-h-full p-4 py-8">
            <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">

              {/* Hero */}
              <div className="space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wide">Live Rankings Active</span>
                </div>

                <h2 className="text-5xl lg:text-6xl font-black text-white leading-tight">
                  Compete<br />&amp; Excel
                </h2>

                <p className="text-base text-slate-400 leading-relaxed max-w-md">
                  Track your CGPA in real-time, compete with classmates, and climb the leaderboard.
                </p>

                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  {[
                    { icon: <TrendingUp className="w-4 h-4 text-blue-400" />,   label: "Live CGPA",     sub: "Calculator"  },
                    { icon: <Target      className="w-4 h-4 text-purple-400" />, label: "Class",         sub: "Rankings"    },
                    { icon: <Trophy      className="w-4 h-4 text-yellow-400" />, label: "Live",          sub: "Leaderboard" }
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                      {f.icon}
                      <div>
                        <p className="text-[10px] text-slate-500 leading-tight">{f.label}</p>
                        <p className="text-xs font-bold text-white leading-tight">{f.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Login form */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl blur-2xl" />
                <div className="relative bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Sign in to Portal</h3>
                    <p className="text-xs text-slate-500">Enter your SRM credentials to continue</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Official Email</label>
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                      onKeyDown={e => e.key === "Enter" && handleLoginSubmit()}
                      placeholder="you@srmist.edu.in"
                      className="w-full h-11 px-3.5 bg-slate-950/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Registration Number</label>
                    <input
                      type="text"
                      value={loginData.regNo}
                      onChange={e => setLoginData({ ...loginData, regNo: e.target.value })}
                      onKeyDown={e => e.key === "Enter" && handleLoginSubmit()}
                      placeholder="RA2532241030001"
                      className="w-full h-11 px-3.5 bg-slate-950/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition"
                    />
                  </div>

                  <button
                    onClick={handleLoginSubmit}
                    disabled={loading}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
                  >
                    {loading
                      ? <Loader className="w-4 h-4 animate-spin" />
                      : <><Sparkles className="w-3.5 h-3.5" />View My Results</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ SUBJECTS ══════════════════════════════ */}
        {step === "subjects" && (
          <div className="flex flex-col h-full w-full max-w-6xl mx-auto px-4 lg:px-6 overflow-hidden">

            {/* Top bar */}
            <div className="py-4 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/15 to-purple-600/15 rounded-xl blur" />
                <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/20 border border-slate-700/50 flex items-center justify-center flex-shrink-0">
                      <Calculator className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Grade Entry</p>
                      <p className="text-sm font-bold text-white">{student?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/60 rounded-lg px-4 py-2 border border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Live CGPA</p>
                    <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      {liveCGPA}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject grid */}
            <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SUBJECTS_CORE.map(sub => (
                  <div key={sub.id} className="group relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${sub.color} rounded-xl blur opacity-10 group-hover:opacity-20 transition`} />
                    <div className="relative bg-slate-900/70 border border-slate-700/50 hover:border-slate-600/50 backdrop-blur p-4 rounded-xl transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2.5">
                          <span className="text-2xl">{sub.icon}</span>
                          <div>
                            <h3 className="text-xs font-bold text-white leading-snug">{sub.name}</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">{sub.badge}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-md flex-shrink-0 ml-1">
                          {sub.credits}cr
                        </span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Object.keys(GRADE_POINTS).map(g => (
                          <button
                            key={g}
                            onClick={() => setGrades({ ...grades, [sub.id]: g })}
                            className={`h-8 rounded-lg text-[11px] font-bold transition-all border ${
                              grades[sub.id] === g
                                ? GRADE_COLORS[g]
                                : "bg-slate-950/40 text-slate-600 border-slate-800/60 hover:border-slate-700/50 hover:text-slate-400"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Elective card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-violet-600/10 rounded-xl blur group-hover:opacity-150 transition" />
                  <div className="relative bg-slate-900/70 border border-slate-700/50 backdrop-blur p-4 rounded-xl">
                    <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-3 block">
                      Elective Subject
                    </label>
                    <div className="flex flex-col gap-2 mb-3">
                      {ELECTIVES.map(ele => (
                        <button
                          key={ele.id}
                          onClick={() => setElective(ele.id)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                            elective === ele.id
                              ? "bg-violet-500/15 border-violet-400/40"
                              : "bg-slate-950/30 border-slate-800/60 hover:border-slate-700/50"
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full border-2 transition-all flex-shrink-0 ${
                            elective === ele.id ? "border-violet-400 bg-violet-500/50" : "border-slate-600"
                          }`} />
                          <span className="text-[11px] font-semibold text-slate-300">{ele.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Object.keys(GRADE_POINTS).map(g => (
                        <button
                          key={g}
                          onClick={() => setGrades({ ...grades, [elective]: g })}
                          className={`h-8 rounded-lg text-[11px] font-bold transition-all border ${
                            grades[elective] === g
                              ? GRADE_COLORS[g]
                              : "bg-slate-950/40 text-slate-600 border-slate-800/60 hover:border-slate-700/50 hover:text-slate-400"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="py-4 flex-shrink-0">
              <button
                onClick={calculateAndPublish}
                disabled={loading}
                className="mx-auto block px-10 h-11 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white flex items-center justify-center gap-2 transition-all"
              >
                {loading
                  ? <><Loader className="w-4 h-4 animate-spin" /> Publishing…</>
                  : <><CheckCircle className="w-4 h-4" /> Publish Results</>}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════ RESULT ════════════════════════════════ */}
        {step === "result" && (
          <div className="flex flex-col lg:flex-row w-full h-full overflow-hidden">

            {/* ── Left panel ─────────────────────────────────── */}
            <div className="w-full lg:w-72 xl:w-80 bg-slate-900/60 backdrop-blur-sm lg:border-r border-slate-800/60 flex flex-col p-4 gap-4 flex-shrink-0 overflow-y-auto custom-scrollbar">

              {/* Score card */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-slate-900/50" />
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="relative z-10 p-5 text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/15 border border-blue-400/25 rounded-full">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Your Results</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{student?.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{student?.regNo}</p>
                  </div>
                  <div className="py-3">
                    <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300">
                      {Number(calculatedCGPA).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wide">CGPA Score</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-xl p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Crown className="w-3 h-3 text-yellow-400" />
                        <span className="text-lg font-black text-white">#{getRank()}</span>
                      </div>
                      <p className="text-[9px] uppercase text-yellow-400 font-bold tracking-wide">Class Rank</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        <span className="text-lg font-black text-white">{classStats.topPercent}%</span>
                      </div>
                      <p className="text-[9px] uppercase text-emerald-400 font-bold tracking-wide">Percentile</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-blue-300">{leaderboard.length}</p>
                  <p className="text-[9px] uppercase text-slate-500 font-bold mt-0.5">Students</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-yellow-300">{classStats.avg}</p>
                  <p className="text-[9px] uppercase text-slate-500 font-bold mt-0.5">Class Avg</p>
                </div>
              </div>

              

              {/* Logout */}
              <button
                onClick={logout}
                className="w-full h-9 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 hover:border-red-400/40 rounded-xl text-red-400 hover:text-red-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>

            {/* ── Right panel – Leaderboard ───────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/40">

              {/* Leaderboard header */}
              <div className="px-5 py-4 border-b border-slate-800/60 backdrop-blur-md flex-shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-500/15 border border-slate-700/50">
                      <Trophy className="w-4 h-4 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white leading-tight">Class Leaderboard</h3>
                      <p className="text-[10px] text-slate-500">Live · {leaderboard.length} students ranked</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400">LIVE</span>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by name or reg no…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 bg-slate-900/60 border border-slate-700/50 rounded-lg text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/10 transition"
                  />
                </div>
              </div>

              {/* Leaderboard body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-5">

                {filteredLeaderboard.length > 0 ? (
                  <>
                    {/* ── Podium (top 3 only when no active search) ── */}
                    {!searchQuery.trim() && leaderboard.length >= 1 && (
                      <div>
                        <p className="text-[10px] uppercase text-slate-600 font-bold mb-3 tracking-widest">Top Performers</p>

                        {/* Podium layout: 2nd | 1st | 3rd */}
                        <div className="flex items-end justify-center gap-2">
                          {/* 2nd */}
                          {leaderboard[1] && (() => {
                            const m = RANK_META[1];
                            return (
                              <div className="flex flex-col items-center flex-1 max-w-[130px]">
                                <div className={`bg-gradient-to-br ${m.bg} border ${m.border} rounded-xl p-3 w-full text-center mb-2`}>
                                  <p className="text-lg mb-0.5">{m.medal}</p>
                                  <p className="text-[10px] font-bold text-white truncate leading-tight">{leaderboard[1].name.split(" ")[0]}</p>
                                  <p className="text-[9px] text-slate-500 font-mono mb-1 truncate">{leaderboard[1].regNo}</p>
                                  <p className={`text-base font-black ${m.numText}`}>{Number(leaderboard[1].cgpa).toFixed(2)}</p>
                                </div>
                                <div className={`${m.bg} bg-gradient-to-b border ${m.border} w-full ${m.barH} rounded-t-lg flex items-center justify-center`}>
                                  <span className={`${m.numSize} font-black ${m.text} opacity-60`}>2</span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* 1st */}
                          {leaderboard[0] && (() => {
                            const m = RANK_META[0];
                            return (
                              <div className="flex flex-col items-center flex-1 max-w-[140px]">
                                <div className={`bg-gradient-to-br ${m.bg} border-2 ${m.border} rounded-xl p-3 w-full text-center mb-2 shadow-lg shadow-yellow-500/10`}>
                                  <p className="text-xl mb-0.5">{m.medal}</p>
                                  <p className="text-[11px] font-bold text-white truncate leading-tight">{leaderboard[0].name.split(" ")[0]}</p>
                                  <p className="text-[9px] text-slate-500 font-mono mb-1 truncate">{leaderboard[0].regNo}</p>
                                  <p className={`text-xl font-black ${m.numText}`}>{Number(leaderboard[0].cgpa).toFixed(2)}</p>
                                </div>
                                <div className={`bg-gradient-to-b ${m.bg} border ${m.border} w-full ${m.barH} rounded-t-lg flex items-center justify-center`}>
                                  <span className={`${m.numSize} font-black ${m.text} opacity-60`}>1</span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* 3rd */}
                          {leaderboard[2] && (() => {
                            const m = RANK_META[2];
                            return (
                              <div className="flex flex-col items-center flex-1 max-w-[130px]">
                                <div className={`bg-gradient-to-br ${m.bg} border ${m.border} rounded-xl p-3 w-full text-center mb-2`}>
                                  <p className="text-lg mb-0.5">{m.medal}</p>
                                  <p className="text-[10px] font-bold text-white truncate leading-tight">{leaderboard[2].name.split(" ")[0]}</p>
                                  <p className="text-[9px] text-slate-500 font-mono mb-1 truncate">{leaderboard[2].regNo}</p>
                                  <p className={`text-sm font-black ${m.numText}`}>{Number(leaderboard[2].cgpa).toFixed(2)}</p>
                                </div>
                                <div className={`bg-gradient-to-b ${m.bg} border ${m.border} w-full ${m.barH} rounded-t-lg flex items-center justify-center`}>
                                  <span className={`${m.numSize} font-black ${m.text} opacity-60`}>3</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* ── Rankings list ── */}
                    <div>
                      <p className="text-[10px] uppercase text-slate-600 font-bold mb-3 tracking-widest">
                        {searchQuery.trim() ? `Results for "${searchQuery}"` : "All Rankings"}
                      </p>

                      <div className="space-y-1.5">
                        {filteredLeaderboard.map(item => {
                          const globalRank = leaderboard.findIndex(r => r.reg_no === item.reg_no) + 1;
                          const isMe = student?.regNo === item.reg_no;
                          const cgpaVal = Number(item.cgpa).toFixed(2);
                          

                          const rankColor =
                            globalRank === 1 ? "text-yellow-400 border-yellow-500/40 bg-yellow-500/10"  :
                            globalRank === 2 ? "text-slate-300  border-slate-400/40  bg-slate-400/10"   :
                            globalRank === 3 ? "text-amber-400  border-amber-600/40  bg-amber-600/10"   :
                                              "text-slate-500  border-slate-700/40  bg-slate-800/40"   ;

                          return (
                            <div key={item.regNo} className="relative group">
                              {isMe && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur-sm" />
                              )}
                              <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                                isMe
                                  ? "bg-gradient-to-r from-blue-900/40 to-purple-900/30 border-blue-500/40 shadow-sm shadow-blue-500/10"
                                  : "bg-slate-900/40 border-slate-800/50 hover:border-slate-700/50 hover:bg-slate-900/60"
                              }`}>

                                {/* Rank badge */}
                                <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center text-xs font-bold rounded-lg border ${rankColor}`}>
                                  {globalRank}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-bold text-white truncate">{item.name}</p>
                                    {isMe && (
                                      <span className="flex-shrink-0 px-1.5 py-0.5 bg-blue-500/25 border border-blue-400/40 rounded text-[9px] font-bold text-blue-300">YOU</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-600 font-mono">{item.regNo}</p>
                                </div>

                                {/* CGPA */}
                                <div className={`flex-shrink-0 text-right px-3 py-1.5 rounded-lg border ${
                                  isMe
                                    ? "bg-blue-600/20 border-blue-400/40 text-blue-200"
                                    : "bg-slate-800/50 border-slate-700/40 text-slate-400"
                                }`}>
                                  <p className="text-sm font-black leading-tight">{cgpaVal}</p>
                                  <p className="text-[8px] uppercase font-bold tracking-wider opacity-70">CGPA</p>
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 text-slate-600">
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No students found</p>
                    <p className="text-xs mt-1 opacity-60">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 text-center border-t border-slate-800/50 bg-slate-950/70 backdrop-blur-xl relative z-20 text-[10px] font-semibold text-slate-600 uppercase tracking-widest flex-shrink-0">
        <div className="flex items-center justify-center gap-2">
          <span>SRM Result Portal</span>
          <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500 animate-pulse" />
          <span>2025</span>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(30px,-50px) scale(1.1); }
          66%       { transform: translate(-20px,20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71,85,105,0.3); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71,85,105,0.6); }
      `}</style>
    </div>
  );
}

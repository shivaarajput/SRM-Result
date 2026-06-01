import React, {
  useState,
  useEffect,
  useMemo
} from "react";

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
  Medal,
  Grid,
  User,
  LogOut,
  Sparkles,
  TrendingUp,
  Target,
  Star,
  Flame,
  BookOpen,
  BarChart3,
  Settings,
  Bell,
  Zap as Lightning,
  Award,
  Flame as Fire
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://srm-result-backend.vercel.app/api";

const SUBJECTS_CORE = [
  {
    id: "python",
    name: "Data Analysis Using Python Programming",
    credits: 4,
    badge: "Python Master",
    icon: "🐍",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "optimization",
    name: "Optimization Techniques",
    credits: 4,
    badge: "Problem Solver",
    icon: "📈",
    color: "from-emerald-500 to-teal-500"
  },
  {
    id: "aos",
    name: "Advanced Operating System",
    credits: 4,
    badge: "System Architect",
    icon: "💻",
    color: "from-orange-500 to-red-500"
  },
  {
    id: "aiml",
    name: "Artificial Intelligence and Machine Learning",
    credits: 4,
    badge: "AI Engineer",
    icon: "🤖",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "iot",
    name: "Internet of Things (IoT)",
    credits: 4,
    badge: "IoT Innovator",
    icon: "🌐",
    color: "from-indigo-500 to-blue-500"
  },
  {
    id: "softskills",
    name: "Soft Skills and Verbal Mastery",
    credits: 2,
    badge: "Communicator",
    icon: "🎤",
    color: "from-rose-500 to-pink-500"
  }
];


const ELECTIVES = [
  {
    id: "dvt",
    name: "Data Visualization Techniques",
    credits: 4,
    badge: "Data Artist",
    icon: "📊",
    color: "from-violet-500 to-purple-500"
  }
];

const GRADE_POINTS = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  F: 0
};

const GRADE_COLORS = {
  O: "text-yellow-300 bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border-yellow-400/50 hover:from-yellow-500/30 hover:to-amber-500/20",
  "A+": "text-emerald-300 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-400/50 hover:from-emerald-500/30 hover:to-teal-500/20",
  A: "text-green-300 bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-400/50 hover:from-green-500/30 hover:to-emerald-500/20",
  "B+": "text-sky-300 bg-gradient-to-br from-sky-500/20 to-blue-500/10 border-sky-400/50 hover:from-sky-500/30 hover:to-blue-500/20",
  B: "text-blue-300 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border-blue-400/50 hover:from-blue-500/30 hover:to-indigo-500/20",
  C: "text-orange-300 bg-gradient-to-br from-orange-500/20 to-red-500/10 border-orange-400/50 hover:from-orange-500/30 hover:to-red-500/20",
  F: "text-red-300 bg-gradient-to-br from-red-500/20 to-pink-500/10 border-red-400/50 hover:from-red-500/30 hover:to-pink-500/20"
};

const Toast = ({
  message,
  type,
  show,
  onClose
}) => {
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(
      onClose,
      3000
    );

    return () =>
      clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150]
      w-[90%] max-w-sm flex items-center gap-3 px-4 py-3
      rounded-2xl shadow-2xl backdrop-blur-xl border
      ${type === "error"
          ? "bg-red-500/20 border-red-400/50 text-red-200"
          : "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
        }`}
    >
      {type === "error" ? (
        <XCircle className="w-5 h-5 flex-shrink-0" />
      ) : (
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
      )}

      <span className="text-sm font-semibold">
        {message}
      </span>
    </div>
  );
};

export default function App() {
  // ----------------------
  // Auth & Session
  // ----------------------

  const [loading, setLoading] =
    useState(true);

  const [token, setToken] =
    useState(
      localStorage.getItem("token")
    );

  const [student, setStudent] =
    useState(() => {
      const stored =
        localStorage.getItem(
          "student"
        );

      return stored
        ? JSON.parse(stored)
        : null;
    });

  // ----------------------
  // Navigation
  // ----------------------

  const [step, setStep] =
    useState("login");

  // ----------------------
  // Login
  // ----------------------

  const [loginData, setLoginData] =
    useState({
      email: "",
      regNo: ""
    });

  // ----------------------
  // Result Data
  // ----------------------

  const [grades, setGrades] =
    useState(() => {
      const defaults = {};

      [
        ...SUBJECTS_CORE,
        ...ELECTIVES
      ].forEach(sub => {
        defaults[sub.id] = "A";
      });

      return defaults;
    });

  const [elective, setElective] =
    useState("dvt");

  const [calculatedCGPA,
    setCalculatedCGPA] =
    useState(0);

  const [editCount,
    setEditCount] =
    useState(0);

  // ----------------------
  // Leaderboard
  // ----------------------

  const [leaderboard,
    setLeaderboard] =
    useState([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  // ----------------------
  // UI
  // ----------------------

  const [errors, setErrors] =
    useState({});

  const [toast, setToast] =
    useState({
      show: false,
      message: "",
      type: "success"
    });

  // ----------------------
  // Toast Helper
  // ----------------------

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      show: true,
      message,
      type
    });
  };

  // ----------------------
  // Navigation Helper
  // ----------------------

  const navigateTo = (
    page
  ) => {
    window.history.pushState(
      { page },
      "",
      ""
    );

    setStep(page);
  };

  // ----------------------
  // History
  // ----------------------

  useEffect(() => {
    window.history.replaceState(
      {
        page: "login"
      },
      ""
    );

    const handlePopState =
      event => {
        setStep(
          event.state?.page ||
          "login"
        );
      };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () =>
      window.removeEventListener(
        "popstate",
        handlePopState
      );
  }, []);

  // ----------------------
  // Load Leaderboard
  // ----------------------

  const loadLeaderboard =
    async () => {

      try {

        const res =
          await fetch(
            `${API_URL}/results/leaderboard`
          );

        const data =
          await res.json();

        setLeaderboard(data);

      } catch (err) {

        console.error(err);

      }
    };

  // ----------------------
  // Poll Leaderboard
  // ----------------------

  useEffect(() => {

    loadLeaderboard();

  }, []);

  // ----------------------
  // Restore Session
  // ----------------------

  useEffect(() => {

    const restore =
      async () => {

        if (!token) {
          setLoading(false);
          return;
        }

        try {

          const res =
            await fetch(
              `${API_URL}/results/me`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`
                }
              }
            );

          if (!res.ok) {
            throw new Error();
          }

          const data =
            await res.json();

          if (data) {

            setCalculatedCGPA(
              data.cgpa
            );

            setGrades(
              data.grades
            );

            setElective(
              data.elective
            );

            setEditCount(
              data.editCount || 0
            );

            setStep(
              "result"
            );
          }

        } catch {

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "student"
          );

          setToken(null);

          setStudent(null);

        } finally {

          setLoading(false);

        }
      };

    restore();

  }, [token]);

  const liveCGPA = useMemo(() => {

    let totalPoints = 0;
    let totalCredits = 0;

    const allSubjects = [
      ...SUBJECTS_CORE,
      ELECTIVES.find(
        e => e.id === elective
      )
    ];

    allSubjects.forEach(sub => {

      totalPoints +=
        GRADE_POINTS[
        grades[sub.id]
        ] * sub.credits;

      totalCredits +=
        sub.credits;

    });

    return (
      totalPoints /
      totalCredits
    ).toFixed(2);

  }, [grades, elective]);

  const classStats = useMemo(() => {

    if (
      !student ||
      leaderboard.length === 0
    ) {
      return {
        avg: 0,
        topPercent: 0
      };
    }

    const total =
      leaderboard.reduce(
        (acc, curr) =>
          acc + curr.cgpa,
        0
      );

    const avg = (
      total /
      leaderboard.length
    ).toFixed(2);

    const myRankIndex =
      leaderboard.findIndex(
        u =>
          u.regNo ===
          student.regNo
      );

    const percentile =
      myRankIndex !== -1
        ? Math.ceil(
          (
            (leaderboard.length -
              myRankIndex -
              1) /
            leaderboard.length
          ) * 100
        )
        : 0;

    return {
      avg,
      topPercent:
        percentile
    };

  }, [leaderboard, student]);

  const getRank = () => {

    if (!student) {
      return "-";
    }

    const idx =
      leaderboard.findIndex(
        item =>
          item.regNo ===
          student.regNo
      );

    return idx !== -1
      ? idx + 1
      : "-";
  };

  const filteredLeaderboard = useMemo(() => {
    if (!searchQuery.trim()) return leaderboard;
    
    const query = searchQuery.toLowerCase().trim();
    return leaderboard.filter(item =>
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.regNo && item.regNo.toLowerCase().includes(query))
    );
  }, [leaderboard, searchQuery]);

  const handleLoginSubmit =
    async () => {

      setErrors({});

      if (
        !loginData.email ||
        !loginData.regNo
      ) {

        showToast(
          "Email and Registration Number required",
          "error"
        );

        return;
      }

      try {

        setLoading(true);

        const res =
          await fetch(
            `${API_URL}/auth/login`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                email:
                  loginData.email
                    .trim()
                    .toLowerCase(),

                regNo:
                  loginData.regNo
                    .trim()
                    .toUpperCase()
              })
            }
          );

        const data =
          await res.json();

        if (!data.success) {

          showToast(
            data.message ||
            "Invalid credentials",
            "error"
          );

          return;
        }

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "student",
          JSON.stringify(
            data.student
          )
        );

        setToken(
          data.token
        );

        setStudent(
          data.student
        );

        const resultRes =
          await fetch(
            `${API_URL}/results/me`,
            {
              headers: {
                Authorization:
                  `Bearer ${data.token}`
              }
            }
          );

        const result =
          await resultRes.json();

        if (
          result &&
          result.cgpa
        ) {

          setCalculatedCGPA(
            result.cgpa
          );

          if (result.grades) {
            setGrades(
              result.grades
            );
          }

          if (
            result.elective
          ) {
            setElective(
              result.elective
            );
          }

          setEditCount(
            result.editCount || 0
          );

          navigateTo(
            "result"
          );

          showToast(
            `Welcome back ${data.student.name
              .split(" ")[0]
            }`
          );

        } else {

          navigateTo(
            "subjects"
          );
        }

      } catch (err) {

        console.error(err);

        showToast(
          "Unable to login",
          "error"
        );

      } finally {

        setLoading(false);

      }
    };

  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "student"
    );

    setToken(null);

    setStudent(null);

    setStep("login");
  };

  const calculateAndPublish =
    async () => {

      if (!student) {

        showToast(
          "Please login again",
          "error"
        );

        return;
      }

      setLoading(true);

      try {

        const payload = {
          name: student.name,
          cgpa: Number(
            liveCGPA
          ),
          grades,
          elective,
          editCount
        };

        const res =
          await fetch(
            `${API_URL}/results`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify(
                payload
              )
            }
          );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.message
          );
        }

        setCalculatedCGPA(
          Number(
            liveCGPA
          )
        );

        await loadLeaderboard();

        navigateTo(
          "result"
        );

        showToast(
          "Result Published Successfully!"
        );

      } catch (err) {

        console.error(err);

        showToast(
          "Unable to save result",
          "error"
        );

      } finally {

        setLoading(false);

      }
    };

  const loadMyResult =
    async () => {

      if (!token) return;

      try {

        const res =
          await fetch(
            `${API_URL}/results/me`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        if (!res.ok) {
          return;
        }

        const data =
          await res.json();

        if (!data) return;

        setCalculatedCGPA(
          data.cgpa
        );

        if (data.grades) {
          setGrades(
            data.grades
          );
        }

        if (data.elective) {
          setElective(
            data.elective
          );
        }

        setEditCount(
          data.editCount || 0
        );

      } catch (err) {

        console.error(err);

      }
    };

  useEffect(() => {

    if (
      (step === "subjects" ||
        step === "result") &&
      !student
    ) {

      setStep(
        "login"
      );

      showToast(
        "Please login first",
        "error"
      );
    }

  }, [step, student]);

  if (
    loading &&
    !student
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex flex-col items-center justify-center gap-4 relative overflow-hidden">

        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">
            Loading your academic journey...
          </p>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-slate-100 font-sans flex flex-col overflow-hidden relative">

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast(prev => ({
            ...prev,
            show: false
          }))
        }
      />

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Header */}

      <header className="px-6 py-5 relative z-20 flex items-center justify-between backdrop-blur-xl bg-slate-950/60 border-b border-slate-700/50">

        <div className="flex items-center gap-4">

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75" />
            <div className="relative bg-slate-950 p-3 rounded-xl">
              <GraduationCap className="text-blue-400 w-6 h-6" />
            </div>
          </div>

          <div>

            <h1 className="font-bold text-xl text-white">
              SRM Academic Portal
            </h1>

            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              MCA Excellence • 2025
            </p>

          </div>

        </div>

        {student && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{student.name}</p>
              <p className="text-xs text-slate-400">{student.regNo}</p>
            </div>
          </div>
        )}

      </header>

      <main className="flex-1 relative z-10 overflow-hidden">
        {step === "login" && (
          <div className="flex items-center justify-center min-h-full p-4">

            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center">

              {/* Left - Hero Section */}

              <div className="text-center lg:text-left space-y-8">

                <div className="space-y-4">
                  <div className="inline-block">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 w-fit">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-semibold text-blue-300">Live Rankings Active</span>
                    </div>
                  </div>

                  <h2 className="text-6xl lg:text-7xl font-black text-white leading-tight">

                    Compete & Excel

                  </h2>

                  <p className="text-xl text-slate-300 leading-relaxed max-w-lg">

                    Track your CGPA in real-time, compete with classmates, and climb the leaderboard. Your academic excellence starts here.

                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-xs text-slate-400">Live CGPA</p>
                      <p className="text-sm font-bold text-white">Calculator</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <Target className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-xs text-slate-400">Class</p>
                      <p className="text-sm font-bold text-white">Rankings</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right - Login Form */}

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
                
                <div className="relative bg-slate-950/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 space-y-6">

                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Login to Portal</h3>
                    <p className="text-sm text-slate-400">Enter your SRM credentials</p>
                  </div>

                  <div>

                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-3">

                      Official Email

                    </label>

                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          email:
                            e.target.value
                        })
                      }
                      placeholder="you@srmist.edu.in"
                      className="w-full h-14 px-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    />

                  </div>

                  <div>

                    <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-3">

                      Registration Number

                    </label>

                    <input
                      type="text"
                      value={loginData.regNo}
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          regNo:
                            e.target.value
                        })
                      }
                      placeholder="RA2532241030001"
                      className="w-full h-14 px-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                    />

                  </div>

                  <button
                    onClick={
                      handleLoginSubmit
                    }
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
                  >

                    {loading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        View Results

                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}

                  </button>

                </div>
              </div>

            </div>

          </div>
        )}

        {step === "subjects" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden w-full max-w-7xl mx-auto px-4 lg:px-6">

            {/* CGPA Bar */}

            <div className="py-6 flex-shrink-0">

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur" />
                
                <div className="relative bg-gradient-to-r from-slate-900/40 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">

                  <div className="flex items-center gap-4">

                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-slate-700/50 flex items-center justify-center">

                      <Calculator className="w-7 h-7 text-blue-300" />

                    </div>

                    <div>

                      <div className="text-xs text-slate-400 uppercase font-bold tracking-wide">

                        Current Grade Entry

                      </div>

                      <div className="text-white font-bold text-lg">

                        {student?.name}

                      </div>

                    </div>

                  </div>

                  <div className="flex items-center gap-4 bg-slate-950/50 rounded-xl px-6 py-3 border border-slate-700/50 backdrop-blur">

                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">Live CGPA</p>
                      <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">

                        {liveCGPA}

                      </p>
                    </div>

                  </div>

                </div>
              </div>

            </div>

            {/* Subject Grid */}

            <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar">

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {SUBJECTS_CORE.map(sub => (

                  <div
                    key={sub.id}
                    className="group relative"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${sub.color} rounded-2xl blur opacity-20 group-hover:opacity-30 transition`} />
                    
                    <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 backdrop-blur hover:border-slate-600/50 p-6 rounded-2xl transition-all">

                      <div className="flex justify-between mb-4">

                        <div className="flex gap-3">

                          <span className="text-3xl group-hover:scale-110 transition-transform">

                            {sub.icon}

                          </span>

                          <div>

                            <h3 className="text-sm font-bold text-white">

                              {sub.name}

                            </h3>

                            <div className="text-[11px] text-slate-400 font-semibold mt-1">

                              {sub.badge}

                            </div>

                          </div>

                        </div>

                        <span className="text-[11px] font-bold text-slate-300 bg-slate-950/50 px-3 py-1 rounded-lg">

                          {sub.credits} Cr

                        </span>

                      </div>

                      <div className="grid grid-cols-7 gap-1.5">

                        {Object.keys(
                          GRADE_POINTS
                        ).map(g => (

                          <button
                            key={g}
                            onClick={() =>
                              setGrades({
                                ...grades,
                                [sub.id]: g
                              })
                            }
                            className={`h-10 rounded-lg text-xs font-bold transition-all border ${grades[sub.id] === g
                              ? GRADE_COLORS[g] + " border-current"
                              : "bg-slate-950/30 text-slate-500 border-slate-700/50 hover:border-slate-600/50"
                              }`}
                          >
                            {g}
                          </button>

                        ))}

                      </div>

                    </div>
                  </div>

                ))}

                {/* ELECTIVE */}

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-2xl blur" />
                  
                  <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 backdrop-blur p-6 rounded-2xl">

                    <label className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-4 block">

                      Choose Elective Subject

                    </label>

                    <div className="flex flex-col gap-3 mb-4">

                      {ELECTIVES.map(ele => (

                        <button
                          key={ele.id}
                          onClick={() =>
                            setElective(ele.id)
                          }
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${elective === ele.id
                            ? "bg-violet-500/20 border-violet-400/50 shadow-lg shadow-violet-500/20"
                            : "bg-slate-950/30 border-slate-700/50 hover:border-slate-600/50"
                            }`}
                        >

                          <div
                            className={`w-4 h-4 rounded-full border-2 transition-all ${elective === ele.id
                              ? "border-violet-300 bg-violet-500/30"
                              : "border-slate-600"
                              }`}
                          />

                          <span className="text-xs font-bold text-slate-200">

                            {ele.name}

                          </span>

                        </button>

                      ))}

                    </div>

                    <div className="grid grid-cols-7 gap-1.5">

                      {Object.keys(
                        GRADE_POINTS
                      ).map(g => (

                        <button
                          key={g}
                          onClick={() =>
                            setGrades({
                              ...grades,
                              [elective]: g
                            })
                          }
                          className={`h-10 rounded-lg text-xs font-bold transition-all border ${grades[elective] === g
                            ? GRADE_COLORS[g] + " border-current"
                            : "bg-slate-950/30 text-slate-500 border-slate-700/50 hover:border-slate-600/50"
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

            {/* Submit Button */}

            <div className="py-6 flex-shrink-0">

              <button
                onClick={
                  calculateAndPublish
                }
                disabled={loading}
                className="w-full md:w-1/2 lg:w-1/3 mx-auto block h-14 rounded-xl font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white flex items-center justify-center gap-2"
              >

                {loading
                  ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  )
                  : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Publish Results
                    </>
                  )}

              </button>

            </div>

          </div>
        )}

        {step === "result" && (
          <div className="flex-1 flex flex-col w-full h-full overflow-hidden">

            <div className="flex-1 flex flex-col lg:flex-row h-full gap-0 overflow-hidden">

              {/* LEFT PANEL - Student Card */}

              <div className="w-full lg:w-[380px] xl:w-[420px] bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-sm lg:border-r border-slate-700/50 flex flex-col p-4 md:p-6 shrink-0 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar">

                {/* Main Score Card */}

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-purple-600/40 to-pink-600/40 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
                  
                  <div className="relative bg-gradient-to-br from-slate-800/40 via-slate-700/40 to-slate-800/40 border border-slate-600/50 backdrop-blur-xl p-4 md:p-6 rounded-3xl text-center overflow-hidden">

                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/30 rounded-full blur-3xl" />
                    <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl" />

                    <div className="relative z-10 space-y-3 md:space-y-4">

                      <div className="inline-block px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-400/30">
                        <span className="text-[10px] md:text-[12px] font-bold uppercase tracking-widest text-blue-200">
                          ⭐ Your Results
                        </span>
                      </div>

                      <div>
                        <p className="text-xs md:text-sm text-slate-300 mb-0.5">{student?.name}</p>
                        <p className="text-[10px] md:text-xs text-slate-500 font-mono">{student?.regNo}</p>
                      </div>

                      <div className="flex items-center justify-center gap-2 py-4 md:py-6">
                        <div className="text-center">
                          <p className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 drop-shadow-xl">
                            {calculatedCGPA}
                          </p>
                          <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1.5">CGPA Score</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 rounded-xl md:rounded-2xl p-2.5 md:p-3 border border-yellow-500/30 text-center">
                          <div className="flex items-center justify-center gap-1.5 mb-1.5">
                            <Crown className="w-3.5 h-3.5 md:w-5 md:h-5 text-yellow-400" />
                            <span className="text-xl md:text-2xl lg:text-3xl font-black text-white">#{getRank()}</span>
                          </div>
                          <p className="text-[9px] md:text-[11px] uppercase text-yellow-300 font-bold">Class Rank</p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-xl md:rounded-2xl p-2.5 md:p-3 border border-emerald-500/30 text-center">
                          <div className="flex items-center justify-center gap-1.5 mb-1.5">
                            <TrendingUp className="w-3.5 h-3.5 md:w-5 md:h-5 text-emerald-400" />
                            <span className="text-xl md:text-2xl lg:text-3xl font-black text-white">{classStats.topPercent}%</span>
                          </div>
                          <p className="text-[9px] md:text-[11px] uppercase text-emerald-300 font-bold">Percentile</p>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>

                {/* Stats Cards */}

                <div className="grid grid-cols-2 gap-2 md:gap-3">

                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-blue-600/30 rounded-xl md:rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                    
                    <div className="relative bg-slate-900/50 backdrop-blur border border-slate-700/50 p-3 md:p-4 rounded-xl md:rounded-2xl text-center hover:border-blue-500/50 transition-all">

                      <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-300 mb-0.5 md:mb-1">
                        {leaderboard.length}
                      </div>

                      <div className="text-[9px] md:text-[10px] uppercase text-slate-400 font-bold">Students</div>

                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 rounded-xl md:rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                    
                    <div className="relative bg-slate-900/50 backdrop-blur border border-slate-700/50 p-3 md:p-4 rounded-xl md:rounded-2xl text-center hover:border-yellow-500/50 transition-all">

                      <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-300 mb-0.5 md:mb-1">
                        {classStats.avg}
                      </div>

                      <div className="text-[9px] md:text-[10px] uppercase text-slate-400 font-bold">Avg CGPA</div>

                    </div>
                  </div>

                </div>

                {/* Logout Button */}

                <button
                  onClick={logout}
                  className="w-full h-10 md:h-12 bg-gradient-to-r from-red-600/30 to-red-700/30 hover:from-red-600/50 hover:to-red-700/50 border border-red-500/50 hover:border-red-400/50 rounded-lg md:rounded-xl text-red-300 hover:text-red-200 text-sm md:text-base font-bold flex items-center justify-center gap-2 transition-all"
                >

                  <LogOut className="w-4 h-4" />

                  Logout

                </button>

              </div>

              {/* RIGHT PANEL - Modern Leaderboard with Podium */}

              <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900/50 to-slate-950/80 backdrop-blur-sm overflow-hidden">

                {/* Leaderboard Header */}
                <div className="px-4 md:px-6 py-4 md:py-6 border-b border-slate-700/50 backdrop-blur-md space-y-3 md:space-y-4 flex-shrink-0">

                  <div className="flex items-center gap-2 md:gap-3">

                    <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-slate-700/50">

                      <Trophy className="w-4 h-4 md:w-6 md:h-6 text-purple-300" />

                    </div>

                    <div>

                      <h3 className="font-bold text-base md:text-xl text-white">

                        Elite Leaderboard
                      </h3>

                      <p className="text-[10px] md:text-xs text-slate-400 font-semibold">

                        Real-time Rankings
                      </p>

                    </div>

                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search student or reg..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 md:h-11 pl-10 pr-3 md:pr-4 bg-slate-900/60 border border-slate-700/50 rounded-lg text-xs md:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10"
                    />
                  </div>

                </div>

                {/* Leaderboard Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">

                  <div className="px-2 md:px-4 lg:px-6 py-3 md:py-4 space-y-2 md:space-y-3">

                    {filteredLeaderboard.length > 0 ? (
                      <>
                        {/* Podium Section for Top 3 */}
                        {leaderboard.slice(0, 3).some(item => filteredLeaderboard.some(f => f.regNo === item.regNo)) && (
                          <div className="mb-4 md:mb-6">
                            <p className="text-[10px] md:text-xs uppercase text-slate-500 font-bold mb-2 md:mb-3 pl-1">Top Performers</p>
                            <div className="flex items-flex-end justify-center gap-1 md:gap-3 h-32 md:h-40">
                              {/* 2nd Place */}
                              {leaderboard[1] && filteredLeaderboard.some(f => f.regNo === leaderboard[1].regNo) && (
                                <div className="flex flex-col items-center flex-1">
                                  <div className="bg-gradient-to-br from-slate-400/40 to-slate-300/30 border-2 border-slate-400/50 rounded-lg md:rounded-xl p-2 md:p-3 w-full text-center">
                                    <Medal className="w-5 h-5 md:w-6 md:h-6 text-slate-300 mx-auto mb-1" />
                                    <p className="text-[9px] md:text-xs font-bold text-white truncate">{leaderboard[1].name}</p>
                                    <p className="text-[8px] md:text-[9px] text-slate-400 mb-1">{leaderboard[1].regNo}</p>
                                    <p className="text-base md:text-xl font-black text-slate-200">{Number(leaderboard[1].cgpa).toFixed(2)}</p>
                                  </div>
                                  <div className="bg-slate-400/20 border border-slate-400/30 w-full h-16 md:h-20 rounded-t-lg flex items-center justify-center mt-2">
                                    <span className="text-2xl md:text-3xl font-black text-slate-300">2</span>
                                  </div>
                                </div>
                              )}

                              {/* 1st Place */}
                              {leaderboard[0] && filteredLeaderboard.some(f => f.regNo === leaderboard[0].regNo) && (
                                <div className="flex flex-col items-center flex-1">
                                  <div className="bg-gradient-to-br from-yellow-500/40 to-orange-500/30 border-2 border-yellow-500/50 rounded-lg md:rounded-xl p-2 md:p-3 w-full text-center">
                                    <Crown className="w-6 h-6 md:w-7 md:h-7 text-yellow-300 mx-auto mb-1" />
                                    <p className="text-[9px] md:text-xs font-bold text-white truncate">{leaderboard[0].name}</p>
                                    <p className="text-[8px] md:text-[9px] text-yellow-300 mb-1">{leaderboard[0].regNo}</p>
                                    <p className="text-lg md:text-2xl font-black text-yellow-200">{Number(leaderboard[0].cgpa).toFixed(2)}</p>
                                  </div>
                                  <div className="bg-yellow-500/20 border border-yellow-500/30 w-full h-24 md:h-32 rounded-t-lg flex items-center justify-center mt-2">
                                    <span className="text-3xl md:text-4xl font-black text-yellow-300">1</span>
                                  </div>
                                </div>
                              )}

                              {/* 3rd Place */}
                              {leaderboard[2] && filteredLeaderboard.some(f => f.regNo === leaderboard[2].regNo) && (
                                <div className="flex flex-col items-center flex-1">
                                  <div className="bg-gradient-to-br from-amber-600/40 to-amber-700/30 border-2 border-amber-600/50 rounded-lg md:rounded-xl p-2 md:p-3 w-full text-center">
                                    <Medal className="w-5 h-5 md:w-6 md:h-6 text-amber-300 mx-auto mb-1" />
                                    <p className="text-[9px] md:text-xs font-bold text-white truncate">{leaderboard[2].name}</p>
                                    <p className="text-[8px] md:text-[9px] text-slate-400 mb-1">{leaderboard[2].regNo}</p>
                                    <p className="text-base md:text-xl font-black text-amber-200">{Number(leaderboard[2].cgpa).toFixed(2)}</p>
                                  </div>
                                  <div className="bg-amber-600/20 border border-amber-600/30 w-full h-12 md:h-16 rounded-t-lg flex items-center justify-center mt-2">
                                    <span className="text-2xl md:text-3xl font-black text-amber-300">3</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Regular List for others */}
                        <div>
                          <p className="text-[10px] md:text-xs uppercase text-slate-500 font-bold mb-2 md:mb-3 pl-1">Rankings</p>
                          {filteredLeaderboard.map((studentItem, idx) => {

                            const globalRank = leaderboard.findIndex(item => item.regNo === studentItem.regNo) + 1;
                            const isMe = student?.regNo === studentItem.regNo;
                            const cgpaValue = Number(studentItem.cgpa).toFixed(2);

                            return (

                              <div
                                key={studentItem.regNo}
                                className={`group relative transition-all duration-300 mb-2 md:mb-3 ${isMe ? "scale-100" : ""}`}
                              >
                                {isMe && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-lg md:rounded-xl blur" />
                                )}

                                <div
                                  className={`relative flex items-center justify-between p-2.5 md:p-3 lg:p-4 rounded-lg md:rounded-xl border backdrop-blur transition-all duration-300 ${
                                    isMe
                                      ? "bg-gradient-to-r from-blue-600/25 to-purple-600/25 border-blue-500/60 shadow-lg shadow-blue-500/20"
                                      : "bg-slate-900/40 border-slate-700/50 hover:border-slate-600/50 group-hover:bg-slate-900/60"
                                  }`}
                                >

                                  {/* Rank Badge */}
                                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">

                                    <div className={`w-8 h-8 md:w-10 md:h-10 flex-shrink-0 flex items-center justify-center font-bold text-xs md:text-sm rounded-lg md:rounded-xl border transition-all ${
                                      globalRank <= 3
                                        ? "bg-slate-800/60 border-slate-700/50 text-slate-400"
                                        : "bg-slate-800/60 border-slate-700/50 text-slate-400"
                                    }`}>

                                      <span className="font-bold">{globalRank}</span>

                                    </div>

                                    {/* Student Info */}
                                    <div className="flex-1 min-w-0">

                                      <div className="flex items-center gap-1 md:gap-2 mb-0.5">
                                        <h4 className="font-bold text-white text-xs md:text-sm truncate">

                                          {studentItem.name}

                                        </h4>
                                        {isMe && (
                                          <span className="flex-shrink-0 px-1.5 py-0.5 bg-blue-500/30 border border-blue-400/50 rounded text-[8px] md:text-[10px] font-bold text-blue-300">
                                            You
                                          </span>
                                        )}
                                      </div>

                                      <p className="text-[8px] md:text-[10px] text-slate-500 font-mono">

                                        {studentItem.regNo}

                                      </p>

                                    </div>

                                  </div>

                                  {/* CGPA Score */}
                                  <div className="flex-shrink-0 ml-2 md:ml-3">
                                    <div className={`text-right px-2.5 md:px-3 lg:px-4 py-1.5 md:py-2 rounded-lg md:rounded-lg border transition-all ${
                                      isMe
                                        ? "bg-blue-600/30 border-blue-400/60 text-blue-200"
                                        : "bg-slate-900/60 border-slate-800/50 text-slate-400"
                                    }`}>

                                      <div className="text-sm md:text-base lg:text-lg font-black">
                                        {cgpaValue}
                                      </div>

                                      <div className="text-[8px] md:text-[9px] uppercase font-bold tracking-wider">
                                        CGPA
                                      </div>

                                    </div>
                                  </div>

                                </div>

                              </div>

                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 md:py-12 text-slate-400">
                        <Search className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 opacity-30" />
                        <p className="text-xs md:text-sm font-medium">No students found</p>
                        <p className="text-[10px] md:text-xs text-slate-500 mt-1">Try a different search term</p>
                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </main>


      <footer className="py-4 text-center border-t border-slate-700/50 bg-slate-950/80 backdrop-blur-xl relative z-20 text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-widest flex-shrink-0">

        <div className="flex items-center justify-center gap-2">

          <span>
            SRM Result Portal
          </span>

          <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />

          <span>2025</span>

        </div>

      </footer>

      <style>{`

      @keyframes blob {
        0%, 100% {
          transform: translate(0, 0) scale(1);
        }
        33% {
          transform: translate(30px, -50px) scale(1.1);
        }
        66% {
          transform: translate(-20px, 20px) scale(0.9);
        }
      }

      .animate-blob {
        animation: blob 7s infinite;
      }

      .animation-delay-2000 {
        animation-delay: 2s;
      }

      .animation-delay-4000 {
        animation-delay: 4s;
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(71, 85, 105, 0.5);
        border-radius: 999px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(71, 85, 105, 0.8);
      }

      @keyframes fade-in-up {

        0% {
          opacity: 0;
          transform:
            translateY(20px)
            scale(0.98);
        }

        100% {
          opacity: 1;
          transform:
            translateY(0)
            scale(1);
        }
      }

      .animate-fade-in-up {
        animation:
          fade-in-up
          0.6s
          cubic-bezier(
            0.16,
            1,
            0.3,
            1
          )
          forwards;
      }

    `}</style>

    </div>
  );
}

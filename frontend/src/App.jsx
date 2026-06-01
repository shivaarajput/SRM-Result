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
  User
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
    icon: "🐍"
  },
  {
    id: "optimization",
    name: "Optimization Techniques",
    credits: 4,
    badge: "Problem Solver",
    icon: "📈"
  },
  {
    id: "aos",
    name: "Advanced Operating System",
    credits: 4,
    badge: "System Architect",
    icon: "💻"
  },
  {
    id: "aiml",
    name: "Artificial Intelligence and Machine Learning",
    credits: 4,
    badge: "AI Engineer",
    icon: "🤖"
  },
  {
    id: "iot",
    name: "Internet of Things (IoT)",
    credits: 4,
    badge: "IoT Innovator",
    icon: "🌐"
  },
  {
    id: "softskills",
    name: "Soft Skills and Verbal Mastery",
    credits: 2,
    badge: "Communicator",
    icon: "🎤"
  }
];


const ELECTIVES = [
  {
    id: "dvt",
    name: "Data Visualization Techniques",
    credits: 4,
    badge: "Data Artist",
    icon: "📊"
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
  O: "text-yellow-400 bg-yellow-400/10 border-yellow-400/50 hover:bg-yellow-400/20",
  "A+": "text-emerald-400 bg-emerald-400/10 border-emerald-400/50 hover:bg-emerald-400/20",
  A: "text-green-400 bg-green-400/10 border-green-400/50 hover:bg-green-400/20",
  "B+": "text-cyan-400 bg-cyan-400/10 border-cyan-400/50 hover:bg-cyan-400/20",
  B: "text-blue-400 bg-blue-400/10 border-blue-400/50 hover:bg-blue-400/20",
  C: "text-orange-400 bg-orange-400/10 border-orange-400/50 hover:bg-orange-400/20",
  F: "text-red-400 bg-red-400/10 border-red-400/50 hover:bg-red-400/20"
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
      rounded-xl shadow-2xl backdrop-blur-md border
      ${type === "error"
          ? "bg-red-900/90 border-red-500/50"
          : "bg-emerald-900/90 border-emerald-500/50"
        }`}
    >
      {type === "error" ? (
        <XCircle className="w-5 h-5" />
      ) : (
        <CheckCircle className="w-5 h-5" />
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

  const handleEdit =
    async () => {

      if (
        editCount >= 1
      ) {

        showToast(
          "Edit limit reached",
          "error"
        );

        return;
      }

      try {

        const res =
          await fetch(
            `${API_URL}/results/edit-count`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        if (!res.ok) {
          throw new Error();
        }

        setEditCount(
          prev => prev + 1
        );

        navigateTo(
          "subjects"
        );

      } catch {

        showToast(
          "Unable to edit result",
          "error"
        );
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">

        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />

        <p className="text-slate-400 text-sm">
          Loading...
        </p>

      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col overflow-hidden">

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

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">

        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 via-slate-900/50 to-slate-950" />

        <div className="absolute -top-[20%] -right-[20%] w-[80%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />

        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[100px]" />

      </div>

      {/* Header */}

      <header className="px-6 py-4 relative z-20 flex items-center justify-between backdrop-blur-md bg-slate-950/80 border-b border-white/5">

        <div className="flex items-center gap-3">

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">

            <GraduationCap className="text-white w-5 h-5" />

          </div>

          <div>

            <h1 className="font-bold text-lg text-white">
              SRM Result
            </h1>

            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
              MCA Core • 2025
            </p>

          </div>

        </div>

      </header>

      <main className="flex-1 relative z-10">
        {step === "login" && (
          <div className="flex items-center justify-center min-h-full p-4">

            <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">

              {/* Left */}

              <div className="text-center lg:text-left">

                <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 mb-6">

                  <Crown className="w-10 h-10 text-yellow-500" />

                </div>

                <h2 className="text-5xl font-black text-white leading-tight">

                  Class Rank

                  <br />

                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">

                    Leaderboard

                  </span>

                </h2>

                <p className="text-slate-400 mt-4 max-w-md">

                  Enter your official email and
                  registration number to
                  calculate your CGPA and
                  view your class ranking.

                </p>

              </div>

              {/* Right */}

              <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">

                <div className="space-y-5">

                  {/* Email */}

                  <div>

                    <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">

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
                      placeholder="username@srmist.edu.in"
                      className="w-full h-14 px-4 bg-slate-950/50 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                    />

                  </div>

                  {/* Registration */}

                  <div>

                    <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">

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
                      className="w-full h-14 px-4 bg-slate-950/50 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                    />

                  </div>

                  {/* Login */}

                  <button
                    onClick={
                      handleLoginSubmit
                    }
                    disabled={loading}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                  >

                    {loading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Check Result

                        <ArrowRight className="w-4 h-4" />
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

            {/* CGPA BAR */}

            <div className="py-4 flex-shrink-0">

              <div className="bg-gradient-to-r from-slate-900 to-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 lg:px-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="h-12 w-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">

                    <Calculator className="w-6 h-6 text-blue-400" />

                  </div>

                  <div>

                    <div className="text-xs text-slate-400 uppercase font-bold">

                      Current Student

                    </div>

                    <div className="text-white font-medium">

                      {student?.name}

                    </div>

                  </div>

                </div>

                <div className="flex items-center gap-3 bg-slate-950/50 rounded-xl px-4 py-2 border border-white/5">

                  <span className="text-xs text-slate-400 uppercase font-bold">

                    Live CGPA

                  </span>

                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">

                    {liveCGPA}

                  </span>

                </div>

              </div>

            </div>

            {/* SUBJECT GRID */}

            <div className="flex-1 overflow-y-auto pb-6">

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {SUBJECTS_CORE.map(sub => (

                  <div
                    key={sub.id}
                    className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all"
                  >

                    <div className="flex justify-between mb-4">

                      <div className="flex gap-3">

                        <span className="text-2xl">

                          {sub.icon}

                        </span>

                        <div>

                          <h3 className="text-sm font-bold text-slate-200">

                            {sub.name}

                          </h3>

                          <div className="text-[10px] text-slate-500">

                            {sub.badge}

                          </div>

                        </div>

                      </div>

                      <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded">

                        {sub.credits} Credits

                      </span>

                    </div>

                    <div className="grid grid-cols-7 gap-1">

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
                          className={`h-9 rounded-lg text-xs font-bold transition-all ${grades[sub.id] === g
                            ? GRADE_COLORS[g]
                            : "bg-slate-950 text-slate-600"
                            }`}
                        >
                          {g}
                        </button>

                      ))}

                    </div>

                  </div>

                ))}

                {/* ELECTIVE */}

                <div className="bg-indigo-900/10 border border-indigo-500/30 p-5 rounded-2xl">

                  <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 block">

                    Elective Subject

                  </label>

                  <div className="flex flex-col gap-2 mb-4">

                    {ELECTIVES.map(ele => (

                      <button
                        key={ele.id}
                        onClick={() =>
                          setElective(ele.id)
                        }
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${elective === ele.id
                          ? "bg-indigo-500/20 border-indigo-500/50"
                          : "bg-slate-950/50 border-slate-800"
                          }`}
                      >

                        <div
                          className={`w-4 h-4 rounded-full border-2 ${elective === ele.id
                            ? "border-indigo-400"
                            : "border-slate-600"
                            }`}
                        />

                        <span className="text-xs font-bold">

                          {ele.name}

                        </span>

                      </button>

                    ))}

                  </div>

                  <div className="grid grid-cols-7 gap-1">

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
                        className={`h-9 rounded-lg text-xs font-bold ${grades[elective] === g
                          ? GRADE_COLORS[g]
                          : "bg-slate-950/50 text-slate-600"
                          }`}
                      >
                        {g}
                      </button>

                    ))}

                  </div>

                </div>

              </div>

            </div>

            {/* SUBMIT */}

            <div className="py-4">

              <button
                onClick={
                  calculateAndPublish
                }
                disabled={loading}
                className="w-full md:w-1/2 lg:w-1/3 mx-auto block h-14 rounded-xl font-bold text-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white"
              >

                {loading
                  ? "Processing..."
                  : "Lock Result & View Rank"}

              </button>

            </div>

          </div>
        )}

        {step === "result" && (
          <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden w-full">

            {/* LEFT PANEL */}

            <div className="w-full lg:w-[400px] xl:w-[450px] bg-slate-950 lg:border-r border-white/5 flex flex-col p-6 shrink-0">

              <div className="space-y-6">

                {/* SCORE CARD */}

                <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-900 p-8 rounded-[2rem] shadow-2xl text-center relative overflow-hidden">

                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

                  <div className="relative z-10">

                    <div className="inline-block px-3 py-1 bg-white/10 rounded-full mb-4">

                      <span className="text-[10px] font-bold uppercase tracking-widest">

                        Official Score

                      </span>

                    </div>

                    <h2 className="text-3xl font-black text-white mb-2">

                      {student?.name}

                    </h2>

                    <div className="text-blue-200/60 text-xs font-mono mb-6">

                      {student?.regNo}

                    </div>

                    <div className="flex items-baseline justify-center gap-2 mb-8">

                      <span className="text-8xl font-black text-white">

                        {calculatedCGPA}

                      </span>

                      <span className="text-xl font-bold text-blue-200">

                        CGPA

                      </span>

                    </div>

                    <div className="bg-slate-950/30 rounded-2xl p-4 flex divide-x divide-white/10">

                      <div className="flex-1">

                        <div className="text-2xl font-black text-white">

                          #{getRank()}

                        </div>

                        <div className="text-[10px] uppercase text-blue-200">

                          Class Rank

                        </div>

                      </div>

                      <div className="flex-1">

                        <div className="text-2xl font-black text-white">

                          {classStats.topPercent}%

                        </div>

                        <div className="text-[10px] uppercase text-blue-200">

                          Percentile

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* STATS */}

                <div className="grid grid-cols-2 gap-4">

                  <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 text-center">

                    <User className="w-6 h-6 mx-auto text-slate-500 mb-2" />

                    <div className="text-2xl font-bold text-white">

                      {leaderboard.length}

                    </div>

                    <div className="text-[10px] uppercase text-slate-500">

                      Participants

                    </div>

                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 text-center">

                    <Trophy className="w-6 h-6 mx-auto text-yellow-500 mb-2" />

                    <div className="text-2xl font-bold text-white">

                      {classStats.avg}

                    </div>

                    <div className="text-[10px] uppercase text-slate-500">

                      Avg CGPA

                    </div>

                  </div>

                </div>

                {/* EDIT */}

                {editCount < 1 ? (

                  <button
                    onClick={handleEdit}
                    className="w-full h-12 bg-slate-900 hover:bg-blue-600 rounded-xl border border-slate-800 text-white flex items-center justify-center gap-2"
                  >

                    <Edit3 className="w-4 h-4" />

                    Fix a Mistake (1 Left)

                  </button>

                ) : (

                  <div className="w-full h-12 bg-slate-900/50 rounded-xl border border-slate-900 text-slate-600 flex items-center justify-center">

                    Score Locked

                  </div>

                )}

                {/* LOGOUT */}

                <button
                  onClick={logout}
                  className="w-full h-12 bg-red-600 hover:bg-red-500 rounded-xl text-white font-bold"
                >

                  Logout

                </button>

              </div>

            </div>

            {/* RIGHT PANEL */}

            <div className="flex-1 flex flex-col bg-slate-950">

              <div className="px-6 py-6 border-b border-white/5">

                <div className="flex items-center gap-3">

                  <Grid className="w-5 h-5 text-yellow-500" />

                  <div>

                    <h3 className="font-bold text-lg text-white">

                      Class Leaderboard

                    </h3>

                    <p className="text-xs text-slate-500">

                      Live Rankings

                    </p>

                  </div>

                </div>

              </div>

              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">

                <div className="grid gap-3">

                  {leaderboard.map(
                    (
                      studentItem,
                      idx
                    ) => {

                      const isMe =
                        student?.regNo ===
                        studentItem.regNo;

                      return (

                        <div
                          key={
                            studentItem.regNo
                          }
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isMe
                            ? "bg-blue-600/10 border-blue-500/40"
                            : "bg-slate-900/40 border-slate-800"
                            }`}
                        >

                          <div className="flex items-center gap-4">

                            <div className="w-8 h-8 flex items-center justify-center">

                              {idx === 0 ? (
                                <Crown className="w-5 h-5 text-yellow-500" />
                              ) : idx === 1 ? (
                                <Medal className="w-5 h-5 text-slate-300" />
                              ) : idx === 2 ? (
                                <Medal className="w-5 h-5 text-amber-600" />
                              ) : (
                                <span className="text-slate-500 font-bold">

                                  {idx + 1}

                                </span>
                              )}

                            </div>

                            <div>

                              <div className="font-bold text-white">

                                {studentItem.name}

                              </div>

                              {isMe && (

                                <div className="text-[10px] uppercase text-blue-400 font-bold">

                                  You

                                </div>

                              )}

                            </div>

                          </div>

                          <div className="font-mono font-bold text-sm px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300">

                            {Number(
                              studentItem.cgpa
                            ).toFixed(2)}

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

      </main>


      <footer className="py-3 text-center border-t border-white/5 bg-slate-950 relative z-20 text-[10px] font-bold text-slate-600 uppercase tracking-widest">

        <div className="flex items-center justify-center gap-1.5">

          <span>
            Designed by Shiva
          </span>

          <Heart className="w-2.5 h-2.5 text-red-900 fill-red-900" />

        </div>

      </footer>

      <style>{`

      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #334155;
        border-radius: 999px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #475569;
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
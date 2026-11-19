// School sign-in (principal, office admin, teacher; later students & parents).
// The platform owner uses the separate Platform Admin app.

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  School,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeRoute, ROLE_PATH } from "@/config/roles";
import { apiRequest, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const LAST_SCHOOL_KEY = "ios_last_school_code";

const readLastSchool = () => {
  try {
    return localStorage.getItem(LAST_SCHOOL_KEY) ?? "";
  } catch {
    return "";
  }
};

// Accounts created by `npm run seed` in the backend (development builds only).
const DEMO = {
  code: "DEMO01",
  accounts: [
    { label: "Principal", email: "principal@demo.school", password: "Principal@123" },
    { label: "Office admin", email: "admin@demo.school", password: "Admin@123" },
    { label: "Teacher", email: "teacher@demo.school", password: "Teacher@123" },
  ],
};

type Lookup = { state: "idle" | "checking" | "found" | "missing" | "error"; name?: string };

/** Shows the school's name while the code is typed (debounced, cancellable). */
function useSchoolLookup(code: string): Lookup {
  const [result, setResult] = useState<Lookup>({ state: "idle" });
  useEffect(() => {
    const clean = code.trim().toUpperCase();
    if (clean.length < 3) {
      setResult({ state: "idle" });
      return;
    }
    setResult({ state: "checking" });
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const s = await apiRequest<{ name: string }>(`/public/schools/${encodeURIComponent(clean)}`, {
          skipAuth: true,
          signal: ctrl.signal,
        });
        setResult({ state: "found", name: s.name });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setResult({ state: err instanceof ApiError && err.status === 404 ? "missing" : "error" });
      }
    }, 400);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [code]);
  return result;
}

const input =
  "w-full rounded-[10px] border border-[#E4E1D8] bg-white py-2.5 text-[14px] text-[#0F1B33] placeholder:text-[#A8AAB0] transition focus:border-[#C6952F] focus:outline-none focus:ring-2 focus:ring-[#C6952F]/30";

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [schoolCode, setSchoolCode] = useState(readLastSchool);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  const school = useSchoolLookup(schoolCode);

  // returning user: school code already filled → start at the email field
  useEffect(() => {
    if (readLastSchool()) emailRef.current?.focus();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolCode.trim() || !email.trim() || !password) return;
    setBusy(true);
    setError("");
    try {
      const user = await login({ schoolCode: schoolCode.trim(), email: email.trim(), password }, remember);
      try {
        localStorage.setItem(LAST_SCHOOL_KEY, schoolCode.trim().toUpperCase());
      } catch {
        /* storage blocked — not important */
      }
      const from = (location.state as { from?: string } | null)?.from;
      const target = typeof from === "string" && from.startsWith(`/${ROLE_PATH[user.role]}/`) ? from : getHomeRoute(user.role);
      navigate(target, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (a: (typeof DEMO.accounts)[number]) => {
    setSchoolCode(DEMO.code);
    setEmail(a.email);
    setPassword(a.password);
    setError("");
  };

  const checkCaps = (e: React.KeyboardEvent) => setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  return (
    <div className="flex min-h-screen w-full bg-[#FBF9F3] font-[Inter,system-ui,sans-serif]">
      <BrandPanel />

      <main className="flex min-h-screen w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-[54%]">
        <div className="w-full max-w-[400px]">
          {/* mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Logo dark />
          </div>

          <h1 className="font-serif text-[1.85rem] leading-tight text-[#0F1B33]">Sign in</h1>
          <p className="mt-1.5 text-[14px] text-[#6B7280]">Welcome back. Use the details your school gave you.</p>

          {error && (
            <div role="alert" className="mt-5 flex gap-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {/* School code */}
            <div>
              <label htmlFor="schoolCode" className="mb-1.5 block text-[12.5px] font-medium text-[#374151]">
                School code
              </label>
              <div className="relative">
                <School className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8AAB0]" />
                <input
                  id="schoolCode"
                  autoComplete="organization"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="e.g. DPS01"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                  required
                  aria-describedby="school-status"
                  className={cn(input, "pl-9 pr-9 font-medium tracking-wide")}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {school.state === "checking" && <Loader2 className="h-4 w-4 animate-spin text-[#A8AAB0]" />}
                  {school.state === "found" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {school.state === "missing" && <AlertCircle className="h-4 w-4 text-red-500" />}
                </span>
              </div>
              <p id="school-status" aria-live="polite" className="mt-1.5 min-h-[18px] text-[12px]">
                {school.state === "found" && <span className="font-medium text-green-700">{school.name}</span>}
                {school.state === "missing" && <span className="text-red-600">No school found with this code.</span>}
                {school.state === "idle" && <span className="text-[#9CA3AF]">Printed on your school ID card or welcome letter.</span>}
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-medium text-[#374151]">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8AAB0]" />
                <input
                  ref={emailRef}
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn(input, "pl-9 pr-3")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-[12.5px] font-medium text-[#374151]">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[12.5px] font-medium text-[#0F1B33] hover:text-[#C6952F]">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8AAB0]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={checkCaps}
                  onKeyDown={checkCaps}
                  required
                  className={cn(input, "pl-9 pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8AAB0] hover:text-[#374151]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {capsLock && <p className="mt-1.5 text-[12px] text-amber-700">Caps Lock is on.</p>}
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2 text-[13px] text-[#6B7280]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-[#D1D5DB] accent-[#0F1B33]"
              />
              Stay signed in on this device
            </label>

            <button
              type="submit"
              disabled={busy || school.state === "missing"}
              className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#0F1B33] py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#16274A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {import.meta.env.DEV && (
            <div className="mt-5 rounded-[10px] border border-dashed border-[#C6952F]/50 bg-[#C6952F]/5 px-3.5 py-3">
              <p className="text-[11.5px] font-medium text-[#8a6a22]">Development demo — school {DEMO.code}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {DEMO.accounts.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => fillDemo(a)}
                    className="rounded-full border border-[#E8E4D9] bg-white px-3 py-1 text-[12px] font-medium text-[#0F1B33] hover:border-[#C6952F]"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-[13px] text-[#6B7280]">
            No account yet? Your school office or principal creates it for you.
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 text-[11.5px] text-[#9CA3AF]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Your school's data is private and encrypted in transit.
          </div>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Brand panel                                                          */
/* ------------------------------------------------------------------ */

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <>
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-[9px]",
          dark ? "bg-[#0F1B33] text-[#C6952F]" : "bg-[#C6952F] text-[#0F1B33]",
        )}
      >
        <GraduationCap className="h-5 w-5" />
      </div>
      <span className={cn("text-[16px] font-semibold tracking-tight", dark ? "text-[#0F1B33]" : "text-white")}>InstituteOS</span>
    </>
  );
}

const PREVIEW = [
  { icon: CalendarCheck, title: "Attendance marked", text: "Class 10-A · 28 of 30 present", tone: "bg-green-400/15 text-green-300" },
  { icon: BookOpenCheck, title: "Homework assigned", text: "Mathematics · due Friday", tone: "bg-sky-400/15 text-sky-300" },
  { icon: MessageSquare, title: "Message to parents", text: "PTM on Saturday, 10 AM", tone: "bg-[#C6952F]/20 text-[#E5BE6A]" },
];

function BrandPanel() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0F1B33] px-12 py-10 lg:flex lg:w-[46%]">
      {/* texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 56px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 56px)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(198,149,47,0.28) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(36,99,212,0.22) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 flex items-center gap-2.5">
        <Logo />
      </div>

      <div className="relative z-10 max-w-md">
        <h2 className="font-serif text-[2.5rem] leading-[1.12] tracking-tight text-white">
          Your whole school,
          <br />
          <span className="text-[#E5BE6A]">in one place.</span>
        </h2>
        <p className="mt-4 text-[14.5px] leading-relaxed text-[#AEB6C7]">
          Attendance, homework, exams and parent communication — for principals, teachers, office staff, parents and
          students.
        </p>

        {/* product preview */}
        <ul className="mt-9 space-y-3" aria-hidden="true">
          {PREVIEW.map(({ icon: Icon, title, text, tone }, i) => (
            <li
              key={title}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm"
              style={{ marginLeft: `${i * 18}px` }}
            >
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tone)}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-white">{title}</span>
                <span className="block truncate text-[12px] text-[#9AA4B8]">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 border-t border-white/10 pt-4 text-[12px] text-[#7C859B]">
        Built with school administrators, not just for them.
      </p>
    </aside>
  );
}

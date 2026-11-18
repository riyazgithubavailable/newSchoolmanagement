import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeRoute, ROLE_PATH, SELF_REGISTER_ROLES, type UserRole } from "@/config/roles";
import { ApiError } from "@/lib/api";
import {
    BookOpenCheck,
    Building2,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    GraduationCap,
    Lock,
    Mail,
    ShieldCheck,
    User,
    Users,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Role tabs shared between Login and Signup
// ---------------------------------------------------------------------------
// ids match UserRole in config/roles.ts
const ROLES: { id: UserRole; label: string; icon: typeof GraduationCap }[] = [
    { id: "TEACHER", label: "Teacher", icon: GraduationCap },
    { id: "STUDENT", label: "Student", icon: BookOpenCheck },
    { id: "PARENT", label: "Parent", icon: Users },
    { id: "PRINCIPAL", label: "Principal", icon: ShieldCheck },
    { id: "ADMIN", label: "Admin", icon: Building2 },
];

// Accounts created by `npm run seed` in the backend (development only).
// TODO: remove before going live.
const DEMO_SCHOOL_CODE = "DEMO01";
const DEMO_ACCOUNTS: Partial<Record<UserRole, { email: string; password: string }>> = {
    PRINCIPAL: { email: "principal@demo.school", password: "Principal@123" },
    ADMIN: { email: "admin@demo.school", password: "Admin@123" },
    TEACHER: { email: "teacher@demo.school", password: "Teacher@123" },
};
const PLATFORM_DEMO = { email: "superadmin@instituteos.local", password: "SuperAdmin@123" };

/** Turns an API error into a friendly message (backend messages are already user-facing). */
const errorText = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong. Please try again.");

function RoleTabs({ value, onChange, allowed = null }: { value: UserRole; onChange: (r: UserRole) => void; allowed?: UserRole[] | null }) {
    const tabs = allowed ? ROLES.filter((r) => allowed.includes(r.id as UserRole)) : ROLES;
    return (
        <div
            className="grid gap-1 rounded-[10px] bg-[#F4F2EC] border border-[#E8E4D9] p-1"
            style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
        >
            {tabs.map((role) => {
                const Icon = role.icon;
                const active = value === role.id;
                return (
                    <button
                        key={role.id}
                        type="button"
                        onClick={() => onChange(role.id)}
                        aria-pressed={active}
                        className={`flex flex-col items-center justify-center gap-1 rounded-[7px] px-2 py-2 text-[11px] font-medium transition-colors ${
                            active
                                ? "bg-[#0F1B33] text-white shadow-sm"
                                : "text-[#6B7280] hover:text-[#0F1B33]"
                        }`}
                    >
                        <Icon
                            className={`h-3.5 w-3.5 ${
                                active ? "text-[#C6952F]" : "text-[#9CA3AF]"
                            }`}
                        />
                        <span className="text-center leading-tight">{role.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Left brand panel — shared between Login and Signup
// ---------------------------------------------------------------------------
function BrandPanel({ heading, sub, features }) {
    return (
        <div className="hidden lg:flex lg:w-[46%] relative bg-[#0F1B33] flex-col justify-between overflow-hidden px-12 py-10">
            <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 56px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 56px)",
                }}
            />
            <div
                className="absolute -right-24 -top-24 w-72 h-72 rounded-full pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, rgba(198,149,47,0.25) 0%, transparent 70%)",
                }}
            />

            <div className="relative z-10 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-[6px] bg-[#C6952F] flex items-center justify-center font-serif text-[#0F1B33] font-bold text-sm">
                    I
                </div>
                <span className="text-white font-medium text-[15px] tracking-tight">
                    InstituteOS
                </span>
            </div>

            <div className="relative z-10 max-w-sm">
                <h1 className="font-serif text-white text-[2.35rem] leading-[1.15] tracking-tight">
                    {heading}
                </h1>
                <p className="text-[#AEB6C7] text-[14px] mt-4 leading-relaxed">
                    {sub}
                </p>
                <ul className="mt-7 space-y-2.5">
                    {features.map((item) => (
                        <li
                            key={item}
                            className="flex items-center gap-2.5 text-[13px] text-[#D7DCE6]"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#C6952F] shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <p className="relative z-10 text-[12px] text-[#7C859B] border-t border-white/10 pt-4">
                Built with school administrators, not just for them.
            </p>
        </div>
    );
}

function MobileLogo() {
    return (
        <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-[6px] bg-[#0F1B33] flex items-center justify-center font-serif text-[#C6952F] font-bold text-sm">
                I
            </div>
            <span className="text-[#0F1B33] font-medium text-[15px]">
                InstituteOS
            </span>
        </div>
    );
}

const inputClass =
    "w-full px-3 py-2.5 text-[13.5px] rounded-[8px] border border-[#E4E1D8] bg-white placeholder:text-[#A8AAB0] focus:outline-none focus:ring-2 focus:ring-[#C6952F]/40 focus:border-[#C6952F] transition-colors";

// ---------------------------------------------------------------------------
// Login page
// ---------------------------------------------------------------------------
function LoginPage({ onSignUpClick }) {
    const [role, setRole] = useState<UserRole>("TEACHER");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [form, setForm] = useState({ schoolCode: "", email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // platform owner (SUPER_ADMIN) signs in without a school code or role
    const [platform, setPlatform] = useState(false);

    const demo = platform ? PLATFORM_DEMO : DEMO_ACCOUNTS[role];
    const fillDemo = () => {
        if (!demo) return;
        setForm({ schoolCode: platform ? "" : DEMO_SCHOOL_CODE, email: demo.email, password: demo.password });
        setError("");
    };

    const switchMode = () => {
        setPlatform((p) => !p);
        setForm({ schoolCode: "", email: "", password: "" });
        setError("");
    };

    const handleChange = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((!platform && !form.schoolCode) || !form.email || !form.password) return;

        setIsLoading(true);
        setError("");
        try {
            const user = await login(
                platform
                    ? { email: form.email.trim(), password: form.password }
                    : { schoolCode: form.schoolCode.trim(), email: form.email.trim(), password: form.password, role },
                rememberMe,
            );
            // go back to the page the user originally asked for (same role only)
            const from = location.state?.from;
            const target =
                typeof from === "string" && from.startsWith(`/${ROLE_PATH[user.role]}/`)
                    ? from
                    : getHomeRoute(user.role);
            navigate(target, { replace: true });
        } catch (err) {
            setError(errorText(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full overflow-hidden flex bg-[#FBF9F3] font-[Inter,system-ui,sans-serif]">
            <BrandPanel
                heading={
                    <>
                        One school.
                        <br />
                        One platform.
                        <br />
                        Complete control.
                    </>
                }
                sub="From classroom attendance to exam results and fee collection, InstituteOS brings your entire school together."
                features={[
                    "Student & teacher management",
                    "Attendance & timetable",
                    "Exams & report cards",
                    "Fees & parent communication",
                ]}
            />

            <div className="w-full lg:w-[54%] min-h-screen flex items-center justify-center px-6 sm:px-10 py-10">
                <div className="w-full max-w-[360px]">
                    <MobileLogo />

                    <div>
                        <h2 className="font-serif text-[1.6rem] text-[#0F1B33] leading-tight">
                            {platform ? "Platform sign in" : "Welcome back"}
                        </h2>
                        <p className="text-[13px] text-[#6B7280] mt-1">
                            {platform ? "For the InstituteOS owner — manage all schools." : "Your school, all in one place."}
                        </p>
                    </div>

                    {/* Role tabs */}
                    {!platform && (
                        <div className="mt-5">
                            <p className="text-[12px] font-medium text-[#374151] mb-1.5">
                                Signing in as
                            </p>
                            <RoleTabs value={role} onChange={setRole} />
                        </div>
                    )}

                    {import.meta.env.DEV && demo && (
                        <div className="mt-3 flex items-center justify-between gap-2 rounded-[8px] border border-dashed border-[#C6952F]/50 bg-[#C6952F]/5 px-3 py-2">
                            <p className="text-[11.5px] text-[#6B7280]">
                                Dev demo —{" "}
                                {!platform && (
                                    <>
                                        school <span className="font-semibold text-[#0F1B33]">{DEMO_SCHOOL_CODE}</span>,{" "}
                                    </>
                                )}
                                {demo.email}
                            </p>
                            <button
                                type="button"
                                onClick={fillDemo}
                                className="shrink-0 text-[11.5px] font-semibold text-[#0F1B33] hover:text-[#C6952F]"
                            >
                                Fill demo
                            </button>
                        </div>
                    )}

                    {error && (
                        <p role="alert" className="mt-3 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                        {!platform && (
                            <div>
                                <label
                                    htmlFor="schoolCode"
                                    className="block text-[12px] font-medium text-[#374151] mb-1.5"
                                >
                                    School ID / Code
                                </label>
                                <input
                                    id="schoolCode"
                                    name="schoolCode"
                                    type="text"
                                    autoComplete="organization"
                                    placeholder="e.g. DPS01"
                                    value={form.schoolCode}
                                    onChange={handleChange("schoolCode")}
                                    required
                                    className={inputClass}
                                />
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-[12px] font-medium text-[#374151] mb-1.5"
                            >
                                Email / Username
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-[#A8AAB0]" />
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="name@school.edu"
                                    value={form.email}
                                    onChange={handleChange("email")}
                                    required
                                    className={`${inputClass} pl-9 pr-3`}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="password"
                                    className="block text-[12px] font-medium text-[#374151]"
                                >
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-[12px] text-[#0F1B33] font-medium hover:text-[#C6952F] transition-colors"
                                    onClick={() => navigate("/forgot-password")}
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-[#A8AAB0]" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange("password")}
                                    required
                                    className={`${inputClass} pl-9 pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8AAB0] hover:text-[#374151] transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-[15px] w-[15px]" />
                                    ) : (
                                        <Eye className="h-[15px] w-[15px]" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-[12.5px] text-[#6B7280] cursor-pointer select-none pt-0.5">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-[#D1D5DB] text-[#0F1B33] focus:ring-[#C6952F]"
                            />
                            <span>Stay signed in on this device</span>
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-[#0F1B33] hover:bg-[#16274A] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13.5px] font-medium py-2.5 rounded-[8px] transition-colors mt-1"
                        >
                            {isLoading ? (
                                <>
                                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="h-[15px] w-[15px]" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Sign up prompt */}
                    {!platform && (
                        <p className="mt-5 text-center text-[12.5px] text-[#6B7280]">
                            New to InstituteOS?{" "}
                            <button
                                type="button"
                                onClick={onSignUpClick}
                                className="font-medium text-[#0F1B33] hover:text-[#C6952F] transition-colors"
                            >
                                Create an account
                            </button>
                        </p>
                    )}

                    <p className="mt-3 text-center text-[12px] text-[#9CA3AF]">
                        <button type="button" onClick={switchMode} className="hover:text-[#0F1B33] transition-colors">
                            {platform ? "← Back to school sign in" : "Platform owner? Sign in here"}
                        </button>
                    </p>

                    <div className="mt-5 rounded-[8px] bg-[#F4F2EC] border border-[#E8E4D9] px-3 py-2.5">
                        <p className="text-[11.5px] text-[#7B7F87] text-center leading-relaxed">
                            Your access is automatically configured based on your role and
                            school permissions.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 mt-6 text-[11px] text-[#B0B4BE]">
                        <button type="button" className="hover:text-[#6B7280] transition-colors">
                            Privacy Policy
                        </button>
                        <span>&middot;</span>
                        <button type="button" className="hover:text-[#6B7280] transition-colors">
                            Terms of Service
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Sign up page
// ---------------------------------------------------------------------------
function SignUpPage({ onBackClick }) {
    const [role, setRole] = useState<UserRole>("TEACHER");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [form, setForm] = useState({
        fullName: "",
        schoolCode: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [created, setCreated] = useState<{ name: string; school: string } | null>(null);
    const { register } = useAuth();

    const handleChange = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (
            !form.fullName ||
            !form.schoolCode ||
            !form.email ||
            !form.password ||
            !form.confirmPassword
        ) {
            return;
        }

        // same rule as the backend, checked here for instant feedback
        if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
            setError("Password must be at least 8 characters and contain a letter and a number.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords don't match. Please re-enter.");
            return;
        }

        setIsLoading(true);
        try {
            const user = await register({
                schoolCode: form.schoolCode.trim(),
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                password: form.password,
                role,
            });
            setCreated({ name: user.fullName, school: user.schoolName || user.schoolCode });
        } catch (err) {
            setError(errorText(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (created) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#FBF9F3] px-6 font-[Inter,system-ui,sans-serif]">
                <div className="w-full max-w-[400px] rounded-2xl border border-[#E8E4D9] bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                        <CheckCircle2 className="h-7 w-7 text-green-600" />
                    </div>
                    <h2 className="mt-4 font-serif text-[1.5rem] text-[#0F1B33]">Account created</h2>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-[#6B7280]">
                        Thanks, {created.name}. Your request has been sent to <b className="text-[#0F1B33]">{created.school}</b>.
                        You can sign in once the school office or principal approves your account.
                    </p>
                    <button
                        type="button"
                        onClick={onBackClick}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#0F1B33] py-2.5 text-[13.5px] font-medium text-white hover:bg-[#1c3154]"
                    >
                        Back to sign in
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full overflow-hidden flex bg-[#FBF9F3] font-[Inter,system-ui,sans-serif]">
            <BrandPanel
                heading={
                    <>
                        Get your school
                        <br />
                        set up in
                        <br />
                        minutes.
                    </>
                }
                sub="Create an account to manage classes, track attendance, and stay connected — whichever role you play."
                features={[
                    "Free for your first 30 days",
                    "No setup fee for schools",
                    "Import existing student records",
                    "Role-based access from day one",
                ]}
            />

            <div className="w-full lg:w-[54%] min-h-screen flex items-center justify-center px-6 sm:px-10 py-10">
                <div className="w-full max-w-[360px]">
                    <div className="flex items-center justify-between mb-8">
                        <MobileLogo />
                    </div>

                    <button
                        type="button"
                        onClick={onBackClick}
                        className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#6B7280] hover:text-[#0F1B33] transition-colors mb-5"
                    >
                        <ArrowLeft className="h-[14px] w-[14px]" />
                        Back to sign in
                    </button>

                    <div>
                        <h2 className="font-serif text-[1.6rem] text-[#0F1B33] leading-tight">
                            Create your account
                        </h2>
                        <p className="text-[13px] text-[#6B7280] mt-1">
                            Tell us who you are and which school you belong to.
                        </p>
                    </div>

                    <div className="mt-5">
                        <p className="text-[12px] font-medium text-[#374151] mb-1.5">
                            I am a
                        </p>
                        <RoleTabs value={role} onChange={setRole} allowed={SELF_REGISTER_ROLES} />
                    </div>

                    <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                        <div>
                            <label
                                htmlFor="fullName"
                                className="block text-[12px] font-medium text-[#374151] mb-1.5"
                            >
                                Full name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-[#A8AAB0]" />
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="e.g. Anjali Deshmukh"
                                    value={form.fullName}
                                    onChange={handleChange("fullName")}
                                    required
                                    className={`${inputClass} pl-9 pr-3`}
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="signupSchoolCode"
                                className="block text-[12px] font-medium text-[#374151] mb-1.5"
                            >
                                School ID / Code
                            </label>
                            <input
                                id="signupSchoolCode"
                                name="schoolCode"
                                type="text"
                                autoComplete="organization"
                                placeholder="e.g. DPS-NGP"
                                value={form.schoolCode}
                                onChange={handleChange("schoolCode")}
                                required
                                className={inputClass}
                            />
                            <p className="mt-1.5 text-[10.5px] text-[#9CA3AF]">
                                Enter the unique code provided by your school.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="signupEmail"
                                className="block text-[12px] font-medium text-[#374151] mb-1.5"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-[#A8AAB0]" />
                                <input
                                    id="signupEmail"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="name@school.edu"
                                    value={form.email}
                                    onChange={handleChange("email")}
                                    required
                                    className={`${inputClass} pl-9 pr-3`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label
                                    htmlFor="signupPassword"
                                    className="block text-[12px] font-medium text-[#374151] mb-1.5"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-[#A8AAB0]" />
                                    <input
                                        id="signupPassword"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="8+ chars, letter & number"
                                        value={form.password}
                                        onChange={handleChange("password")}
                                        required
                                        className={`${inputClass} pl-9 pr-8`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8AAB0] hover:text-[#374151] transition-colors"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-[14px] w-[14px]" />
                                        ) : (
                                            <Eye className="h-[14px] w-[14px]" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-[12px] font-medium text-[#374151] mb-1.5"
                                >
                                    Confirm
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-[#A8AAB0]" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirm ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Re-enter"
                                        value={form.confirmPassword}
                                        onChange={handleChange("confirmPassword")}
                                        required
                                        className={`${inputClass} pl-9 pr-8`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((prev) => !prev)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8AAB0] hover:text-[#374151] transition-colors"
                                        aria-label={showConfirm ? "Hide password" : "Show password"}
                                    >
                                        {showConfirm ? (
                                            <EyeOff className="h-[14px] w-[14px]" />
                                        ) : (
                                            <Eye className="h-[14px] w-[14px]" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <p className="text-[12px] text-[#B3453D] bg-[#FBEDEB] border border-[#F3D3CF] rounded-[7px] px-3 py-2">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-[#0F1B33] hover:bg-[#16274A] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13.5px] font-medium py-2.5 rounded-[8px] transition-colors mt-1"
                        >
                            {isLoading ? (
                                <>
                                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight className="h-[15px] w-[15px]" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-[12.5px] text-[#6B7280]">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={onBackClick}
                            className="font-medium text-[#0F1B33] hover:text-[#C6952F] transition-colors"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Root — toggles between Login and Signup
// ---------------------------------------------------------------------------
export default function AuthPages() {
    const [view, setView] = useState("login"); // "login" | "signup"

    if (view === "signup") {
        return <SignUpPage onBackClick={() => setView("login")} />;
    }
    return <LoginPage onSignUpClick={() => setView("signup")} />;
}
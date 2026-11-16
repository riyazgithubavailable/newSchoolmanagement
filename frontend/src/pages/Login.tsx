// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//     Card,
//     CardContent,
//     CardHeader,
//     CardTitle,
//     CardDescription,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";

// import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// import { loginPlantEmployee } from "@/hooks/usePlantEmployeeAuth.ts";
// import { useAuth } from "@/contexts/AuthContext";

// export default function Login(): JSX.Element {
//     const [username, setUsername] = useState<string>("");
//     const [password, setPassword] = useState<string>("");
//     const [showPassword, setShowPassword] = useState<boolean>(false);
//     const [loading, setLoading] = useState<boolean>(false);

//     const { setSession } = useAuth();
//     const navigate = useNavigate();
//     const { toast } = useToast();

//     // Remove dark mode on login page for better aesthetics
//     useEffect(() => {
//         const isDark = document.documentElement.classList.contains("dark");
//         document.documentElement.classList.remove("dark");
//         return () => {
//             if (isDark) document.documentElement.classList.add("dark");
//         };
//     }, []);

//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             const res = await loginPlantEmployee({ Username: username, Password: password });

//             setSession(res.data?.token, res.data);

//             toast({
//                 title: "Login Successful",
//                 description: `Welcome, ${res.data?.fullName} (${res.data?.roleName}).`,
//             });

//             const role = res.data?.roleName;
//             setTimeout(() => {
//                 if (role === "Plant Admin") navigate("/dashboard");
//                 else if (role === "Gate Operator") navigate("/gateOperator-dashboard");
//                 else if (role === "Primary-Segregation Supervisor") navigate("/primary-segregation-dashboard");
//                 else if (role === "WeighBridge Operator") navigate("/weight-bridge-operator-dashboard"); 
//                 else if (role === "Secondary-Segregation Supervisor") navigate("/secondary-segregation-dashboard");
//                 else if (role === "Processing Supervisor") navigate("/waste-processing-dashboard");
//                 else if (role === "Stock Manager") navigate("/waste-stock-dashboard");
//                 else if (role === "Sales Manager") navigate("/sales-dashboard");
//                 else navigate("/dashboard");
//             }, 300);
//         } catch (err: any) {
//             toast({
//                 title: "Authentication Failed",
//                 description: err?.message || "Invalid credentials. Please verify your details.",
//                 variant: "destructive",
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="relative min-h-screen overflow-hidden">
//             {/* Background image */}
//             <div className="absolute inset-0 bg-[url('/Login-Image.jpg')] bg-cover bg-center" />

//             {/* Dark overlay */}
//             <div className="absolute inset-0 bg-black/20" />

//             {/* Content */}
//             <div className="relative z-10 min-h-screen">
//                 <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4">
//                     <div className="w-full md:w-[460px]">

//                         {/* Logo + Title */}
//                         <div className="mb-6 flex items-center gap-3">
//                             <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-800">
//                                 <Shield className="h-6 w-6 text-white" />
//                             </div>
//                             <div>
//                                 <h1 className="text-2xl font-bold text-black leading-tight">Waste Processing</h1>
//                                 <p className="text-sm text-black">Monitoring Portal</p>
//                             </div>
//                         </div>

//                         {/* Main Login Card */}
//                         <Card className="shadow-4xl border border-gray-200 bg-white">
//                             <CardHeader className="pb-3">
//                                 <CardTitle className="text-xl">Sign In</CardTitle>
//                                 <CardDescription>Access the plant operations dashboard</CardDescription>
//                             </CardHeader>

//                             <CardContent>
//                                 <form onSubmit={handleSubmit} className="space-y-4">
//                                     {/* Username */}
//                                     <div className="space-y-2">
//                                         <Label htmlFor="username">Username</Label>
//                                         <Input
//                                             id="username"
//                                             type="text"
//                                             placeholder="Enter username"
//                                             value={username}
//                                             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                                                 setUsername(e.target.value)
//                                             }
//                                             required
//                                         />
//                                     </div>

//                                     {/* Password */}
//                                     <div className="space-y-2">
//                                         <Label htmlFor="password">Password</Label>
//                                         <div className="relative">
//                                             <Input
//                                                 id="password"
//                                                 type={showPassword ? "text" : "password"}
//                                                 placeholder="••••••••"
//                                                 value={password}
//                                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                                                     setPassword(e.target.value)
//                                                 }
//                                                 className="pr-10"
//                                                 required
//                                             />
//                                             <button
//                                                 type="button"
//                                                 onClick={() => setShowPassword((prev) => !prev)}
//                                                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-800"
//                                                 aria-label={showPassword ? "Hide Password" : "Show Password"}
//                                             >
//                                                 {showPassword ? (
//                                                     <EyeOff className="h-4 w-4" />
//                                                 ) : (
//                                                     <Eye className="h-4 w-4" />
//                                                 )}
//                                             </button>
//                                         </div>
//                                     </div>

//                                     {/* Forgot Password */}
//                                     <div className="flex items-center justify-between pt-1">
//                                         <button
//                                             type="button"
//                                             className="text-sm font-medium text-green-800 hover:underline"
//                                             onClick={() =>
//                                                 toast({
//                                                     title: "Forgot Password",
//                                                     description:
//                                                         "Please contact your system administrator to reset credentials.",
//                                                 })
//                                             }
//                                         >
//                                             Forgot password?
//                                         </button>
//                                     </div>

//                                     {/* Login Button */}
//                                     <Button
//                                         type="submit"
//                                         className="w-full bg-green-800 hover:bg-green-900 flex items-center justify-center gap-2"
//                                         disabled={loading}
//                                     >
//                                         {loading ? (
//                                             <>
//                                                 <Loader2 className="h-4 w-4 animate-spin" />
//                                                 Authenticating…
//                                             </>
//                                         ) : (
//                                             "Login"
//                                         )}
//                                     </Button>

//                                     {/* Divider */}
//                                     {/* <div className="relative flex items-center gap-3 my-1">
//                                         <div className="flex-1 h-px bg-gray-200" />
//                                         <span className="text-xs text-gray-400">or</span>
//                                         <div className="flex-1 h-px bg-gray-200" />
//                                     </div> */}

//                                     {/* Admin Login Button */}
//                                     {/* <Button
//                                         type="button"
//                                         variant="outline"
//                                         className="w-50 border-green-800 text-green-800 hover:bg-green-800  flex items-center justify-center gap-2"
//                                         onClick={() => navigate("/admin-login")}
//                                     >
//                                         <Shield className="h-4 w-4" />
//                                         Admin Login
//                                     </Button> */}
//                                 </form>
//                             </CardContent>
//                         </Card>
//                     </div>

//                     {/* Right side open for background */}
//                     <div className="hidden flex-1 md:block" />
//                 </div>
//             </div>
//         </div>
//     );
// }
import { useState } from "react";
import {
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
const ROLES = [
    { id: "teacher", label: "Teacher", icon: GraduationCap },
    { id: "parent", label: "Parent", icon: Users },
    { id: "admin", label: "Principal / Admin", icon: ShieldCheck },
];

function RoleTabs({ value, onChange }) {
    return (
        <div className="grid grid-cols-3 gap-1.5 rounded-[10px] bg-[#F4F2EC] border border-[#E8E4D9] p-1">
            {ROLES.map((role) => {
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
    const [role, setRole] = useState("teacher");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [form, setForm] = useState({ schoolCode: "", email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.schoolCode || !form.email || !form.password) return;

        setIsLoading(true);
        try {
            // TODO: connect your login API here, including `role`
            console.log("Sign in submitted:", { ...form, role, rememberMe });
        } catch (error) {
            console.error("Login failed:", error);
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
                            Welcome back
                        </h2>
                        <p className="text-[13px] text-[#6B7280] mt-1">
                            Your school, all in one place.
                        </p>
                    </div>

                    {/* Role tabs */}
                    <div className="mt-5">
                        <p className="text-[12px] font-medium text-[#374151] mb-1.5">
                            Signing in as
                        </p>
                        <RoleTabs value={role} onChange={setRole} />
                    </div>

                    <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
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
                                placeholder="e.g. DPS-NGP"
                                value={form.schoolCode}
                                onChange={handleChange("schoolCode")}
                                required
                                className={inputClass}
                            />
                        </div>

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
                                    onClick={() => console.log("Forgot password")}
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
    const [role, setRole] = useState("teacher");
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

        if (form.password !== form.confirmPassword) {
            setError("Passwords don't match. Please re-enter.");
            return;
        }

        setIsLoading(true);
        try {
            // TODO: connect your signup API here, including `role`
            console.log("Sign up submitted:", { ...form, role });
        } catch (err) {
            console.error("Signup failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

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
                        <RoleTabs value={role} onChange={setRole} />
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
                                        placeholder="Min. 8 characters"
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
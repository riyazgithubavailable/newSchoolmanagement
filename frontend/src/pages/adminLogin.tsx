

// import { adminLogin } from "@/hooks/useAdminAuth.ts";
// import { useAuth } from "@/contexts/AuthContext";

// export default function AdminLogin(): JSX.Element {
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
//             const res = await adminLogin({ Username: username, Password: password });

//             setSession(res.data?.token, res.data);

//             toast({
//                 title: "Admin Login Successful",
//                 description: `Welcome, ${res.data?.fullName || 'Admin'}.`,
//             });

//             setTimeout(() => {
//                 navigate("/dashboard");
//             }, 300);
//         } catch (err: any) {
//             toast({
//                 title: "Authentication Failed",
//                 description: err?.message || "Invalid admin credentials. Please verify your details.",
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

//                         {/* Back Button */}
//                         <button
//                             type="button"
//                             onClick={() => navigate("/login")}
//                             className="mb-5 flex items-center gap-2 text-sm font-medium text-black hover:text-green-800 transition-colors"
//                             aria-label="Back to main login"
//                         >
//                             <ArrowLeft className="h-4 w-4" />
//                             Back to Login
//                         </button>

//                         {/* Logo + Title */}
//                         <div className="mb-6 flex items-center gap-3">
//                             <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-800">
//                                 <ShieldCheck className="h-6 w-6 text-white" />
//                             </div>
//                             <div>
//                                 <h1 className="text-2xl font-bold text-black leading-tight">Admin Portal</h1>
//                                 <p className="text-sm text-black">Waste Processing Monitoring</p>
//                             </div>
//                         </div>

//                         {/* Admin Login Card */}
//                         <Card className="shadow-4xl border border-gray-200 bg-white">
//                             <CardHeader className="pb-3">
//                                 <CardTitle className="text-xl">Admin Sign In</CardTitle>
//                                 <CardDescription>Restricted access — administrators only</CardDescription>
//                             </CardHeader>

//                             <CardContent>
//                                 <form onSubmit={handleSubmit} className="space-y-4">
//                                     {/* Username */}
//                                     <div className="space-y-2">
//                                         <Label htmlFor="admin-username">Admin Username</Label>
//                                         <Input
//                                             id="admin-username"
//                                             type="text"
//                                             placeholder="Enter admin username"
//                                             value={username}
//                                             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                                                 setUsername(e.target.value)
//                                             }
//                                             required
//                                         />
//                                     </div>

//                                     {/* Password */}
//                                     <div className="space-y-2">
//                                         <Label htmlFor="admin-password">Password</Label>
//                                         <div className="relative">
//                                             <Input
//                                                 id="admin-password"
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

//                                     {/* Forgot */}
//                                     <div className="flex items-center justify-end pt-1">
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
//                                             "Admin Login"
//                                         )}
//                                     </Button>
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


const adminLogin = () => {
  return (
    <div>
       <h1>Admin Login Page</h1>
    </div>
  )
}

export default adminLogin

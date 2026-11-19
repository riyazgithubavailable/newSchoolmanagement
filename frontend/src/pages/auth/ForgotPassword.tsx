import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { passwordService } from "@/services/authService";
import { AuthAlert, AuthShell, authButton, authInput } from "./AuthShell";

export default function ForgotPassword() {
  const [schoolCode, setSchoolCode] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ message: string; devToken?: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await passwordService.forgotPassword({ schoolCode: schoolCode.trim(), email: email.trim() });
      setDone({
        message: "If an account exists with these details, we've emailed a link to reset your password. It's valid for 30 minutes.",
        devToken: res.devResetToken,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter the details you sign in with and we'll email you a reset link."
    >
      {done ? (
        <>
          <AuthAlert kind="success">{done.message}</AuthAlert>
          <p className="text-[12.5px] text-[#6B7280]">
            Didn't get it? Check spam, or ask your school office to reset your password.
          </p>
          {import.meta.env.DEV && done.devToken && (
            <p className="mt-3 rounded-[8px] border border-dashed border-[#C6952F]/50 bg-[#C6952F]/5 px-3 py-2 text-[11.5px] text-[#6B7280]">
              Dev only (no email server):{" "}
              <Link to={`/reset-password?token=${done.devToken}`} className="font-semibold text-[#0F1B33] underline">
                open reset link
              </Link>
            </p>
          )}
        </>
      ) : (
        <form onSubmit={submit} className="space-y-3.5">
          {error && <AuthAlert kind="error">{error}</AuthAlert>}
          <div>
              <label htmlFor="fp-school" className="mb-1.5 block text-[12px] font-medium text-[#374151]">
                School ID / Code
              </label>
              <input
                id="fp-school"
                className={authInput}
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                placeholder="e.g. DPS01"
                required
              />
          </div>
          <div>
            <label htmlFor="fp-email" className="mb-1.5 block text-[12px] font-medium text-[#374151]">
              Email
            </label>
            <input
              id="fp-email"
              type="email"
              autoComplete="email"
              className={authInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={authButton} disabled={busy}>
            {busy ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <Link to="/" className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#6B7280] hover:text-[#0F1B33]">
        <ArrowLeft className="h-[14px] w-[14px]" /> Back to sign in
      </Link>
    </AuthShell>
  );
}

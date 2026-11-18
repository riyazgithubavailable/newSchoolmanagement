import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { passwordProblems, passwordService } from "@/services/authService";
import { AuthAlert, AuthShell, PasswordInput, PasswordRules, authButton } from "./AuthShell";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (passwordProblems(password).length) return setError("Your new password doesn't meet the rules below.");
    if (password !== confirm) return setError("Passwords don't match.");
    setBusy(true);
    try {
      await passwordService.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Invalid link" subtitle="This password reset link is incomplete.">
        <Link to="/forgot-password" className={authButton}>
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="You'll be signed out of all devices after changing it.">
      {done ? (
        <>
          <AuthAlert kind="success">Your password has been updated.</AuthAlert>
          <Link to="/" className={authButton}>
            Sign in
          </Link>
        </>
      ) : (
        <form onSubmit={submit} className="space-y-3.5">
          {error && (
            <AuthAlert kind="error">
              {error}{" "}
              {/expired|invalid/i.test(error) && (
                <Link to="/forgot-password" className="font-semibold underline">
                  Request a new link
                </Link>
              )}
            </AuthAlert>
          )}
          <PasswordInput id="rp-new" label="New password" value={password} onChange={setPassword} />
          <PasswordRules value={password} />
          <PasswordInput id="rp-confirm" label="Confirm new password" value={confirm} onChange={setConfirm} />
          <button type="submit" className={authButton} disabled={busy}>
            {busy ? "Saving..." : "Set new password"}
          </button>
        </form>
      )}
      {!done && (
        <Link to="/" className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#6B7280] hover:text-[#0F1B33]">
          <ArrowLeft className="h-[14px] w-[14px]" /> Back to sign in
        </Link>
      )}
    </AuthShell>
  );
}

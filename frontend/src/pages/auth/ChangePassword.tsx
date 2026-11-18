// Forced after sign-in with a temporary password, and reachable from the
// header menu for everyone else.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeRoute } from "@/config/roles";
import { passwordProblems } from "@/services/authService";
import { AuthAlert, AuthShell, PasswordInput, PasswordRules, authButton } from "./AuthShell";

export default function ChangePassword() {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const forced = !!user?.mustChangePassword;

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (passwordProblems(next).length) return setError("Your new password doesn't meet the rules below.");
    if (next !== confirm) return setError("New passwords don't match.");
    if (next === current) return setError("New password must be different from the current one.");
    setBusy(true);
    try {
      const updated = await changePassword(current, next);
      toast.success("Password changed. Other devices have been signed out.");
      navigate(getHomeRoute(updated.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={forced ? "Set your own password" : "Change password"}
      subtitle={
        forced
          ? `Welcome${user ? `, ${user.fullName.split(" ")[0]}` : ""}! Your account was created with a temporary password. Please choose a new one to continue.`
          : "You'll stay signed in here; other devices will be signed out."
      }
    >
      <form onSubmit={submit} className="space-y-3.5">
        {error && <AuthAlert kind="error">{error}</AuthAlert>}
        <PasswordInput
          id="cp-current"
          label={forced ? "Temporary password" : "Current password"}
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
        />
        <PasswordInput id="cp-new" label="New password" value={next} onChange={setNext} />
        <PasswordRules value={next} />
        <PasswordInput id="cp-confirm" label="Confirm new password" value={confirm} onChange={setConfirm} />
        <button type="submit" className={authButton} disabled={busy}>
          {busy ? "Saving..." : "Save new password"}
        </button>
      </form>

      <div className="mt-5 text-center text-[12.5px]">
        {forced ? (
          <button type="button" onClick={() => logout()} className="font-medium text-[#6B7280] hover:text-[#0F1B33]">
            Sign out
          </button>
        ) : (
          <button type="button" onClick={() => navigate(-1)} className="font-medium text-[#6B7280] hover:text-[#0F1B33]">
            Cancel
          </button>
        )}
      </div>
    </AuthShell>
  );
}

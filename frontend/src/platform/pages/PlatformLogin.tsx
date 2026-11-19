// Two steps: email + password, then the 6-digit authenticator code.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { platformApi } from "../platformApi";
import { usePlatformAuth } from "../PlatformAuth";

export const darkInput =
  "w-full rounded-[10px] border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/35 focus:border-[#E5BE6A] focus:outline-none focus:ring-2 focus:ring-[#E5BE6A]/30";
export const goldButton =
  "flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#E5BE6A] py-3 text-[14px] font-semibold text-[#0B1426] transition hover:bg-[#f0cd7e] disabled:cursor-not-allowed disabled:opacity-60";

export function PlatformShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1426] px-4 py-10 font-[Inter,system-ui,sans-serif]">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 48px)",
        }}
      />
      <div className="relative w-full max-w-[380px]">
        <div className="mb-6 flex items-center justify-center gap-2 text-white">
          <ShieldCheck className="h-6 w-6 text-[#E5BE6A]" />
          <span className="text-[15px] font-semibold tracking-tight">InstituteOS Platform</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur">{children}</div>
        <p className="mt-6 text-center text-[11.5px] text-white/35">Restricted access. All sign-ins are recorded.</p>
      </div>
    </div>
  );
}

export function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="mb-4 flex gap-2 rounded-[10px] border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-200">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export default function PlatformLogin() {
  const { start } = usePlatformAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [challenge, setChallenge] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const step = await platformApi.login(email.trim(), password);
      if (step.kind === "code") {
        setChallenge(step.challengeToken);
        setPassword("");
      } else {
        // first sign-in: 2FA must be set up before anything else
        start(step.session);
        navigate("/setup-2fa", { replace: true });
      }
    });
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      try {
        const session = await platformApi.verifyCode(challenge!, code);
        start(session);
        navigate("/schools", { replace: true });
      } catch (err) {
        setCode("");
        // challenge expired → back to the password step
        if (err instanceof Error && /too long/i.test(err.message)) setChallenge(null);
        throw err;
      }
    });
  };

  return (
    <PlatformShell>
      {!challenge ? (
        <form onSubmit={submitPassword} className="space-y-4">
          <div>
            <h1 className="text-[1.35rem] font-semibold text-white">Platform sign in</h1>
            <p className="mt-1 text-[13px] text-white/55">For the InstituteOS owner only.</p>
          </div>
          {error && <ErrorBox>{error}</ErrorBox>}
          <div>
            <label htmlFor="p-email" className="mb-1.5 block text-[12.5px] font-medium text-white/70">
              Email
            </label>
            <input id="p-email" type="email" autoComplete="username" className={darkInput} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="p-password" className="mb-1.5 block text-[12.5px] font-medium text-white/70">
              Password
            </label>
            <input
              id="p-password"
              type="password"
              autoComplete="current-password"
              className={darkInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={goldButton} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
          </button>
          <p className="text-center text-[11.5px] text-white/40">
            Forgot your password? Reset it on the server: <code className="text-white/60">npm run super-admin -- reset-password</code>
          </p>
        </form>
      ) : (
        <form onSubmit={submitCode} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5BE6A]/15 text-[#E5BE6A]">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-[1.2rem] font-semibold text-white">2-step verification</h1>
              <p className="text-[12.5px] text-white/55">Enter the 6-digit code from your authenticator app.</p>
            </div>
          </div>
          {error && <ErrorBox>{error}</ErrorBox>}
          <label htmlFor="p-code" className="sr-only">
            6-digit code
          </label>
          <input
            id="p-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            placeholder="000000"
            className={`${darkInput} text-center font-mono text-2xl tracking-[0.5em]`}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <button type="submit" className={goldButton} disabled={busy || code.length !== 6}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setChallenge(null);
              setCode("");
              setError("");
            }}
            className="flex w-full items-center justify-center gap-1.5 text-[12.5px] text-white/50 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Use a different account
          </button>
          <p className="text-center text-[11.5px] text-white/40">
            Lost your phone? <code className="text-white/60">npm run super-admin -- reset-2fa</code> on the server.
          </p>
        </form>
      )}
    </PlatformShell>
  );
}

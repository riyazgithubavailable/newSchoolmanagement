// First sign-in: scan the QR code with an authenticator app, confirm a code.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { platformApi } from "../platformApi";
import { usePlatformAuth } from "../PlatformAuth";
import { ErrorBox, PlatformShell, darkInput, goldButton } from "./PlatformLogin";

export default function SetupTwoFactor() {
  const { start, logout } = usePlatformAuth();
  const navigate = useNavigate();
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    platformApi
      .startSetup()
      .then(async ({ secret, otpauthUrl }) => {
        // the QR image is generated locally — the secret never leaves the browser
        const dataUrl = await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 });
        if (!cancelled) {
          setSecret(secret);
          setQr(dataUrl);
        }
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Couldn't start setup."));
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const session = await platformApi.enable(code);
      start(session);
      toast.success("2-step verification is on");
      navigate("/schools", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wrong code.");
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PlatformShell>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5BE6A]/15 text-[#E5BE6A]">
          <Smartphone className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-[1.2rem] font-semibold text-white">Set up 2-step verification</h1>
          <p className="text-[12.5px] text-white/55">Required for the platform account.</p>
        </div>
      </div>

      <ol className="mt-5 space-y-1.5 text-[12.5px] text-white/70">
        <li>1. Install Google Authenticator, Microsoft Authenticator or Authy.</li>
        <li>2. Scan this QR code with the app.</li>
        <li>3. Type the 6-digit code it shows.</li>
      </ol>

      <div className="mt-4 flex justify-center">
        {qr ? (
          <img src={qr} alt="QR code for your authenticator app" className="h-[200px] w-[200px] rounded-xl bg-white p-2" />
        ) : (
          <div className="flex h-[200px] w-[200px] items-center justify-center rounded-xl bg-white/5">
            <Loader2 className="h-6 w-6 animate-spin text-white/50" />
          </div>
        )}
      </div>
      {secret && (
        <p className="mt-3 text-center text-[11.5px] text-white/50">
          Can't scan? Enter this key: <span className="select-all break-all font-mono text-white/80">{secret}</span>
        </p>
      )}

      <form onSubmit={submit} className="mt-5 space-y-3">
        {error && <ErrorBox>{error}</ErrorBox>}
        <label htmlFor="setup-code" className="sr-only">
          6-digit code
        </label>
        <input
          id="setup-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          className={`${darkInput} text-center font-mono text-2xl tracking-[0.5em]`}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
        <button type="submit" className={goldButton} disabled={busy || code.length !== 6 || !qr}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Turn on 2-step verification"}
        </button>
        <button type="button" onClick={() => logout()} className="w-full text-center text-[12.5px] text-white/50 hover:text-white">
          Sign out
        </button>
      </form>
    </PlatformShell>
  );
}

// Shared by the platform owner (new principal) and the school (new staff):
// a temporary password generator and the "share these login details" box.

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Modal, primaryBtn, secondaryBtn } from "./PageKit";

export interface Credentials {
  title: string;
  schoolName: string;
  schoolCode: string;
  email: string;
  password: string;
  /** e.g. "Principal", "Teacher", "School Admin" */
  roleLabel: string;
}

/** 12 chars, always has upper, lower, digit and symbol */
// eslint-disable-next-line react-refresh/only-export-components
export function generatePassword() {
  const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnpqrstuvwxyz", "23456789", "@#$%&*"];
  const all = sets.join("");
  const rand = (n: number) => crypto.getRandomValues(new Uint32Array(1))[0] % n;
  const chars = sets.map((s) => s[rand(s.length)]);
  while (chars.length < 12) chars.push(all[rand(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export function CredentialsModal({ credentials, onClose }: { credentials: Credentials | null; onClose: () => void }) {
  if (!credentials) return null;
  const text = [
    `InstituteOS login for ${credentials.schoolName}`,
    `School code: ${credentials.schoolCode}`,
    `Email: ${credentials.email}`,
    `Password: ${credentials.password}`,
    `Role: ${credentials.roleLabel}`,
    "",
    "You'll be asked to choose your own password at first sign in.",
  ].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Login details copied");
    } catch {
      toast.error("Couldn't copy — please select and copy the text manually.");
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={credentials.title}
      description={`Share these login details with the ${credentials.roleLabel.toLowerCase()}. The password won't be shown again.`}
      footer={
        <>
          <button type="button" className={secondaryBtn} onClick={copy}>
            <Copy size={16} /> Copy details
          </button>
          <button type="button" className={primaryBtn} onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      <pre className="whitespace-pre-wrap rounded-xl bg-[#FBF9F3] p-4 font-mono text-sm text-[#0F1B33]">{text}</pre>
    </Modal>
  );
}

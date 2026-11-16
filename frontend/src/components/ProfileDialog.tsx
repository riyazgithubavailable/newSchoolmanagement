import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    User, Lock, ShieldCheck, Eye, EyeOff, Mail, Phone, ArrowRight,
} from "lucide-react";
import { getInitials } from "@/lib/nameUtils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { createPortal } from "react-dom";

export type ProfileData = {
    plantEmployeeId?: number;
    plantId?: number;
    fullName?: string;
    roleName?: string;
    email?: string;
    phone?: string;
};

type EmployeePhotoData = {
    employeePhotoBase64?: string;
};

function PwdField({ id, label }: { id: string; label: string }) {
    const [show, setShow] = React.useState(false);
    return (
        <div className="mb-3.5">
            <Label className="text-[11px] text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">
                {label}
            </Label>
            <div className="relative">
                <Input
                    id={id}
                    type={show ? "text" : "password"}
                    className="pr-9 bg-background border-border text-foreground text-sm focus-visible:ring-1 focus-visible:ring-primary"
                />
                <button
                    type="button"
                    onClick={() => setShow((p) => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
}

function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;
    return createPortal(
        <div
            className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                            <Lock className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground font-semibold text-base">Change Password</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-2 py-1 text-sm leading-none transition-all"
                    >
                        ✕
                    </button>
                </div>
                <p className="text-xs text-muted-foreground mb-5 mt-1">
                    Keep your account secure with a strong password.
                </p>

                <PwdField id="cp"  label="Current Password" />
                <PwdField id="np"  label="New Password" />
                <PwdField id="cfp" label="Confirm Password" />

                <Button className="w-full mt-2">
                    Change Password
                </Button>
            </div>
        </div>,
        document.body
    );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <tr className="border-b border-border last:border-0">
            <td className="py-2.5 text-xs text-muted-foreground font-medium">{label}</td>
            <td className="py-2.5 text-xs text-foreground font-semibold text-right">{value ?? "—"}</td>
        </tr>
    );
}

export default function ProfileDialog({
    open,
    onOpenChange,
    profile,
    displayName,
    roleName,
    photo,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    profile?: ProfileData | null;
    displayName?: string;
    roleName?: string;
    photo?: EmployeePhotoData | null;
}) {
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const [pwdOpen,     setPwdOpen]     = React.useState(false);
    const [editMode,    setEditMode]    = React.useState(false);

    const finalName  = (profile?.fullName  || displayName || "").trim();
    const finalRole  = (profile?.roleName  || roleName    || "").trim();
    const finalEmail = profile?.email || "";
    const finalPhone = profile?.phone || "";

    const [editName,  setEditName]  = React.useState(finalName);
    const [editEmail, setEditEmail] = React.useState(finalEmail);
    const [editPhone, setEditPhone] = React.useState(finalPhone);

    function cancelEdit() {
        setEditName(finalName);
        setEditEmail(finalEmail);
        setEditPhone(finalPhone);
        setEditMode(false);
    }

    const initials = finalName ? getInitials(finalName) : null;

    return (
        <>
            <Dialog open={open && !previewOpen && !pwdOpen} onOpenChange={onOpenChange}>
                <DialogContent className="w-[calc(100vw-1rem)] max-w-3xl p-0 rounded-2xl overflow-hidden bg-card border border-border shadow-2xl [&>button]:hidden">

                    {/* ── Header ── */}
                    <div className="bg-primary px-6 py-5 flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-primary-foreground text-lg font-bold tracking-tight">
                                Account &amp; Security
                            </DialogTitle>
                            <p className="text-primary-foreground/70 text-xs mt-0.5">
                                Manage your profile details and password
                            </p>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="flex items-center gap-1.5 text-primary-foreground bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                        >
                            Close <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* ── Avatar Banner ── */}
                    <div className="bg-muted/40 border-b border-border px-6 py-4 flex items-center gap-4">
                        <div
                            className="relative flex-shrink-0 cursor-pointer"
                            onClick={() => photo?.employeePhotoBase64 && setPreviewOpen(true)}
                        >
                            {photo?.employeePhotoBase64 ? (
                                <img
                                    src={`data:image/jpeg;base64,${photo.employeePhotoBase64}`}
                                    alt="profile"
                                    className="h-16 w-16 rounded-full object-cover border-2 border-primary shadow-md"
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-bold text-xl shadow-md">
                                    {initials ?? <User className="h-6 w-6" />}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-foreground font-bold text-base">{finalName || "User"}</p>
                            {finalEmail && (
                                <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-0.5">
                                    <Mail className="h-3 w-3" /> {finalEmail}
                                </div>
                            )}
                            {finalPhone && (
                                <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-0.5">
                                    <Phone className="h-3 w-3" /> {finalPhone}
                                </div>
                            )}
                        </div>
                        <div className="ml-auto">
                            <span className="inline-flex items-center bg-primary/10 border border-primary/30 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                                {finalRole || "Employee"}
                            </span>
                        </div>
                    </div>

                    {/* ── Two-column body ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">

                        {/* LEFT — Profile Details */}
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                                    <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-foreground font-semibold text-sm">Profile Details</p>
                                </div>
                            </div>

                            {/* Info table */}
                            <table className="w-full mb-4">
                                <tbody>
                                    <InfoRow label="Full Name"   value={finalName} />
                                    <InfoRow label="Email"       value={finalEmail} />
                                    <InfoRow label="Role"        value={finalRole} />
                                </tbody>
                            </table>

                            {/* Change password */}
                            <button
                                onClick={() => setPwdOpen(true)}
                                className="w-full flex items-center gap-2 bg-muted hover:bg-muted/80 border border-border hover:border-primary text-muted-foreground hover:text-primary rounded-lg px-3 py-2.5 text-xs font-medium transition-all"
                            >
                                <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                                Change Password
                            </button>
                        </div>

                        {/* RIGHT — Edit Profile */}
                        <div className="p-5 bg-muted/20">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-foreground font-semibold text-sm">Edit Profile</p>
                                        <p className="text-muted-foreground text-[10px]">Update your information</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => editMode ? cancelEdit() : setEditMode(true)}
                                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                                        editMode
                                            ? "border-destructive/40 text-destructive hover:bg-destructive/10"
                                            : "border-primary/40 text-primary hover:bg-primary/10"
                                    }`}
                                >
                                    {editMode ? "Cancel" : "Edit"}
                                </button>
                            </div>

                            {[
                                { label: "Full Name",     val: editName,  set: setEditName  },
                                { label: "Email Address", val: editEmail, set: setEditEmail },
                                { label: "Phone Number",  val: editPhone, set: setEditPhone },
                            ].map(({ label, val, set }) => (
                                <div key={label} className="mb-3">
                                    <Label className="text-[11px] text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">
                                        {label}
                                    </Label>
                                    <Input
                                        value={val}
                                        onChange={(e) => set(e.target.value)}
                                        readOnly={!editMode}
                                        className={`bg-background border-border text-foreground text-sm focus-visible:ring-1 focus-visible:ring-primary ${
                                            !editMode ? "opacity-60 cursor-not-allowed" : ""
                                        }`}
                                    />
                                </div>
                            ))}

                            <div className="mb-3">
                                <Label className="text-[11px] text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">
                                    Role
                                </Label>
                                <Input
                                    value={finalRole || "Employee"}
                                    readOnly
                                    className="bg-background border-border text-foreground text-sm opacity-50 cursor-not-allowed"
                                />
                            </div>

                            {editMode && (
                                <Button className="w-full mt-2">
                                    Save Changes
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Photo preview */}
            {previewOpen && photo?.employeePhotoBase64 &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center"
                        onClick={() => setPreviewOpen(false)}
                    >
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="absolute -top-10 right-0 text-white text-xl hover:text-gray-300 transition-colors"
                                onClick={() => setPreviewOpen(false)}
                            >
                                ✕
                            </button>
                            <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-primary shadow-2xl">
                                <img
                                    src={`data:image/jpeg;base64,${photo.employeePhotoBase64}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }

            <ChangePasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} />
        </>
    );
}
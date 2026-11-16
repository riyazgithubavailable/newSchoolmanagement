import * as React from "react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {User} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export type ProfileData = {
    plantEmployeeId?: number;
    plantId?: number;
    fullName?: string;
    roleName?: string;
};

function getInitials(name?: string) {
    const n = (name || "").trim();
    if (!n) return "U";
    const parts = n.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "U";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase();
}

function InfoRow({
                     label,
                     value,
                 }: {
    label: string;
    value?: string | number | null;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-2">
            <span className="text-sm font-bold text-foreground">{label}</span>
            <span className="text-m font-bold">{value ?? "-"}</span>
        </div>
    );
}

export default function ProfileDialog({
                                          open,
                                          onOpenChange,
                                          profile,
                                          displayName,
                                          roleName,
                                      }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    profile?: ProfileData | null;
    displayName?: string;
    roleName?: string;
     user?: Omit<any, "accessToken"> | null;
}) {
    const finalName = (profile?.fullName || displayName || "").trim();
    const finalRole = (profile?.roleName || roleName || "").trim();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-900 font-semibold">
                            {finalName ? getInitials(finalName) : <User className="h-4 w-4"/>}
                        </div>

                        <div className="min-w-0">
                            <div className="truncate">{finalName || "User Profile"}</div>
                            <DialogDescription className="mt-1">
                                <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
                                    {finalRole || "Unknown Role"}
                                </Badge>
                            </DialogDescription>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-3">
                    <InfoRow label="Plant Employee ID" value={profile?.plantEmployeeId}/>
                    <InfoRow label="Plant ID" value={profile?.plantId}/>
                    <InfoRow label="Full Name" value={profile?.fullName || finalName}/>
                    <InfoRow label="Role" value={profile?.roleName || finalRole}/>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

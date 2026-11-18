import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROLE_LABELS } from "@/config/roles";
import { getInitials } from "@/lib/nameUtils";
import { classLabel } from "@/services/teacherService";
import type { AuthUser } from "@/types/school";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value || "-"}</span>
    </div>
  );
}

export default function ProfileDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: AuthUser | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-900">
              {user ? getInitials(user.fullName) : <User className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <div className="truncate">{user?.fullName || "User Profile"}</div>
              <DialogDescription className="mt-1">
                <Badge variant="secondary" className="px-2 py-0.5 text-[11px]">
                  {user ? ROLE_LABELS[user.role] : "Unknown Role"}
                </Badge>
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <InfoRow label="User ID" value={user?.id} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="School Code" value={user?.schoolCode} />
          {user?.classTeacherOf && <InfoRow label="Class Teacher Of" value={classLabel(user.classTeacherOf)} />}
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

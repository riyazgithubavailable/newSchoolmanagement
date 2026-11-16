import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type ConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;

    variant?: "default" | "destructive";
    loading?: boolean;
    confirmDisabled?: boolean;

    children?: React.ReactNode;

    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
};

export default function ConfirmDialog({
    open,
    onOpenChange,
    title = "Are you sure?",
    description = "",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    loading = false,
    confirmDisabled = false,
    children,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const handleCancel = () => {
        onCancel?.();
        onOpenChange(false);
    };

    const handleConfirm = async () => {
        if (loading || confirmDisabled) return;
        if (onConfirm) await Promise.resolve(onConfirm());
        onOpenChange(false);
    };

    const confirmVariant = variant === "destructive" ? "destructive" : "default";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description ? <DialogDescription>{description}</DialogDescription> : null}
                </DialogHeader>

                {children ? <div className="mt-3">{children}</div> : null}

                <DialogFooter className="flex justify-end gap-2 mt-4">
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                        {cancelText}
                    </Button>

                    <Button
                        type="button"
                        variant={confirmVariant}
                        onClick={handleConfirm}
                        disabled={loading || confirmDisabled}
                    >
                        {loading ? "Please wait..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

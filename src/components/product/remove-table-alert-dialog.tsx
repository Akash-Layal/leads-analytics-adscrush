"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

type RemoveTableAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  clientName: string;
  onConfirm: () => void;
  loading?: boolean;
};

export function RemoveTableAlertDialog({
  open,
  onOpenChange,
  tableName,
  clientName,
  onConfirm,
  loading = false,
}: RemoveTableAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Remove Table Assignment
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Are you sure you want to remove the table <strong>&ldquo;{tableName}&rdquo;</strong> from client <strong>&ldquo;{clientName}&rdquo;</strong>?
            <br /><br />
            This action will permanently remove the table mapping and the table will become available for assignment to other clients.
            <br /><br />
            <span className="text-red-600 font-medium">This action cannot be undone.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Table
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
import { Trash2, AlertTriangle } from "lucide-react";

type DeleteClientAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  clientCompany: string;
  onConfirm: () => void;
  loading?: boolean;
};

export function DeleteClientAlertDialog({
  open,
  onOpenChange,
  clientName,
  clientCompany,
  onConfirm,
  loading = false,
}: DeleteClientAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Client
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Are you sure you want to delete the client <strong>&ldquo;{clientName}&rdquo;</strong> from <strong>&ldquo;{clientCompany}&rdquo;</strong>?
            <br /><br />
            This action will permanently delete the client and all their table mappings. All assigned tables will become available for assignment to other clients.
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
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Client
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

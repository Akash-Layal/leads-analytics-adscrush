'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTableMappingAction } from "@/lib/actions-clients";
import { IconDatabase, IconEdit, IconFileText } from '@tabler/icons-react';
import { getAvailableTablesAction } from "@/lib/actions-tables";

interface TableMappingDialogProps {
  clientId: string;
  clientName: string;
  onTableMapped?: () => void;
  trigger?: React.ReactNode;
}

export function TableMappingDialog({ clientId, clientName, onTableMapped, trigger }: TableMappingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    readReplicaTableName: '',
    customTableName: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load available tables when dialog opens
  useEffect(() => {
    if (open) {
      loadAvailableTables();
    }
  }, [open]);

  const loadAvailableTables = async () => {
    try {
      const result = await getAvailableTablesAction();
      if (result.success) {
        setAvailableTables(result.availableTables || []);
      }
    } catch (error) {
      console.error("Error loading available tables:", error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.readReplicaTableName.trim()) {
      newErrors.readReplicaTableName = 'Please select a table';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await createTableMappingAction({
        clientId,
        tableName: formData.readReplicaTableName,
        tableSchema: 'default', // You can customize this based on your needs
        customTableName: formData.customTableName || undefined,
        description: formData.description || undefined,
      });
      
      if (result.success) {
        setOpen(false);
        setFormData({
          readReplicaTableName: '',
          customTableName: '',
          description: '',
        });
        setErrors({});
        onTableMapped?.();
      } else {
        setErrors({ submit: result.error || 'Failed to assign table' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Assign Table
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Table to {clientName}</DialogTitle>
          <DialogDescription>
            Select an available table from the read replica to assign to this client.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="readReplicaTableName" className="flex items-center gap-2">
              <IconDatabase className="h-4 w-4" />
              Available Tables *
            </Label>
            <Select
              value={formData.readReplicaTableName}
              onValueChange={(value) => handleInputChange('readReplicaTableName', value)}
            >
              <SelectTrigger className={errors.readReplicaTableName ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent>
                {availableTables.length === 0 ? (
                  <SelectItem value="" disabled>
                    No available tables
                  </SelectItem>
                ) : (
                  availableTables.map((tableName) => (
                    <SelectItem key={tableName} value={tableName}>
                      {tableName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.readReplicaTableName && (
              <p className="text-sm text-red-500">{errors.readReplicaTableName}</p>
            )}
            {availableTables.length === 0 && (
              <p className="text-sm text-amber-600">All tables have been assigned to clients.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customTableName" className="flex items-center gap-2">
              <IconEdit className="h-4 w-4" />
              Custom Table Name (Optional)
            </Label>
            <Input
              id="customTableName"
              value={formData.customTableName}
              onChange={(e) => handleInputChange('customTableName', e.target.value)}
              placeholder="Enter custom name for this table"
            />
            <p className="text-xs text-gray-500">
              Leave empty to use the original table name. The custom name will be displayed to users.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <IconFileText className="h-4 w-4" />
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this table contains or how it will be used"
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Optional description to help users understand the purpose of this table.
            </p>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || availableTables.length === 0}
            >
              {loading ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Table'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Icons
function LoaderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

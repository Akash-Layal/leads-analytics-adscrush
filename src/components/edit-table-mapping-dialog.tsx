'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconEdit, IconLoader } from '@tabler/icons-react';

interface TableMapping {
  xataId: string;
  clientId: string;
  tableName: string;
  customTableName: string | null;
  tableSchema: string;
  description: string | null;
  isActive: string;
  xataCreatedat: string;
  xataUpdatedat: string;
  client: {
    name: string;
    company: string;
  };
}

interface EditTableMappingDialogProps {
  mapping: TableMapping;
  onClose: () => void;
  onUpdate: (mappingId: string, updates: {
    customTableName?: string;
    description?: string;
    isActive?: string;
  }) => Promise<void>;
}

export function EditTableMappingDialog({ mapping, onClose, onUpdate }: EditTableMappingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customTableName: mapping.customTableName || '',
    description: mapping.description || '',
    isActive: mapping.isActive,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.customTableName.trim() && formData.customTableName.length < 3) {
      newErrors.customTableName = 'Custom table name must be at least 3 characters long';
    }

    if (formData.customTableName.trim() && formData.customTableName.length > 50) {
      newErrors.customTableName = 'Custom table name must be less than 50 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
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
      const updates: {
        customTableName?: string;
        description?: string;
        isActive?: string;
      } = {};

      // Only include fields that have changed
      if (formData.customTableName !== (mapping.customTableName || '')) {
        updates.customTableName = formData.customTableName.trim() || undefined;
      }
      
      if (formData.description !== (mapping.description || '')) {
        updates.description = formData.description.trim() || undefined;
      }
      
      if (formData.isActive !== mapping.isActive) {
        updates.isActive = formData.isActive;
      }

      if (Object.keys(updates).length > 0) {
        await onUpdate(mapping.xataId, updates);
      }
    } catch (error) {
      console.error('Error updating table mapping:', error);
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

  const getDisplayName = () => {
    return mapping.customTableName || mapping.tableName;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconEdit className="h-5 w-5" />
            Edit Table Mapping
          </DialogTitle>
          <DialogDescription>
            Update the custom name and description for the table mapping.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Original Table Name (Read-only) */}
          <div className="space-y-2">
            <Label>Original Table Name</Label>
            <div className="p-3 bg-gray-50 border rounded-md">
              <code className="text-sm font-mono">{mapping.tableName}</code>
            </div>
          </div>

          {/* Client Info (Read-only) */}
          <div className="space-y-2">
            <Label>Client</Label>
            <div className="p-3 bg-gray-50 border rounded-md">
              <div className="font-medium">{mapping.client.name}</div>
              <div className="text-sm text-gray-600">{mapping.client.company}</div>
            </div>
          </div>

          {/* Custom Table Name */}
          <div className="space-y-2">
            <Label htmlFor="customTableName">Custom Table Name</Label>
            <Input
              id="customTableName"
              value={formData.customTableName}
              onChange={(e) => handleInputChange('customTableName', e.target.value)}
              placeholder="Enter custom name for this table"
              className={errors.customTableName ? 'border-red-500' : ''}
            />
            <p className="text-xs text-gray-500">
              Leave empty to use the original table name. 
              The custom name will be displayed to users instead of the technical table name.
            </p>
            {errors.customTableName && (
              <p className="text-sm text-red-500">{errors.customTableName}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this table contains or how it will be used"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            <p className="text-xs text-gray-500">
              Optional description to help users understand the purpose of this table.
            </p>
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <Select
              value={formData.isActive}
              onValueChange={(value) => handleInputChange('isActive', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Inactive mappings will not be displayed to users.
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Display Name Preview</Label>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="font-medium text-blue-900">
                {formData.customTableName.trim() ? formData.customTableName : mapping.tableName}
              </div>
              <div className="text-xs text-blue-700 mt-1">
                This is how the table name will appear to users
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Mapping'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

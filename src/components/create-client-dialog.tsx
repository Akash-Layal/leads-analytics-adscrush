'use client';

import { useEffect, useState } from 'react';
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
import { createClientAction, createTableMappingAction } from "@/lib/actions-clients";
import type { ClientStatus } from "@/lib/actions-clients";
import { getAvailableTablesAction } from "@/lib/actions-tables";
import { Badge } from "@/components/ui/badge";

interface CreateClientDialogProps {
  onClientCreated?: () => void;
  trigger?: React.ReactNode;
}

export function CreateClientDialog({ onClientCreated, trigger }: CreateClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    // Table assignment fields
    tableName: 'none',
    tableSchema: 'public',
    tableDescription: '',
    status: 'active' as ClientStatus,
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
      console.log("Loading available tables...");
      const result = await getAvailableTablesAction();
      console.log("getAvailableTablesAction result:", result);
      
      if (result.success) {
        setAvailableTables(result.availableTables || []);
        console.log("Available tables set:", result.availableTables);
      } else {
        console.error("Failed to load tables:", result.error);
      }
    } catch (error) {
      console.error("Error loading available tables:", error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
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
      // First create the client
      const clientResult = await createClientAction({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        status: formData.status,
      });
      
      if (clientResult.success && clientResult.clientId) {
        // If table is selected, create table mapping
        if (formData.tableName && formData.tableName !== 'none') {
          await createTableMappingAction({
            clientId: clientResult.clientId,
            tableName: formData.tableName,
            tableSchema: formData.tableSchema,
            description: formData.tableDescription || undefined,
          });
        }
        
        setOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          tableName: 'none',
          tableSchema: 'public',
          tableDescription: '',
          status: 'active',
        });
        setErrors({});
        onClientCreated?.();
      } else {
        setErrors({ submit: clientResult.error || 'Failed to create client' });
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
          <Button variant="default" className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Create Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Client</DialogTitle>
          <DialogDescription>
            Add a new client to manage their table mappings and data access.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter client name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ClientStatus) => handleInputChange('status', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <Badge className="!w-full bg-green-100 text-green-800 border-green-200">Active</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Company name"
              className={errors.company ? 'border-red-500' : ''}
            />
            {errors.company && (
              <p className="text-sm text-red-500">{errors.company}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="client@company.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Table Assignment Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Table Assignment (Optional)</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tableName">Available Tables</Label>
                <Select
                  value={formData.tableName}
                  onValueChange={(value) => handleInputChange('tableName', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a table to assign (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      No table assignment
                    </SelectItem>
                    {availableTables.length === 0 ? (
                      <SelectItem value="no-tables" disabled>
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
                {availableTables.length === 0 && (
                  <p className="text-sm text-amber-600">All tables have been assigned to other clients.</p>
                )}
              </div>

              {formData.tableName && formData.tableName !== 'none' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tableSchema">Table Schema</Label>
                    <Input
                      id="tableSchema"
                      value={formData.tableSchema}
                      onChange={(e) => handleInputChange('tableSchema', e.target.value)}
                      placeholder="public"
                    />
                    <p className="text-xs text-gray-500">
                      The database schema where the table is located
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tableDescription">Table Description (Optional)</Label>
                    <Textarea
                      id="tableDescription"
                      value={formData.tableDescription}
                      onChange={(e) => handleInputChange('tableDescription', e.target.value)}
                      placeholder="Describe what this table contains or how it will be used"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Client'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Icons
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

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


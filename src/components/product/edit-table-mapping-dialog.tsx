"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { IconEdit, IconLoader, IconPhoto, IconX } from "@tabler/icons-react";
import Image from "next/image";

interface TableMapping {
  xataId: string;
  clientId: string;
  tableName: string;
  customTableName: string | null;
  tableSchema: string;
  description: string | null;
  imageUrl: string | null;
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
  onUpdate: (
    mappingId: string,
    updates: {
      customTableName?: string;
      description?: string;
      imageUrl?: string;
      isActive?: string;
    }
  ) => Promise<void>;
}

// ✅ Zod schema for validation
const formSchema = z.object({
  customTableName: z
    .string()
    .min(3, { message: "Custom table name must be at least 3 characters long" })
    .max(50, { message: "Custom table name must be less than 50 characters" })
    .optional()
    .or(z.literal("")),
  description: z.string().max(500, { message: "Description must be less than 500 characters" }).optional().or(z.literal("")),
  imageUrl: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        try {
          const url = new URL(val);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid URL (e.g., https://example.com/image.jpg)" }
    ),
  isActive: z.enum(["true", "false"]),
});

type FormData = z.infer<typeof formSchema>;

export function EditTableMappingDialog({ mapping, onClose, onUpdate }: EditTableMappingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customTableName: mapping.customTableName || "",
      description: mapping.description || "",
      imageUrl: mapping.imageUrl || "",
      isActive: mapping.isActive as "true" | "false",
    },
  });

  const handleSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      const updates: {
        customTableName?: string;
        description?: string;
        imageUrl?: string;
        isActive?: string;
      } = {};

      if (values.customTableName !== (mapping.customTableName || "")) {
        updates.customTableName = values.customTableName?.trim() || undefined;
      }
      if (values.description !== (mapping.description || "")) {
        updates.description = values.description?.trim() || undefined;
      }
      if (values.imageUrl !== (mapping.imageUrl || "")) {
        updates.imageUrl = values.imageUrl?.trim() || undefined;
      }
      if (values.isActive !== mapping.isActive) {
        updates.isActive = values.isActive;
      }

      if (Object.keys(updates).length > 0) {
        await onUpdate(mapping.xataId, updates);
      }
    } catch (error) {
      console.error("Error updating table mapping:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Centralized preview state
  const imageUrl = form.watch("imageUrl")?.trim();
  const hasError = !!form.getFieldState("imageUrl").error;
  const isValidUrl = imageUrl && /^https?:\/\/.+/i.test(imageUrl);
  const shouldShowPreview = isValidUrl && !hasError && !imageError;
  const shouldShowInvalid = imageUrl && hasError;
  const shouldShowFailed = isValidUrl && !hasError && imageError;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconEdit className="h-5 w-5" />
            Edit Table Mapping
          </DialogTitle>
          <DialogDescription>Update the custom name and description for the table mapping.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="customTableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Table Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter custom name for this table" />
                  </FormControl>
                  <p className="text-xs text-gray-500">Leave empty to use the original table name.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image URL */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://example.com/image.jpg"
                        onChange={(e) => {
                          field.onChange(e);
                          setImageError(false);
                        }}
                      />
                    </FormControl>
                    {field.value && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          form.setValue("imageUrl", "");
                          setImageError(false);
                        }}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Optional image URL to display with this table mapping.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ Image States */}
            {shouldShowPreview && (
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="border rounded-md p-4 bg-gray-50">
                  <div className="flex items-center justify-center min-h-[120px]">
                    <Image
                      src={imageUrl}
                      alt="Table mapping preview"
                      width={200}
                      height={120}
                      unoptimized
                      className="max-w-full max-h-48 object-contain rounded"
                      onError={() => setImageError(true)}
                      onLoad={() => setImageError(false)}
                    />
                  </div>
                </div>
              </div>
            )}

            {shouldShowInvalid && (
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="border border-red-200 rounded-md p-4 bg-red-50">
                  <div className="flex items-center justify-center min-h-[120px] text-red-500">
                    <div className="text-center">
                      <IconPhoto className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Invalid URL format</p>
                      <p className="text-xs text-red-400 mt-1">Please enter a valid URL (e.g., https://example.com/image.jpg)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {shouldShowFailed && (
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="border border-red-200 rounded-md p-4 bg-red-50">
                  <div className="flex items-center justify-center min-h-[120px] text-red-500">
                    <div className="text-center">
                      <IconPhoto className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Failed to load image</p>
                      <p className="text-xs text-red-400 mt-1">Please check the URL</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Describe what this table contains or how it will be used" />
                  </FormControl>
                  <p className="text-xs text-gray-500">Optional description to help users understand the purpose of this table.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Inactive mappings will not be displayed to users.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            <div className="space-y-2">
              <Label>Display Name Preview</Label>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="font-medium text-blue-900">{form.watch("customTableName")?.trim() ? form.watch("customTableName") : mapping.tableName}</div>
                <div className="text-xs text-blue-700 mt-1">This is how the table name will appear to users</div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Mapping"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

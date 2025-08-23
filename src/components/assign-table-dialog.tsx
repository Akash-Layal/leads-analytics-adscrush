"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Database } from "lucide-react";
import { getAvailableTablesAction } from "@/lib/actions-tables";
import { createTableMappingAction } from "@/lib/actions-clients";

type AssignTableDialogProps = {
  clientId: string;
  clientName: string;
  onTableAssigned: () => void;
  trigger?: React.ReactNode;
};

export function AssignTableDialog({ clientId, clientName, onTableAssigned, trigger }: AssignTableDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [formData, setFormData] = useState({
    tableName: "",
    tableSchema: "public",
    description: "",
  });

  const fetchAvailableTables = async () => {
    try {
      setLoadingTables(true);
      console.log("Loading available tables...");
      const result = await getAvailableTablesAction();
      console.log("getAvailableTablesAction result:", result);
      
      if (result.success && result.availableTables) {
        setAvailableTables(result.availableTables);
        console.log("Available tables set:", result.availableTables);
      } else {
        console.error("Failed to load tables:", result.error);
        setAvailableTables([]);
      }
    } catch (error) {
      console.error("Error loading available tables:", error);
      setAvailableTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered, open state:", open);
    if (open) {
      console.log("Dialog opened, fetching available tables...");
      fetchAvailableTables();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tableName) {
      alert("Please select a table");
      return;
    }

    try {
      setLoading(true);
      const result = await createTableMappingAction({
        clientId,
        tableName: formData.tableName,
        tableSchema: formData.tableSchema,
        description: formData.description || undefined,
      });

      if (result.success) {
        setOpen(false);
        setFormData({ tableName: "", tableSchema: "public", description: "" });
        onTableAssigned();
      } else {
        alert("Failed to assign table: " + result.error);
      }
    } catch (error) {
      console.error("Failed to assign table:", error);
      alert("Failed to assign table");
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (tableName: string) => {
    setFormData(prev => ({ ...prev, tableName }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add Table
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Table to {clientName}</DialogTitle>
          <DialogDescription>
            Select a table from the read replica database to assign to this client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tableName">Table Name *</Label>
            <Select value={formData.tableName} onValueChange={handleTableSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent>
                {loadingTables ? (
                  <SelectItem value="loading" disabled>
                    Loading tables...
                  </SelectItem>
                ) : availableTables.length === 0 ? (
                  <SelectItem value="no-tables" disabled>
                    No available tables
                  </SelectItem>
                ) : (
                  availableTables.map((tableName) => (
                    <SelectItem key={tableName} value={tableName}>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        {tableName}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tableSchema">Table Schema</Label>
            <Input
              id="tableSchema"
              value={formData.tableSchema}
              onChange={(e) => setFormData(prev => ({ ...prev, tableSchema: e.target.value }))}
              placeholder="e.g., public, production, staging"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this table assignment"
              rows={3}
            />
          </div>

          {formData.tableName && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Database className="h-4 w-4" />
                <span className="font-medium">Selected Table:</span>
                <Badge variant="secondary">{formData.tableName}</Badge>
              </div>
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
              disabled={loading || !formData.tableName}
            >
              {loading ? "Assigning..." : "Assign Table"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

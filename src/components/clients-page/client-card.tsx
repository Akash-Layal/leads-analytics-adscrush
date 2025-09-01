"use client";

import { AssignTableDialog } from "@/components/assign-table-dialog";
import { DeleteClientAlertDialog } from "@/components/delete-client-alert-dialog";
import { RemoveTableAlertDialog } from "@/components/remove-table-alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteClientAction } from "@/lib/actions-clients";
import { removeTableMappingAction } from "@/lib/actions-tables";
import { ClientWithTables } from "@/lib/server/clients";
import { Database, Edit, Eye, MoreHorizontal, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatDate, getShortId, getStatusColor, handleCopyId } from "./utils";

interface ClientCardProps {
  client: ClientWithTables;
  onClientDeleted: () => void;
  onTableRemoved: () => void;
  onTableAssigned: () => void;
}

export function ClientCard({ client, onClientDeleted, onTableRemoved, onTableAssigned }: ClientCardProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeDialogData, setRemoveDialogData] = useState<{
    tableMappingId: string;
    clientName: string;
    tableName: string;
  } | null>(null);
  const [removingTable, setRemovingTable] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingClient, setDeletingClient] = useState(false);

  const handleRemoveTable = (tableMappingId: string, clientName: string, tableName: string) => {
    setRemoveDialogData({ tableMappingId, clientName, tableName });
    setRemoveDialogOpen(true);
  };

  const confirmRemoveTable = async () => {
    if (!removeDialogData) return;
    
    const { tableMappingId, clientName, tableName } = removeDialogData;
    
    try {
      setRemovingTable(true);
      console.log(`Removing table mapping: ${tableMappingId} for table: ${tableName}`);
      const result = await removeTableMappingAction(tableMappingId);
      
      if (result.success) {
        alert(`Table "${tableName}" has been successfully removed from client "${clientName}"`);
        onTableRemoved();
        setRemoveDialogOpen(false);
        setRemoveDialogData(null);
      } else {
        alert(`Failed to remove table: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to remove table:", error);
      alert(`Failed to remove table "${tableName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRemovingTable(false);
    }
  };

  const cancelRemoveTable = () => {
    setRemoveDialogOpen(false);
    setRemoveDialogData(null);
    setRemovingTable(false);
  };

  const handleDeleteClient = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeleteClient = async () => {
    try {
      setDeletingClient(true);
      console.log(`Deleting client: ${client.name} (${client.xataId})`);
      const result = await deleteClientAction(client.xataId);
      
      if (result.success) {
        alert(`Client "${client.name}" has been successfully deleted`);
        onClientDeleted();
        setDeleteDialogOpen(false);
      } else {
        alert(`Failed to delete client: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to delete client:", error);
      alert(`Failed to delete client "${client.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingClient(false);
    }
  };

  const cancelDeleteClient = () => {
    setDeleteDialogOpen(false);
    setDeletingClient(false);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <Link href={`/clients/${client.xataId}`} className="flex-1 hover:opacity-80 transition-opacity">
              <div>
                <CardTitle className="text-lg">{client.name}</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  ID: {getShortId(client.xataId)}
                </CardDescription>
              </div>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyId(client.xataId);
                  }}
                >
                  Copy client ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <AssignTableDialog 
                    clientId={client.xataId} 
                    clientName={client.name}
                    onTableAssigned={onTableAssigned}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit client
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClient();
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Client Info - Clickable */}
          <Link href={`/clients/${client.xataId}`} className="block hover:opacity-80 transition-opacity">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Company</span>
                <span className="text-sm text-gray-900">{client.company}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Email</span>
                <span className="text-sm text-gray-900">{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Phone</span>
                  <span className="text-sm text-gray-900">{client.phone}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <Badge className={getStatusColor(client.status)}>
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Created</span>
                <span className="text-sm text-gray-900">{formatDate(client.xataCreatedat)}</span>
              </div>
            </div>
          </Link>

          {/* Assigned Tables Section - Not Clickable */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Assigned Products ({client.assignedTables.length})
              </h4>
              <AssignTableDialog 
                clientId={client.xataId} 
                clientName={client.name}
                onTableAssigned={onTableAssigned}
              />
            </div>
            
            {client.assignedTables.length === 0 ? (
              <div className="text-sm text-gray-500 italic">
                No tables assigned yet
              </div>
            ) : (
              <div className="space-y-2">
                {client.assignedTables.map((table) => (
                  <div key={table.xataId} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{table.tableName}</div>
                      {table.description && (
                        <div className="text-xs text-gray-500 mt-1">{table.description}</div>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs ml-2">
                      {table.tableSchema}
                    </Badge>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTable(table.xataId, client.name, table.tableName);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove table mapping</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remove Table Alert Dialog */}
      {removeDialogData && (
        <RemoveTableAlertDialog
          open={removeDialogOpen}
          onOpenChange={setRemoveDialogOpen}
          tableName={removeDialogData.tableName}
          clientName={removeDialogData.clientName}
          onConfirm={confirmRemoveTable}
          loading={removingTable}
        />
      )}
      
      {/* Delete Client Alert Dialog */}
      <DeleteClientAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        clientName={client.name}
        clientCompany={client.company}
        onConfirm={confirmDeleteClient}
        loading={deletingClient}
      />
    </>
  );
}

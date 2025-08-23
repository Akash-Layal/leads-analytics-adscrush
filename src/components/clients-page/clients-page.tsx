"use client";

import { ClientWithTables } from "@/lib/server/clients";
import { CreateClientDialog } from "@/components/create-client-dialog";
import { ClientCard } from "./client-card";
import { EmptyState } from "./empty-state";
import { useClients } from "./use-clients";

interface ClientsPageProps {
  initialClients: ClientWithTables[];
}

export function ClientsPage({ initialClients }: ClientsPageProps) {
  const { 
    clients, 
    isRefetching, 
    refetchClients, 
    removeClient, 
    updateClientTables 
  } = useClients(initialClients);

  const handleClientCreated = () => {
    refetchClients();
  };

  const handleClientDeleted = (clientId: string) => {
    removeClient(clientId);
  };

  const handleTableRemoved = (clientId: string) => {
    // Update the client's tables by removing the deleted table
    // This is a simplified approach - in a real app you'd refetch the data
    refetchClients();
  };

  const handleTableAssigned = (clientId: string) => {
    // Update the client's tables by adding the new table
    // This is a simplified approach - in a real app you'd refetch the data
    refetchClients();
  };

  return (
    <div className="flex-1 p-8 w-full">
      <div className="flex items-center justify-between space-y-2 w-full mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
        <div className="flex items-center space-x-2">
          <CreateClientDialog onClientCreated={handleClientCreated} />
          {isRefetching && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Refreshing...</span>
            </div>
          )}
        </div>
      </div>
      
      {clients.length === 0 ? (
        <EmptyState onClientCreated={handleClientCreated} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <ClientCard
              key={client.xataId}
              client={client}
              onClientDeleted={() => handleClientDeleted(client.xataId)}
              onTableRemoved={() => handleTableRemoved(client.xataId)}
              onTableAssigned={() => handleTableAssigned(client.xataId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

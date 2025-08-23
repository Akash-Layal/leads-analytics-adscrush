"use client";
import { useState, useCallback } from "react";
import { ClientWithTables } from "@/lib/server/clients";
import { getClientsWithTables } from "@/lib/server/clients";

export function useClients(initialClients: ClientWithTables[]) {
  const [clients, setClients] = useState<ClientWithTables[]>(initialClients);
  const [isRefetching, setIsRefetching] = useState(false);

  const refetchClients = useCallback(async () => {
    try {
      setIsRefetching(true);
      // Use server action directly instead of API call
      const newClients = await getClientsWithTables();
      setClients(newClients);
    } catch (error) {
      console.error("Failed to refetch clients:", error);
    } finally {
      setIsRefetching(false);
    }
  }, []);

  const updateClient = useCallback((clientId: string, updates: Partial<ClientWithTables>) => {
    setClients(prev => prev.map(client => 
      client.xataId === clientId ? { ...client, ...updates } : client
    ));
  }, []);

  const removeClient = useCallback((clientId: string) => {
    setClients(prev => prev.filter(client => client.xataId !== clientId));
  }, []);

  const addClient = useCallback((newClient: ClientWithTables) => {
    setClients(prev => [newClient, ...prev]);
  }, []);

  const updateClientTables = useCallback((clientId: string, tables: ClientWithTables['assignedTables']) => {
    setClients(prev => prev.map(client => 
      client.xataId === clientId ? { ...client, assignedTables: tables } : client
    ));
  }, []);

  return {
    clients,
    isRefetching,
    refetchClients,
    updateClient,
    removeClient,
    addClient,
    updateClientTables,
  };
}

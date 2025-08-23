import { Suspense } from "react";
import { getClientsWithTables } from "@/lib/server/clients";
import { ClientsPage } from "@/components/clients-page";
import { Loading } from "@/components/clients-page/loading";

export default async function ClientsPageServer() {
  try {
    const clients = await getClientsWithTables();
    
    return (
      <Suspense fallback={<Loading />}>
        <ClientsPage initialClients={clients} />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return (
      <div className="flex-1 p-8">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading clients</h3>
          <p className="text-gray-600 mb-4">Failed to load clients. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}

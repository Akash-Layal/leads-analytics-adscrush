import { CreateClientDialog } from "@/components/create-client-dialog";

export function EmptyState({ onClientCreated }: { onClientCreated: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-12 h-12 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
      <p className="text-gray-600 mb-4">Get started by creating your first client.</p>
      <CreateClientDialog onClientCreated={onClientCreated} />
    </div>
  );
}

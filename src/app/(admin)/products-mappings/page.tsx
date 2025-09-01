import { Suspense } from 'react';
import { TableMappingsPage } from '@/components/table-mappings-page';
import { Skeleton } from '@/components/ui/skeleton';

export default function TableMappingsPageRoute() {
  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Table Mappings</h1>
          <p className="text-muted-foreground">
            Manage table mappings, custom names, and descriptions for all clients
          </p>
        </div>
      </div>
      
      <Suspense fallback={<TableMappingsSkeleton />}>
        <TableMappingsPage />
      </Suspense>
    </div>
  );
}

function TableMappingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-4" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

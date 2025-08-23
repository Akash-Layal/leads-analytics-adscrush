import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getClientDetailsAction } from "@/lib/actions-clients";
import { ClientDetailsContent, ClientDetailsLoading } from "@/components/client-details";

interface ClientDetailsPageProps {
  params: Promise<{ clientId: string }>;
}

export default async function ClientDetailsPage({ params }: ClientDetailsPageProps) {
  try {
    const { clientId } = await params;
    
    if (!clientId) {
      redirect("/clients");
    }

    // Fetch all client data server-side
    const result = await getClientDetailsAction(clientId);
    
    if (!result.success || !result.data) {
      notFound();
    }

    const { client, tableCounts, totalCount, dailyStats } = result.data;

    return (
      <Suspense fallback={<ClientDetailsLoading />}>
        <ClientDetailsContent
          client={client}
          tableCounts={tableCounts}
          totalCount={totalCount}
          dailyStats={dailyStats}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to fetch client details:", error);
    redirect("/clients");
  }
}

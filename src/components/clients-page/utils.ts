import { Client, AssignedTable } from "@/lib/server/clients";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "inactive":
      return "bg-red-100 text-red-800 border-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const handleCopyId = async (clientId: string) => {
  try {
    await navigator.clipboard.writeText(clientId);
  } catch (error) {
    console.error("Failed to copy ID:", error);
  }
};

export const getShortId = (fullId: string) => fullId.slice(-8);

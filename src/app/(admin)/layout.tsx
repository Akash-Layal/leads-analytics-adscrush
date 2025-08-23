import { AppSidebar } from "@/components/app-sidebar";
import React from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
};

export default AdminLayout;

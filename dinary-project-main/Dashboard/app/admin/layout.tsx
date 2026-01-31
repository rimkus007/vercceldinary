// app/admin/layout.tsx
"use client";

import { DashboardProvider } from "@/contexts/DashboardContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="flex h-screen bg-gray-100">
        {" "}
        {/* Changé bg-dinary-light pour bg-gray-100 pour la cohérence */}
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          {" "}
          {/* Retiré pl-16 */}
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 ml-16">
            {" "}
            {/* Ajouté ml-16 */}
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}

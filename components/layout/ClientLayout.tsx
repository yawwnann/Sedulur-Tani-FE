"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // Don't show Navbar/Footer on Admin routes
  // Auth routes might want to skip them too, but request was specifically for Admin
  const shouldShowNavFooter = !isAdminRoute;

  return (
    <>
      {shouldShowNavFooter && <Navbar />}
      <main className={shouldShowNavFooter ? "min-h-screen" : ""}>
        {children}
      </main>
      {shouldShowNavFooter && <Footer />}
    </>
  );
}

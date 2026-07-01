import React from "react";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../lib/auth-context";
import "@/app/globals.css";

export const metadata = {
  title: "F4sens Attendance",
  description: "Attendance Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-surface antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col text-text-primary decoration-dots">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 container mx-auto px-4 pt-20 md:pt-28 pb-8">{children}</main>
          <footer className="border-t border-surface-dark py-8 px-4 bg-surface/50">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-text-muted text-sm">
              <span>&copy; {new Date().getFullYear()} F4sens Attendance</span>
              <span className="text-text-muted/60">All rights reserved</span>
            </div>
          </footer>
          <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1E4B34",
              color: "#F2EDE2",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 8px 32px rgba(30, 75, 52, 0.15)",
            },
            success: {
              iconTheme: {
                primary: "#2E8B57",
                secondary: "#F2EDE2",
              },
            },
            error: {
              iconTheme: {
                primary: "#C0392B",
                secondary: "#F2EDE2",
              },
            },
          }}
        />
        </AuthProvider>
      </body>
    </html>
  );
}

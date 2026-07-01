'use client';
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../lib/auth-context";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const nav = (
    !isAuthPage && (
      <div className={`${mobileMenuOpen ? "flex flex-col" : "hidden"} md:flex absolute md:relative top-full left-0 right-0 bg-white shadow-card md:shadow-none border-t md:border-t-0 border-surface-dark p-4 md:p-0 animate-slide-down md:animate-none z-40`} id="mobile-menu">
        <nav className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-1 md:items-center">
          <Link
            href="/dashboard"
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
              pathname === "/dashboard"
                ? "bg-primary text-text-inverse shadow-soft"
                : "text-text-secondary hover:bg-surface-dark hover:text-text-primary"
            }`}
          >
            Dashboard
            {pathname === "/dashboard" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-text-inverse" />
            )}
          </Link>
          {(user?.role === "admin" || user?.role === "super_admin") && (
            <Link
              href="/admin"
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                pathname.startsWith("/admin")
                  ? "bg-primary text-text-inverse shadow-soft"
                  : "text-text-secondary hover:bg-surface-dark hover:text-text-primary"
              }`}
            >
              Admin
              {pathname.startsWith("/admin") && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-text-inverse" />
              )}
            </Link>
          )}
        </nav>
      </div>
    )
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/95 backdrop-blur-sm shadow-card" : "bg-white"
    }`}>
      <nav className="container mx-auto px-4" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 md:h-14">
          <Link href="/" className="flex items-center text-primary font-bold text-xl tracking-tight flex-shrink-0 group -ml-1">
            <Image
              src="/images/F4Sn_logo.png"
              alt="F4Sens Logo"
              width={72}
              height={72}
              className="w-12 h-12 md:w-20 md:h-20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            />
          </Link>

          <div className="flex items-center gap-3 md:gap-4">
            {nav}

            {user ? (
              <div className="flex items-center gap-3">
                <NotificationBell unreadCount={0} />
                <div className="hidden sm:block text-sm text-text-secondary">
                  {user.name} · {user.role === "super_admin" ? "Super Admin" : user.role === "admin" ? "Admin" : "Employee"}
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-ghost px-4 py-2 text-sm hidden sm:inline-flex"
                >
                  Logout
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-ghost px-3 py-2 sm:hidden"
                  aria-label="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="btn-ghost px-4 py-2 text-sm hidden sm:inline-flex"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-primary px-5 py-2.5 text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}

            {!isAuthPage && (
              <button
                className="md:hidden p-2 rounded-xl text-text-secondary hover:bg-surface-dark hover:text-text-primary transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle menu"
              >
                <svg className={`w-6 h-6 transition-transform duration-300 ${mobileMenuOpen ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

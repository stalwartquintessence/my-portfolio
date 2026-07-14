import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/**
 * Layout for the portfolio site itself: the sticky Navbar, the page content,
 * and the Footer. Lives in the `(site)` route group so this chrome wraps the
 * home route (and any future marketing routes) but NOT standalone utility
 * routes like `/interested`, which sit outside the group under the bare root
 * layout. The `(site)` group name is stripped from the URL, so the page inside
 * still serves `/`.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

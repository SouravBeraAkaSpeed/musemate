import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Navbar } from "@/components/landing/Navbar";
import { SupabaseUserProvider } from "@/components/providers/supabase-user-provider";
import { Toaster } from "@/components/ui/toaster";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MYMUSEMATE",
  description: "A heaven for readers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <SupabaseUserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            storageKey="MYMUSEMATE-theme"
          >
            <Navbar className="top-2" />
            <Toaster/>
            {children}
          </ThemeProvider>
        </SupabaseUserProvider>
      </body>
    </html>
  );
}

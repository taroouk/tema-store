import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { bodyFont, headingFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/constants/site";
import { Navbar } from "@/components/layout/navbar";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { PageTransition } from "@/components/ux/page-transition";
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },

  description: siteConfig.description,

  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
<body
  className={cn(
    bodyFont.variable,
    headingFont.variable,
    "bg-background text-foreground antialiased"
  )}
>
 <AnnouncementBar />
<Navbar />

<PageTransition>{children}</PageTransition>

<Footer />
</body>
    </html>
  );
}
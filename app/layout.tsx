import type { Metadata } from "next";
import "./globals.css";
import { bodyFont, headingFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/constants/site";
import { ThemeSync } from "@/components/theme/theme-sync";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { CatalogProvider } from "@/components/catalog/catalog-provider";
import { getCategories, getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { Footer } from "@/components/layout/footer";
import { SiteChrome } from "@/components/layout/site-chrome";
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  keywords: [siteConfig.name, ...siteConfig.alternateNames, "oversized t-shirts Egypt", "premium essentials"],
  verification: {
    google: settings.googleVerification || undefined,
    other: settings.bingVerification ? { "msvalidate.01": settings.bingVerification } : undefined,
  },

  title: {
    default: `${siteConfig.name} — Premium Everyday Essentials`,
    template: `%s | ${siteConfig.name}`,
  },

  description: siteConfig.description,

  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_EG",
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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories(), getSettings()]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the saved/OS theme before first paint to avoid a flash */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
<body
  className={cn(
    bodyFont.variable,
    headingFont.variable,
    "bg-background text-foreground antialiased"
  )}
>
<ThemeSync />
<CatalogProvider products={products} categories={categories} pricing={settings} announcement={settings.announcement} payments={settings.payments}>
  <SiteChrome footer={<Footer />}>{children}</SiteChrome>
</CatalogProvider>
</body>
    </html>
  );
}
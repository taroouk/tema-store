import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Shop",
    template: `%s | TEMA`,
  },
};

interface ShopLayoutProps {
  children: React.ReactNode;
}

export default function ShopAreaLayout({ children }: ShopLayoutProps) {
  return <>{children}</>;
}

import { ReactNode } from "react";

import { Container } from "@/components/common/container";

interface ShopLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function ShopLayout({
  sidebar,
  children,
}: ShopLayoutProps) {
  return (
    <Container>
      <div className="grid gap-12 py-14 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          {sidebar}
        </aside>

        {/* Products */}
        <section>{children}</section>
      </div>
    </Container>
  );
}
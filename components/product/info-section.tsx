import type { ReactNode } from "react";

interface InfoSectionProps {
  title: string;
  children: ReactNode;
}

export function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <div className="border-b border-neutral-200 py-6 last:border-b-0">
      <h3 className="text-lg font-medium">{title}</h3>

      <div className="mt-4 space-y-4 text-sm leading-7 text-neutral-600">
        {children}
      </div>
    </div>
  );
}

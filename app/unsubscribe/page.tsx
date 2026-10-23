import type { Metadata } from "next";

import { Container } from "@/components/common/container";
import { verifyToken } from "@/lib/tokens";

import { UnsubscribeForm } from "./unsubscribe-form";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ e?: string; t?: string }> }) {
  const { e = "", t = "" } = await searchParams;
  const valid = e.length > 3 && e.length < 200 && verifyToken("unsubscribe", e.toLowerCase(), t);

  return (
    <Container>
      <section className="mx-auto max-w-xl py-24 text-center">
        <h1 className="text-4xl" style={{ fontFamily: "var(--font-heading)" }}>Unsubscribe</h1>
        {valid ? (
          <>
            <p className="mt-4 text-neutral-600">Stop sending emails to <strong className="text-foreground">{e}</strong>?</p>
            <UnsubscribeForm email={e.toLowerCase()} token={t} />
          </>
        ) : (
          <p className="mt-4 text-neutral-600">This unsubscribe link is invalid or incomplete. Write to us from the Contact page and we&apos;ll remove you.</p>
        )}
      </section>
    </Container>
  );
}

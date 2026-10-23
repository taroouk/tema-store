import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h2: (p) => (
    <h2 className="mt-12 text-2xl font-semibold first:mt-0" style={{ fontFamily: "var(--font-heading)" }} {...p} />
  ),
  h3: (p) => <h3 className="mt-8 text-lg font-semibold" {...p} />,
  p: (p) => <p className="mt-4 leading-8 text-neutral-600" {...p} />,
  ul: (p) => <ul className="mt-4 list-disc space-y-2 pl-5 leading-8 text-neutral-600" {...p} />,
  ol: (p) => <ol className="mt-4 list-decimal space-y-2 pl-5 leading-8 text-neutral-600" {...p} />,
  strong: (p) => <strong className="font-semibold text-foreground" {...p} />,
  hr: () => <hr className="my-10 border-neutral-200" />,
  blockquote: (p) => <blockquote className="mt-4 border-l-2 border-neutral-300 pl-4 italic text-neutral-600" {...p} />,
  a: ({ href = "", children }) =>
    href.startsWith("/") ? (
      <Link href={href} className="font-medium text-foreground underline underline-offset-4">
        {children}
      </Link>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline underline-offset-4">
        {children}
      </a>
    ),
  table: (p) => (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200">
      <table className="w-full text-left text-sm" {...p} />
    </div>
  ),
  thead: (p) => <thead className="bg-neutral-50 text-xs uppercase tracking-[0.18em] text-neutral-500" {...p} />,
  th: (p) => <th className="px-5 py-3 font-medium" {...p} />,
  td: (p) => <td className="border-t border-neutral-200 px-5 py-4 text-neutral-600" {...p} />,
};

/**
 * Renders admin-authored Markdown. Raw HTML is NOT interpreted (react-markdown's default), and images,
 * iframes and scripts are not allowed, so editors can't inject anything executable.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={components}
      disallowedElements={["img", "iframe", "script", "style"]}
      unwrapDisallowed
    >
      {children}
    </ReactMarkdown>
  );
}

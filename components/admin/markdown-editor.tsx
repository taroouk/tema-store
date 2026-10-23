"use client";

import { Bold, Heading2, Link2, List, Table } from "lucide-react";
import { useRef, useState } from "react";

import { Markdown } from "@/components/content/markdown";

import { inputCls } from "./ui";

const TOOLS = [
  { label: "Heading", icon: Heading2, before: "\n## ", after: "\n", sample: "Heading" },
  { label: "Bold", icon: Bold, before: "**", after: "**", sample: "bold text" },
  { label: "List", icon: List, before: "\n- ", after: "\n", sample: "List item" },
  { label: "Link", icon: Link2, before: "[", after: "](https://)", sample: "link text" },
  { label: "Table", icon: Table, before: "\n| Column | Column |\n| --- | --- |\n| ", after: " | |\n", sample: "Cell" },
] as const;

/** Markdown textarea with a toolbar and a live preview. The value posts as the `name` field. */
export function MarkdownEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const area = useRef<HTMLTextAreaElement>(null);

  const insert = (before: string, after: string, sample: string) => {
    const el = area.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const selected = value.slice(a, b) || sample;
    const next = value.slice(0, a) + before + selected + after + value.slice(b);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + before.length, a + before.length + selected.length);
    });
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-md border border-neutral-300 p-0.5 text-sm">
          {(["write", "preview"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`rounded px-3 py-1 capitalize ${tab === t ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
              {t}
            </button>
          ))}
        </div>
        {tab === "write" && (
          <div className="flex gap-1">
            {TOOLS.map((t) => (
              <button key={t.label} type="button" title={t.label} aria-label={t.label} onClick={() => insert(t.before, t.after, t.sample)} className="rounded-md border border-neutral-300 p-2 text-neutral-600 hover:bg-neutral-100">
                <t.icon size={14} />
              </button>
            ))}
          </div>
        )}
      </div>

      <textarea
        ref={area}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={22}
        spellCheck
        className={`${inputCls} font-mono text-[13px] leading-6 ${tab === "preview" ? "hidden" : ""}`}
      />
      {tab === "preview" && (
        <div className="min-h-[20rem] rounded-md border border-neutral-300 bg-white p-6">
          <Markdown>{value}</Markdown>
        </div>
      )}
    </div>
  );
}

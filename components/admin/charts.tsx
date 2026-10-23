import { money } from "@/lib/admin/format";

export interface DayPoint {
  label: string;
  date: string;
  sales: number;
  orders: number;
}

/** Dependency-free SVG bar chart (server-rendered, accessible via <title> + table fallback). */
export function SalesChart({ data }: { data: DayPoint[] }) {
  const W = 720;
  const H = 200;
  const pad = { t: 12, r: 8, b: 24, l: 8 };
  const max = Math.max(1, ...data.map((d) => d.sales));
  const bw = (W - pad.l - pad.r) / data.length;
  const every = Math.ceil(data.length / 10);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full" role="img" aria-label="Daily sales">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={pad.l} x2={W - pad.r} y1={pad.t + (H - pad.t - pad.b) * (1 - f)} y2={pad.t + (H - pad.t - pad.b) * (1 - f)} stroke="currentColor" className="text-neutral-200" strokeDasharray="3 4" />
      ))}
      {data.map((d, i) => {
        const h = ((H - pad.t - pad.b) * d.sales) / max;
        const x = pad.l + i * bw + bw * 0.15;
        const y = H - pad.b - h;
        return (
          <g key={d.date}>
            <rect x={x} y={d.sales ? y : H - pad.b - 1.5} width={bw * 0.7} height={d.sales ? h : 1.5} rx={2} className={d.sales ? "fill-neutral-900" : "fill-neutral-200"}>
              <title>{`${d.date}: ${money(d.sales)} · ${d.orders} order${d.orders === 1 ? "" : "s"}`}</title>
            </rect>
            {i % every === 0 && (
              <text x={x + (bw * 0.7) / 2} y={H - 6} textAnchor="middle" className="fill-neutral-500" fontSize="10">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function BarList({
  items,
}: {
  items: { label: string; value: number; display?: string; tone?: string }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="truncate pr-2 text-neutral-700">{i.label}</span>
            <span className="font-medium tabular-nums">{i.display ?? i.value}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div className={`h-full rounded-full ${i.tone ?? "bg-neutral-900"}`} style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

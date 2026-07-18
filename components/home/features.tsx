import {
  BadgeCheck,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

const features = [
  {
    icon: BadgeCheck,
    title: "Premium Quality",
    description: "100% Premium Cotton",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "2–4 Business Days",
  },
  {
    icon: RefreshCcw,
    title: "Easy Returns",
    description: "14 Days Return",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "100% Secure Checkout",
  },
];

export function Features() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className={`
                flex items-center gap-4 p-8
                ${index !== features.length - 1 ? "lg:border-r" : ""}
                ${index < 2 ? "border-b lg:border-b-0" : ""}
                border-neutral-200
              `}
            >
              <Icon
                size={30}
                strokeWidth={1.7}
                className="shrink-0 text-neutral-900"
              />

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.08em]">
                  {feature.title}
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
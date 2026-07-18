import { Star } from "lucide-react";

interface Review {
  name: string;
  rating: number;
  date: string;
  title: string;
  body: string;
}

const REVIEWS: Review[] = [
  {
    name: "Layla M.",
    rating: 5,
    date: "May 2026",
    title: "Perfect everyday piece",
    body: "The fabric quality is exceptional and the fit is exactly as described. Easily my new favorite.",
  },
  {
    name: "Omar K.",
    rating: 5,
    date: "April 2026",
    title: "Premium feel",
    body: "Heavyweight cotton that holds its shape. Sizing is true to the guide. Highly recommend.",
  },
  {
    name: "Nada A.",
    rating: 4,
    date: "April 2026",
    title: "Great, slightly oversized",
    body: "Love the minimal design. I sized down for a closer fit and it worked perfectly.",
  },
];

interface ReviewsProps {
  average?: number;
  count?: number;
}

export function Reviews({ average = 4.7, count = 24 }: ReviewsProps) {
  return (
    <section className="mt-20 border-t border-neutral-200">
      <div className="grid gap-12 py-12 lg:grid-cols-[280px_1fr]">
        {/* Summary */}

        <div>
          <h2
            className="text-2xl font-semibold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Customer Reviews
          </h2>

          <div className="mt-6 flex items-end gap-3">
            <span className="text-5xl font-semibold">{average}</span>
            <span className="mb-1 text-sm text-neutral-500">/ 5</span>
          </div>

          <div className="mt-3 flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={16}
                className={
                  index < Math.round(average)
                    ? "fill-black text-black"
                    : "fill-neutral-200 text-neutral-200"
                }
              />
            ))}
          </div>

          <p className="mt-3 text-sm text-neutral-500">
            Based on {count} reviews
          </p>
        </div>

        {/* List */}

        <div className="divide-y divide-neutral-200">
          {REVIEWS.map((review) => (
            <article key={review.name} className="py-6 first:pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={14}
                        className={
                          index < review.rating
                            ? "fill-black text-black"
                            : "fill-neutral-200 text-neutral-200"
                        }
                      />
                    ))}
                  </div>

                  <span className="text-sm font-medium">{review.name}</span>
                </div>

                <span className="text-xs text-neutral-400">{review.date}</span>
              </div>

              <h3 className="mt-3 text-sm font-semibold">{review.title}</h3>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-600">
                {review.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

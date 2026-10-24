export const money = (value: unknown, currency = "EGP") =>
  `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${currency}`;

export const dateTime = (d: Date) =>
  d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Redirect target carrying a flash message. */
export const withMessage = (path: string, key: "error" | "ok", msg: string) =>
  `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(msg)}`;

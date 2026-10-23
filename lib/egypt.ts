export const GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Qalyubia", "Sharqia", "Dakahlia", "Gharbia", "Monufia", "Beheira", "Kafr El Sheikh",
  "Damietta", "Port Said", "Ismailia", "Suez", "North Sinai", "South Sinai", "Faiyum", "Beni Suef", "Minya", "Asyut",
  "Sohag", "Qena", "Luxor", "Aswan", "Red Sea", "New Valley", "Matrouh",
] as const;

/**
 * Egyptian mobile (010/011/012/015) or landline, with optional +20 / 0020 prefix.
 * Spaces and dashes are ignored.
 */
export function normalizeEgyptianPhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-().]/g, "");
  const m = digits.match(/^(?:\+20|0020|20)?(0?1[0125]\d{8}|0?[2-9]\d{7,8})$/);
  if (!m) return null;
  const local = m[1].startsWith("0") ? m[1] : `0${m[1]}`;
  return local;
}

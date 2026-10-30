export type NavigationItem = {
  title: string;
  href: string;
  children?: NavigationItem[];
};

export const navigation: NavigationItem[] = [
  {
    title: "New Arrivals",
    href: "/new-arrivals",
  },
  {
    title: "Shop",
    href: "/shop",
  },
  {
    title: "Essentials",
    href: "/essentials",
  },
  {
    title: "About",
    href: "/about",
  },
];
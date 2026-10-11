import type { ReactNode } from "react";

interface IconProps {
  className?: string;
  size?: number;
}

function svg(size: number | undefined, className: string | undefined, children: ReactNode) {
  return (
    <svg
      width={size ?? 16}
      height={size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const Icons = {
  sticker: (p: IconProps = {}) => svg(p.size, p.className, <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7l7-7V5a2 2 0 0 0-2-2Z" /><path d="M14 21v-5a2 2 0 0 1 2-2h5" /><path d="M9 9h.01M13 9h.01M9.5 13.5s.8 1 2.5 1 2.5-1 2.5-1" /></>),
  image: (p: IconProps = {}) => svg(p.size, p.className, <><rect x="3" y="4" width="18" height="16" /><circle cx="9" cy="10" r="2" /><path d="m3 17 5-4 4 3 4-4 5 5" /></>),
  canvas: (p: IconProps = {}) => svg(p.size, p.className, <><rect x="3" y="3" width="18" height="14" /><path d="M8 21h8M12 17v4" /><path d="m7 12 3-3 2 2 3-3 2 2" /></>),
  audio: (p: IconProps = {}) => svg(p.size, p.className, <><path d="M3 12h2l2-6 3 15 3-12 2 6h6" /></>),
  download: (p: IconProps = {}) => svg(p.size, p.className, <><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M4 21h16" /></>),
  tools: (p: IconProps = {}) => svg(p.size, p.className, <><path d="M14.5 5.5a4 4 0 0 0 5 5L21 21l-8-2-2.5-4.5a4 4 0 0 1 4-9Z" /><path d="M5 9 3 11l6 6 2-2" /><path d="m7 5 2 2" /></>),
  ai: (p: IconProps = {}) => svg(p.size, p.className, <><rect x="6" y="7" width="12" height="11" /><path d="M9 3v4M15 3v4" /><circle cx="10" cy="12" r="1" /><circle cx="14" cy="12" r="1" /><path d="M10 15.5h4" /><path d="M3 11v3M21 11v3" /></>),
  music: (p: IconProps = {}) => svg(p.size, p.className, <><circle cx="7" cy="18" r="3" /><circle cx="18" cy="16" r="3" /><path d="M10 18V6l11-2v12" /></>),
  anime: (p: IconProps = {}) => svg(p.size, p.className, <><circle cx="12" cy="11" r="8" /><path d="M8.5 10h.01M15.5 10h.01" /><path d="M9.5 14.5s1 1 2.5 1 2.5-1 2.5-1" /><path d="m5 5 1.5 2.5M19 5l-1.5 2.5" /></>),
  search: (p: IconProps = {}) => svg(p.size, p.className, <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  games: (p: IconProps = {}) => svg(p.size, p.className, <><rect x="2" y="7" width="20" height="11" /><path d="M7 11v3M5.5 12.5h3" /><circle cx="16" cy="11.5" r="0.8" /><circle cx="18" cy="14" r="0.8" /></>),
  menu: (p: IconProps = {}) => svg(p.size, p.className, <><path d="M3 6h18M3 12h18M3 18h18" /></>),
  close: (p: IconProps = {}) => svg(p.size, p.className, <><path d="M6 6l12 12M18 6 6 18" /></>),
  chevron: (p: IconProps = {}) => svg(p.size, p.className, <path d="m6 9 6 6 6-6" />),
  arrowRight: (p: IconProps = {}) => svg(p.size, p.className, <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>),
  sun: (p: IconProps = {}) => svg(p.size, p.className, <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" /></>),
  moon: (p: IconProps = {}) => svg(p.size, p.className, <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z" />),
  copy: (p: IconProps = {}) => svg(p.size, p.className, <><rect x="9" y="9" width="12" height="12" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>),
  check: (p: IconProps = {}) => svg(p.size, p.className, <path d="m4 12 5 5L20 6" />),
  bolt: (p: IconProps = {}) => svg(p.size, p.className, <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />),
  file: (p: IconProps = {}) => svg(p.size, p.className, <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5" /></>),
  upload: (p: IconProps = {}) => svg(p.size, p.className, <><path d="M12 17V5" /><path d="m6 10 6-6 6 6" /><path d="M4 21h16" /></>),
  clock: (p: IconProps = {}) => svg(p.size, p.className, <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  alert: (p: IconProps = {}) => svg(p.size, p.className, <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17.5h.01" /></>),
  key: (p: IconProps = {}) => svg(p.size, p.className, <><circle cx="8" cy="14" r="4" /><path d="m11 11 8-8 2 2-2 2 2 2-3 3-2-2-2 2" /></>),
  terminal: (p: IconProps = {}) => svg(p.size, p.className, <><rect x="3" y="4" width="18" height="16" /><path d="m7 9 3 3-3 3M13 15h4" /></>)
};

export type IconName = keyof typeof Icons;

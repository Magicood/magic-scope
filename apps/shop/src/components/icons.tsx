import type { SVGProps } from 'react';

function Base({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconSearch = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
);

export const IconBag = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M6 8h12l-1 12H7z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </Base>
);

export const IconCup = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M5 8h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5z" />
    <path d="M16 9h2.5a2.5 2.5 0 0 1 0 5H16" />
    <path d="M8 3c-.6.8-.6 1.7 0 2.5M11.5 3c-.6.8-.6 1.7 0 2.5" />
  </Base>
);

export const IconLeaf = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13Z" />
    <path d="M5 19c3-5 6-7 9-8" />
  </Base>
);

export const IconTruck = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M3 7h11v9H3z" />
    <path d="M14 10h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </Base>
);

export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="m4 12 5 5L20 6" />
  </Base>
);

export const IconArrowRight = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

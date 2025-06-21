import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.42 6.22c-1.33-1.33-3.49-1.33-4.82 0l-1.42 1.42c-1.33 1.33-1.33 3.49 0 4.82l7.24 7.24c1.33 1.33 3.49 1.33 4.82 0l1.42-1.42c1.33-1.33 1.33-3.49 0-4.82L9.42 6.22Z" />
      <path d="M18.5 2.5 21.5 5.5" />
      <path d="m2.5 18.5 3 3" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M22 12h-2" />
      <path d="M4 12H2" />
    </svg>
  );
}

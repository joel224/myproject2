
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="150"
      height="37.5" // Adjusted to maintain aspect ratio with width 150
      aria-labelledby="logoTitle"
      {...props}
    >
      <title id="logoTitle">Dr. Loji's Dental Hub Logo</title>
      <rect width="200" height="50" fill="none" /> {/* Transparent background */}
      {/* Simple Tooth Icon */}
      <path 
        d="M30 10 Q35 5 40 10 C45 15 45 25 40 30 L40 40 Q35 45 30 40 L30 30 Q25 25 25 15 C25 5 30 10 30 10Z" 
        fill="hsl(var(--primary))" 
      />
      <path 
        d="M30 10 Q25 5 20 10 C15 15 15 25 20 30 L20 40 Q25 45 30 40 L30 30"
        fill="hsl(var(--primary))"
        transform="translate(10, 0) scale(-1, 1) translate(-40, 0)" // Mirror the right part for symmetry
      />
      <text
        x="55"
        y="32" // Adjusted for vertical alignment
        fontFamily="var(--font-open-sans), sans-serif"
        fontSize="20"
        fontWeight="bold"
        fill="hsl(var(--navbar-foreground-main))" 
      >
        Dr. Loji's
      </text>
      <text
        x="55"
        y="46" // Adjusted for vertical alignment
        fontFamily="var(--font-open-sans), sans-serif"
        fontSize="12"
        fill="hsl(var(--navbar-foreground-main), 0.8)" 
      >
        D E N T A L H U B
      </text>
    </svg>
  );
}

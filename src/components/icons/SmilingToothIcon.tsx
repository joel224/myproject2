import type { SVGProps } from 'react';

export function SmilingToothIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-label="Smiling Tooth Icon"
      {...props}
    >
      {/* Tooth body */}
      <path 
        d="M20,80 Q20,40 50,40 Q80,40 80,80 L70,90 L30,90 Z" 
        fill="hsl(var(--card))" 
        stroke="hsl(var(--primary))" 
        strokeWidth="3"
      />
      {/* Roots */}
      <path 
        d="M35,88 Q30,100 25,90" 
        fill="none" 
        stroke="hsl(var(--primary))" 
        strokeWidth="3" 
      />
      <path 
        d="M65,88 Q70,100 75,90" 
        fill="none" 
        stroke="hsl(var(--primary))" 
        strokeWidth="3" 
      />
      {/* Eyes */}
      <circle cx="35" cy="60" r="5" fill="hsl(var(--foreground))" />
      <circle cx="65" cy="60" r="5" fill="hsl(var(--foreground))" />
      {/* Smile */}
      <path 
        d="M35,75 Q50,85 65,75" 
        fill="none" 
        stroke="hsl(var(--foreground))" 
        strokeWidth="3" 
      />
    </svg>
  );
}

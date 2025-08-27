import { useState } from "react";
import { cn } from "@/lib/utils";

interface GlossaryTermProps {
  term: string;
  definition: string;
  className?: string;
  children?: React.ReactNode;
}

export function GlossaryTerm({ term, definition, className, children }: GlossaryTermProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span 
      className={cn("relative border-b border-dotted border-ufOrange cursor-help", className)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      data-testid={`glossary-term-${term.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {children || term}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-md shadow-lg max-w-xs z-50 whitespace-normal">
          <div className="font-medium mb-1">{term}</div>
          <div>{definition}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </span>
  );
}

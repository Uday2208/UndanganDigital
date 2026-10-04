/**
 * Ornamen SVG lokal & orisinal (motif geometris ala pucuk rebung / berlian).
 * Warna memakai palet resmi (#D99418).
 */
export function DividerOrnament({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 24"
      width="168"
      height="17"
      aria-hidden="true"
      focusable="false"
      className={`mx-auto block ${className}`}
    >
      <g fill="none" stroke="#D99418" strokeWidth="1">
        <line x1="0" y1="12" x2="94" y2="12" strokeOpacity="0.7" />
        <line x1="146" y1="12" x2="240" y2="12" strokeOpacity="0.7" />
        <path d="M120 2 L130 12 L120 22 L110 12 Z" />
        <path d="M100 8 L104 12 L100 16 L96 12 Z" />
        <path d="M140 8 L144 12 L140 16 L136 12 Z" />
      </g>
      <path d="M120 7 L125 12 L120 17 L115 12 Z" fill="#F0B83F" />
    </svg>
  );
}

export function EthnicBorder({ patternId = "rebung", className = "" }: { patternId?: string; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" width="100%" height="14" className={`block ${className}`}>
      <defs>
        <pattern id={patternId} width="20" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 14 L10 2 L20 14 Z" fill="none" stroke="#D99418" strokeOpacity="0.55" strokeWidth="1" />
          <path d="M10 6 L14 14 L6 14 Z" fill="#9A650E" fillOpacity="0.55" />
        </pattern>
      </defs>
      <rect width="100%" height="14" fill={`url(#${patternId})`} />
    </svg>
  );
}

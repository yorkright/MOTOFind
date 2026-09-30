"use client";

/**
 * A hand-drawn, generic coupe silhouette — not a trace of any real make/model.
 * We use crafted SVG illustration here instead of stock photography on purpose:
 * it's copyright-safe to ship in a real product, renders crisp at any size,
 * and themes with the site's colors instead of fighting a random photo's
 * lighting/background. Swap in real inventory photos per-listing once you're
 * pulling from your car API — this is the "no listing photo yet" / brand art.
 */
export default function CarSilhouette({ id = "car", className = "", glow = true }) {
  const grad = `${id}-body`;
  const glowId = `${id}-glow`;
  const shine = `${id}-shine`;

  return (
    <svg
      viewBox="0 0 600 260"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of a coupe car"
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A3345" />
          <stop offset="100%" stopColor="#141A26" />
        </linearGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0%" stopColor="#F5A623" stopOpacity="0" />
          <stop offset="50%" stopColor="#F5A623" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5A623" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
        </radialGradient>
      </defs>

      {glow && <ellipse cx="300" cy="205" rx="230" ry="34" fill={`url(#${glowId})`} />}

      {/* ground shadow */}
      <ellipse cx="300" cy="215" rx="215" ry="12" fill="#000" opacity="0.35" />

      {/* body */}
      <path
        d="M40 175
           C 45 140, 90 120, 130 112
           L 175 78
           C 205 58, 250 48, 300 48
           C 350 48, 392 58, 420 80
           L 460 112
           C 505 118, 548 138, 558 175
           L 558 182
           C 558 190, 550 194, 540 194
           L 500 194
           L 500 185
           C 500 165, 484 149, 464 149
           C 444 149, 428 165, 428 185
           L 428 194
           L 175 194
           L 175 185
           C 175 165, 159 149, 139 149
           C 119 149, 103 165, 103 185
           L 103 194
           L 60 194
           C 48 194, 40 188, 40 180
           Z"
        fill={`url(#${grad})`}
        stroke="#F5A623"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />

      {/* windows */}
      <path
        d="M188 108 L 215 80 C 240 63 265 56 300 56 C 335 56 358 63 382 80 L 408 108 Z"
        fill="#0B0F19"
        stroke="#4C7CF3"
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />
      <line x1="300" y1="60" x2="300" y2="108" stroke="#4C7CF3" strokeOpacity="0.5" strokeWidth="1.5" />

      {/* shine sweep */}
      <rect x="40" y="48" width="520" height="146" fill={`url(#${shine})`} />

      {/* headlight + taillight */}
      <ellipse cx="548" cy="140" rx="10" ry="6" fill="#F5A623" />
      <ellipse cx="52" cy="140" rx="8" ry="5" fill="#E5484D" opacity="0.85" />

      {/* wheels */}
      <circle cx="139" cy="185" r="34" fill="#0B0F19" stroke="#232C3D" strokeWidth="6" />
      <circle cx="139" cy="185" r="14" fill="#232C3D" />
      <circle cx="464" cy="185" r="34" fill="#0B0F19" stroke="#232C3D" strokeWidth="6" />
      <circle cx="464" cy="185" r="14" fill="#232C3D" />
    </svg>
  );
}

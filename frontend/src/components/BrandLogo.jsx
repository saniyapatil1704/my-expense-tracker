import React from 'react';

/**
 * BrandLogo - Premium vector brand emblem for Daily Balance
 */
export const BrandLogo = ({ size = 'md', className = '', withShadow = true }) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const dimension = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 rounded-xl overflow-hidden transition-transform duration-200 ${dimension} ${
        withShadow ? 'shadow-md shadow-brand-accent/25 hover:shadow-lg hover:shadow-brand-accent/35' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 512 512"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="blGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E26A45" />
            <stop offset="45%" stopColor="#C45D3C" />
            <stop offset="100%" stopColor="#8F3216" />
          </linearGradient>

          <linearGradient id="blGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF8E7" />
            <stop offset="40%" stopColor="#F7D08A" />
            <stop offset="100%" stopColor="#D6963E" />
          </linearGradient>

          <linearGradient id="blIvory" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FAF1E6" />
          </linearGradient>
        </defs>

        {/* Squircle Badge Base */}
        <rect x="24" y="24" width="464" height="464" rx="116" fill="url(#blGrad)" />
        <rect
          x="26"
          y="26"
          width="460"
          height="460"
          rx="114"
          fill="none"
          stroke="#FFAE94"
          strokeWidth="6"
          strokeOpacity="0.55"
        />

        {/* Ambient Ring */}
        <circle
          cx="256"
          cy="256"
          r="148"
          fill="none"
          stroke="url(#blGold)"
          strokeWidth="3.5"
          opacity="0.3"
          strokeDasharray="10 8"
        />

        {/* Base Pedestal */}
        <path
          d="M 176 400 L 336 400"
          stroke="url(#blIvory)"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M 216 420 L 296 420"
          stroke="url(#blGold)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Pillar */}
        <line
          x1="256"
          y1="126"
          x2="256"
          y2="400"
          stroke="url(#blIvory)"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Top Ring */}
        <circle
          cx="256"
          cy="126"
          r="22"
          fill="url(#blGold)"
          stroke="url(#blIvory)"
          strokeWidth="7"
        />

        {/* Cross Beam */}
        <path
          d="M 112 186 Q 256 160 400 186"
          fill="none"
          stroke="url(#blIvory)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <circle cx="256" cy="173" r="12" fill="url(#blGold)" />

        {/* Left Pan */}
        <circle cx="112" cy="186" r="9" fill="url(#blGold)" />
        <line
          x1="112"
          y1="186"
          x2="68"
          y2="292"
          stroke="url(#blIvory)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        <line
          x1="112"
          y1="186"
          x2="156"
          y2="292"
          stroke="url(#blIvory)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        <path
          d="M 54 292 C 54 336 170 336 170 292 Z"
          fill="url(#blGold)"
          stroke="url(#blIvory)"
          strokeWidth="7"
        />
        <ellipse cx="112" cy="286" rx="28" ry="12" fill="#FFFFFF" opacity="0.95" />

        {/* Right Pan */}
        <circle cx="400" cy="186" r="9" fill="url(#blGold)" />
        <line
          x1="400"
          y1="186"
          x2="356"
          y2="292"
          stroke="url(#blIvory)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        <line
          x1="400"
          y1="186"
          x2="444"
          y2="292"
          stroke="url(#blIvory)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        <path
          d="M 342 292 C 342 336 458 336 458 292 Z"
          fill="url(#blGold)"
          stroke="url(#blIvory)"
          strokeWidth="7"
        />
        <ellipse cx="400" cy="286" rx="28" ry="12" fill="#FFFFFF" opacity="0.95" />

        {/* Center Coin with Rupee Symbol */}
        <circle
          cx="256"
          cy="268"
          r="48"
          fill="url(#blGold)"
          stroke="url(#blIvory)"
          strokeWidth="7"
        />
        <text
          x="256"
          y="286"
          fontFamily="'Manrope', 'Segoe UI', sans-serif"
          fontWeight="900"
          fontSize="48"
          textAnchor="middle"
          fill="#6A220D"
        >
          ₹
        </text>
      </svg>
    </div>
  );
};

export default BrandLogo;

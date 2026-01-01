interface LogoProps {
  variant?: 1 | 2 | 3 | 4;
  size?: number;
  className?: string;
  showText?: boolean;
}

// Option 1: Speech bubble + star
const Logo1 = ({ size = 32 }: { size: number }) => (
  <svg width={size} height={size} viewBox="4 4 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 6C4 4.89543 4.89543 4 6 4H26C27.1046 4 28 4.89543 28 6V20C28 21.1046 27.1046 22 26 22H18L12 28V22H6C4.89543 22 4 21.1046 4 20V6Z"
      fill="#4F46E5"
    />
    <path
      d="M16 7L17.5 11.5H22L18.5 14L20 18.5L16 15.5L12 18.5L13.5 14L10 11.5H14.5L16 7Z"
      fill="#FBBF24"
    />
  </svg>
);

// Option 2: Stylized O with orbiting stars
const Logo2 = ({ size = 32 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="10" stroke="#4F46E5" strokeWidth="3" fill="none" />
    <circle cx="16" cy="16" r="4" fill="#4F46E5" />
    <path
      d="M16 2L17 5.5H20.5L17.75 7.5L18.75 11L16 9L13.25 11L14.25 7.5L11.5 5.5H15L16 2Z"
      fill="#FBBF24"
    />
    <path
      d="M26 14L27 16H29L27.5 17.5L28 19.5L26 18L24 19.5L24.5 17.5L23 16H25L26 14Z"
      fill="#FBBF24"
    />
  </svg>
);

// Option 3: Checkmark + star combo
const Logo3 = ({ size = 32 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="#4F46E5" />
    <path
      d="M9 16L14 21L23 11"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 6L25 8.5H27.5L25.5 10L26.5 12.5L24 11L21.5 12.5L22.5 10L20.5 8.5H23L24 6Z"
      fill="#FBBF24"
    />
  </svg>
);

// Option 4: Wordmark star
const Logo4 = ({ size = 32 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="8" width="28" height="16" rx="4" fill="#4F46E5" />
    <text x="7" y="20" fill="white" fontSize="10" fontWeight="bold" fontFamily="system-ui">
      О
    </text>
    <path
      d="M22 12L23.2 15.2H26.5L23.9 17.2L24.9 20.5L22 18.2L19.1 20.5L20.1 17.2L17.5 15.2H20.8L22 12Z"
      fill="#FBBF24"
    />
  </svg>
);

export default function Logo({ variant = 1, size = 32, className = "", showText = true }: LogoProps) {
  const LogoIcon = {
    1: Logo1,
    2: Logo2,
    3: Logo3,
    4: Logo4,
  }[variant];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <span className="font-bold text-gray-900" style={{ fontSize: size * 0.8 }}>
          Отзовик
        </span>
      )}
    </div>
  );
}

// Export individual variants for favicon/specific uses
export { Logo1, Logo2, Logo3, Logo4 };

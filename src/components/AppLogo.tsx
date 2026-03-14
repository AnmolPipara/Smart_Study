interface AppLogoProps {
  size?: number;
}

const AppLogo = ({ size = 40 }: AppLogoProps) => {
  const px = `${size}px`;

  return (
    <div
      style={{ width: px, height: px }}
      className="relative rounded-2xl app-logo-orb flex items-center justify-center overflow-hidden"
    >
      <svg
        viewBox="0 0 48 48"
        className="w-[70%] h-[70%] text-foreground"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(0 84% 60%)" />
            <stop offset="50%" stopColor="hsl(14 90% 60%)" />
            <stop offset="100%" stopColor="hsl(160 80% 45%)" />
          </linearGradient>
        </defs>
        <path
          d="M12 10c4-3 8-4 12-4 7 0 12 3 12 9 0 9-9 9-15 11s-9 3-9 8c0 5 5 8 11 8 4 0 7-1 10-3"
          fill="none"
          stroke="url(#logoStroke)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="60 60"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="60"
            to="0"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx="14" cy="12" r="2" fill="white">
          <animate
            attributeName="opacity"
            values="0.4;1;0.4"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};

export default AppLogo;


interface AppLogoProps {
  size?: number;
  showName?: boolean;
}

const AppLogo = ({ size = 40, showName = false }: AppLogoProps) => {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/studora-logo.png"
        alt="Studora"
        width={size}
        height={size}
        className="object-contain mix-blend-multiply"
        draggable={false}
      />
      {showName && (
        <span
          className="font-bold text-gray-900 tracking-tight"
          style={{ fontSize: size * 0.5, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Studora
        </span>
      )}
    </div>
  );
};

export default AppLogo;

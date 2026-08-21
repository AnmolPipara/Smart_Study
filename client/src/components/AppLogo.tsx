interface AppLogoProps {
  size?: number;
}

const AppLogo = ({ size = 40 }: AppLogoProps) => {
  return (
    <img
      src="/studora-logo.png"
      alt="Studora"
      width={size}
      height={size}
      className="object-contain"
      draggable={false}
    />
  );
};

export default AppLogo;

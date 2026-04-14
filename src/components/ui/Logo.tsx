import NabTechLogo from "./NabTechLogo";

interface LogoProps {
  className?: string;
  width?: number; // Kept for backward compatibility, though SVG uses aspect ratio
  height?: number;
}

export default function Logo({ className = "", width = 180, height = 60 }: LogoProps) {
  return (
    <div 
      className={`flex items-center justify-center group transition-colors duration-300 ${className}`}
      style={{ width: width || 'auto', height: height || 'auto' }}
    >
      <NabTechLogo 
        className="w-full h-full object-contain transition-transform group-hover:scale-105" 
      />
    </div>
  );
}

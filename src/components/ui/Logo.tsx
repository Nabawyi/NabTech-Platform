import Link from "next/link";
import Image from "next/image";
import blackLogo from "./black.png";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  href?: string;
}

export default function Logo({ className = "", width = 180, height = 60, href = "/" }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center justify-center group ${className}`}>
      <Image 
        src={blackLogo} 
        alt="NabTech Logo" 
        width={width}
        height={height}
        className="object-contain transition-transform group-hover:scale-105"
        priority
      />
    </Link>
  );
}

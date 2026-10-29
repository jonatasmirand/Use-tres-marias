"use client";

import Image from "next/image";
import Link from "next/link";

export interface LogoProps {
  href?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  onClick?: () => void;
  alt?: string;
  width?: number;
  height?: number;
}

export default function Logo({
  href = "/",
  className = "inline-flex items-center transition hover:opacity-90",
  imageClassName = "h-9 w-auto md:h-12",
  priority = true,
  onClick,
  alt = "Três Marias",
  width = 1024,
  height = 240,
}: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={alt ? `${alt} — página inicial` : "Três Marias — página inicial"}
      className={className}
      onClick={onClick}
    >
      <Image
        src="/logo-tres-marias.png"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={imageClassName}
      />
    </Link>
  );
}

export { Logo };

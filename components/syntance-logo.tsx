import { cn } from "@/lib/utils";

const LOGO_SRC = "/icons/syntance-logo-white.svg";
const LOGO_WIDTH = 1280;
const LOGO_HEIGHT = 280;

type SyntanceLogoProps = {
  className?: string;
  priority?: boolean;
};

export default function SyntanceLogo({ className, priority = false }: SyntanceLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- wektor SVG, ostre skalowanie bez rasterizacji
    <img
      src={LOGO_SRC}
      alt=""
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      decoding="sync"
      fetchPriority={priority ? "high" : "auto"}
      className={cn("h-10 sm:h-11 w-auto block shrink-0 translate-z-0", className)}
    />
  );
}

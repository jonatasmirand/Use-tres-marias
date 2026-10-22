import { HeroContent } from "@/types/cms";
import HeroCarousel from "./HeroCarousel";

interface HeroSectionProps {
  content: HeroContent;
}

export default function HeroSection({ content }: HeroSectionProps) {
  return <HeroCarousel content={content} />;
}

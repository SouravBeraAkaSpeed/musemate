import { About } from "@/components/landing/About";
import Communities from "@/components/landing/Communities";
import { Hero } from "@/components/landing/HeroSection";
import Owner from "@/components/landing/Owner";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between ">
      <Hero />
      <About />
      <Owner/>
    </main>
  );
}

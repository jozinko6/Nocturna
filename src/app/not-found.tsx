import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-[#dc2626]/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-[#6366f1]/[0.04] rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        <div className="text-[80px] md:text-[120px] font-bold text-[#1a1a2e] leading-none select-none">
          404
        </div>
        <h1 className="text-xl font-semibold text-[#e2e8f0] -mt-4 mb-2">
          Stratený v tme
        </h1>
        <p className="text-sm text-[#64748b] mb-8">
          Táto cesta neexistuje. Možno ju pohltila temnota, alebo nikdy nebola.
        </p>
        <Link href="/">
          <Button variant="primary" size="lg">
            Vrátiť sa do bezpečia
          </Button>
        </Link>
      </div>
    </div>
  );
}

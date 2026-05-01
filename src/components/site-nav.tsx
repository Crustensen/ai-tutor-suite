import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";

type SiteNavProps = {
  className?: string;
};

const navItems = [
  { href: "/", label: "Landing" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/generator", label: "AI Generator" },
];

export function SiteNav({ className }: SiteNavProps) {
  return (
    <header className={cn("border-b border-slate-200/80 bg-white/95", className)}>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <GraduationCap className="h-5 w-5 text-indigo-600" />
          AI Tutor Suite
        </Link>
        <nav className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

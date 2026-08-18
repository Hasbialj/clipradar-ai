"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Scan,
  Scissors,
  Flame,
  FolderOpen,
  BarChart2,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyze", label: "Analyze Video", icon: Scan },
  { href: "/clips", label: "My Clips", icon: Scissors },
  { href: "/moments", label: "Viral Moments", icon: Flame },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
];

const BOTTOM_ITEMS = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-screen z-50 flex flex-col"
      style={{
        width: 240,
        background: "rgba(10, 10, 20, 0.95)",
        borderRight: "1px solid #1e1e3a",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <div className="px-6 py-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center pulse-glow"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
          >
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div
              className="text-base font-bold"
              style={{ color: "#f0f0ff", letterSpacing: "-0.02em" }}
            >
              ClipRadar
            </div>
            <div
              className="text-[10px] font-semibold tracking-widest"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              AI
            </div>
          </div>
        </Link>
      </div>

      {/* Beta badge */}
      <div className="px-6 mb-4">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
          style={{
            background: "rgba(124, 58, 237, 0.12)",
            border: "1px solid rgba(124, 58, 237, 0.25)",
            color: "#9f60ff",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          AI Engine Active
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#1e1e3a", margin: "0 16px 12px" }} />

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <p
          className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: "#55557a" }}
        >
          Navigation
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                active
                  ? "text-white"
                  : "text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a2e]"
              )}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(236, 72, 153, 0.1))",
                      border: "1px solid rgba(124, 58, 237, 0.3)",
                    }
                  : {}
              }
            >
              <Icon
                size={17}
                className={active ? "text-purple-400" : "text-[#55557a] group-hover:text-[#8888aa]"}
              />
              <span>{label}</span>
              {active && (
                <ChevronRight size={14} className="ml-auto text-purple-400/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1">
        <div style={{ height: 1, background: "#1e1e3a", margin: "8px 4px 12px" }} />
        {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#8888aa] hover:text-[#f0f0ff] hover:bg-[#1a1a2e] transition-all"
          >
            <Icon size={17} className="text-[#55557a]" />
            <span>{label}</span>
          </Link>
        ))}

        {/* User area */}
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl mt-2"
          style={{
            background: "rgba(26, 26, 46, 0.6)",
            border: "1px solid #1e1e3a",
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
          >
            CR
          </div>
          <div className="min-w-0">
            <div
              className="text-xs font-semibold truncate"
              style={{ color: "#f0f0ff" }}
            >
              Creator Studio
            </div>
            <div className="text-[10px] truncate" style={{ color: "#55557a" }}>
              Free Plan
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

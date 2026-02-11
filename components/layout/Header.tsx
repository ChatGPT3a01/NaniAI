"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import TutorialModal from "./TutorialModal";

const navItems = [
  { href: "/", label: "教科書列表", icon: BookOpen },
  { href: "/admin", label: "資源管理", icon: Shield },
  { href: "/settings", label: "API Key 設定", icon: Settings },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Logo 連到南一書局官網 */}
          <a
            href="https://trans.nani.com.tw/NaniWeb/"
            target="_blank"
            rel="noopener noreferrer"
            title="前往南一書局官網"
            className="transition-opacity hover:opacity-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="南一書局"
              style={{ height: "44px", width: "auto" }}
            />
          </a>
          {/* 文字連回平台首頁 */}
          <Link href="/" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
            AI 教學助手
          </Link>
        </div>
        <nav className="flex items-center gap-1">
          <TutorialModal />
          <div className="mx-1 h-6 w-px bg-border" />
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-gray-100 hover:text-foreground"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

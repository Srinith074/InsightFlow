import { useTheme } from "next-themes"
import { Moon, Search, SunMedium } from "lucide-react"
import { Button } from "@/components/ui"
import { useUIStore } from "@/store/ui-store"
import { ProfileMenu } from "@/components/layout/ProfileMenu"

export function TopNavbar() {
  const { theme, setTheme } = useTheme()
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen)

  return (
    <header className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur-xl md:sticky md:top-4 md:z-10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(true)} className="lg:hidden">
          <span className="sr-only">Open sidebar</span>
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </Button>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/70 px-4 py-2 text-sm text-muted-foreground">
          <Search className="size-4" />
          <span>Search insights</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark") }>
          {theme === "dark" ? <SunMedium className="size-5" /> : <Moon className="size-5" />}
        </Button>
        <ProfileMenu />
      </div>
    </header>
  )
}

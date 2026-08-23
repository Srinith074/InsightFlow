import { useTheme } from "next-themes"
import { Moon, Search, SunMedium } from "lucide-react"
import { Button } from "@/components/ui"
import { useUIStore } from "@/store/ui-store"
import { ProfileMenu } from "@/components/layout/ProfileMenu"

export function TopNavbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen)

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <header className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur-xl md:sticky md:top-4 md:z-10">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <span className="sr-only">Open sidebar</span>
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </Button>
        <div
          className="hidden sm:flex items-center gap-2.5 rounded-2xl border border-border bg-muted/40 px-3.5 py-1.5 text-xs text-muted-foreground select-none opacity-80 cursor-default"
          title="Global search across datasets (coming soon)"
        >
          <Search className="size-3.5" />
          <span>Search insights</span>
          <span className="ml-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Soon
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="cursor-pointer"
          aria-label="Toggle theme"
          title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {resolvedTheme === "dark" ? <SunMedium className="size-5" /> : <Moon className="size-5" />}
        </Button>
        <ProfileMenu />
      </div>
    </header>
  )
}

import { motion } from "framer-motion"
import { useUIStore } from "@/store/ui-store"
import { workspaceNavigation, managementNavigation } from "@/utils/navigation"
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, Separator } from "@/components/ui"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

export function MobileSidebar() {
  const mobileSidebarOpen = useUIStore((state) => state.mobileSidebarOpen)
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen)

  return (
    <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
      <SheetContent side="left" className="w-[calc(100vw-2rem)] sm:w-[320px]">
        <SheetHeader>
          <div className="flex items-center justify-between gap-3">
            <SheetTitle>InsightFlow</SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(false)}>
              <span className="sr-only">Close menu</span>
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </Button>
          </div>
        </SheetHeader>

        <Separator />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 px-1 py-4">
          <div className="space-y-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace
            </p>
            <nav className="space-y-1">
              {workspaceNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/dashboard"}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )
                    }
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          <div className="space-y-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Management
            </p>
            <nav className="space-y-1">
              {managementNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )
                    }
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}

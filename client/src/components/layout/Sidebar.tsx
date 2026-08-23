import { NavLink } from "react-router-dom"
import { workspaceNavigation, managementNavigation } from "@/utils/navigation"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui"

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col gap-6 border-r border-border bg-background p-6 lg:flex">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-bold tracking-tight text-foreground">InsightFlow</div>
        <p className="max-w-[18rem] text-xs leading-5 text-muted-foreground">
          Deterministic analytics & AI-powered intelligence for Excel and CSV datasets.
        </p>
      </div>

      <Separator />

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
        <div className="space-y-2">
          <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
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
          <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Management
          </p>
          <nav className="space-y-1">
            {managementNavigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
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
      </div>
    </aside>
  )
}

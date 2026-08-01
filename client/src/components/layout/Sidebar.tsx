import { NavLink } from "react-router-dom"
import { dashboardNavigation } from "@/utils/navigation"
import { cn } from "@/lib/utils"
import { Button, Separator } from "@/components/ui"

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col gap-6 border-r border-border bg-background p-6 lg:flex">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-semibold text-foreground">InsightFlow</div>
        <p className="max-w-[18rem] text-sm leading-6 text-muted-foreground">A premium analytics workspace for growth teams and modern product leaders.</p>
      </div>
      <Separator className="my-2" />
      <nav className="space-y-1">
        {dashboardNavigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition",
                  isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )
              }
            >
              <Icon className="size-5" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="mt-auto"> 
        <Button variant="secondary" className="w-full">Upgrade plan</Button>
      </div>
    </aside>
  )
}

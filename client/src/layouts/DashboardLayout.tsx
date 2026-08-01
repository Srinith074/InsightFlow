import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import { MobileSidebar } from "@/components/layout/MobileSidebar"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNavbar } from "@/components/layout/TopNavbar"

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MobileSidebar />
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col gap-6">
          <TopNavbar />
          <motion.main
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex-1"
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </div>
  )
}

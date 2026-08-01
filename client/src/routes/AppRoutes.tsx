import { Routes, Route } from "react-router-dom"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { AnalyticsPage } from "@/pages/AnalyticsPage"
import { AIChatPage } from "@/pages/AIChatPage"
import { DatasetsPage } from "@/pages/DatasetsPage"
import { DashboardHome } from "@/pages/DashboardHome"
import { LandingPage } from "@/pages/LandingPage"
import { LoginPage } from "@/pages/LoginPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { ReportsPage } from "@/pages/ReportsPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { UploadPage } from "@/pages/UploadPage"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="ai-chat" element={<AIChatPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="datasets" element={<DatasetsPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import LoginPage from "./components/LoginPage";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";
import Projects from "./pages/Projects";
import Schedule from "./pages/Schedule";
import DailyLog from "./pages/DailyLog";
import Reports from "./pages/Reports";
import ChangeOrdersPage from "./pages/ChangeOrdersPage";
import Team from "./pages/Team";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/daily-log" element={<DailyLog />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/change-orders" element={<ChangeOrdersPage />} />
            <Route path="/team" element={<Team />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

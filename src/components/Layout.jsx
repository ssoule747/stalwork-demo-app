import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import RoleSwitcher from "./RoleSwitcher";
import Sidebar from "./Sidebar";

const Footer = () => (
  <div className="pinecrest-footer">Powered by Pinecrest AI</div>
);

export default function Layout() {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) return <Navigate to="/" replace />;

  // Unique key per route + role so transitions fire on both navigation and role switch
  const viewKey = `${currentUser.role}-${location.pathname}`;

  // Client portal: full-width, no sidebar
  if (currentUser.role === "client") {
    return (
      <>
        <RoleSwitcher />
        <div className="client-portal-wrap">
          <div className="view-transition" key={viewKey}>
            <Outlet />
          </div>
          <Footer />
        </div>
      </>
    );
  }

  // Field crew: full-width, no sidebar (mobile-first)
  if (currentUser.role === "field") {
    return (
      <>
        <RoleSwitcher />
        <div className="field-portal-wrap">
          <div className="view-transition" key={viewKey}>
            <Outlet />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <RoleSwitcher />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="view-transition" key={viewKey}>
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </>
  );
}

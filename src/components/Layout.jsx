import { Outlet, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import RoleSwitcher from "./RoleSwitcher";
import Sidebar from "./Sidebar";

const Footer = () => (
  <div className="pinecrest-footer">Powered by Pinecrest AI</div>
);

export default function Layout() {
  const { currentUser } = useApp();

  if (!currentUser) return <Navigate to="/" replace />;

  // Client portal: full-width, no sidebar
  if (currentUser.role === "client") {
    return (
      <>
        <RoleSwitcher />
        <div className="client-portal-wrap">
          <Outlet />
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
          <Outlet />
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
          <Outlet />
          <Footer />
        </main>
      </div>
    </>
  );
}

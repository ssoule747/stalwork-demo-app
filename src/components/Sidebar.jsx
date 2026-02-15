import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const navItems = {
  admin: [
    { to: "/dashboard", label: "Dashboard", icon: "grid" },
    { to: "/projects", label: "Projects", icon: "briefcase" },
    { to: "/schedule", label: "Schedule", icon: "calendar" },
    { to: "/reports", label: "Reports", icon: "chart" },
    { to: "/change-orders", label: "Change Orders", icon: "clipboard" },
    { to: "/team", label: "Team", icon: "users" },
  ],
  pm: [
    { to: "/dashboard", label: "Dashboard", icon: "grid" },
    { to: "/projects", label: "Projects", icon: "briefcase" },
    { to: "/schedule", label: "Schedule", icon: "calendar" },
    { to: "/reports", label: "Reports", icon: "chart" },
    { to: "/change-orders", label: "Change Orders", icon: "clipboard" },
  ],
  client: [
    { to: "/dashboard", label: "My Project", icon: "home" },
  ],
  field: [
    { to: "/dashboard", label: "Dashboard", icon: "grid" },
    { to: "/daily-log", label: "Daily Log", icon: "edit" },
  ],
};

const iconMap = {
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
  ),
};

export default function Sidebar() {
  const { currentUser, projects, logout } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const items = navItems[currentUser.role] || [];

  const showProjectLinks = false;
  const visibleProjects = [];

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>Command Center</h1>
        <div className="brand-sub">Stalwork, Inc.</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {iconMap[item.icon]}
            {item.label}
          </NavLink>
        ))}

        {showProjectLinks && (
          <>
            <div className="nav-section-label" style={{ marginTop: 8 }}>
              Projects
            </div>
            {visibleProjects.map((project) => (
              <NavLink
                key={project.id}
                to={`/project/${project.id}`}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                {iconMap.briefcase}
                {project.name.replace(" Residence", "")}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          {iconMap.logout}
          Sign Out
        </button>
      </div>
    </aside>
  );
}

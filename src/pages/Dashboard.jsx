import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ClientPortal from "./ClientPortal";
import FieldPortal from "./FieldPortal";

function formatCurrency(n) {
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return "$" + (n / 1000).toFixed(0) + "K";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatCurrencyFull(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2);
}

// ─── Admin Dashboard (God View) ─────────────
function AdminDashboard() {
  const { projects, crews, dailyLogs, changeOrders } = useApp();
  const navigate = useNavigate();
  const [expandedLog, setExpandedLog] = useState(null);

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const avgCompletion = Math.round(projects.reduce((s, p) => s + p.percentComplete, 0) / projects.length);
  const pendingCOs = changeOrders.filter((c) => c.status === "pending").length;

  return (
    <>
      <div className="page-header">
        <h2>Owner Dashboard</h2>
        <p>All projects, all crews, all data — at a glance.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat-card">
          <div className="stat-label">Active Projects</div>
          <div className="stat-value gold">{projects.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overall Completion</div>
          <div className="stat-value">{avgCompletion}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Budget</div>
          <div className="stat-value">{formatCurrency(totalBudget)}</div>
          <div className="stat-note">{formatCurrencyFull(totalSpent)} spent</div>
          <div className="progress-bar-bg" style={{ marginTop: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${Math.round((totalSpent / totalBudget) * 100)}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Change Orders</div>
          <div className="stat-value" style={{ color: pendingCOs > 0 ? "var(--warning)" : "var(--text-primary)" }}>
            {pendingCOs}
          </div>
        </div>
      </div>

      {/* ── Project Cards with Segmented Bars ── */}
      <div className="section-header">
        <span className="section-title">All Projects</span>
      </div>

      {projects.map((p) => (
        <div key={p.id} className="admin-project-card" onClick={() => navigate(`/project/${p.id}`)}>
          <div className="admin-project-card-top">
            <div>
              <h3>{p.name}</h3>
              <div className="location">{p.location}</div>
            </div>
            <div className="admin-project-percent">
              {p.percentComplete}<span>%</span>
            </div>
          </div>

          <div className="admin-project-bar-wrap">
            <div className="segmented-bar">
              {p.phases.map((phase) => (
                <div key={phase.name} className={`segment ${phase.status}`} />
              ))}
            </div>
          </div>

          <div className="admin-project-meta">
            <span className="admin-project-phase">{p.currentPhase}</span>
            <span>PM: {p.pm}</span>
            <span className="admin-project-budget">
              {formatCurrencyFull(p.spent)} of {formatCurrencyFull(p.budget)}
            </span>
          </div>
        </div>
      ))}

      {/* ── Recent Activity Feed ── */}
      <div className="card" style={{ marginTop: 24, marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Recent Activity</span>
          <span className="card-subtitle">{dailyLogs.length} daily logs</span>
        </div>
        <div className="activity-feed">
          {dailyLogs.slice(0, 5).map((log) => {
            const proj = projects.find((p) => p.id === log.projectId);
            const isExpanded = expandedLog === log.id;
            return (
              <div
                key={log.id}
                className="activity-item"
                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
              >
                <div className="activity-dot" />
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-date">{log.date}</span>
                    <span className="activity-author">{log.author}</span>
                    <span className="activity-project-tag">
                      {proj?.name.replace(" Residence", "")}
                    </span>
                    {log.weather && <span className="activity-date">{log.weather}</span>}
                  </div>
                  <div className={`activity-summary ${isExpanded ? "expanded" : ""}`}>
                    {log.workCompleted}
                  </div>
                  {isExpanded && log.issues !== "None" && (
                    <div className="log-entry-issue" style={{ marginTop: 6 }}>
                      Issue: {log.issues}
                    </div>
                  )}
                  {isExpanded && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                      <div className="log-entry-crew">
                        {log.crewOnSite.map((c) => (
                          <span key={c} className="crew-tag">{c}</span>
                        ))}
                      </div>
                      {log.photos > 0 && (
                        <span className="activity-photos">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          {log.photos} photo{log.photos > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Crew Location Summary ── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Crew Locations</span>
          <span className="card-subtitle">Today</span>
        </div>
        <div className="crew-location-grid">
          {crews.map((c) => {
            const proj = projects.find((p) => p.id === c.currentProject);
            return (
              <div
                key={c.id}
                className="crew-location-item"
                onClick={() => proj && navigate(`/project/${proj.id}`)}
                style={{ cursor: proj ? "pointer" : "default" }}
              >
                <div className="crew-location-left">
                  <div className="crew-location-avatar">{getInitials(c.name)}</div>
                  <div className="crew-location-info">
                    <div className="crew-name">{c.name}</div>
                    <div className="crew-specialty">{c.specialty}</div>
                  </div>
                </div>
                <div>
                  {proj ? (
                    <span className="badge badge-gold">{proj.name.replace(" Residence", "")}</span>
                  ) : (
                    <span className="badge badge-warning">Available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── PM Dashboard (Scoped God View) ─────────
function PMDashboard() {
  const { currentUser, projects, crews, dailyLogs, changeOrders } = useApp();
  const navigate = useNavigate();
  const [expandedLog, setExpandedLog] = useState(null);

  const myProjects = projects.filter((p) => p.pm === currentUser.name);
  const myProjectIds = new Set(myProjects.map((p) => p.id));
  const myCrew = crews.filter((c) => myProjectIds.has(c.currentProject));
  const myLogs = dailyLogs.filter((l) => myProjectIds.has(l.projectId));
  const myCOs = changeOrders.filter((c) => myProjectIds.has(c.projectId));

  const totalBudget = myProjects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = myProjects.reduce((s, p) => s + p.spent, 0);
  const avgCompletion = myProjects.length
    ? Math.round(myProjects.reduce((s, p) => s + p.percentComplete, 0) / myProjects.length)
    : 0;
  const pendingCOs = myCOs.filter((c) => c.status === "pending").length;

  return (
    <>
      <div className="page-header">
        <h2>PM Dashboard</h2>
        <p>{currentUser.name} — {myProjects.length} active projects</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat-card">
          <div className="stat-label">Active Projects</div>
          <div className="stat-value gold">{myProjects.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. Completion</div>
          <div className="stat-value">{avgCompletion}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Budget</div>
          <div className="stat-value">{formatCurrency(totalBudget)}</div>
          <div className="stat-note">{formatCurrencyFull(totalSpent)} spent</div>
          <div className="progress-bar-bg" style={{ marginTop: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${Math.round((totalSpent / totalBudget) * 100)}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Change Orders</div>
          <div className="stat-value" style={{ color: pendingCOs > 0 ? "var(--warning)" : "var(--text-primary)" }}>
            {pendingCOs}
          </div>
        </div>
      </div>

      {/* ── Project Cards with Segmented Bars ── */}
      <div className="section-header">
        <span className="section-title">My Projects</span>
      </div>

      {myProjects.map((p) => (
        <div key={p.id} className="admin-project-card" onClick={() => navigate(`/project/${p.id}`)}>
          <div className="admin-project-card-top">
            <div>
              <h3>{p.name}</h3>
              <div className="location">{p.location}</div>
            </div>
            <div className="admin-project-percent">
              {p.percentComplete}<span>%</span>
            </div>
          </div>

          <div className="admin-project-bar-wrap">
            <div className="segmented-bar">
              {p.phases.map((phase) => (
                <div key={phase.name} className={`segment ${phase.status}`} />
              ))}
            </div>
          </div>

          <div className="admin-project-meta">
            <span className="admin-project-phase">{p.currentPhase}</span>
            <span>Client: {p.client}</span>
            <span className="admin-project-budget">
              {formatCurrencyFull(p.spent)} of {formatCurrencyFull(p.budget)}
            </span>
          </div>
        </div>
      ))}

      {/* ── Recent Activity Feed ── */}
      <div className="card" style={{ marginTop: 24, marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Recent Activity</span>
          <span className="card-subtitle">{myLogs.length} daily logs</span>
        </div>
        <div className="activity-feed">
          {myLogs.slice(0, 5).map((log) => {
            const proj = projects.find((p) => p.id === log.projectId);
            const isExpanded = expandedLog === log.id;
            return (
              <div
                key={log.id}
                className="activity-item"
                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
              >
                <div className="activity-dot" />
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-date">{log.date}</span>
                    <span className="activity-author">{log.author}</span>
                    <span className="activity-project-tag">
                      {proj?.name.replace(" Residence", "")}
                    </span>
                    {log.weather && <span className="activity-date">{log.weather}</span>}
                  </div>
                  <div className={`activity-summary ${isExpanded ? "expanded" : ""}`}>
                    {log.workCompleted}
                  </div>
                  {isExpanded && log.issues !== "None" && (
                    <div className="log-entry-issue" style={{ marginTop: 6 }}>
                      Issue: {log.issues}
                    </div>
                  )}
                  {isExpanded && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                      <div className="log-entry-crew">
                        {log.crewOnSite.map((c) => (
                          <span key={c} className="crew-tag">{c}</span>
                        ))}
                      </div>
                      {log.photos > 0 && (
                        <span className="activity-photos">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          {log.photos} photo{log.photos > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Crew on My Projects ── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">My Crew</span>
          <span className="card-subtitle">{myCrew.length} assigned</span>
        </div>
        <div className="crew-location-grid">
          {myCrew.map((c) => {
            const proj = projects.find((p) => p.id === c.currentProject);
            return (
              <div
                key={c.id}
                className="crew-location-item"
                onClick={() => proj && navigate(`/project/${proj.id}`)}
                style={{ cursor: proj ? "pointer" : "default" }}
              >
                <div className="crew-location-left">
                  <div className="crew-location-avatar">{getInitials(c.name)}</div>
                  <div className="crew-location-info">
                    <div className="crew-name">{c.name}</div>
                    <div className="crew-specialty">{c.specialty}</div>
                  </div>
                </div>
                <div>
                  {proj ? (
                    <span className="badge badge-gold">{proj.name.replace(" Residence", "")}</span>
                  ) : (
                    <span className="badge badge-warning">Available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Client Dashboard (delegates to ClientPortal) ───
// ─── Field Crew Dashboard (delegates to FieldPortal) ───

// ─── Router ──────────────────────────────────
export default function Dashboard() {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  switch (currentUser.role) {
    case "admin":
      return <AdminDashboard />;
    case "pm":
      return <PMDashboard />;
    case "client":
      return <ClientPortal />;
    case "field":
      return <FieldPortal />;
    default:
      return <AdminDashboard />;
  }
}

import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function formatCurrency(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function Projects() {
  const { currentUser, projects } = useApp();
  const navigate = useNavigate();

  // PM sees only their projects; admin sees all
  const visibleProjects =
    currentUser.role === "pm"
      ? projects.filter((p) => p.pm === currentUser.name)
      : projects;

  return (
    <>
      <div className="page-header">
        <h2>{currentUser.role === "pm" ? "My Projects" : "All Projects"}</h2>
        <p>{visibleProjects.length} active project{visibleProjects.length !== 1 ? "s" : ""}</p>
      </div>

      {visibleProjects.map((p) => (
        <div key={p.id} className="admin-project-card" onClick={() => navigate(`/project/${p.id}`)}>
          <div className="admin-project-card-top">
            <div>
              <h3>{p.name}</h3>
              <div className="location">{p.location} &middot; Client: {p.client}</div>
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
            <span>Started: {new Date(p.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
            <span className="admin-project-budget">
              {formatCurrency(p.spent)} of {formatCurrency(p.budget)}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}

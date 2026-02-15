import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2);
}

export default function Team() {
  const { crews, projects } = useApp();
  const navigate = useNavigate();

  const assigned = crews.filter((c) => c.currentProject);
  const available = crews.filter((c) => !c.currentProject);

  return (
    <>
      <div className="page-header">
        <h2>Team</h2>
        <p>{crews.length} crew members &middot; {assigned.length} assigned &middot; {available.length} available</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="stat-card">
          <div className="stat-label">Total Crew</div>
          <div className="stat-value gold">{crews.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">On Site</div>
          <div className="stat-value">{assigned.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Available</div>
          <div className="stat-value" style={{ color: available.length > 0 ? "var(--warning)" : "var(--success)" }}>
            {available.length}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Crew Members</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Role</th>
                <th>Specialty</th>
                <th>Current Assignment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {crews.map((c) => {
                const proj = projects.find((p) => p.id === c.currentProject);
                return (
                  <tr
                    key={c.id}
                    style={{ cursor: proj ? "pointer" : "default" }}
                    onClick={() => proj && navigate(`/project/${proj.id}`)}
                  >
                    <td style={{ width: 40, paddingRight: 0 }}>
                      <div className="crew-location-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>
                        {getInitials(c.name)}
                      </div>
                    </td>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{c.name}</td>
                    <td>{c.role}</td>
                    <td>{c.specialty}</td>
                    <td>
                      {proj ? (
                        <span className="badge badge-gold">{proj.name.replace(" Residence", "")}</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>\u2014</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${proj ? "badge-success" : "badge-warning"}`}>
                        {proj ? "Active" : "Available"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

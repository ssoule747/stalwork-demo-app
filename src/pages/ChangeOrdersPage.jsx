import { useApp } from "../context/AppContext";

function formatCurrency(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function ChangeOrdersPage() {
  const { currentUser, projects, changeOrders, updateChangeOrderStatus } = useApp();

  // PM sees only their project COs; admin sees all
  const myProjectIds = currentUser.role === "pm"
    ? new Set(projects.filter((p) => p.pm === currentUser.name).map((p) => p.id))
    : null;
  const visibleCOs = myProjectIds
    ? changeOrders.filter((c) => myProjectIds.has(c.projectId))
    : changeOrders;

  const pending = visibleCOs.filter((c) => c.status === "pending");
  const approved = visibleCOs.filter((c) => c.status === "approved");
  const rejected = visibleCOs.filter((c) => c.status === "rejected");
  const totalApproved = approved.reduce((s, c) => s + c.estimatedCost, 0);

  return (
    <>
      <div className="page-header">
        <h2>Change Orders</h2>
        <p>{currentUser.role === "pm" ? "Change orders for your projects" : "All change orders across projects"}</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value gold">{visibleCOs.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: pending.length > 0 ? "var(--warning)" : "var(--text-primary)" }}>
            {pending.length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Approved</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>{approved.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Approved Value</div>
          <div className="stat-value">{formatCurrency(totalApproved)}</div>
        </div>
      </div>

      <div className="card">
        {visibleCOs.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <p>No change orders {currentUser.role === "pm" ? "for your projects" : "yet"}</p>
          </div>
        ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Description</th>
                <th>Requested By</th>
                <th>Date</th>
                <th>Cost</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCOs.map((co) => {
                const proj = projects.find((p) => p.id === co.projectId);
                return (
                  <tr key={co.id}>
                    <td>
                      <span className="badge badge-gold">{proj?.name.replace(" Residence", "")}</span>
                    </td>
                    <td>
                      <div style={{ color: "var(--text-primary)", fontWeight: 500, marginBottom: 2 }}>{co.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{co.description}</div>
                    </td>
                    <td>{co.requestedBy}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{co.date}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(co.estimatedCost)}</td>
                    <td>
                      <span className={`badge ${co.status === "approved" ? "badge-success" : co.status === "rejected" ? "badge-danger" : "badge-warning"}`}>
                        {co.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {co.status === "pending" ? (
                        <div className="co-actions" style={{ justifyContent: "flex-end" }}>
                          <button className="btn-approve" onClick={() => updateChangeOrderStatus(co.id, "approved")}>
                            Approve
                          </button>
                          <button className="btn-reject" onClick={() => updateChangeOrderStatus(co.id, "rejected")}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {co.approvedDate || "\u2014"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </>
  );
}

import { useApp } from "../context/AppContext";

function formatCurrency(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function Reports() {
  const { projects, dailyLogs, changeOrders } = useApp();

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const totalCOs = changeOrders.length;
  const approvedCOs = changeOrders.filter((c) => c.status === "approved");
  const coValue = approvedCOs.reduce((s, c) => s + c.estimatedCost, 0);

  return (
    <>
      <div className="page-header">
        <h2>Reports</h2>
        <p>Financial summaries and project analytics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Budget</div>
          <div className="stat-value gold">{formatCurrency(totalBudget)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">{formatCurrency(totalSpent)}</div>
          <div className="stat-note">{Math.round((totalSpent / totalBudget) * 100)}% of budget</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Daily Logs Filed</div>
          <div className="stat-value">{dailyLogs.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Change Orders</div>
          <div className="stat-value">{totalCOs}</div>
          <div className="stat-note">{formatCurrency(coValue)} approved</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Budget by Project</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>% Used</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{p.name}</td>
                  <td>{formatCurrency(p.budget)}</td>
                  <td>{formatCurrency(p.spent)}</td>
                  <td>{formatCurrency(p.budget - p.spent)}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar-bg" style={{ flex: 1, height: 6 }}>
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${Math.round((p.spent / p.budget) * 100)}%` }}
                        />
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 32 }}>
                        {Math.round((p.spent / p.budget) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="placeholder-page">
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Charts, PDF exports, and custom report builder coming in full build.
        </p>
      </div>
    </>
  );
}

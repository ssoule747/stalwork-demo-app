import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function formatCurrency(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="4" />
  </svg>
);

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, dailyLogs, changeOrders, crews, updatePhaseStatus, updateChangeOrderStatus } = useApp();
  const [activeTab, setActiveTab] = useState("timeline");
  const [tabLoading, setTabLoading] = useState(false);

  const switchTab = (newTab) => {
    if (newTab === activeTab) return;
    setTabLoading(true);
    setActiveTab(newTab);
    setTimeout(() => setTabLoading(false), 200);
  };

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="placeholder-page">
        <h2>Project Not Found</h2>
        <p>No project matches this ID.</p>
        <button className="btn btn-gold" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const projectLogs = dailyLogs.filter((l) => l.projectId === id);
  const projectCOs = changeOrders.filter((c) => c.projectId === id);
  const assignedCrew = crews.filter((c) => c.currentProject === id);
  const approvedCOs = projectCOs.filter((c) => c.status === "approved");
  const coTotal = approvedCOs.reduce((s, c) => s + c.estimatedCost, 0);
  const adjustedBudget = project.budget + coTotal;
  const remaining = adjustedBudget - project.spent;
  const spentPercent = Math.round((project.spent / adjustedBudget) * 100);

  const tabs = [
    { id: "timeline", label: "Timeline" },
    { id: "logs", label: "Daily Logs", count: projectLogs.length },
    { id: "change-orders", label: "Change Orders", count: projectCOs.length },
    { id: "budget", label: "Budget" },
  ];

  return (
    <>
      {/* ── Header ── */}
      <div className="project-detail-header">
        <h2>{project.name}</h2>
        <div className="project-detail-meta">
          <span>{project.location}</span>
          <span><span className="meta-label">Client</span> {project.client}</span>
          <span><span className="meta-label">PM</span> {project.pm}</span>
          <span><span className="meta-label">Started</span> {new Date(project.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
          <span><span className="meta-label">Est. Completion</span> {project.estimatedCompletion}</span>
        </div>

        {/* Segmented bar + stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="stat-card">
            <div className="stat-label">Progress</div>
            <div className="stat-value gold">{project.percentComplete}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Current Phase</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{project.currentPhase}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Budget</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{formatCurrency(adjustedBudget)}</div>
            <div className="stat-note">{formatCurrency(project.spent)} spent</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Crew On Site</div>
            <div className="stat-value gold">{assignedCrew.length}</div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div className="segmented-bar">
            {project.phases.map((phase) => (
              <div key={phase.name} className={`segment ${phase.status}`} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => switchTab(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab skeleton */}
      {tabLoading && (
        <div className="card tab-fade-enter">
          <div className="skeleton skeleton-text long" />
          <div className="skeleton skeleton-text short" />
          <div style={{ height: 12 }} />
          <div className="skeleton skeleton-card" style={{ height: 120, borderRadius: 14 }} />
          <div className="skeleton skeleton-card" style={{ height: 80, borderRadius: 14 }} />
        </div>
      )}

      {/* ── Timeline Tab ── */}
      {!tabLoading && activeTab === "timeline" && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Phase Timeline</span>
            <span className="card-subtitle" style={{ fontSize: 11 }}>Click a phase to toggle status</span>
          </div>
          <div className="phase-timeline">
            {project.phases.map((phase) => (
              <div
                key={phase.name}
                className={`phase-row ${phase.status === "in-progress" ? "is-in-progress" : ""} ${phase.status === "complete" ? "is-complete" : ""}`}
                onClick={() => updatePhaseStatus(id, phase.name)}
              >
                <div className={`phase-icon ${phase.status}`}>
                  {phase.status === "complete" && <CheckIcon />}
                  {phase.status === "in-progress" && <PlayIcon />}
                </div>
                <div className="phase-row-content">
                  <span className="phase-row-name">{phase.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="phase-row-status">
                      {phase.status === "complete" && "Complete"}
                      {phase.status === "in-progress" && `${phase.percent}%`}
                      {phase.status === "upcoming" && "\u2014"}
                    </span>
                    <span className="phase-click-hint">click to change</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Daily Logs Tab ── */}
      {!tabLoading && activeTab === "logs" && (
        <div>
          {projectLogs.length === 0 && (
            <div className="card">
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <p>No daily logs for this project yet</p>
              </div>
            </div>
          )}
          {projectLogs.map((log) => (
            <div key={log.id} className="log-entry">
              <div className="log-entry-header">
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{log.author}</span>
                <div className="log-entry-meta">
                  <span>{log.date}</span>
                  <span>{log.weather}</span>
                  {log.photos > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 12, height: 12 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      {log.photos}
                    </span>
                  )}
                </div>
              </div>
              <div className="log-entry-body">{log.workCompleted}</div>
              {log.issues !== "None" && <div className="log-entry-issue">Issue: {log.issues}</div>}
              <div className="log-entry-crew">
                {log.crewOnSite.map((c) => (
                  <span key={c} className="crew-tag">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Change Orders Tab ── */}
      {!tabLoading && activeTab === "change-orders" && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Change Orders</span>
          </div>
          {projectCOs.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              <p>No change orders for this project</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Requested By</th>
                    <th>Date</th>
                    <th>Cost</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projectCOs.map((co) => (
                    <tr key={co.id}>
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
                            <button className="btn-approve" onClick={(e) => { e.stopPropagation(); updateChangeOrderStatus(co.id, "approved"); }}>
                              Approve
                            </button>
                            <button className="btn-reject" onClick={(e) => { e.stopPropagation(); updateChangeOrderStatus(co.id, "rejected"); }}>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Budget Tab ── */}
      {!tabLoading && activeTab === "budget" && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Budget Breakdown</span>
          </div>
          <div className="budget-breakdown">
            <div className="budget-line">
              <span className="budget-line-label">Original Contract</span>
              <span className="budget-line-value">{formatCurrency(project.budget)}</span>
            </div>

            {approvedCOs.length > 0 && (
              <>
                <div className="budget-line">
                  <span className="budget-line-label">Approved Change Orders</span>
                  <span className="budget-line-value">+{formatCurrency(coTotal)}</span>
                </div>
                {approvedCOs.map((co) => (
                  <div key={co.id} className="budget-line sub">
                    <span className="budget-line-label">{co.title}</span>
                    <span className="budget-line-value">+{formatCurrency(co.estimatedCost)}</span>
                  </div>
                ))}
              </>
            )}

            <div className="budget-line total">
              <span className="budget-line-label">Adjusted Budget</span>
              <span className="budget-line-value">{formatCurrency(adjustedBudget)}</span>
            </div>

            <div className="budget-line">
              <span className="budget-line-label">Spent to Date</span>
              <span className="budget-line-value">{formatCurrency(project.spent)}</span>
            </div>

            <div className="budget-line">
              <span className="budget-line-label">Remaining</span>
              <span className="budget-line-value" style={{ color: remaining >= 0 ? "var(--success)" : "var(--danger)" }}>
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>

          <div className="budget-bar">
            <div className="budget-bar-labels">
              <span>{formatCurrency(project.spent)} spent</span>
              <span>{formatCurrency(adjustedBudget)} budget</span>
            </div>
            <div className="budget-bar-track">
              <div
                className={`budget-bar-fill ${spentPercent > 100 ? "over-budget" : ""}`}
                style={{ width: `${Math.min(spentPercent, 100)}%` }}
              />
            </div>
            <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
              {spentPercent}% of budget used
            </div>
          </div>
        </div>
      )}
    </>
  );
}

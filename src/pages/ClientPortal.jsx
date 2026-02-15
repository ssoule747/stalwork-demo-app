import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";

function formatCurrency(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function TabSkeleton() {
  return (
    <div className="tab-fade-enter">
      <div className="skeleton skeleton-text long" />
      <div className="skeleton skeleton-text medium" />
      <div style={{ height: 16 }} />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-card" style={{ height: 60 }} />
    </div>
  );
}

// Phase completion dates (hardcoded for Winkenbach demo)
const PHASE_DATES = {
  "Site Prep & Grading": "2025-07-10",
  "Foundation & Concrete": "2025-08-28",
  "Framing": "2025-10-20",
  "Roofing": "2025-11-18",
  "Plumbing Rough-In": "2025-12-05",
  "Electrical Rough-In": "2025-12-22",
  "HVAC": "2026-01-10",
  "Insulation & Drywall": "2026-01-25",
};

export default function ClientPortal() {
  const { projects, dailyLogs, changeOrders, weeklyReports, photos, addWeeklyReport } = useApp();
  const [tab, setTab] = useState("home");
  const [tabLoading, setTabLoading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [showPWA, setShowPWA] = useState(() => !localStorage.getItem("stalwork-pwa-dismissed"));
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);

  const switchTab = (newTab) => {
    if (newTab === tab) return;
    setTabLoading(true);
    setTab(newTab);
    setTimeout(() => setTabLoading(false), 200);
  };

  const project = projects.find((p) => p.id === "winkenbach");
  if (!project) return null;

  const myLogs = dailyLogs.filter((l) => l.projectId === "winkenbach");
  const myCOs = changeOrders.filter((c) => c.projectId === "winkenbach");
  const myReports = weeklyReports.filter((r) => r.projectId === "winkenbach");
  const myPhotos = photos.filter((p) => p.projectId === "winkenbach");

  const completedPhases = project.phases.filter((p) => p.status === "complete");
  const currentPhase = project.phases.find((p) => p.status === "in-progress");

  // PWA dismiss
  const dismissPWA = () => {
    setShowPWA(false);
    localStorage.setItem("stalwork-pwa-dismissed", "1");
  };

  // Toast helper
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Generate report
  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const recentWork = myLogs.slice(0, 3).map((l) => l.workCompleted).join(" ");
      addWeeklyReport({
        projectId: "winkenbach",
        weekEnding: new Date().toISOString().split("T")[0],
        summary: `This week your team made excellent progress. ${recentWork.slice(0, 300)}... Everything is tracking well and on schedule.`,
        nextWeek: "Continued interior finish work, countertop installation, and trim carpentry.",
        budgetNote: "Current spend remains within the adjusted budget. No concerns at this time.",
      });
      setGenerating(false);
    }, 2200);
  };

  // SVG progress ring values
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (project.percentComplete / 100) * circumference;

  // Build timeline entries
  const timelineEntries = [];

  // Phase milestones
  completedPhases.forEach((phase) => {
    const date = PHASE_DATES[phase.name];
    if (date) {
      timelineEntries.push({
        type: "milestone",
        date,
        title: `${phase.name} — Complete`,
        icon: "check",
      });
    }
  });

  if (currentPhase) {
    timelineEntries.push({
      type: "milestone",
      date: new Date().toISOString().split("T")[0],
      title: `${currentPhase.name} — In Progress (${currentPhase.percent}%)`,
      icon: "progress",
    });
  }

  // Daily logs (client-friendly)
  myLogs.forEach((log) => {
    timelineEntries.push({
      type: "log",
      date: log.date,
      title: log.workCompleted,
      author: log.author,
      weather: log.weather,
      hasPhotos: log.photos > 0,
    });
  });

  // Approved change orders
  myCOs
    .filter((co) => co.status === "approved")
    .forEach((co) => {
      timelineEntries.push({
        type: "change-order",
        date: co.approvedDate || co.date,
        title: co.title,
        cost: co.estimatedCost,
      });
    });

  // Sort newest first
  timelineEntries.sort((a, b) => b.date.localeCompare(a.date));

  // Document categories
  const documents = [
    { category: "Plans & Drawings", items: [
      { name: "Architectural Plans — Final Rev", ext: "PDF", size: "14.2 MB" },
      { name: "Structural Engineering Set", ext: "PDF", size: "8.7 MB" },
      { name: "Landscape Design Package", ext: "PDF", size: "5.1 MB" },
    ]},
    { category: "Permits", items: [
      { name: "Building Permit #2025-4821", ext: "PDF", size: "1.2 MB" },
      { name: "Grading Permit", ext: "PDF", size: "0.8 MB" },
    ]},
    { category: "Change Orders", items: myCOs.map((co) => ({
      name: `CO-${co.id}: ${co.title}`,
      ext: "PDF",
      size: "0.3 MB",
      status: co.status,
    }))},
    { category: "Inspections", items: [
      { name: "Foundation Inspection — Passed", ext: "PDF", size: "0.5 MB" },
      { name: "Framing Inspection — Passed", ext: "PDF", size: "0.6 MB" },
      { name: "Rough MEP Inspection — Passed", ext: "PDF", size: "0.4 MB" },
    ]},
    { category: "Contract", items: [
      { name: "Construction Agreement — Signed", ext: "PDF", size: "2.1 MB" },
      { name: "Insurance Certificate", ext: "PDF", size: "0.9 MB" },
    ]},
  ];

  const tabs = [
    { id: "home", label: "Home" },
    { id: "timeline", label: "Timeline" },
    { id: "photos", label: "Photos" },
    { id: "updates", label: "Updates" },
    { id: "documents", label: "Documents" },
  ];

  return (
    <div className="client-portal">
      {/* PWA Banner */}
      {showPWA && (
        <div className="pwa-banner">
          <div className="pwa-banner-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
              <strong>Add to Home Screen</strong>
              <span>Get instant access to your project updates</span>
            </div>
          </div>
          <button className="pwa-dismiss" onClick={dismissPWA}>&times;</button>
        </div>
      )}

      {/* Top Tab Navigation */}
      <nav className="client-nav">
        <div className="client-nav-brand">
          <span className="client-nav-logo">S</span>
          <span className="client-nav-title">Stalwork</span>
        </div>
        <div className="client-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`client-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => switchTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="client-content">
        {tabLoading && <TabSkeleton />}

        {/* ════════════ HOME TAB ════════════ */}
        {!tabLoading && tab === "home" && (
          <div className="client-home">
            {/* Hero */}
            <div className="client-hero">
              <div className="client-hero-ring-wrap">
                <svg className="client-hero-ring" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r={radius} fill="none" stroke="#2A2A2A" strokeWidth="8" />
                  <circle
                    cx="100" cy="100" r={radius}
                    fill="none"
                    stroke="url(#goldGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 100 100)"
                    className="ring-progress"
                  />
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#D4B76A" />
                      <stop offset="100%" stopColor="#C6A55A" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="client-hero-ring-text">
                  <span className="ring-percent">{project.percentComplete}</span>
                  <span className="ring-label">% Complete</span>
                </div>
              </div>
              <div className="client-hero-info">
                <h1>{project.name}</h1>
                <p className="client-hero-location">{project.location}</p>
                <p className="client-hero-phase">
                  Currently: <strong>{project.currentPhase}</strong>
                </p>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="client-stats">
              <div className="client-stat">
                <div className="client-stat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="client-stat-label">Est. Completion</div>
                <div className="client-stat-value">
                  {new Date(project.estimatedCompletion).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </div>
              </div>
              <div className="client-stat">
                <div className="client-stat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="client-stat-label">Phases Complete</div>
                <div className="client-stat-value">{completedPhases.length} of {project.phases.length}</div>
              </div>
              <div className="client-stat">
                <div className="client-stat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div className="client-stat-label">Site Photos</div>
                <div className="client-stat-value">{myPhotos.length}</div>
              </div>
            </div>

            {/* Milestone Scroller */}
            <div className="client-milestones-section">
              <h3>Build Progress</h3>
              <div className="client-milestone-scroller">
                <div className="client-milestone-track">
                  {project.phases.map((phase, i) => (
                    <div key={phase.name} className={`client-milestone ${phase.status}`}>
                      <div className="milestone-dot-wrap">
                        <div className={`milestone-dot ${phase.status}`}>
                          {phase.status === "complete" && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="10" height="10">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        {i < project.phases.length - 1 && (
                          <div className={`milestone-connector ${phase.status === "complete" ? "filled" : ""}`} />
                        )}
                      </div>
                      <span className="milestone-label">{phase.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ TIMELINE TAB ════════════ */}
        {!tabLoading && tab === "timeline" && (
          <div className="client-timeline-page">
            <h2>Project Timeline</h2>
            <p className="client-section-sub">A complete history of your project progress</p>

            <div className="client-timeline">
              {timelineEntries.map((entry, i) => (
                <div key={i} className={`client-timeline-item ${entry.type}`}>
                  <div className="client-timeline-dot-col">
                    <div className={`client-timeline-dot ${entry.type}`}>
                      {entry.type === "milestone" && entry.icon === "check" && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="10" height="10">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {entry.type === "milestone" && entry.icon === "progress" && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                      {entry.type === "log" && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        </svg>
                      )}
                      {entry.type === "change-order" && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10">
                          <path d="M12 2v20M2 12h20" />
                        </svg>
                      )}
                    </div>
                    {i < timelineEntries.length - 1 && <div className="client-timeline-line" />}
                  </div>
                  <div className="client-timeline-content">
                    <div className="client-timeline-date">{entry.date}</div>
                    <div className="client-timeline-title">{entry.title}</div>
                    {entry.author && (
                      <div className="client-timeline-meta">
                        Logged by {entry.author} {entry.weather && `\u00b7 ${entry.weather}`}
                      </div>
                    )}
                    {entry.cost && (
                      <div className="client-timeline-meta co-cost">
                        Approved change order: {formatCurrency(entry.cost)}
                      </div>
                    )}
                    {entry.hasPhotos && (
                      <span className="client-timeline-photo-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Photos attached
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════ PHOTOS TAB ════════════ */}
        {!tabLoading && tab === "photos" && (
          <div className="client-photos-page">
            <h2>Progress Photos</h2>
            <p className="client-section-sub">{myPhotos.length} photos from the job site</p>

            <div className="client-photo-grid">
              {myPhotos.length === 0 && (
                <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <h4>No photos yet</h4>
                  <p>Photos from the job site will appear here</p>
                </div>
              )}
              {myPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="client-photo-card"
                  onClick={() => setLightbox(photo)}
                >
                  {photo.isNew && <span className="photo-new-badge">New</span>}
                  <img
                    src={`https://picsum.photos/seed/sw${photo.id}/400/${photo.h}`}
                    alt={photo.label}
                    loading="lazy"
                  />
                  <div className="client-photo-overlay">
                    <span className="client-photo-label">{photo.label}</span>
                    <span className="client-photo-meta">{photo.phase} &middot; {photo.date}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Lightbox */}
            {lightbox && (
              <div className="client-lightbox" onClick={() => setLightbox(null)}>
                <div className="client-lightbox-inner" onClick={(e) => e.stopPropagation()}>
                  <button className="lightbox-close" onClick={() => setLightbox(null)}>&times;</button>
                  <img
                    src={`https://picsum.photos/seed/sw${lightbox.id}/900/${Math.round(lightbox.h * 2.25)}`}
                    alt={lightbox.label}
                  />
                  <div className="lightbox-caption">
                    <strong>{lightbox.label}</strong>
                    <span>{lightbox.phase} &middot; {lightbox.date}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════ UPDATES TAB ════════════ */}
        {!tabLoading && tab === "updates" && (
          <div className="client-updates-page">
            <div className="client-updates-header">
              <div>
                <h2>Weekly Updates</h2>
                <p className="client-section-sub">Progress reports from your project team</p>
              </div>
              <button
                className="client-generate-btn"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <span className="dot-pulse"><span /><span /><span /></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                      <path d="M12 2a10 10 0 1 0 10 10" />
                      <path d="M12 8v4l3 3" />
                    </svg>
                    Generate This Week's Report
                  </>
                )}
              </button>
            </div>

            {myReports.length === 0 && (
              <div className="client-empty">
                No reports yet. Click "Generate This Week's Report" to create one.
              </div>
            )}

            {myReports.map((report, i) => (
              <div key={report.id} className="client-report-card">
                <div className="client-report-header">
                  <h3>Week of {report.weekEnding}</h3>
                  {i === 0 && <span className="badge badge-gold">Latest</span>}
                </div>
                <div className="client-report-body">
                  <p>{report.summary}</p>
                </div>
                <div className="client-report-section">
                  <h4>Looking Ahead</h4>
                  <p>{report.nextWeek}</p>
                </div>
                <div className="client-report-section">
                  <h4>Budget Note</h4>
                  <p>{report.budgetNote}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════════════ DOCUMENTS TAB ════════════ */}
        {!tabLoading && tab === "documents" && (
          <div className="client-documents-page">
            <h2>Project Documents</h2>
            <p className="client-section-sub">All files related to your project</p>

            {documents.map((cat) => (
              <div key={cat.category} className="client-doc-category">
                <h3>{cat.category}</h3>
                <div className="client-doc-list">
                  {cat.items.map((doc, i) => (
                    <div
                      key={i}
                      className="client-doc-item"
                      onClick={() => showToast("Document preview is not available in this demo")}
                    >
                      <div className="client-doc-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div className="client-doc-info">
                        <span className="client-doc-name">{doc.name}</span>
                        <span className="client-doc-meta">{doc.ext} &middot; {doc.size}</span>
                      </div>
                      {doc.status && (
                        <span className={`badge ${doc.status === "approved" ? "badge-success" : doc.status === "rejected" ? "badge-danger" : "badge-warning"}`}>
                          {doc.status}
                        </span>
                      )}
                      <svg className="client-doc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="client-toast">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12" y2="16.01" strokeLinecap="round" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}

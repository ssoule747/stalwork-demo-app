import { useState } from "react";
import { useApp } from "../context/AppContext";

function FieldSkeleton() {
  return (
    <div className="tab-fade-enter">
      <div className="skeleton skeleton-text long" />
      <div className="skeleton skeleton-text short" />
      <div style={{ height: 12 }} />
      <div className="skeleton skeleton-card" style={{ height: 120, borderRadius: 14 }} />
      <div className="skeleton skeleton-card" style={{ height: 80, borderRadius: 14 }} />
    </div>
  );
}

const CHECKLIST_ITEMS = [
  "Door alignment and swing direction verified",
  "Cabinet hardware installed and level",
  "Countertop seams inspected and sealed",
  "Trim and crown molding gaps caulked",
  "Paint touch-ups complete — all rooms",
  "Light fixtures installed and tested",
  "Outlet and switch plates installed",
  "Closet millwork aligned and secured",
  "Tile grout lines inspected",
  "Final clean-up complete",
];

export default function FieldPortal() {
  const { currentUser, projects, crews, dailyLogs, addDailyLog, addPhoto } = useApp();
  const [tab, setTab] = useState("today");
  const [tabLoading, setTabLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const switchTab = (newTab) => {
    if (newTab === tab) return;
    setTabLoading(true);
    setTab(newTab);
    setTimeout(() => setTabLoading(false), 200);
  };
  const [checks, setChecks] = useState(() => new Array(CHECKLIST_ITEMS.length).fill(false));
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Log form state
  const crew = crews.find((c) => c.name === currentUser.name);
  const project = crew ? projects.find((p) => p.id === crew.currentProject) : null;
  const currentPhase = project?.phases.find((p) => p.status === "in-progress");

  // Crew assigned to same project
  const projectCrew = crews.filter((c) => c.currentProject === project?.id);
  const today = new Date().toISOString().split("T")[0];

  const [logForm, setLogForm] = useState({
    weather: "Clear, 55°F",
    workCompleted: "",
    issues: "",
    crewOnSite: projectCrew.map((c) => c.name),
  });
  const [logSubmitted, setLogSubmitted] = useState(false);

  // Field photos (from context, filtered to current project)
  const myPhotos = project
    ? dailyLogs
        .filter((l) => l.projectId === project.id && l.photos > 0)
        .slice(0, 6)
    : [];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle crew member in log form
  const toggleCrew = (name) => {
    setLogForm((prev) => ({
      ...prev,
      crewOnSite: prev.crewOnSite.includes(name)
        ? prev.crewOnSite.filter((n) => n !== name)
        : [...prev.crewOnSite, name],
    }));
  };

  // Submit daily log
  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!project || !logForm.workCompleted.trim()) return;

    addDailyLog({
      projectId: project.id,
      date: today,
      author: currentUser.name,
      weather: logForm.weather,
      crewOnSite: logForm.crewOnSite,
      workCompleted: logForm.workCompleted,
      issues: logForm.issues || "None",
      photos: 0,
    });

    setLogForm({
      weather: "Clear, 55°F",
      workCompleted: "",
      issues: "",
      crewOnSite: projectCrew.map((c) => c.name),
    });
    setLogSubmitted(true);
    setTimeout(() => setLogSubmitted(false), 3000);
  };

  // Simulate photo upload
  const handleUpload = () => {
    if (uploading || !project) return;
    setUploading(true);
    setUploadProgress(0);

    const labels = [
      "Master suite door installation",
      "Kitchen cabinet detail",
      "Countertop edge profile",
      "Crown molding progress",
      "Closet millwork installation",
      "Tile grouting closeup",
    ];
    const label = labels[Math.floor(Math.random() * labels.length)];

    // Animate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        addPhoto({
          projectId: project.id,
          label,
          date: today,
          phase: currentPhase?.name || project.currentPhase,
          h: 240 + Math.floor(Math.random() * 80),
        });

        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
          showToast("Photo uploaded successfully");
        }, 300);
      }
      setUploadProgress(Math.min(progress, 100));
    }, 150);
  };

  // Toggle checklist item
  const toggleCheck = (i) => {
    setChecks((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  const checksComplete = checks.filter(Boolean).length;

  const tabs = [
    { id: "today", label: "Today", icon: "sun" },
    { id: "log", label: "Log", icon: "edit" },
    { id: "photos", label: "Photos", icon: "camera" },
    { id: "checklist", label: "Checklist", icon: "check" },
  ];

  return (
    <div className="field-portal">
      {/* Top Bar */}
      <div className="field-topbar">
        <div className="field-topbar-brand">
          <span className="field-topbar-logo">S</span>
          <span className="field-topbar-title">Stalwork</span>
        </div>
        <div className="field-topbar-date">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </div>
      </div>

      {/* Content */}
      <div className="field-content">
        {tabLoading && <FieldSkeleton />}

        {/* ════════════ TODAY TAB ════════════ */}
        {!tabLoading && tab === "today" && (
          <div className="field-today">
            {/* Assignment Card */}
            {project && (
              <div className="field-assignment-card">
                <div className="field-assignment-badge">Current Assignment</div>
                <h2>{project.name}</h2>
                <div className="field-assignment-location">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {project.location}
                </div>

                <div className="field-assignment-details">
                  <div className="field-detail-row">
                    <span className="field-detail-label">Phase</span>
                    <span className="field-detail-value gold">
                      {currentPhase?.name || project.currentPhase}
                      {currentPhase && ` (${currentPhase.percent}%)`}
                    </span>
                  </div>
                  <div className="field-detail-row">
                    <span className="field-detail-label">Project Manager</span>
                    <span className="field-detail-value">{project.pm}</span>
                  </div>
                </div>

                {/* Phase progress bar */}
                {currentPhase && (
                  <div className="field-phase-bar">
                    <div className="field-phase-bar-track">
                      <div
                        className="field-phase-bar-fill"
                        style={{ width: `${currentPhase.percent}%` }}
                      />
                    </div>
                    <span className="field-phase-bar-label">{currentPhase.percent}%</span>
                  </div>
                )}

                {/* Crew on site */}
                <div className="field-crew-section">
                  <div className="field-detail-label">Today's Crew</div>
                  <div className="field-crew-chips">
                    {projectCrew.map((c) => (
                      <span
                        key={c.id}
                        className={`field-crew-chip ${c.name === currentUser.name ? "you" : ""}`}
                      >
                        {c.name}
                        {c.name === currentUser.name && <span className="you-tag">you</span>}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Task note */}
                <div className="field-task-note">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Continue interior door installation — master suite. Custom closet millwork install this week.
                </div>
              </div>
            )}

            {/* Weather Widget */}
            <div className="field-weather-card">
              <div className="field-weather-now">
                <div className="field-weather-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                </div>
                <div>
                  <div className="field-weather-temp">Clear, 55°F</div>
                  <div className="field-weather-note">Good conditions for interior work</div>
                </div>
              </div>
              <div className="field-weather-tomorrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                  <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 15.25" />
                  <line x1="8" y1="19" x2="8" y2="21" />
                  <line x1="8" y1="13" x2="8" y2="15" />
                  <line x1="16" y1="19" x2="16" y2="21" />
                  <line x1="16" y1="13" x2="16" y2="15" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="12" y1="15" x2="12" y2="17" />
                </svg>
                <span>Tomorrow: <strong>Rain likely</strong> — plan indoor work</span>
              </div>
            </div>

            {/* Recent Activity */}
            {dailyLogs.filter((l) => l.projectId === project?.id).length > 0 && (
              <div className="field-recent">
                <h3>Recent Logs</h3>
                {dailyLogs
                  .filter((l) => l.projectId === project?.id)
                  .slice(0, 3)
                  .map((log) => (
                    <div key={log.id} className="field-recent-item">
                      <div className="field-recent-meta">
                        <span>{log.date}</span>
                        <span>{log.author}</span>
                      </div>
                      <div className="field-recent-text">{log.workCompleted}</div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════ LOG TAB ════════════ */}
        {!tabLoading && tab === "log" && (
          <div className="field-log-page">
            <h2>Daily Log</h2>
            <p className="field-section-sub">End-of-day field report</p>

            {!project && (
              <div className="field-empty">No active project assignment.</div>
            )}

            {project && (
              <form className="field-log-form" onSubmit={handleLogSubmit}>
                {/* Project (read-only) */}
                <div className="field-form-group">
                  <label>Project</label>
                  <div className="field-form-static">{project.name}</div>
                </div>

                {/* Date */}
                <div className="field-form-row">
                  <div className="field-form-group">
                    <label>Date</label>
                    <div className="field-form-static">{today}</div>
                  </div>
                  <div className="field-form-group">
                    <label>Weather</label>
                    <input
                      type="text"
                      value={logForm.weather}
                      onChange={(e) => setLogForm({ ...logForm, weather: e.target.value })}
                      className="field-input"
                    />
                  </div>
                </div>

                {/* Crew on site */}
                <div className="field-form-group">
                  <label>Crew On Site</label>
                  <div className="field-crew-checks">
                    {projectCrew.map((c) => (
                      <label key={c.id} className="field-crew-check">
                        <input
                          type="checkbox"
                          checked={logForm.crewOnSite.includes(c.name)}
                          onChange={() => toggleCrew(c.name)}
                        />
                        <span className="field-check-box" />
                        <span>{c.name}</span>
                        <span className="field-crew-check-role">{c.role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Work completed */}
                <div className="field-form-group">
                  <label>Work Completed *</label>
                  <textarea
                    rows={5}
                    value={logForm.workCompleted}
                    onChange={(e) => setLogForm({ ...logForm, workCompleted: e.target.value })}
                    placeholder="Describe today's work..."
                    className="field-textarea"
                  />
                </div>

                {/* Issues */}
                <div className="field-form-group">
                  <label>Issues / Notes</label>
                  <textarea
                    rows={3}
                    value={logForm.issues}
                    onChange={(e) => setLogForm({ ...logForm, issues: e.target.value })}
                    placeholder="Any issues, delays, or notes..."
                    className="field-textarea"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="field-submit-btn"
                  disabled={!logForm.workCompleted.trim()}
                >
                  Submit Daily Log
                </button>

                {logSubmitted && (
                  <div className="field-submit-success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Log submitted — visible to PM and client
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* ════════════ PHOTOS TAB ════════════ */}
        {!tabLoading && tab === "photos" && (
          <div className="field-photos-page">
            <h2>Site Photos</h2>
            <p className="field-section-sub">{project?.name || "No project"}</p>

            {/* Upload Button */}
            <button
              className="field-upload-btn"
              onClick={handleUpload}
              disabled={uploading || !project}
            >
              {uploading ? (
                "Uploading..."
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload Photo
                </>
              )}
            </button>

            {/* Upload progress */}
            {uploading && (
              <div className="field-upload-progress">
                <div className="field-upload-track">
                  <div
                    className="field-upload-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="field-upload-percent">{Math.round(uploadProgress)}%</span>
              </div>
            )}

            {/* Photo grid */}
            <div className="field-photo-grid">
              {project && (
                <FieldPhotoGrid projectId={project.id} />
              )}
            </div>
          </div>
        )}

        {/* ════════════ CHECKLIST TAB ════════════ */}
        {!tabLoading && tab === "checklist" && (
          <div className="field-checklist-page">
            <h2>QC Checklist</h2>
            <p className="field-section-sub">
              {currentPhase?.name || project?.currentPhase || "QC"} — {project?.name || "No project"}
            </p>

            <div className="field-checklist-progress">
              <div className="field-checklist-count">
                <span className="field-checklist-done">{checksComplete}</span>
                <span> of {CHECKLIST_ITEMS.length} complete</span>
              </div>
              <div className="field-checklist-bar-track">
                <div
                  className="field-checklist-bar-fill"
                  style={{ width: `${(checksComplete / CHECKLIST_ITEMS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="field-checklist-items">
              {CHECKLIST_ITEMS.map((item, i) => (
                <label
                  key={i}
                  className={`field-checklist-item ${checks[i] ? "checked" : ""}`}
                  onClick={() => toggleCheck(i)}
                >
                  <div className={`field-checkbox ${checks[i] ? "checked" : ""}`}>
                    {checks[i] && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="field-checklist-text">{item}</span>
                </label>
              ))}
            </div>

            {checksComplete === CHECKLIST_ITEMS.length && (
              <div className="field-checklist-complete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                All items verified — QC checklist complete
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Tab Navigation */}
      <nav className="field-bottom-nav">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`field-bottom-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => switchTab(t.id)}
          >
            <FieldTabIcon name={t.icon} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Toast */}
      {toast && (
        <div className="field-toast">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ── Extracted photo grid (needs useApp hook) ── */
function FieldPhotoGrid({ projectId }) {
  const { photos } = useApp();
  const projectPhotos = photos.filter((p) => p.projectId === projectId);

  if (projectPhotos.length === 0) {
    return (
      <div className="field-empty" style={{ marginTop: 16 }}>
        No photos yet. Use the button above to upload.
      </div>
    );
  }

  return (
    <div className="field-photo-items">
      {projectPhotos.map((photo) => (
        <div key={photo.id} className="field-photo-card">
          {photo.isNew && <span className="field-photo-new">New</span>}
          <img
            src={photo.url || `https://picsum.photos/seed/sw${photo.id}/400/${photo.h}`}
            alt={photo.label}
            loading="lazy"
          />
          <div className="field-photo-info">
            <span className="field-photo-label">{photo.label}</span>
            <span className="field-photo-date">{photo.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Tab icons ── */
function FieldTabIcon({ name }) {
  switch (name) {
    case "sun":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      );
    case "edit":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    case "camera":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    default:
      return null;
  }
}

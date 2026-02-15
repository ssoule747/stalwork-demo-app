import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function DailyLog() {
  const { currentUser, projects, crews, addDailyLog, addPhoto, dailyLogs } = useApp();

  const crew = crews.find((c) => c.name === currentUser.name);
  const project = crew ? projects.find((p) => p.id === crew.currentProject) : null;

  const [form, setForm] = useState({
    workCompleted: "",
    weather: "Sunny, 72\u00b0F",
    issues: "None",
    attachPhoto: false,
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!project || !form.workCompleted.trim()) return;

    const today = new Date().toISOString().split("T")[0];

    addDailyLog({
      projectId: project.id,
      date: today,
      author: currentUser.name,
      weather: form.weather,
      crewOnSite: [currentUser.name],
      workCompleted: form.workCompleted,
      issues: form.issues || "None",
      photos: form.attachPhoto ? 1 : 0,
    });

    if (form.attachPhoto) {
      addPhoto({
        projectId: project.id,
        label: form.workCompleted.slice(0, 50),
        date: today,
        phase: project.currentPhase,
        h: 280,
      });
    }

    setForm({ workCompleted: "", weather: "Sunny, 72\u00b0F", issues: "None", attachPhoto: false });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  const myLogs = dailyLogs.filter((l) => l.author === currentUser.name);

  return (
    <>
      <div className="page-header">
        <h2>Daily Log</h2>
        <p>Submit your end-of-day field report</p>
      </div>

      {!project && (
        <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
          No active project assignment. Contact your PM for scheduling.
        </div>
      )}

      {project && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <span className="card-title">New Entry — {project.name}</span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: "0 0 4px" }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Work Completed *
              </label>
              <textarea
                rows={4}
                value={form.workCompleted}
                onChange={(e) => setForm({ ...form, workCompleted: e.target.value })}
                placeholder="Describe work completed today..."
                style={{
                  width: "100%", padding: "10px 12px", background: "var(--bg-card)", border: "1px solid var(--border-light)",
                  borderRadius: 8, color: "var(--text-primary)", fontSize: 13, resize: "vertical", fontFamily: "inherit",
                }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                  Weather
                </label>
                <input
                  type="text"
                  value={form.weather}
                  onChange={(e) => setForm({ ...form, weather: e.target.value })}
                  style={{
                    width: "100%", padding: "10px 12px", background: "var(--bg-card)", border: "1px solid var(--border-light)",
                    borderRadius: 8, color: "var(--text-primary)", fontSize: 13, fontFamily: "inherit",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                  Issues
                </label>
                <input
                  type="text"
                  value={form.issues}
                  onChange={(e) => setForm({ ...form, issues: e.target.value })}
                  style={{
                    width: "100%", padding: "10px 12px", background: "var(--bg-card)", border: "1px solid var(--border-light)",
                    borderRadius: 8, color: "var(--text-primary)", fontSize: 13, fontFamily: "inherit",
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                id="attachPhoto"
                checked={form.attachPhoto}
                onChange={(e) => setForm({ ...form, attachPhoto: e.target.checked })}
                style={{ accentColor: "var(--accent-gold)", width: 16, height: 16 }}
              />
              <label htmlFor="attachPhoto" style={{ fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>
                Attach a site photo (visible in client portal)
              </label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={!form.workCompleted.trim()}>
              Submit Log
            </button>
            {submitted && (
              <span style={{ marginLeft: 12, fontSize: 13, color: "var(--accent-gold)" }}>
                Log submitted successfully.
              </span>
            )}
          </form>
        </div>
      )}

      {myLogs.length > 0 && (
        <div>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <span className="card-title">My Previous Logs</span>
          </div>
          {myLogs.map((log) => {
            const proj = projects.find((p) => p.id === log.projectId);
            return (
              <div key={log.id} className="log-entry">
                <div className="log-entry-header">
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{proj?.name}</span>
                  <div className="log-entry-meta">
                    <span>{log.date}</span>
                    <span>{log.weather}</span>
                  </div>
                </div>
                <div className="log-entry-body">{log.workCompleted}</div>
                {log.issues !== "None" && <div className="log-entry-issue">Issue: {log.issues}</div>}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

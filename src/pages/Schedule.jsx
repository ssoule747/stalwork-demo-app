import { useState, Fragment } from "react";
import { useApp } from "../context/AppContext";

const DAYS = ["mon", "tue", "wed", "thu", "fri"];
const DAY_HEADERS = [
  { key: "mon", label: "Mon", date: "16" },
  { key: "tue", label: "Tue", date: "17" },
  { key: "wed", label: "Wed", date: "18" },
  { key: "thu", label: "Thu", date: "19" },
  { key: "fri", label: "Fri", date: "20" },
];

const PROJECT_COLORS = {
  winkenbach:  { bg: "rgba(96, 165, 250, 0.15)",  text: "#60A5FA", border: "rgba(96, 165, 250, 0.3)",  label: "Winkenbach" },
  hope:        { bg: "rgba(74, 222, 128, 0.15)",  text: "#4ADE80", border: "rgba(74, 222, 128, 0.3)",  label: "Hope" },
  athanasakos: { bg: "rgba(251, 146, 60, 0.15)",  text: "#FB923C", border: "rgba(251, 146, 60, 0.3)",  label: "Athanasakos" },
  okimoto:     { bg: "rgba(192, 132, 252, 0.15)", text: "#C084FC", border: "rgba(192, 132, 252, 0.3)", label: "Okimoto" },
};

function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2);
}

export default function Schedule() {
  const { crews, schedule, updateScheduleCell } = useApp();
  const [dragOver, setDragOver] = useState(null);
  const [conflicts, setConflicts] = useState(new Set());

  const handleDragStart = (e, data) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify(data));
    e.currentTarget.style.opacity = "0.4";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDragOver(null);
  };

  const handleDragOver = (e, crewId, day) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const key = `${crewId}-${day}`;
    if (dragOver !== key) setDragOver(key);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(null);
    }
  };

  const handleDrop = (e, targetCrewId, targetDay) => {
    e.preventDefault();
    setDragOver(null);

    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData("application/json"));
    } catch {
      return;
    }

    const existing = schedule[targetCrewId]?.[targetDay];

    // Conflict flash if overwriting a different assignment
    if (existing && data.projectId && existing !== data.projectId) {
      const key = `${targetCrewId}-${targetDay}`;
      setConflicts((prev) => new Set([...prev, key]));
      setTimeout(() => {
        setConflicts((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 700);
    }

    if (data.type === "cell") {
      // Moving from another cell — clear source unless same cell
      if (data.crewId !== targetCrewId || data.day !== targetDay) {
        updateScheduleCell(data.crewId, data.day, null);
      }
      updateScheduleCell(targetCrewId, targetDay, data.projectId);
    } else if (data.type === "palette") {
      updateScheduleCell(targetCrewId, targetDay, data.projectId);
    } else if (data.type === "clear") {
      updateScheduleCell(targetCrewId, targetDay, null);
    }
  };

  // Count assignments per project this week
  const projectCounts = {};
  Object.values(schedule).forEach((days) => {
    Object.values(days).forEach((pid) => {
      if (pid) projectCounts[pid] = (projectCounts[pid] || 0) + 1;
    });
  });

  return (
    <>
      <div className="page-header">
        <h2>Crew Schedule</h2>
        <p>Week of February 16 – 20, 2026</p>
      </div>

      <div className="schedule-board">
        <div className="schedule-grid">
          {/* Header row */}
          <div className="schedule-header-cell crew-col">Crew Member</div>
          {DAY_HEADERS.map((d) => (
            <div key={d.key} className="schedule-header-cell">
              {d.label}
              <span className="schedule-header-date">{d.date}</span>
            </div>
          ))}

          {/* Crew rows */}
          {crews.map((crew) => (
            <Fragment key={crew.id}>
              <div className="schedule-crew-cell">
                <div className="crew-location-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>
                  {getInitials(crew.name)}
                </div>
                <div>
                  <div className="schedule-crew-name">{crew.name}</div>
                  <div className="schedule-crew-role">{crew.specialty}</div>
                </div>
              </div>

              {DAYS.map((day) => {
                const projectId = schedule[crew.id]?.[day];
                const color = projectId ? PROJECT_COLORS[projectId] : null;
                const cellKey = `${crew.id}-${day}`;
                const isDragOver = dragOver === cellKey;
                const isConflict = conflicts.has(cellKey);

                return (
                  <div
                    key={cellKey}
                    className={`schedule-cell${isDragOver ? " drag-over" : ""}${isConflict ? " conflict" : ""}`}
                    onDragOver={(e) => handleDragOver(e, crew.id, day)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, crew.id, day)}
                  >
                    {projectId && color ? (
                      <div
                        className="schedule-block"
                        style={{
                          background: color.bg,
                          color: color.text,
                          borderColor: color.border,
                        }}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, { type: "cell", crewId: crew.id, day, projectId })
                        }
                        onDragEnd={handleDragEnd}
                        title={`${crew.name} — ${crew.specialty}`}
                      >
                        {color.label}
                      </div>
                    ) : (
                      <div className="schedule-empty" />
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Project Palette */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Drag to Assign</span>
          <span className="card-subtitle">Drop onto any cell above</span>
        </div>
        <div className="schedule-palette">
          {Object.entries(PROJECT_COLORS).map(([id, color]) => (
            <div
              key={id}
              className="palette-chip"
              style={{ background: color.bg, color: color.text, borderColor: color.border }}
              draggable
              onDragStart={(e) => handleDragStart(e, { type: "palette", projectId: id })}
              onDragEnd={handleDragEnd}
            >
              {color.label}
            </div>
          ))}
          <div
            className="palette-chip clear"
            draggable
            onDragStart={(e) => handleDragStart(e, { type: "clear", projectId: null })}
            onDragEnd={handleDragEnd}
          >
            Clear
          </div>
        </div>
      </div>

      {/* Legend / Summary */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Week Summary</span>
        </div>
        <div className="schedule-legend">
          {Object.entries(PROJECT_COLORS).map(([id, color]) => (
            <div key={id} className="schedule-legend-item">
              <div
                className="schedule-legend-swatch"
                style={{ background: color.bg, borderColor: color.border }}
              />
              <span style={{ color: color.text, fontWeight: 600 }}>{color.label}</span>
              <span>{projectCounts[id] || 0} crew-days</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

import { createContext, useContext, useState, useCallback } from "react";
import { users, projects, crews, dailyLogs, changeOrders, weeklyReports, projectPhotos } from "../data";

const AppContext = createContext(null);

const initialSchedule = {
  concrete:  { mon: "athanasakos", tue: "athanasakos", wed: "athanasakos", thu: "athanasakos", fri: "athanasakos" },
  framing:   { mon: "winkenbach",  tue: "winkenbach",  wed: "winkenbach",  thu: "winkenbach",  fri: "winkenbach" },
  foreman2:  { mon: "hope",        tue: "hope",        wed: "hope",        thu: "hope",        fri: "hope" },
  foreman1:  { mon: "hope",        tue: "hope",        wed: "hope",        thu: "hope",        fri: "athanasakos" },
  tile:      { mon: null,           tue: null,           wed: null,           thu: null,           fri: null },
  landscape: { mon: "okimoto",     tue: "okimoto",     wed: "okimoto",     thu: "okimoto",     fri: "okimoto" },
  finish1:   { mon: "winkenbach",  tue: "winkenbach",  wed: "winkenbach",  thu: "winkenbach",  fri: "winkenbach" },
  finish2:   { mon: "winkenbach",  tue: "winkenbach",  wed: "winkenbach",  thu: "winkenbach",  fri: "winkenbach" },
};

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [state, setState] = useState({
    projects,
    crews,
    dailyLogs,
    changeOrders,
    weeklyReports,
    schedule: initialSchedule,
    photos: [...projectPhotos],
  });

  const login = useCallback((userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const switchRole = useCallback((userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) setCurrentUser(user);
  }, []);

  const addDailyLog = useCallback((log) => {
    setState((prev) => ({
      ...prev,
      dailyLogs: [{ ...log, id: prev.dailyLogs.length + 1 }, ...prev.dailyLogs],
    }));
  }, []);

  const addPhoto = useCallback((photo) => {
    setState((prev) => ({
      ...prev,
      photos: [{ ...photo, id: Date.now(), isNew: true }, ...prev.photos],
    }));
  }, []);

  const addWeeklyReport = useCallback((report) => {
    setState((prev) => ({
      ...prev,
      weeklyReports: [{ ...report, id: prev.weeklyReports.length + 1 }, ...prev.weeklyReports],
    }));
  }, []);

  const updatePhaseStatus = useCallback((projectId, phaseName) => {
    setState((prev) => {
      const newProjects = prev.projects.map((p) => {
        if (p.id !== projectId) return p;
        const newPhases = p.phases.map((phase) => {
          if (phase.name !== phaseName) return phase;
          if (phase.status === "upcoming") return { ...phase, status: "in-progress", percent: 50 };
          if (phase.status === "in-progress") return { ...phase, status: "complete", percent: 100 };
          return { ...phase, status: "upcoming", percent: 0 };
        });
        const totalPercent = newPhases.reduce((s, ph) => s + ph.percent, 0);
        const percentComplete = Math.round(totalPercent / newPhases.length);
        const inProgress = newPhases.find((ph) => ph.status === "in-progress");
        const lastComplete = [...newPhases].reverse().find((ph) => ph.status === "complete");
        const currentPhase = inProgress?.name || lastComplete?.name || newPhases[0].name;
        return { ...p, phases: newPhases, percentComplete, currentPhase };
      });
      return { ...prev, projects: newProjects };
    });
  }, []);

  const addChangeOrder = useCallback((co) => {
    setState((prev) => ({
      ...prev,
      changeOrders: [{ ...co, id: prev.changeOrders.length + 1 }, ...prev.changeOrders],
    }));
  }, []);

  const updateChangeOrderStatus = useCallback((coId, newStatus) => {
    setState((prev) => ({
      ...prev,
      changeOrders: prev.changeOrders.map((co) =>
        co.id === coId
          ? { ...co, status: newStatus, approvedDate: newStatus === "approved" ? new Date().toISOString().split("T")[0] : null }
          : co
      ),
    }));
  }, []);

  const updateScheduleCell = useCallback((crewId, day, projectId) => {
    setState((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [crewId]: { ...prev.schedule[crewId], [day]: projectId },
      },
    }));
  }, []);

  const value = {
    currentUser, users,
    ...state,
    login, logout, switchRole,
    addDailyLog, addPhoto, addWeeklyReport, addChangeOrder,
    updatePhaseStatus, updateChangeOrderStatus, updateScheduleCell,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}

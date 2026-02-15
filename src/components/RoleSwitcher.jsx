import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

export default function RoleSwitcher() {
  const { currentUser, users, switchRole } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleSwitch = (userId) => {
    if (userId === currentUser.id) return;
    switchRole(userId);
    navigate("/dashboard");
  };

  return (
    <div className="role-switcher">
      <div className="role-switcher-left">
        <span className="role-switcher-label">
          Viewing as: <strong>{currentUser.name}</strong>{" "}
          &mdash; <span className="role-title">{currentUser.title}</span>
        </span>
        <div className="role-avatars">
          {users.map((user) => (
            <div
              key={user.id}
              className={`role-avatar ${user.id === currentUser.id ? "active" : ""}`}
              onClick={() => handleSwitch(user.id)}
              title={`${user.name} — ${user.title}`}
            >
              {getInitials(user.name)}
            </div>
          ))}
        </div>
      </div>
      <span className="demo-badge">Demo Mode</span>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const icons = {
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  hardhat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18h20M4 18v-4a8 8 0 0 1 16 0v4" />
      <path d="M12 2v4" />
    </svg>
  ),
};

export default function LoginPage() {
  const { users, login } = useApp();
  const navigate = useNavigate();

  function handleLogin(userId) {
    login(userId);
    navigate("/dashboard");
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <h1>
            Stalwork <span>Command Center</span>
          </h1>
          <p>Powered by Pinecrest AI</p>
        </div>

        <p className="login-prompt">Select a role to explore the platform</p>

        <div className="login-cards">
          {users.map((user) => (
            <div key={user.id} className="login-card" onClick={() => handleLogin(user.id)}>
              <div className="login-card-icon">{icons[user.icon]}</div>
              <h3>{user.name}</h3>
              <div className="login-role">{user.title}</div>
              <div className="login-desc">{user.description}</div>
            </div>
          ))}
        </div>

        <p className="login-footer">
          Demo environment — data resets on refresh
        </p>
      </div>
    </div>
  );
}

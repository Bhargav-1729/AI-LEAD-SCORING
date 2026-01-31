import { useState } from "react";
import LeadForm from "./components/LeadForm";
import SalesTeamDashboard from "./components/SalesTeamDashboard";
import AdminLogin from "./components/AdminLogin";

function App() {
  const [page, setPage] = useState("lead");
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = () => {
    const t = localStorage.getItem("token");
    setToken(t);
    setPage("admin");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setPage("lead");
  };

  return (
    <div>
      {/* NAV BAR */}
      <nav style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={() => setPage("lead")}>Lead Form</button>

        <button
          onClick={() => setPage("admin")}
          style={{ marginLeft: "10px" }}
        >
          Admin Dashboard
        </button>

        {token && (
          <button
            onClick={handleLogout}
            style={{ marginLeft: "10px", color: "red" }}
          >
            Logout
          </button>
        )}
      </nav>

      {/* PAGE RENDERING */}
      {page === "lead" && <LeadForm />}

      {page === "admin" &&
        (token ? (
          <SalesTeamDashboard />
        ) : (
          <AdminLogin onLogin={handleLogin} />
        ))}
    </div>
  );
}

export default App;

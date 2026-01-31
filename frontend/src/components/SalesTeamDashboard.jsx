import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import "./dashboard.css";
import LeadDrawer from "./LeadDrawer";

const API_URL = import.meta.env.VITE_API_URL;
const PAGE_SIZES = [5, 10, 20];

function SalesTeamDashboard() {
  const token = localStorage.getItem("token");

  const [summary, setSummary] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);


  // Filters & controls
  const [intentFilter, setIntentFilter] = useState("HIGH");
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState("date_desc");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const authHeaders = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [summaryRes, leadsRes] = await Promise.all([
          fetch(`${API_URL}/dashboard/summary`, { headers: authHeaders }),
          fetch(`${API_URL}/dashboard/leads?limit=200`, { headers: authHeaders })
        ]);

        if (!summaryRes.ok || !leadsRes.ok) {
          throw new Error("Unauthorized");
        }

        setSummary(await summaryRes.json());

        const leadsData = await leadsRes.json();
        setLeads(
          leadsData.map(l => ({
            ...l,
            notes: l.notes || []
          }))
        );
      } catch {
        setError("Session expired. Please login again.");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // 🔍 Filter + sort
  const filteredLeads = useMemo(() => {
    let data = [...leads];

    if (intentFilter !== "ALL") {
      data = data.filter(l => l.ai.intent === intentFilter);
    }

    data = data.filter(l => l.ai.score >= minScore);

    if (search) {
      data = data.filter(l =>
        l.company.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === "score_desc") {
      data.sort((a, b) => b.ai.score - a.ai.score);
    } else if (sortBy === "score_asc") {
      data.sort((a, b) => a.ai.score - b.ai.score);
    } else if (sortBy === "date_asc") {
      data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else {
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return data;
  }, [leads, intentFilter, minScore, search, sortBy]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const paginatedLeads = filteredLeads.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // 📊 Chart data
  const chartData = [
    { name: "HIGH", value: summary?.intent_split.HIGH || 0 },
    { name: "MEDIUM", value: summary?.intent_split.MEDIUM || 0 },
    { name: "LOW", value: summary?.intent_split.LOW || 0 }
  ];

  // 🔄 Update lead status
  const updateStatus = async (email, status) => {
    await fetch(`${API_URL}/dashboard/lead/update?email=${email}`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ status })
    });

    setLeads(prev =>
      prev.map(l => (l.email === email ? { ...l, status } : l))
    );
  };

  // 📝 Add note
  const addNote = async (email) => {
    const note = prompt("Add sales note");
    if (!note) return;

    await fetch(`${API_URL}/dashboard/lead/update?email=${email}`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ note })
    });

    setLeads(prev =>
      prev.map(l =>
        l.email === email
          ? {
              ...l,
              notes: [
                ...l.notes,
                { text: note, created_at: new Date().toISOString() }
              ]
            }
          : l
      )
    );
  };

  if (loading) return <div className="loading">Loading dashboard…</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Sales Team Dashboard</h2>

      {/* METRIC CARDS */}
      <div className="metrics">
        <div className="metric-card" onClick={() => setIntentFilter("ALL")}>
          <div className="metric-label">Total Leads</div>
          <div className="metric-value">{summary.total_leads}</div>
        </div>
        <div className="metric-card" onClick={() => setIntentFilter("HIGH")}>
          <div className="metric-label">High Intent</div>
          <div className="metric-value">{summary.intent_split.HIGH}</div>
        </div>
        <div className="metric-card" onClick={() => setIntentFilter("MEDIUM")}>
          <div className="metric-label">Medium Intent</div>
          <div className="metric-value">{summary.intent_split.MEDIUM}</div>
        </div>
        <div className="metric-card" onClick={() => setIntentFilter("LOW")}>
          <div className="metric-label">Low Intent</div>
          <div className="metric-value">{summary.intent_split.LOW}</div>
        </div>
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>

      {/* EXPORT CSV */}
      <button
        onClick={() => {
          fetch(`${API_URL}/dashboard/export`, { headers: authHeaders })
            .then(res => res.blob())
            .then(blob => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "leads.csv";
              a.click();
            });
        }}
      >
        ⬇️ Export CSV
      </button>

      {/* FILTERS */}
<div className="filters">
  <input
    type="text"
    placeholder="Search by company…"
    value={search}
    onChange={e => {
      setSearch(e.target.value);
      setPage(1);
    }}
  />

  <select
    value={intentFilter}
    onChange={e => {
      setIntentFilter(e.target.value);
      setPage(1);
    }}
  >
    <option value="ALL">All Intent</option>
    <option value="HIGH">High Intent</option>
    <option value="MEDIUM">Medium Intent</option>
    <option value="LOW">Low Intent</option>
  </select>

  <input
    type="number"
    min="0"
    max="100"
    placeholder="Min Score"
    value={minScore}
    onChange={e => {
      setMinScore(Number(e.target.value));
      setPage(1);
    }}
  />

  <select
    value={sortBy}
    onChange={e => setSortBy(e.target.value)}
  >
    <option value="date_desc">Newest First</option>
    <option value="date_asc">Oldest First</option>
    <option value="score_desc">Score High → Low</option>
    <option value="score_asc">Score Low → High</option>
  </select>

  <select
    value={pageSize}
    onChange={e => {
      setPageSize(Number(e.target.value));
      setPage(1);
    }}
  >
    {PAGE_SIZES.map(size => (
      <option key={size} value={size}>
        {size} / page
      </option>
    ))}
  </select>
</div>


      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Company</th>
              <th>Role</th><th>Status</th><th>Intent</th>
              <th>Score</th><th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.map((l, i) => (
              <tr key={i} onClick={() => setSelectedLead(l)} style={{ cursor: "pointer" }}>
                <td>{l.name}</td>
                <td><a href={`mailto:${l.email}`}>{l.email}</a></td>
                <td>{l.company}</td>
                <td>{l.role}</td>
                <td>
                  <select
                    value={l.status}
                    onChange={e => updateStatus(l.email, e.target.value)}
                  >
                    <option>NEW</option>
                    <option>CONTACTED</option>
                    <option>QUALIFIED</option>
                    <option>DISQUALIFIED</option>
                  </select>
                </td>
                <td>{l.ai.intent}</td>
                <td>{l.ai.score}</td>
                <td>
                  <button onClick={() => addNote(l.email)}>📝</button>
                  <ul>
                    {l.notes.slice(-2).map((n, i) => (
                      <li key={i}>{n.text}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>  

      {selectedLead && (
  <LeadDrawer
    lead={selectedLead}
    onClose={() => setSelectedLead(null)}
  />
)}


      {/* PAGINATION */}
      <div>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span> Page {page} / {totalPages} </span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}

export default SalesTeamDashboard;

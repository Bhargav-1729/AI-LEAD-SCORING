import { useState } from "react";
import "./leadDrawer.css";

const API_URL = import.meta.env.VITE_API_URL;

function LeadDrawer({ lead, onClose }) {
  const [followup, setFollowup] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  if (!lead) return null;

  const generateFollowup = async () => {
    setLoadingAI(true);

    try {
      const res = await fetch(
        `${API_URL}/dashboard/lead/followup?email=${lead.email}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await res.json();
      setFollowup(data);
    } catch (err) {
      alert("Failed to generate follow-up");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>{lead.name}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="drawer-section">
          <strong>Email:</strong>{" "}
          <a href={`mailto:${lead.email}`}>{lead.email}</a>
        </div>

        <div className="drawer-section">
          <strong>Company:</strong> {lead.company}
        </div>

        <div className="drawer-section">
          <strong>Role:</strong> {lead.role}
        </div>

        <div className="drawer-section">
          <strong>Status:</strong> {lead.status}
        </div>

        <div className="drawer-section">
          <strong>AI Intent:</strong>{" "}
          <span className={`intent-${lead.ai.intent.toLowerCase()}`}>
            {lead.ai.intent}
          </span>
        </div>

        <div className="drawer-section">
          <strong>AI Score:</strong> {lead.ai.score}
        </div>

        {/* AI REASONS */}
        {lead.ai.reasons && (
          <div className="drawer-section">
            <strong>Why AI thinks this:</strong>
            <ul>
              {lead.ai.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 🤖 AI FOLLOW-UP */}
        <div className="drawer-section">
          <strong>AI Follow-up Suggestion</strong>

          {!followup && (
            <button onClick={generateFollowup} disabled={loadingAI}>
              {loadingAI ? "Generating..." : "🤖 Generate Follow-up"}
            </button>
          )}

          {followup && (
            <div className="ai-followup">
              <p>
                <strong>Subject:</strong> {followup.subject}
              </p>

              <p><strong>Email:</strong></p>
              <pre>{followup.email}</pre>

              <p>
                <strong>Sales Angle:</strong> {followup.angle}
              </p>

              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    `Subject: ${followup.subject}\n\n${followup.email}`
                  )
                }
              >
                Copy Email
              </button>
            </div>
          )}
        </div>

        {/* NOTES */}
        <div className="drawer-section">
          <strong>Notes Timeline</strong>
          {lead.notes.length === 0 && <p>No notes yet</p>}
          <ul className="notes">
            {lead.notes.map((n, i) => (
              <li key={i}>
                <div>{n.text}</div>
                <small>
                  {new Date(n.created_at).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        </div>

        <div className="drawer-footer">
          <button onClick={() => navigator.clipboard.writeText(lead.email)}>
            Copy Email
          </button>
          <a href={`mailto:${lead.email}`}>
            <button>Email Lead</button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default LeadDrawer;

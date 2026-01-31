import { useState } from "react";
import "./leadForm.css"
const API_URL = import.meta.env.VITE_API_URL;

function LeadForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    company_size: "",
    problem: "",
    budget: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Request failed");

      setMessage("✅ Thanks! We’ll contact you shortly.");
      setForm({
        name: "",
        email: "",
        company: "",
        role: "",
        company_size: "",
        problem: "",
        budget: ""
      });
    } catch (err) {
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "Arial" }}>
      <h1>AI Customer Support for Growing Teams</h1>
      <p>Reduce ticket volume and respond faster using AI.</p>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <br /><br />

        <input type="email" name="email" placeholder="Work Email" value={form.email} onChange={handleChange} required />
        <br /><br />

        <input name="company" placeholder="Company" value={form.company} onChange={handleChange} required />
        <br /><br />

        <input name="role" placeholder="Role" value={form.role} onChange={handleChange} required />
        <br /><br />

        <select name="company_size" value={form.company_size} onChange={handleChange} required>
          <option value="">Company Size</option>
          <option>1–10</option>
          <option>11–50</option>
          <option>51–200</option>
          <option>200+</option>
        </select>
        <br /><br />

        <textarea
          name="problem"
          placeholder="Describe your support problem"
          value={form.problem}
          onChange={handleChange}
          required
        />
        <br /><br />

        <select name="budget" value={form.budget} onChange={handleChange}>
          <option value="">Budget (optional)</option>
          <option>$0–$200</option>
          <option>$200–$500</option>
          <option>$500–$1000</option>
          <option>$1000+</option>
        </select>
        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Request Demo"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default LeadForm;

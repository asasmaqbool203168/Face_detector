import { useState, useEffect } from "react";
import { Users, Trash2, RefreshCw, UserCheck } from "lucide-react";
import { api } from "../api";

export default function UsersPage({ refreshTrigger }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // user id being deleted

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.listUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [refreshTrigger]);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete "${user.name}"? This cannot be undone.`)) return;
    setDeleting(user.id);
    try {
      await api.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });

  const getInitials = (name) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Registered Users</h1>
        <p className="page-subtitle">
          All faces currently stored in the database.
        </p>
      </div>

      {/* Stats strip */}
      <div className="stats-strip">
        <div className="stat-card">
          <div className="stat-icon purple">
            <Users size={22} style={{ color: "var(--accent-light)" }} />
          </div>
          <div>
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{users.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <UserCheck size={22} style={{ color: "var(--success)" }} />
          </div>
          <div>
            <div className="stat-label">Active Faces</div>
            <div className="stat-value">{users.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">
            <span style={{ fontSize: "1.3rem" }}>🧠</span>
          </div>
          <div>
            <div className="stat-label">Encodings</div>
            <div className="stat-value">{users.length}</div>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="card" style={{ padding: 0 }}>
        {/* Card header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--border)"
        }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            <Users size={18} /> Face Database
          </h2>
          <button
            className="btn btn-ghost btn-sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner" style={{
              width: 40, height: 40, margin: "0 auto 1rem",
              borderColor: "rgba(99,102,241,0.25)",
              borderTopColor: "var(--accent)"
            }} />
            <p>Loading users…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <Users size={56} style={{ margin: "0 auto", display: "block" }} />
            <h3>No Users Registered</h3>
            <p>Go to the Register tab to add your first face.</p>
          </div>
        ) : (
          <div className="users-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.id}>
                    <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>
                      {idx + 1}
                    </td>
                    <td>
                      <div className="avatar-cell">
                        <div className="avatar">{getInitials(user.name)}</div>
                        <span style={{ fontWeight: 600 }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {user.email || <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      {formatDate(user.created_at)}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user)}
                        disabled={deleting === user.id}
                      >
                        {deleting === user.id
                          ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                          : <Trash2 size={13} />}
                        {deleting === user.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

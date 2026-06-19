const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = {
  /**
   * Register a new user face.
   * @param {string} name
   * @param {string|null} email
   * @param {Blob} imageBlob  – JPEG blob from webcam capture
   */
  async register(name, email, imageBlob) {
    const form = new FormData();
    form.append("name", name);
    if (email) form.append("email", email);
    form.append("image", imageBlob, "face.jpg");

    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registration failed");
    return data;
  },

  /**
   * Recognize a face from an image blob.
   * @param {Blob} imageBlob
   */
  async recognize(imageBlob) {
    const form = new FormData();
    form.append("image", imageBlob, "face.jpg");

    const res = await fetch(`${BASE_URL}/recognize`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Recognition failed");
    return data;
  },

  /** Fetch all registered users */
  async listUsers() {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error("Failed to load users");
    return res.json();
  },

  /** Delete a user by ID */
  async deleteUser(id) {
    const res = await fetch(`${BASE_URL}/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Delete failed");
    return data;
  },
};

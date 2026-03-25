"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Streamer {
  id: number;
  name: string;
  slug: string;
  stag: string;
  hasAvatar: boolean;
  avatarMimeType: string | null;
  prizes: Record<string, string>;
  registrationUrl: string | null;
  loginUrl: string | null;
  ctaUrl: string | null;
  campaignId: string | null;
  termsAndConditionsHtml: string | null;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  name: "",
  slug: "",
  stag: "",
  campaignId: "",
  prize1: "",
  prize2: "",
  prize3: "",
  registrationUrl: "",
  loginUrl: "",
  ctaUrl: "",
  termsAndConditionsHtml: "",
};

export default function AdminPage() {
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStreamers = useCallback(async () => {
    const res = await fetch("/api/admin/streamers", { credentials: "include" });
    const data = await res.json();
    setStreamers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStreamers();
  }, [fetchStreamers]);

  function slugify(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-");
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setAvatarFile(null);
    setRemoveAvatar(false);
    setSlugTouched(false);
    setError("");
    setShowForm(true);
  }

  function openEdit(s: Streamer) {
    const prizes = s.prizes || {};
    setEditingId(s.id);
    setSlugTouched(true);
    setForm({
      name: s.name,
      slug: s.slug,
      stag: s.stag,
      campaignId: s.campaignId || "",
      prize1: prizes["1st"] || "",
      prize2: prizes["2nd"] || "",
      prize3: prizes["3rd"] || "",
      registrationUrl: s.registrationUrl || "",
      loginUrl: s.loginUrl || "",
      ctaUrl: s.ctaUrl || "",
      termsAndConditionsHtml: s.termsAndConditionsHtml || "",
    });
    setAvatarFile(null);
    setRemoveAvatar(false);
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("slug", slugTouched ? form.slug : slugify(form.name));
    fd.set("stag", form.stag);
    fd.set("campaignId", form.campaignId);
    if (form.registrationUrl) fd.set("registrationUrl", form.registrationUrl);
    if (form.loginUrl) fd.set("loginUrl", form.loginUrl);
    if (form.ctaUrl) fd.set("ctaUrl", form.ctaUrl);
    if (form.termsAndConditionsHtml) fd.set("termsAndConditionsHtml", form.termsAndConditionsHtml);

    const prizes: Record<string, string> = {};
    if (form.prize1) prizes["1st"] = form.prize1;
    if (form.prize2) prizes["2nd"] = form.prize2;
    if (form.prize3) prizes["3rd"] = form.prize3;
    fd.set("prizes", JSON.stringify(prizes));

    if (avatarFile) fd.set("avatar", avatarFile);
    if (removeAvatar) fd.set("removeAvatar", "true");

    const url = editingId
      ? `/api/admin/streamers/${editingId}`
      : "/api/admin/streamers";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, { method, body: fd });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setSaving(false);
      return;
    }

    setSaving(false);
    closeForm();
    fetchStreamers();
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete streamer "${name}"?`)) return;
    await fetch(`/api/admin/streamers/${id}`, { method: "DELETE" });
    fetchStreamers();
  }

  function copyUrl(slug: string, id: number) {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Find the editing streamer for avatar preview
  const editingStreamer = editingId
    ? streamers.find((s) => s.id === editingId)
    : null;

  if (loading) {
    return <p className="text-gray-500">Loading…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">
          Streamers ({streamers.length})
        </h2>
        {!showForm && (
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Add Streamer
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 border border-gray-200 rounded-lg p-6 bg-gray-50"
        >
          <h3 className="font-medium mb-4">
            {editingId ? "Edit Streamer" : "New Streamer"}
          </h3>

          {error && (
            <p className="text-red-600 text-sm mb-4">{error}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name: newName,
                    ...(slugTouched ? {} : { slug: slugify(newName) }),
                  }));
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                type="text"
                required
                value={slugTouched ? form.slug : slugify(form.name)}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm({ ...form, slug: e.target.value });
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {slugTouched ? "Custom slug" : "Auto-generated from name"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stag *</label>
              <input
                type="text"
                required
                value={form.stag}
                onChange={(e) =>
                  setForm({ ...form, stag: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Campaign ID *</label>
              <input
                type="text"
                required
                value={form.campaignId}
                onChange={(e) =>
                  setForm({ ...form, campaignId: e.target.value })
                }
                placeholder="e.g. 12345"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                1st Prize
              </label>
              <input
                type="text"
                value={form.prize1}
                onChange={(e) =>
                  setForm({ ...form, prize1: e.target.value })
                }
                placeholder="e.g. $500"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                2nd Prize
              </label>
              <input
                type="text"
                value={form.prize2}
                onChange={(e) =>
                  setForm({ ...form, prize2: e.target.value })
                }
                placeholder="e.g. $300"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                3rd Prize
              </label>
              <input
                type="text"
                value={form.prize3}
                onChange={(e) =>
                  setForm({ ...form, prize3: e.target.value })
                }
                placeholder="e.g. $200"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Registration URL
              </label>
              <input
                type="url"
                value={form.registrationUrl}
                onChange={(e) =>
                  setForm({ ...form, registrationUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Login URL
              </label>
              <input
                type="url"
                value={form.loginUrl}
                onChange={(e) =>
                  setForm({ ...form, loginUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                CTA URL
              </label>
              <input
                type="url"
                value={form.ctaUrl}
                onChange={(e) =>
                  setForm({ ...form, ctaUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Terms & Conditions HTML
              </label>
              <textarea
                value={form.termsAndConditionsHtml}
                onChange={(e) =>
                  setForm({ ...form, termsAndConditionsHtml: e.target.value })
                }
                placeholder="<h2>Custom Terms</h2><p>Enter HTML content here...</p>"
                rows={5}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use default Lucky Dreams terms. Supports HTML tags.
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Avatar</label>
              {/* Hidden single file input driven by ref */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    setAvatarFile(file);
                    setRemoveAvatar(false);
                  }
                  // Reset so the same file can be re-selected
                  e.target.value = "";
                }}
              />
              {/* Current avatar preview when editing */}
              {editingStreamer?.hasAvatar && !removeAvatar && !avatarFile && (
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={`/api/streamers/${editingStreamer.id}/avatar?v=${editingStreamer.updatedAt}`}
                    alt="Current avatar"
                    className="w-16 h-16 rounded-full object-cover border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoveAvatar(true)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              {/* Removed state */}
              {removeAvatar && !avatarFile && (
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs border border-gray-300">
                    Removed
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemoveAvatar(false)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Undo
                  </button>
                </div>
              )}
              {/* New file preview */}
              {avatarFile && (
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={URL.createObjectURL(avatarFile)}
                    alt="New avatar"
                    className="w-16 h-16 rounded-full object-cover border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarFile(null);
                      setRemoveAvatar(false);
                    }}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
              {/* Visible file input for create mode or no-avatar state */}
              {!editingStreamer?.hasAvatar && !avatarFile && !removeAvatar && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Upload avatar
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {streamers.length === 0 ? (
        <p className="text-gray-500">No streamers yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2 px-3">Avatar</th>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Slug</th>
                <th className="py-2 px-3">Stag</th>
                <th className="py-2 px-3">Campaign</th>
                <th className="py-2 px-3">URL</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {streamers.map((s) => (
                <tr key={s.id} className="border-b border-gray-100">
                  <td className="py-2 px-3">
                    {s.hasAvatar ? (
                      <img
                        src={`/api/streamers/${s.id}/avatar?v=${s.updatedAt}`}
                        alt={s.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3 font-medium">{s.name}</td>
                  <td className="py-2 px-3 text-gray-500">{s.slug}</td>
                  <td className="py-2 px-3">{s.stag}</td>
                  <td className="py-2 px-3 text-gray-500">{s.campaignId || "—"}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/${s.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate max-w-[200px]"
                      >
                        /{s.slug}
                      </a>
                      <button
                        onClick={() => copyUrl(s.slug, s.id)}
                        className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap"
                      >
                        {copiedId === s.id ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => openEdit(s)}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

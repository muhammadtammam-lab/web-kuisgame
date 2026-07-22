"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/shared/components/AdminLayout";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import type { Materi } from "@/types/quiz";

export default function AdminMateriPage() {
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ judul: "", konten: "", gambarUrl: "", videoUrl: "", urutan: 0 });
  const [isSaving, setIsSaving] = useState(false);

  async function fetchMateri() {
    try {
      const res = await fetch("/api/materi");
      if (!res.ok) throw new Error("Gagal memuat materi");
      setMateriList(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/materi");
        if (!res.ok) throw new Error("Gagal memuat materi");
        const data = await res.json();
        if (!cancelled) setMateriList(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm({ judul: "", konten: "", gambarUrl: "", videoUrl: "", urutan: 0 });
  }

  function editMateri(m: Materi) {
    setEditingId(m.id);
    setForm({
      judul: m.judul,
      konten: m.konten,
      gambarUrl: m.gambarUrl || "",
      videoUrl: m.videoUrl || "",
      urutan: m.urutan,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editingId ? `/api/materi/${editingId}` : "/api/materi";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          gambarUrl: form.gambarUrl || null,
          videoUrl: form.videoUrl || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan");
      }
      resetForm();
      await fetchMateri();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Hapus materi ini?")) return;
    try {
      const res = await fetch(`/api/materi/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      await fetchMateri();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kelola Materi</h1>

      {/* Form */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "Edit Materi" : "Tambah Materi Baru"}
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
            <input
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konten *</label>
            <textarea
              value={form.konten}
              onChange={(e) => setForm({ ...form, konten: e.target.value })}
              className="w-full h-32 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
              <input
                value={form.gambarUrl}
                onChange={(e) => setForm({ ...form, gambarUrl: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Video</label>
              <input
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
            <input
              type="number"
              value={form.urutan}
              onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 0 })}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="primary" isLoading={isSaving}>
              {editingId ? "Update" : "Simpan"}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Batal
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Table */}
      {isLoading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : error ? (
        <Card className="text-red-600">{error}</Card>
      ) : materiList.length === 0 ? (
        <Card><p className="text-gray-500">Belum ada materi.</p></Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Urutan</th>
                <th className="pb-3 pr-4">Judul</th>
                <th className="pb-3 pr-4">Konten</th>
                <th className="pb-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {materiList.map((m) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">{m.urutan}</td>
                  <td className="py-3 pr-4 font-medium">{m.judul}</td>
                  <td className="py-3 pr-4 text-gray-500 max-w-xs truncate">{m.konten}</td>
                  <td className="py-3 flex gap-2">
                    <button onClick={() => editMateri(m)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:underline text-sm">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
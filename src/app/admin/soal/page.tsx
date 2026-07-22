"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/shared/components/AdminLayout";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import type { SoalAdmin } from "@/types/quiz";

export default function AdminSoalPage() {
  const [soalList, setSoalList] = useState<SoalAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    pertanyaan: "",
    pilihanA: "",
    pilihanB: "",
    pilihanC: "",
    pilihanD: "",
    jawabanBenar: "A" as "A" | "B" | "C" | "D",
    urutan: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  async function fetchSoal() {
    try {
      const res = await fetch("/api/soal?admin=true");
      if (!res.ok) throw new Error("Gagal memuat soal");
      setSoalList(await res.json());
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
        const res = await fetch("/api/soal?admin=true");
        if (!res.ok) throw new Error("Gagal memuat soal");
        const data = await res.json();
        if (!cancelled) setSoalList(data);
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
    setForm({
      pertanyaan: "",
      pilihanA: "",
      pilihanB: "",
      pilihanC: "",
      pilihanD: "",
      jawabanBenar: "A",
      urutan: 0,
    });
  }

  function editSoal(s: SoalAdmin) {
    setEditingId(s.id);
    setForm({
      pertanyaan: s.pertanyaan,
      pilihanA: s.pilihanA,
      pilihanB: s.pilihanB,
      pilihanC: s.pilihanC,
      pilihanD: s.pilihanD,
      jawabanBenar: s.jawabanBenar as "A" | "B" | "C" | "D",
      urutan: s.urutan,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editingId ? `/api/soal/${editingId}` : "/api/soal";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan");
      }
      resetForm();
      await fetchSoal();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Hapus soal ini?")) return;
    try {
      const res = await fetch(`/api/soal/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      await fetchSoal();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kelola Soal</h1>

      {/* Form */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "Edit Soal" : "Tambah Soal Baru"}
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan *</label>
            <textarea
              value={form.pertanyaan}
              onChange={(e) => setForm({ ...form, pertanyaan: e.target.value })}
              className="w-full h-24 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(["A", "B", "C", "D"] as const).map((huruf) => (
              <div key={huruf}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilihan {huruf} *
                </label>
                <input
                  value={form[`pilihan${huruf}` as keyof typeof form] as string}
                  onChange={(e) =>
                    setForm({ ...form, [`pilihan${huruf}`]: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            ))}
          </div>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jawaban Benar *</label>
              <select
                value={form.jawabanBenar}
                onChange={(e) =>
                  setForm({ ...form, jawabanBenar: e.target.value as "A" | "B" | "C" | "D" })
                }
                className="h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
              <input
                type="number"
                value={form.urutan}
                onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 0 })}
                className="w-24 h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
      ) : soalList.length === 0 ? (
        <Card><p className="text-gray-500">Belum ada soal.</p></Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Urutan</th>
                <th className="pb-3 pr-4">Pertanyaan</th>
                <th className="pb-3 pr-4">Jawaban</th>
                <th className="pb-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {soalList.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">{s.urutan}</td>
                  <td className="py-3 pr-4 max-w-md truncate font-medium">{s.pertanyaan}</td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                      {s.jawabanBenar}
                    </span>
                  </td>
                  <td className="py-3 flex gap-2">
                    <button onClick={() => editSoal(s)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline text-sm">Hapus</button>
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
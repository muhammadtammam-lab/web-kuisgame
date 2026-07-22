"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/shared/components/AdminLayout";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import type { Pengaturan } from "@/types/quiz";

export default function AdminPengaturanPage() {
  const [settings, setSettings] = useState<Pengaturan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/pengaturan");
        if (!res.ok) throw new Error("Gagal memuat pengaturan");
        setSettings(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/pengaturan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan");
      }
      setSuccess("Pengaturan berhasil disimpan!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  }

  const generateQr = useCallback(async () => {
    if (!qrUrl.trim()) return;
    setIsGeneratingQr(true);
    try {
      // Dynamic import qrcode library
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(qrUrl.trim(), {
        width: 300,
        margin: 2,
        color: { dark: "#1e3a5f", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
    } catch {
      setError("Gagal generate QR Code");
    } finally {
      setIsGeneratingQr(false);
    }
  }, [qrUrl]);

  if (isLoading) {
    return (
      <AdminLayout>
        <p className="text-gray-500">Memuat...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan Sistem</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Form Pengaturan */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Konfigurasi Quiz</h2>
        {settings && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Soal
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.jumlah_soal}
                  onChange={(e) =>
                    setSettings({ ...settings, jumlah_soal: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durasi (menit)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.durasi_menit}
                  onChange={(e) =>
                    setSettings({ ...settings, durasi_menit: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.acak_soal === "true"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      acak_soal: e.target.checked ? "true" : "false",
                    })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Acak Soal
                </span>
              </label>
            </div>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Simpan Pengaturan
            </Button>
          </form>
        )}
      </Card>

      {/* QR Code Generator */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">QR Code Landing Page</h2>
        <p className="text-sm text-gray-500 mb-4">
          Generate QR Code untuk di-print dan ditempel di lokasi acara.
        </p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Landing Page
            </label>
            <input
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
              placeholder="https://gema-akuntabilitas.vercel.app"
              className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            variant="primary"
            onClick={generateQr}
            isLoading={isGeneratingQr}
            disabled={!qrUrl.trim()}
          >
            Generate
          </Button>
        </div>

        {qrDataUrl && (
          <div className="mt-6 flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt="QR Code Landing Page"
              className="rounded-lg shadow-md"
            />
            <a
              href={qrDataUrl}
              download="qr-landing-page.png"
              className="inline-flex h-10 px-6 items-center justify-center rounded-full bg-blue-900 text-white font-semibold text-sm hover:bg-blue-800 transition-colors"
            >
              Download PNG
            </a>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
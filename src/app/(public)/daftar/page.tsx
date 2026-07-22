"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Card } from "@/shared/components/Card";

interface FormData {
  nama: string;
  instansi: string;
  email: string;
  noHp: string;
}

interface FormErrors {
  nama?: string;
  instansi?: string;
}

export default function DaftarPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    nama: "",
    instansi: "",
    email: "",
    noHp: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error saat user mengetik
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.nama.trim()) {
      newErrors.nama = "Nama wajib diisi";
    }
    if (!form.instansi.trim()) {
      newErrors.instansi = "Instansi wajib diisi";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/peserta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama.trim(),
          instansi: form.instansi.trim(),
          email: form.email.trim() || undefined,
          noHp: form.noHp.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mendaftar");
      }

      const data = await res.json();
      sessionStorage.setItem("pesertaId", String(data.pesertaId));
      router.push("/quiz");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Terjadi kesalahan"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Data Diri Peserta
        </h1>
        <p className="text-blue-200 text-center mb-8">
          Isi data diri Anda sebelum memulai quiz.
        </p>

        <Card padding="lg">
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap"
              name="nama"
              placeholder="Masukkan nama lengkap"
              value={form.nama}
              onChange={handleChange}
              error={errors.nama}
              required
              autoComplete="name"
            />

            <Input
              label="Instansi"
              name="instansi"
              placeholder="Contoh: BPK RI Perwakilan Provinsi..."
              value={form.instansi}
              onChange={handleChange}
              error={errors.instansi}
              required
              autoComplete="organization"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="opsional"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />

            <Input
              label="No. Handphone"
              name="noHp"
              type="tel"
              placeholder="opsional"
              value={form.noHp}
              onChange={handleChange}
              autoComplete="tel"
            />

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Mulai Quiz"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
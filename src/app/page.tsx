"use client";

import Link from "next/link";

function LogoImage({ src, alt, label }: { src: string; alt: string; label: string }) {
  return (
    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="w-[60px] h-[60px] object-contain"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<span class="text-blue-900 text-xs font-semibold">${label}</span>`;
          }
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-white">
      <main className="flex flex-col items-center gap-6 px-4 text-center">
        <div className="flex gap-4 items-center justify-center flex-wrap">
          <LogoImage src="/logo-bpk-ri.png" alt="Logo BPK RI" label="BPK RI" />
          <LogoImage src="/logo-intosai.png" alt="Logo INTOSAI" label="INTOSAI" />
          <LogoImage src="/logo-incosai.png" alt="Logo INCOSAI" label="INCOSAI" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Gema Akuntabilitas
        </h1>

        <p className="max-w-md text-lg text-blue-100">
          Uji pemahaman Anda seputar akuntabilitas dalam konteks BPK RI,
          INTOSAI, dan INCOSAI.
        </p>

        <Link
          href="/materi"
          className="mt-4 inline-flex h-12 w-56 items-center justify-center rounded-full bg-white px-6 text-blue-900 font-semibold text-base transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800"
        >
          Mulai
        </Link>
      </main>
    </div>
  );
}
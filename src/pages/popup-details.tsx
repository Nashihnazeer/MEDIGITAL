// pages/popup-details.tsx
import React from "react";
import logoData from "@/data/logoData"; // or "../src/data/logoData" depending on your tsconfig paths

export default function PopupDetailsPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Popup details (logoData)</h1>
      <div className="space-y-6">
        {logoData.map((it) => (
          <div key={it.id} className="p-4 border rounded">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm text-gray-600 mt-2">{it.body}</div>
            <div className="text-xs text-gray-400 mt-1">{it.src}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
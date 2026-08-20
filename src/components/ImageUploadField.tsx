"use client";

import { useRef, useState } from "react";

/**
 * Resizes an image file client-side (via canvas) and returns it as a JPEG
 * data URL. Keeping uploads small matters here because there's no separate
 * file storage service wired up — uploaded images are stored directly as
 * data URLs in the `courses` table (Postgres/Neon), which is free but has
 * limited storage, so we downscale before encoding rather than storing
 * multi-megabyte originals.
 */
async function fileToResizedDataUrl(
  file: File,
  maxDimension: number,
  quality = 0.82
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

export default function ImageUploadField({
  name,
  label,
  defaultValue,
  maxDimension = 1200,
  shape = "rect",
  helperText,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  maxDimension?: number;
  shape?: "rect" | "circle";
  helperText?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("請選擇圖片檔案（jpg / png / webp 等）");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("圖片檔案太大，請選擇 8MB 以內的圖片");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const dataUrl = await fileToResizedDataUrl(file, maxDimension);
      setValue(dataUrl);
    } catch {
      setError("圖片處理失敗，請換一張圖片試試");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-start gap-3">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-100 text-center text-[11px] leading-tight text-slate-400 ${
            shape === "circle" ? "rounded-full" : "rounded-md"
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            "尚未設定圖片"
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="text"
            name={name}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="貼上圖片網址，或點擊下方按鈕上傳圖片"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "處理中…" : "上傳圖片"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => setValue("")}
                className="text-xs text-rose-600 hover:underline"
              >
                移除圖片
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          {error && <p className="text-xs text-rose-600">{error}</p>}
          {helperText && !error && (
            <p className="text-xs text-slate-400">{helperText}</p>
          )}
        </div>
      </div>
    </div>
  );
}

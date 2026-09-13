"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";

/**
 * SEYİR DEFTERİ — MİSAFİR YÜKLEME FORMU
 * ------------------------------------------------------------------
 * Fotoğraf istemcide 1600px'e küçültülüp webp'e çevriliyor (canvas):
 * 8 MB'lık telefon fotoğrafı ~300 KB'a iniyor, yükleme mobil veride
 * saniyeler sürüyor. HEIC'i canvas çözemeyebilir — o durumda dosya
 * olduğu gibi gönderilir, sunucu sharp ile işler.
 *
 * İstemcideki küçültme bir OPTİMİZASYON; güvenlik değil. Tip, boyut ve
 * EXIF temizliği sunucuda yeniden yapılır (app/api/logbook/submit).
 */

const MAX_NOTE = 140;
const MAX_NAME = 40;
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_EDGE = 1600;

/** Canvas ile küçült + webp'e çevir. Başarısızsa orijinali döndür. */
async function shrink(file: File): Promise<File> {
  if (typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82),
    );
    if (!blob || blob.size === 0) return file;

    return new File([blob], "seyir-defteri.webp", { type: "image/webp" });
  } catch {
    // HEIC gibi tarayıcının çözemediği formatlar: sunucu hallesin
    return file;
  }
}

function todayISO(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

export default function LogbookUploadForm({ code }: { code: string }) {
  const t = useTranslations("logbookUpload");
  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [tripDate, setTripDate] = useState(todayISO());
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"idle" | "processing" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);
    if (!file) {
      setPreview(null);
      setFileName(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(t("errorSize"));
      event.target.value = "";
      setPreview(null);
      setFileName(null);
      return;
    }
    setFileName(file.name);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];

    if (!file) return setError(t("errorPhoto"));
    if (!consent) return setError(t("errorConsent"));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tripDate)) return setError(t("errorDate"));

    setError(null);
    setBusy(true);
    setPhase("processing");

    try {
      const photo = await shrink(file);
      if (photo.size > MAX_BYTES) {
        setError(t("errorSize"));
        return;
      }

      setPhase("sending");
      const body = new FormData();
      body.append("photo", photo);
      body.append("code", code);
      body.append("tripDate", tripDate);
      body.append("name", name.trim().slice(0, MAX_NAME));
      body.append("note", note.trim().slice(0, MAX_NOTE));
      body.append("consent", String(consent));

      const res = await fetch("/api/logbook/submit", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as
        | { ok: boolean; error?: string }
        | null;

      if (res.ok && data?.ok) {
        setDone(true);
        return;
      }

      const key = data?.error ?? "generic";
      const messages: Record<string, string> = {
        size: t("errorSize"),
        type: t("errorType"),
        rate: t("errorRate"),
        code: t("errorCode"),
        date: t("errorDate"),
        consent: t("errorConsent"),
        photo: t("errorPhoto"),
        store: t("errorStore"),
      };
      setError(messages[key] ?? t("errorGeneric"));
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setBusy(false);
      setPhase("idle");
    }
  }

  function reset() {
    setDone(false);
    setPreview(null);
    setFileName(null);
    setNote("");
    setName("");
    setConsent(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  /* ---------- Başarı ekranı ---------- */
  if (done) {
    return (
      <div className="rounded-sm border border-line bg-surface p-6 text-center sm:p-10">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-wa/15">
          <CheckIcon className="keep-accent size-6 text-wa" />
        </span>
        <h2 className="mt-4 text-2xl">{t("successTitle")}</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          {t("successText")}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-line px-6 py-3.5 text-sm font-medium transition-colors hover:border-accent"
          >
            {t("successAgain")}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-deep transition-opacity hover:opacity-90"
          >
            {t("successHome")}
            <ArrowIcon className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- Form ---------- */
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-sm border border-line bg-surface p-5 sm:p-6"
    >
      {/* Fotoğraf */}
      <div>
        <span className="block text-sm font-medium">{t("photoLabel")}</span>
        <p className="mt-1 text-xs text-ink-soft">{t("photoHint")}</p>

        <label
          htmlFor="logbook-photo"
          className="mt-3 block cursor-pointer overflow-hidden rounded-sm border border-dashed border-line bg-surface-2 transition-colors hover:border-accent"
        >
          {preview ? (
            <span className="block">
              {/* Yerel önizleme (blob:) — next/image dış kaynak beklemiyor */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
              <span className="block px-4 py-2.5 text-center text-sm font-medium">
                {t("photoChange")}
              </span>
            </span>
          ) : (
            <span className="flex aspect-[4/3] flex-col items-center justify-center gap-2 px-4 text-center">
              <span className="text-3xl" aria-hidden>
                📷
              </span>
              <span className="text-sm font-medium">{t("photoPick")}</span>
            </span>
          )}
        </label>
        <input
          ref={fileRef}
          id="logbook-photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
          onChange={onPick}
          className="sr-only"
        />
        {fileName && (
          <p className="mt-2 truncate text-xs text-ink-soft">{fileName}</p>
        )}
      </div>

      {/* Tarih */}
      <div className="mt-5">
        <label htmlFor="logbook-date" className="block text-sm font-medium">
          {t("dateLabel")}
        </label>
        <input
          id="logbook-date"
          name="tripDate"
          type="date"
          value={tripDate}
          max={todayISO()}
          onChange={(e) => setTripDate(e.target.value)}
          className="mt-2 h-11 w-full rounded-sm border border-line bg-surface-2 px-3 text-base text-deep focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Ad */}
      <div className="mt-4">
        <label htmlFor="logbook-name" className="block text-sm font-medium">
          {t("nameLabel")}
        </label>
        <p className="mt-1 text-xs text-ink-soft">{t("nameHint")}</p>
        <input
          id="logbook-name"
          name="name"
          type="text"
          maxLength={MAX_NAME}
          value={name}
          placeholder={t("namePlaceholder")}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 h-11 w-full rounded-sm border border-line bg-surface-2 px-3 text-base text-deep placeholder:text-deep/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Not */}
      <div className="mt-4">
        <label htmlFor="logbook-note" className="block text-sm font-medium">
          {t("noteLabel")}
        </label>
        <p className="mt-1 text-xs text-ink-soft">{t("noteHint", { max: MAX_NOTE })}</p>
        <textarea
          id="logbook-note"
          name="note"
          rows={3}
          maxLength={MAX_NOTE}
          value={note}
          placeholder={t("notePlaceholder")}
          onChange={(e) => setNote(e.target.value)}
          className="mt-2 w-full rounded-sm border border-line bg-surface-2 p-3 text-base leading-relaxed text-deep placeholder:text-deep/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="mt-1 text-right text-xs tabular-nums text-ink-soft">
          {t("noteCounter", { count: note.length, max: MAX_NOTE })}
        </p>
      </div>

      {/* Rıza — zorunlu */}
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-sm border border-line bg-surface-2 p-4">
        <input
          type="checkbox"
          name="consent"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            setError(null);
          }}
          className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent)]"
        />
        <span className="text-sm leading-relaxed">{t("consent")}</span>
      </label>

      {/* Gönder */}
      <button
        type="submit"
        disabled={busy}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-accent px-6 py-4 text-sm font-medium text-deep transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy
          ? phase === "processing"
            ? t("processing")
            : t("submitting")
          : t("submit")}
      </button>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium">
          {error}
        </p>
      )}
    </form>
  );
}

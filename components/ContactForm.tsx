"use client";

import { useState } from "react";
import { WhatsappIcon } from "@/components/icons";
import { whatsappUrl } from "@/lib/links";

/**
 * Kısa iletişim formu.
 * Talep kaydedilmez — mesaj derlenip WhatsApp'a devredilir (Faz 2 kararı).
 * Numara sunucudan prop olarak geliyor, bileşen hiçbir veri kaynağına bakmıyor.
 */
const TOPICS = [
  "Fiyat ve müsaitlik",
  "Özel gün / organizasyon",
  "Grup ve kurumsal",
  "Diğer",
];

export default function ContactForm({ whatsapp }: { whatsapp: string }) {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = [
      `Merhaba, ${topic.toLocaleLowerCase("tr-TR")} hakkında bilgi almak istiyorum.`,
      message.trim(),
    ]
      .filter(Boolean)
      .join("\n\n");

    window.location.href = whatsappUrl(whatsapp, text);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-sm border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-xl">WhatsApp&apos;tan yazın</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Konuyu seçin, dilerseniz birkaç satır ekleyin. Buton hazır mesajı
        WhatsApp&apos;ta açar — göndermeden önce görebilirsiniz.
      </p>

      <div className="mt-5">
        <label htmlFor="topic" className="block text-sm font-medium">
          Konu
        </label>
        <select
          id="topic"
          name="topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="mt-2 h-11 w-full rounded-sm border border-line bg-surface-2 px-3 text-base text-deep focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {TOPICS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="message" className="block text-sm font-medium">
          Mesajınız{" "}
          <span className="font-normal text-ink-soft">(isteğe bağlı)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Örnek: 12 Eylül için 6 kişiyiz, gün batımı turu müsait mi?"
          className="mt-2 w-full rounded-sm border border-line bg-surface-2 p-3 text-base leading-relaxed text-deep placeholder:text-deep/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-wa px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-wa-deep"
      >
        <WhatsappIcon className="size-4" />
        WhatsApp&apos;ta aç
      </button>
    </form>
  );
}

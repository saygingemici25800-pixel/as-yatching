"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { WhatsappIcon } from "@/components/icons";
import { whatsappUrl } from "@/lib/links";

/**
 * Kısa iletişim formu.
 * Talep kaydedilmez — mesaj derlenip WhatsApp'a devredilir (Faz 2 kararı).
 * Numara sunucudan prop olarak geliyor, bileşen hiçbir veri kaynağına bakmıyor.
 */
const TOPIC_KEYS = ["topicPrice", "topicEvent", "topicGroup", "topicOther"] as const;

export default function ContactForm({ whatsapp }: { whatsapp: string }) {
  const t = useTranslations("contactForm");
  const tw = useTranslations("whatsapp");
  const locale = useLocale();
  const [topicKey, setTopicKey] = useState<(typeof TOPIC_KEYS)[number]>(TOPIC_KEYS[0]);
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = [
      tw("contactTopic", { topic: t(topicKey).toLocaleLowerCase(locale) }),
      message.trim(),
    ]
      .filter(Boolean)
      .join("\n\n");

    window.location.href = whatsappUrl(whatsapp, text);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-sm border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-xl">{t("title")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t("text")}</p>

      <div className="mt-5">
        <label htmlFor="topic" className="block text-sm font-medium">
          {t("topic")}
        </label>
        <select
          id="topic"
          name="topic"
          value={topicKey}
          onChange={(event) =>
            setTopicKey(event.target.value as (typeof TOPIC_KEYS)[number])
          }
          className="mt-2 h-11 w-full rounded-sm border border-line bg-surface-2 px-3 text-base text-deep focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {TOPIC_KEYS.map((key) => (
            <option key={key} value={key}>
              {t(key)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="message" className="block text-sm font-medium">
          {t("message")}{" "}
          <span className="font-normal text-ink-soft">{t("optional")}</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t("placeholder")}
          className="mt-2 w-full rounded-sm border border-line bg-surface-2 p-3 text-base leading-relaxed text-deep placeholder:text-deep/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-wa px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-wa-deep"
      >
        <WhatsappIcon className="size-4" />
        {t("submit")}
      </button>
    </form>
  );
}

/**
 * Demo aşamasında her fiyatın yanında zorunlu.
 * Faz 6'da gerçek fiyat girildiğinde seed'de isSamplePrice=false olur ve rozet kaybolur.
 */
export default function SampleBadge({ className = "" }: { className?: string }) {
  return (
    <span
      title="Bu fiyat demo verisidir, gerçek fiyat değildir."
      className={`inline-flex items-center rounded-sm border border-accent/60 px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-[0.12em] text-accent ${className}`}
    >
      Örnek
    </span>
  );
}

/**
 * Demo aşamasında dürüstlük şeridi.
 * Faz 6'da gerçek veriye geçilince bu bileşen kaldırılacak.
 */
export default function DemoNotice() {
  return (
    <div className="border-y border-line bg-surface">
      <p className="mx-auto max-w-6xl px-4 py-3 text-xs leading-relaxed text-ink-soft sm:px-6">
        <span className="mr-2 font-medium uppercase tracking-[0.12em] text-accent">
          Demo
        </span>
        Tekne özellikleri ve fiyatlar örnek veridir. Telefon, adres, çalışma
        saati ve Google puanı gerçektir.
      </p>
    </div>
  );
}

import Link from "next/link";

export function FinalCta() {
  return (
    <section className="bg-[var(--ld-cream)] py-16 sm:py-24">
      <div className="landing-shell text-center">
        <h2 className="landing-h2 mx-auto max-w-2xl">
          Kariyerinizi bir sonraki seviyeye taşımaya hazır mısınız?
        </h2>
        <p className="landing-lede mx-auto mt-4 text-center">
          CV yükleyin, skoru görün, net aksiyonlarla ilerleyin. Giriş zorunlu değil.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/forge" className="landing-cta-primary">
            Ücretsiz Başlayın
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-[var(--ld-teal)] hover:underline"
          >
            Panele git
          </Link>
        </div>
      </div>
    </section>
  );
}

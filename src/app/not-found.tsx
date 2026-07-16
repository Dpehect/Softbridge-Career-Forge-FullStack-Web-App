import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-4 py-24 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-cosmic-teal mb-3">404</p>
      <h1 className="font-display text-3xl font-semibold mb-3">Path not found</h1>
      <p className="text-muted-steel mb-8">That route doesn&apos;t exist in CareerForge.</p>
      <Link
        href="/"
        className="inline-flex h-11 items-center rounded-xl px-5 font-semibold bg-star-white text-midnight-void"
      >
        Back home
      </Link>
    </div>
  );
}

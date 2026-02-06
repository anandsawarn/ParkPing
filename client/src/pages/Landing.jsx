import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="mx-auto max-w-3xl space-y-6 text-center">
        <div className="chip mx-auto dark:border-white/20 dark:bg-darkCard/70">Smart parking contact layer</div>
        <h1 className="font-display text-3xl leading-tight sm:text-5xl md:text-6xl">
          Contact any car owner without exposing your number
        </h1>
        <p className="mx-auto max-w-xl text-base text-ink/70 sm:text-lg dark:text-white/70">
          ParkPing solves the problem of blocked parking by providing a secure QR-based contact
          system. No more awkward number exchanges or privacy concerns.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            className="rounded-full bg-ink px-6 py-3 font-semibold text-white shadow-glow dark:bg-white dark:text-ink"
            to="/signup"
          >
            Get started free
          </Link>
          <Link
            className="rounded-full border border-ink/20 bg-white/70 px-6 py-3 font-semibold dark:border-white/20 dark:bg-darkCard/70"
            to="/login"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card grid-glow space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-moss/20 text-2xl">
            🚗
          </div>
          <h3 className="font-display text-lg sm:text-xl">Register your vehicles</h3>
          <p className="text-sm text-ink/70 dark:text-white/70">
            Add all your cars with contact details. Each car gets a unique QR code with a custom
            message.
          </p>
        </div>

        <div className="card grid-glow space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tide/30 text-2xl">
            📱
          </div>
          <h3 className="font-display text-lg sm:text-xl">Scan & Contact</h3>
          <p className="text-sm text-ink/70 dark:text-white/70">
            Anyone can scan your QR and instantly call, SMS, or WhatsApp—without seeing your actual
            number.
          </p>
        </div>

        <div className="card grid-glow space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-clay/20 text-2xl">
            🔒
          </div>
          <h3 className="font-display text-lg sm:text-xl">Privacy first</h3>
          <p className="text-sm text-ink/70 dark:text-white/70">
            Phone numbers are masked. Only verified QR scans can trigger contact actions. Your data
            stays safe.
          </p>
        </div>
      </section>

      <section className="card grid-glow mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-moss">How it works</p>
          <h2 className="font-display text-2xl sm:text-3xl">Three simple steps</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moss/20 font-display text-2xl text-moss">
              1
            </div>
            <h4 className="text-sm font-semibold sm:text-base">Sign up & add cars</h4>
            <p className="text-sm text-ink/70 dark:text-white/70">
              Create your account and register vehicles with driver contact details.
            </p>
          </div>

          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-tide/30 font-display text-2xl text-clay">
              2
            </div>
            <h4 className="text-sm font-semibold sm:text-base">Download & stick QR</h4>
            <p className="text-sm text-ink/70 dark:text-white/70">
              Generate and download the QR with a custom quote. Stick it on your car windshield.
            </p>
          </div>

          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clay/20 font-display text-2xl text-clay">
              3
            </div>
            <h4 className="text-sm font-semibold sm:text-base">Let people scan</h4>
            <p className="text-sm text-ink/70 dark:text-white/70">
              Anyone who needs to reach you can scan the QR and contact the driver instantly.
            </p>
          </div>
        </div>
      </section>

      <section className="card grid-glow mx-auto max-w-2xl space-y-4 text-center">
        <h2 className="font-display text-2xl sm:text-3xl">Ready to solve parking chaos?</h2>
        <p className="text-ink/70 dark:text-white/70">
          Join ParkPing and make your car contactable without sharing your personal number.
        </p>
        <Link
          className="mx-auto inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-white shadow-glow dark:bg-white dark:text-ink"
          to="/signup"
        >
          Create your QR now
        </Link>
      </section>
    </div>
  );
};

export default Landing;

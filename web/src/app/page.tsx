import Link from "next/link";
import { client, obsById } from "@/lib/fixture";
import { consultations, itemById, studioClients, upcoming, wardrobe } from "@/lib/atelier";
import { Garment } from "@/components/atelier/Garment";
import { Portrait, PortraitPlaceholder } from "@/components/atelier/Portrait";
import { Label, Marker, Reveal, TextLink } from "@/components/atelier/primitives";
import { Status } from "@/components/atelier/ui/controls";
import { photoCreditLine } from "@/lib/photos";

export const metadata = { title: "Studio" };

// Roster plates step down in size so the client who needs you now leads, and sit on one baseline.
const plateSpan = ["col-span-6 lg:col-span-4", "col-span-3 lg:col-span-3", "col-span-3 lg:col-span-2"];

export default function Studio() {
  const awaiting = client.recommendations.filter((r) => r.status === "Draft");
  const outside = wardrobe.find((w) => !w.inPalette && w.slot !== "watch")!;
  const featured = ["w-camel-coat", "w-rust-blouse", "w-cognac-loafers"].map((id) => itemById(id)!);

  return (
    <main id="main" className="mx-auto max-w-[1600px] px-[var(--gutter)] pb-10">
      {/* ------------------------------------------------ Opening */}
      <section className="relative grid min-h-[86svh] grid-cols-12 items-end gap-x-6 pb-16 pt-28 sm:pt-36">
        <div className="col-span-12 mb-10 ml-auto w-[62%] sm:absolute sm:right-[var(--gutter)] sm:top-24 sm:mb-0 sm:w-[30%]">
          <Reveal mask delay={120} className="w-full">
            <Portrait subject="direction" priority sizes="(min-width: 640px) 30vw, 62vw" label="A reference portrait for the direction: a woman in a dark pinstripe jacket, looking straight at the camera" />
          </Reveal>
          <p className="label tone-muted mt-3 text-right">
            <span className="numeral text-sm normal-case tracking-normal">Fig. 01</span> · A reference for the direction
          </p>
        </div>

        <div className="relative z-10 col-span-12">
          <Label className="rise">Personal image direction · Madrid</Label>
          <h1 className="display-xl mt-6 sm:mt-8" aria-label="Your image, considered.">
            <span className="rise block" style={{ ["--d" as string]: "60ms" }}>Your image,</span>
            <span className="rise block pl-[6vw] italic-serif normal-case tracking-[-0.03em] sm:pl-[12vw]" style={{ ["--d" as string]: "160ms", fontWeight: 300 }}>considered.</span>
          </h1>
          <div className="mt-10 grid grid-cols-12 gap-x-6 sm:mt-14">
            <p className="lede rise col-span-10 sm:col-span-5 lg:col-span-3" style={{ ["--d" as string]: "260ms" }}>
              A living expression of who you are, how you move, and how you want to be seen.
            </p>
            <div className="rise col-span-12 mt-8 sm:col-span-4 sm:col-start-7 sm:mt-0 lg:col-start-5" style={{ ["--d" as string]: "320ms" }}>
              <TextLink href="/clients/marisol">Continue with Marisol</TextLink>
              <p className="meta">Session 3 on Thursday 19 March</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ 01 Clients: a roster of portraits, not a table */}
      <section id="clients" aria-labelledby="clients-h" className="pt-[var(--rhythm-md)]">
        <Marker n="01" label="Clients" />
        <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-3">
            <h2 id="clients-h" className="display-m">Three clients, <span className="italic-serif">two waiting on you.</span></h2>
            <p className="body-copy tone-muted mt-5">Marisol’s draft is ready to review. Diego’s analysis is complete and waiting for your interpretation.</p>
          </div>
          <ul className="col-span-12 grid grid-cols-6 items-end gap-x-4 gap-y-12 lg:col-span-9 lg:grid-cols-9 lg:gap-x-6">
            {studioClients.map((c, i) => {
              const plate = c.hasPortrait
                ? <Portrait tx={`portrait-${c.slug}`} subject="today" decorative sizes="(min-width: 1024px) 30vw, 92vw" />
                : <PortraitPlaceholder initials={c.initials} name={c.name} />;
              const caption = (
                <div className="mt-4">
                  <h3 className="headline transition-transform duration-[var(--dur-ui)] group-hover:translate-x-1">{c.name}</h3>
                  <p className="meta mt-1">{c.focus}</p>
                  <p className="meta">{c.last}</p>
                  {c.status && <Status tone="review" className="mt-3">{c.status}</Status>}
                </div>
              );
              return (
                <li key={c.slug} className={`list-none ${plateSpan[i]}`}>
                  {c.href ? (
                    <Link href={c.href} transitionTypes={["portrait"]} className="group block" data-cursor="Open">{plate}{caption}</Link>
                  ) : (
                    <div>{plate}{caption}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------ 02 For review + Upcoming */}
      <section aria-labelledby="review-h" className="pt-[var(--rhythm-lg)]">
        <Marker n="02" label="This week" />
        <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-16">
          <div className="col-span-12 lg:col-span-6 lg:col-start-2">
            <h2 id="review-h" className="display-m">Waiting for your <span className="italic-serif">judgement</span></h2>
            <ol className="mt-10">
              {awaiting.map((r) => (
                <li key={r.id} className="list-none border-t border-ink/15 py-7">
                  <Label tone="accent">Draft · {obsById(r.observationId)!.area}</Label>
                  <p className="headline mt-3">{r.title}</p>
                  <p className="meta mt-3">Marisol Vega Ortiz · {r.nextStep}</p>
                  <TextLink href={`/clients/marisol#rec-${r.id}`} className="mt-2 text-sm">Review the direction</TextLink>
                </li>
              ))}
              <li className="list-none border-y border-ink/15 py-7">
                <Label tone="accent">Analysis ready</Label>
                <p className="headline mt-3">Diego Flores</p>
                <p className="meta mt-3">Personal branding · observations complete, waiting for interpretation</p>
              </li>
            </ol>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pt-24">
            <Label>Upcoming</Label>
            <ol className="mt-6">
              {upcoming.map((u) => (
                <li key={u.when} className="list-none py-5">
                  <p className="numeral text-3xl leading-none">{u.when}</p>
                  <p className="mt-2 text-sm">{u.what}</p>
                  <p className="meta">{u.who}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ 03 Wardrobe activity */}
      <section aria-labelledby="wardrobe-h" className="pt-[var(--rhythm-lg)]">
        <Marker n="03" label="Wardrobe" />
        <div className="relative mt-12 grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 sm:col-span-5 lg:col-span-4">
            <h2 id="wardrobe-h" className="display-m">{wardrobe.length} pieces,<br /><span className="italic-serif">one point of view.</span></h2>
            <p className="body-copy tone-muted mt-6">
              Marisol’s most-worn layer, the {outside.name.toLowerCase()}, sits outside her palette and softens the shoulder on camera.
            </p>
            <div className="mt-6"><TextLink href="/wardrobe">Enter the wardrobe</TextLink></div>
          </div>
          <div className="col-span-12 grid grid-cols-12 items-end gap-x-4 sm:col-span-7 lg:col-span-8">
            {featured.map((f, i) => {
              const spans = ["col-span-7 lg:col-span-5", "col-span-5 self-start mt-10 lg:col-span-3 lg:mt-0 lg:self-end lg:mb-16", "col-span-8 col-start-4 mt-6 lg:col-span-4 lg:col-start-auto lg:mt-0"][i];
              return (
                <div key={f.id} className={spans}>
                  <Link href="/wardrobe" className="group block" data-cursor="View" aria-label={`${f.name} in the wardrobe`}>
                    <div className="frame bg-paper p-4">
                      <div className="frame-inner" style={{ transform: `rotate(${i === 1 ? 1.5 : i === 2 ? -1 : 0}deg)` }}>
                        <Garment kind={f.kind} color={f.color} className="h-auto w-full" />
                      </div>
                    </div>
                    <p className="label tone-muted mt-3">{f.colorName} · {f.category}</p>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Ask */}
      <section aria-labelledby="ask-h" className="on-dark -mx-[var(--gutter)] mt-[var(--rhythm-lg)] bg-ink px-[var(--gutter)] py-24 text-ivory sm:py-36">
        <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-7">
            <Label className="tone-inverse-muted">Ask your consultant</Label>
            <h2 id="ask-h" className="display-l mt-6">What are you<br /><span className="italic-serif">dressing for?</span></h2>
          </div>
          <ul className="col-span-12 self-end lg:col-span-4 lg:col-start-9">
            {consultations.map((c) => (
              <li key={c.id} className="list-none border-t border-ivory/20 last:border-b">
                <Link href={`/looks?ask=${c.id}`} className="group focus-inset flex items-baseline justify-between gap-6 py-5">
                  <span className="text-lg leading-snug"><span className="travel">{c.prompt}</span></span>
                  <span aria-hidden className="transition-transform duration-[var(--dur-ui)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="flex flex-wrap items-baseline justify-between gap-4 pt-10">
        <p className="meta max-w-[62ch]">Prototype on synthetic data: the clients are fictional and the photographs are examples. {photoCreditLine} Only Marisol’s dossier is built.</p>
        <nav aria-label="Reference" className="flex gap-6">
          <Link href="/design-lab" className="label tone-muted tap inline-flex items-center py-2 hover:text-ink"><span className="travel pb-0.5">Design lab</span></Link>
          <Link href="/concepts" className="label tone-muted tap inline-flex items-center py-2 hover:text-ink"><span className="travel pb-0.5">Design concepts</span></Link>
        </nav>
      </footer>
    </main>
  );
}

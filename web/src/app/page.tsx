import Link from "next/link";
import { client, obsById } from "@/lib/fixture";
import { consultations, itemById, studioClients, upcoming, wardrobe } from "@/lib/atelier";
import { Garment } from "@/components/atelier/Garment";
import { PortraitStudy } from "@/components/atelier/PortraitStudy";
import { ClientRow, Label, Marker, Reveal, TextLink } from "@/components/atelier/primitives";

export const metadata = { title: "Studio" };

export default function Studio() {
  const awaiting = client.recommendations.filter((r) => r.status === "Draft");
  const outside = wardrobe.find((w) => !w.inPalette && w.slot !== "watch")!;
  const featured = ["w-camel-coat", "w-rust-blouse", "w-cognac-loafers"].map((id) => itemById(id)!);

  return (
    <main id="main" className="mx-auto max-w-[1600px] px-[var(--gutter)] pb-10">
      {/* ------------------------------------------------ Opening */}
      <section className="relative grid min-h-[86svh] grid-cols-12 items-end gap-x-6 pb-16 pt-28 sm:pt-36">
        <div className="col-span-12 mb-10 ml-auto w-[62%] sm:absolute sm:right-[var(--gutter)] sm:top-24 sm:mb-0 sm:w-[30%]">
          <Reveal mask delay={200} className="frame aspect-[4/5] w-full">
            <div className="frame-inner h-full w-full">
              <PortraitStudy outfit="jacket" crop="tall" className="h-full w-full" decorative />
            </div>
          </Reveal>
          <p className="label mt-3 text-right text-warm">
            <span className="numeral text-sm normal-case tracking-normal">Fig. 01</span> · Proposed direction
          </p>
        </div>

        <div className="relative z-10 col-span-12">
          <Label className="rise" >Personal image direction · Madrid</Label>
          <h1 className="display-xl mt-6 sm:mt-8" aria-label="Your image, considered.">
            <span className="rise block" style={{ ["--d" as string]: "120ms" }}>Your image,</span>
            <span className="rise block pl-[6vw] italic-serif normal-case tracking-[-0.03em] sm:pl-[12vw]" style={{ ["--d" as string]: "260ms", fontWeight: 300 }}>considered.</span>
          </h1>
          <div className="mt-10 grid grid-cols-12 gap-x-6 sm:mt-14">
            <p className="lede rise col-span-10 sm:col-span-5 lg:col-span-3" style={{ ["--d" as string]: "520ms" }}>
              A living expression of who you are, how you move, and how you want to be seen.
            </p>
            <div className="rise col-span-12 mt-8 sm:col-span-4 sm:col-start-7 sm:mt-0 lg:col-start-5" style={{ ["--d" as string]: "640ms" }}>
              <TextLink href="/clients/marisol">Continue with Marisol</TextLink>
              <p className="meta">Session 3 on Thursday 19 March</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ 01 Clients */}
      <section aria-labelledby="clients-h" className="pt-20 sm:pt-32">
        <Marker n="01" label="Clients" />
        <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 sm:col-span-4 lg:col-span-3">
            <Reveal>
              <h2 id="clients-h" className="label text-ink">Active clients</h2>
              <p className="display-l numeral mt-3" aria-label={`${studioClients.length} active clients`}>
                {String(studioClients.length).padStart(2, "0")}
              </p>
            </Reveal>
          </div>
          <ul className="col-span-12 sm:col-span-8 lg:col-span-8 lg:col-start-5">
            {studioClients.map((c, i) => (
              <ClientRow key={c.slug} {...c} index={i} />
            ))}
            <li className="border-t border-ink/15" aria-hidden />
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------ 02 For review + Upcoming */}
      <section aria-labelledby="review-h" className="pt-28 sm:pt-44">
        <Marker n="01" label="This week" />
        <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-16">
          <div className="col-span-12 lg:col-span-6 lg:col-start-2">
            <Reveal>
              <h2 id="review-h" className="display-m">Waiting for your <span className="italic-serif">judgement</span></h2>
            </Reveal>
            <ol className="mt-10">
              {awaiting.map((r, i) => (
                <Reveal as="li" key={r.id} delay={i * 100} className="list-none border-t border-ink/15 py-7">
                  <Label tone="accent">Draft · {obsById(r.observationId)!.area}</Label>
                  <p className="headline mt-3">{r.title}</p>
                  <p className="body-copy mt-2 text-warm">{r.rationale}</p>
                  <p className="meta mt-3">Marisol Vega Ortiz · {r.nextStep}</p>
                  <TextLink href="/clients/marisol#opportunities" className="mt-2 text-sm">Review the direction</TextLink>
                </Reveal>
              ))}
              <Reveal as="li" delay={awaiting.length * 100} className="list-none border-y border-ink/15 py-7">
                <Label tone="accent">Analysis ready</Label>
                <p className="headline mt-3">Diego Flores</p>
                <p className="body-copy mt-2 text-warm">Personal branding. Observations are complete and waiting for interpretation.</p>
                <p className="meta mt-3">Not part of this preview</p>
              </Reveal>
            </ol>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pt-24">
            <Reveal>
              <Label>Upcoming</Label>
            </Reveal>
            <ol className="mt-6">
              {upcoming.map((u, i) => (
                <Reveal as="li" key={u.when} delay={i * 100} className="list-none py-5">
                  <p className="numeral text-3xl leading-none">{u.when}</p>
                  <p className="mt-2 text-sm">{u.what}</p>
                  <p className="meta">{u.who}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ 03 Wardrobe activity */}
      <section aria-labelledby="wardrobe-h" className="pt-28 sm:pt-44">
        <Marker n="02" label="Wardrobe" />
        <div className="relative mt-12 grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 sm:col-span-5 lg:col-span-4">
            <Reveal>
              <h2 id="wardrobe-h" className="display-m">{wardrobe.length} pieces,<br /><span className="italic-serif">one point of view.</span></h2>
              <p className="body-copy mt-6 text-warm">
                Marisol’s most-worn layer, the {outside.name.toLowerCase()}, sits outside her palette and softens the shoulder on camera.
              </p>
              <div className="mt-6"><TextLink href="/wardrobe">Enter the wardrobe</TextLink></div>
            </Reveal>
          </div>
          <div className="col-span-12 grid grid-cols-12 items-end gap-x-4 sm:col-span-7 lg:col-span-8">
            {featured.map((f, i) => {
              const spans = ["col-span-7 lg:col-span-5", "col-span-5 self-start mt-10 lg:col-span-3 lg:mt-0 lg:self-end lg:mb-16", "col-span-8 col-start-4 mt-6 lg:col-span-4 lg:col-start-auto lg:mt-0"][i];
              return (
                <Reveal key={f.id} delay={i * 120} className={spans}>
                  <Link href="/wardrobe" className="group block" data-cursor="View" aria-label={`${f.name} in the wardrobe`}>
                    <div className="frame bg-paper p-4">
                      <div className="frame-inner" style={{ transform: `rotate(${i === 1 ? 1.5 : i === 2 ? -1 : 0}deg)` }}>
                        <Garment kind={f.kind} color={f.color} className="h-auto w-full" />
                      </div>
                    </div>
                    <p className="label mt-3 text-warm">{f.colorName} · {f.category}</p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Ask */}
      <section aria-labelledby="ask-h" className="on-dark -mx-[var(--gutter)] mt-32 bg-ink px-[var(--gutter)] py-24 text-ivory sm:mt-48 sm:py-36">
        <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-7">
            <Label className="!text-taupe">Ask your consultant</Label>
            <h2 id="ask-h" className="display-l mt-6">What are you<br /><span className="italic-serif">dressing for?</span></h2>
          </div>
          <ul className="col-span-12 self-end lg:col-span-4 lg:col-start-9">
            {consultations.map((c, i) => (
              <Reveal as="li" key={c.id} delay={i * 100} className="list-none border-t border-ivory/20 last:border-b">
                <Link href={`/looks?ask=${c.id}`} className="group flex items-baseline justify-between gap-6 py-5">
                  <span className="text-lg leading-snug"><span className="travel">{c.prompt}</span></span>
                  <span aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <footer className="flex flex-wrap items-baseline justify-between gap-4 pt-10 text-warm">
        <p className="meta">Prototype on synthetic data. No real client is shown.</p>
        <Link href="/concepts" className="label travel">Design concepts</Link>
      </footer>
    </main>
  );
}

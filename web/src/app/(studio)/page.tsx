import Link from "next/link";
import { client } from "@/lib/fixture";
import { consultations, itemById, studioClients, upcoming, wardrobe } from "@/lib/atelier";
import { STUDIO_TODAY, formatDay, relativeDay } from "@/lib/clock";
import { copy } from "@/lib/copy";
import { liveRecommendations } from "@/lib/live";
import { studioToday, type Waiting } from "@/lib/today";
import { Garment } from "@/components/atelier/Garment";
import { Portrait, PortraitPlaceholder } from "@/components/atelier/Portrait";
import { Label, Marker, Reveal, TextLink } from "@/components/atelier/primitives";
import { EmptyState, Status } from "@/components/atelier/ui/controls";
import { photoCreditLine } from "@/lib/photos";

export const metadata = { title: "Studio" };

// Roster plates step down in size so the client who needs you now leads, and sit on one baseline.
const plateSpan = ["col-span-6 lg:col-span-4", "col-span-3 lg:col-span-3", "col-span-3 lg:col-span-2"];

const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const word = (n: number) => words[n] ?? String(n);
const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function Studio() {
  const recs = await liveRecommendations();
  const today = studioToday({
    today: STUDIO_TODAY, clients: studioClients, appointments: upcoming, recommendations: recs,
    client: { slug: "marisol", name: client.name },
  });
  const t = copy.en;
  const nextAppointment = today.upcoming[0];
  const waitingRecs = today.waiting.filter((w) => w.kind === "recommendation").length;
  const waitingClients = new Set(today.waiting.map((w) => w.slug)).size;
  const clientFor = (slug: string) => studioClients.find((c) => c.slug === slug)!;
  // Marisol's status comes from her live recommendations; the others carry a client-level status of their own.
  const status = (c: (typeof studioClients)[number]) =>
    c.slug === "marisol" ? (waitingRecs > 0 ? "Awaiting your review" : undefined) : c.status;
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
              <p className="label tone-muted">Today · {formatDay(today.date, { weekday: "long" })}</p>
              {today.next?.kind === "review" && <TextLink href={today.next.href}>Review {today.next.client}’s recommendation</TextLink>}
              {today.next?.kind === "prepare" && today.next.href && <TextLink href={today.next.href}>Open {today.next.who}’s dossier</TextLink>}
              {!today.next && <p className="mt-2 text-sm">Nothing is waiting for you.</p>}
              {nextAppointment && (
                <p className="meta">{formatDay(nextAppointment.on, { weekday: "short" })} · {nextAppointment.what}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ 01 Today: real work, derived from the records */}
      <section id="today" aria-labelledby="today-h" className="pt-[var(--rhythm-md)]">
        <Marker n="01" label="Today" sub={formatDay(today.date, { weekday: "long" })} />
        <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-14">
          <div className="col-span-12 lg:col-span-8">
            <h2 id="today-h" className="display-m">Today in the <span className="italic-serif">studio</span></h2>
            <p className="body-copy tone-muted mt-5">
              {waitingRecs > 0 && `${sentence(word(waitingRecs))} recommendation${waitingRecs === 1 ? " is" : "s are"} waiting for your decision.`}
              {today.drafts > 0 && `${waitingRecs > 0 ? " " : ""}${waitingRecs > 0 ? `${sentence(word(today.drafts))} more` : `${sentence(word(today.drafts))} recommendation${today.drafts === 1 ? "" : "s"}`} ${today.drafts === 1 ? "is" : "are"} still in draft.`}
              {waitingRecs === 0 && today.drafts === 0 && "No recommendation is waiting for your decision."}
              {nextAppointment && ` Next up: ${nextAppointment.what}, ${relativeDay(nextAppointment.inDays)}.`}
            </p>
          </div>

          {/* The item that is the next action leads with a strong rule and says so; nothing is listed twice. */}
          <div className="col-span-12 lg:col-span-6">
            <Label>Waiting for your judgement</Label>
            {today.waiting.length === 0 ? (
              <div className="mt-6"><EmptyState title="Nothing to decide.">Recommendations you send for review will wait for you here.</EmptyState></div>
            ) : (
              <ol className="mt-6 border-b border-ink/15">
                {today.waiting.map((w: Waiting, i) => {
                  const c = clientFor(w.slug);
                  const lead = i === 0 && today.next?.kind === "review";
                  const rule = lead ? "border-ink" : "border-ink/15";
                  return w.kind === "recommendation" ? (
                    <li key={w.id} className={`list-none border-t ${rule} py-7`}>
                      {lead && <Label tone="ink" className="mb-3">Start here</Label>}
                      <Status tone="review">{t.status.Review}</Status>
                      <p className="headline mt-3 break-words">{w.title}</p>
                      <p className="meta mt-3">{c.name} · {t.priority[w.priority]}</p>
                      <TextLink href={w.href} className="mt-2 text-sm">Review the direction</TextLink>
                    </li>
                  ) : (
                    <li key={`analysis-${w.slug}`} className={`list-none border-t ${rule} py-7`}>
                      <Status tone="review">Analysis ready</Status>
                      <p className="headline mt-3">{c.name}</p>
                      <p className="meta mt-3">{c.focus} · observations complete, waiting for interpretation</p>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <Label>Coming up</Label>
            {today.upcoming.length === 0 ? (
              <div className="mt-6"><EmptyState title="Nothing is booked.">Fittings and sessions you add will appear here, nearest first.</EmptyState></div>
            ) : (
              <ol className="mt-6">
                {today.upcoming.map((u, i) => {
                  const lead = i === 0 && today.next?.kind === "prepare";
                  const body = (
                    <>
                      {lead && <Label tone="ink" className="mb-3">Start here</Label>}
                      <p className="numeral text-3xl leading-none">{formatDay(u.on, { weekday: "short" })}</p>
                      <p className="label tone-muted mt-2">{relativeDay(u.inDays)}</p>
                      <p className="mt-3 text-sm">{u.href ? <span className="travel">{u.what}</span> : u.what}</p>
                      <p className="meta">{u.who}</p>
                    </>
                  );
                  return (
                    <li key={u.on + u.what} className={`list-none border-t ${lead ? "border-ink" : "border-ink/15"}`}>
                      {u.href ? <Link href={u.href} className="group focus-inset block py-5">{body}</Link> : <div className="py-5">{body}</div>}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ 02 Clients: a roster of portraits, not a table */}
      <section id="clients" aria-labelledby="clients-h" className="pt-[var(--rhythm-md)]">
        <Marker n="02" label="Clients" />
        <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-3">
            <h2 id="clients-h" className="display-m">{sentence(word(studioClients.length))} clients, <span className="italic-serif">{waitingClients === 0 ? "none waiting on you." : `${word(waitingClients)} waiting on you.`}</span></h2>
            <p className="body-copy tone-muted mt-5">
              {today.waiting.length === 0
                ? "Nobody is waiting on you."
                : today.waiting.map((w) => (w.kind === "recommendation" ? `${w.client}’s recommendation is ready for your review.` : `${w.client}’s analysis is complete and waiting for your interpretation.`)).join(" ")}
            </p>
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
                  {status(c) && <Status tone="review" className="mt-3">{status(c)}</Status>}
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

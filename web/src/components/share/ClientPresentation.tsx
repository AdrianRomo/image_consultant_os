import { formatDay } from "@/lib/clock";
import { copy, type Copy } from "@/lib/copy";
import type { ClientView, SharedRecommendation } from "@/lib/share";
import { Portrait } from "../atelier/Portrait";
import { Reveal } from "../atelier/primitives";

/* ------------------------------------------------------------------
   The page a client opens. It renders a ClientView and nothing else: it cannot show what it was not given, and
   it imports no records, no store and no consultant components. Both /share/[slug] and the consultant's preview
   render this same component with the same object, so the preview is the real thing.

   No controls, no status words, no navigation: the client is reading, not operating. Motion is one portrait
   unmask, as elsewhere. Without JavaScript everything is visible.
   ------------------------------------------------------------------ */

export function SharedRecommendationRow({ r, t = copy.en }: { r: SharedRecommendation; t?: Copy }) {
  const s = t.share;
  return (
    <li id={`recommendation-${r.number}`} className="grid list-none grid-cols-[2.5rem_1fr] gap-x-4 border-t border-ink/15 py-9 sm:grid-cols-[3.25rem_1fr]">
      <span className="numeral tone-faint text-4xl leading-none" aria-hidden>{String(r.number).padStart(2, "0")}</span>
      <div className="min-w-0">
        <p className="label tone-muted flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className={r.priority === "High" ? "tone-ink" : ""}>{t.priority[r.priority]}</span>
          {r.forAudience && <span>{t.forAudience(r.forAudience)}</span>}
        </p>
        <h3 className="statement mt-2.5 break-words !text-[clamp(1.6rem,2.7vw,2.4rem)]">{r.title}</h3>
        <dl className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
          <div className="min-w-0 md:col-span-2">
            <dt className="label tone-muted">{s.why}</dt>
            <dd className="body-copy mt-2 break-words">{r.why}</dd>
          </div>
          <div className="min-w-0">
            <dt className="label tone-muted">{s.next}</dt>
            <dd className="mt-2 break-words text-[0.95rem] leading-snug">{r.next}</dd>
          </div>
          <div className="min-w-0">
            <dt className="label tone-muted">{s.helps}</dt>
            <dd className="statement mt-2 !text-[1.6rem]">{r.serves.toLowerCase()}</dd>
          </div>
        </dl>
      </div>
    </li>
  );
}

export function SharedEmpty({ t = copy.en }: { t?: Copy }) {
  return (
    <div className="border-t border-ink/15 py-12">
      <p className="statement max-w-[22ch] !text-[clamp(1.6rem,3vw,2.4rem)]">{t.share.emptyTitle}</p>
      <p className="body-copy tone-muted mt-4">{t.share.emptyBody}</p>
    </div>
  );
}

export function ClientPresentation({ view, t = copy.en }: { view: ClientView; t?: Copy }) {
  const s = t.share;
  const [lead, ...rest] = view.perception.split(/(?<=\.)\s+/);
  const surname = view.name.slice(view.first.length).trim();
  const quote = view.words.quote.replace(/^[“"]|[”"]$/g, "");
  return (
    <main id="main" lang={t.lang} className="mx-auto max-w-[1200px] px-[var(--gutter)] pb-24 pt-8 sm:pt-12">
      <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-ink/15 pb-4">
        <p className="label tone-muted">{s.preparedFor}</p>
        {view.sharedOn && <p className="meta">{s.sharedOn(formatDay(view.sharedOn, { lang: t.lang }))}</p>}
      </header>

      <section aria-labelledby="share-name" className="grid grid-cols-12 gap-x-6 pt-10 sm:pt-16">
        <div className="col-span-12 lg:col-span-6 lg:row-start-1">
          {/* The name is sized to its column, so any first name fits on one line (a container query unit: 1cqw is 1%
              of the column). Seven letters is the reference; a longer name scales down rather than breaking. */}
          <div style={{ containerType: "inline-size" }}>
            <h1 id="share-name" aria-label={view.name} className="name" style={{ fontSize: `min(9.5rem, ${(136 / Math.max(7, view.first.length)).toFixed(2)}cqw)` }}>
              <span className="block break-words uppercase">{view.first}</span>
              {surname && <span className="italic-serif block break-words pl-[0.5em] normal-case">{surname}</span>}
            </h1>
          </div>
          <p className="label tone-muted mt-10">{s.working}</p>
          <p className="statement mt-3" style={{ fontSize: "clamp(2rem, 3.4vw, 3rem)" }}>{lead}</p>
          {rest.length > 0 && <p className="lede mt-3">{rest.join(" ")}</p>}
        </div>
        <div className="col-span-12 mt-12 sm:col-span-6 sm:col-start-4 lg:col-span-5 lg:col-start-8 lg:mt-0">
          <Reveal mask className="w-full">
            <Portrait subject="today" priority sizes="(min-width: 1024px) 40vw, 80vw" />
          </Reveal>
        </div>
      </section>

      <figure className="mt-[var(--rhythm-md)] grid grid-cols-12 gap-x-6">
        <blockquote className="col-span-12 m-0 lg:col-span-9 lg:col-start-2">
          <p className="statement break-words" style={{ fontSize: "clamp(1.9rem, 3.6vw, 3.25rem)" }}>“{quote}”</p>
          <figcaption className="label tone-muted mt-5">{s.words} · {view.words.source}</figcaption>
        </blockquote>
      </figure>

      <section aria-labelledby="share-recommendations" className="pt-[var(--rhythm-md)]">
        <h2 id="share-recommendations" className="display-m" style={{ fontSize: "clamp(2.1rem, 4vw, 3.4rem)" }}>{s.heading}</h2>
        <div className="mt-10">
          {view.recommendations.length === 0 ? (
            <SharedEmpty t={t} />
          ) : (
            <ol className="border-b border-ink/15">
              {view.recommendations.map((r) => <SharedRecommendationRow key={r.id} r={r} t={t} />)}
            </ol>
          )}
        </div>
      </section>

      <footer className="pt-14"><p className="meta max-w-[62ch]">{s.footnote}</p></footer>
    </main>
  );
}

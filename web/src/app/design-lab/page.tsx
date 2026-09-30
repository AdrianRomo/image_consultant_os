import type { ReactNode } from "react";
import { Portrait, PortraitPlaceholder } from "@/components/atelier/Portrait";
import { Label, Marker, Spectrum } from "@/components/atelier/primitives";
import { AnnotationDemo, ControlsDemo, MotionDemo, OverlaysDemo, PatternsDemo, StatesDemo } from "@/components/lab/LabDemos";
import { contrast, grade } from "@/lib/color";
import { season } from "@/lib/atelier";
import { Button } from "@/components/atelier/ui/controls";

export const metadata = { title: "Design lab" };

/* The canonical visual reference. Everything on this page is the code the product runs:
   the same tokens, the same controls, the same dossier components. Nothing is redrawn for show. */

const palette = [
  { name: "Ivory", token: "--ivory", hex: "#f5f1e8", role: "The ground. Most of the product lives here." },
  { name: "Paper", token: "--paper", hex: "#efe9dc", role: "Sunken plates: garments, placeholders." },
  { name: "Stone", token: "--stone", hex: "#e2dac9", role: "Selection wash in menus." },
  { name: "Taupe", token: "--taupe", hex: "#a99b86", role: "Secondary text on ink only." },
  { name: "Warm gray", token: "--warm-gray", hex: "#6b6357", role: "Muted text on ivory and paper." },
  { name: "Faint", token: "--faint", hex: "#857a68", role: "Large decorative numerals only." },
  { name: "Charcoal", token: "--charcoal", hex: "#2d2a26", role: "Body text." },
  { name: "Ink", token: "--ink", hex: "#171512", role: "Type, rules, the inverse ground." },
  { name: "Cordovan", token: "--cordovan", hex: "#7a3324", role: "Meaning only: review, selection, focus, error." },
  { name: "Olive", token: "--olive", hex: "#5d6238", role: "Meaning only: saved, approved." },
];

const semantic = [
  { token: "--text", fg: "#171512", bg: "#f5f1e8", use: "Headings, controls", large: false },
  { token: "--text-body", fg: "#2d2a26", bg: "#f5f1e8", use: "Reading text", large: false },
  { token: "--text-muted", fg: "#6b6357", bg: "#f5f1e8", use: "Metadata, labels", large: false },
  { token: "--text-muted", fg: "#6b6357", bg: "#efe9dc", use: "Metadata on paper", large: false },
  { token: "--text-faint", fg: "#857a68", bg: "#f5f1e8", use: "Decorative numerals ≥ 24px", large: true },
  { token: "--accent", fg: "#7a3324", bg: "#f5f1e8", use: "Review, selection, error text", large: false },
  { token: "--positive", fg: "#5d6238", bg: "#f5f1e8", use: "Saved, approved text", large: false },
  { token: "--text-on-inverse", fg: "#f5f1e8", bg: "#171512", use: "Text on ink", large: false },
  { token: "--text-on-inverse-muted", fg: "#a99b86", bg: "#171512", use: "Secondary text on ink", large: false },
];

const scale: { cls: string; name: string; sample: string; spec: string; use: string; size?: string }[] = [
  { cls: "display-xl", name: "Display XL", sample: "Your image,", spec: "Cormorant 300 · uppercase · 3.4–10rem · lh 0.88 · −0.02em", use: "The opening statement of a page. Rare.", size: "clamp(2.5rem,7vw,6rem)" },
  { cls: "name", name: "Name", sample: "Marisol", spec: "Cormorant 300 · min(13.2vw, 21svh), 4.25–13rem · lh 0.86 · −0.028em", use: "A client’s name, once per dossier, interlocking with the portrait.", size: "clamp(3rem,7vw,6rem)" },
  { cls: "display-l", name: "Display L", sample: "Autumn / soft", spec: "Cormorant 300 · 3–8rem · lh 0.95 · −0.015em", use: "Page and chapter titles.", size: "clamp(2.5rem,6vw,5rem)" },
  { cls: "display-m", name: "Display M", sample: "Three things I noticed.", spec: "Cormorant 400 · 2.1–4.25rem · lh 1.02", use: "Chapter statements and drawer titles." },
  { cls: "statement", name: "Statement", sample: "Decisive and warm.", spec: "Cormorant 300 italic · 1.9–3.5rem · lh 1.12", use: "Perceptions, conclusions, quotations." },
  { cls: "headline", name: "Headline", sample: "Soft tailoring dilutes authority", spec: "Cormorant 400 · 1.6–2.25rem · lh 1.1", use: "The name of a thing in a list." },
  { cls: "lede", name: "Lede", sample: "Someone the board trusts with hard calls and the team trusts to hear them out.", spec: "Inter 400 · 1–1.15rem · lh 1.65 · 34ch", use: "An introduction." },
  { cls: "body-copy", name: "Body", sample: "A defined shoulder line does the work her voice already does. It gives the eye a place to rest.", spec: "Inter 400 · 0.95rem · lh 1.7 · 52ch", use: "Reading and notes." },
  { cls: "label", name: "Label", sample: "Interpretation · Nonverbal", spec: "Inter 500 · 12px · 0.16em · uppercase", use: "Labels, controls, statuses. Never smaller." },
  { cls: "meta", name: "Meta", sample: "Noted · Session 2 · 12 March", spec: "Inter 400 · 0.8125rem · warm gray", use: "Attribution and hints." },
  { cls: "numeral", name: "Numeral", sample: "01  02  03  Fig. 04", spec: "Cormorant italic 300 · lining figures", use: "Chapter numbers and figure captions.", size: "clamp(1.75rem,3vw,2.5rem)" },
];

function Section({ n, label, title, intro, children }: { n: string; label: string; title: ReactNode; intro?: ReactNode; children: ReactNode }) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="pt-[var(--rhythm-md)]">
      <Marker n={n} label={label} />
      <div className="mt-12 grid grid-cols-12 gap-x-6">
        <div className="col-span-12 lg:col-span-8">
          <h2 id={`${id}-h`} className="display-m" style={{ fontSize: "clamp(2rem,4vw,3.25rem)" }}>{title}</h2>
          {intro && <p className="lede mt-5" style={{ maxWidth: "52ch" }}>{intro}</p>}
        </div>
      </div>
      <div className="mt-14">{children}</div>
    </section>
  );
}

export default function DesignLab() {
  const toc = ["Principles", "Typography", "Colour", "Space and rules", "Motion", "Controls", "Photography", "Patterns", "Navigation", "Overlays", "States", "Focus", "Accessibility"];
  return (
    <main id="main" className="mx-auto max-w-[1600px] px-[var(--gutter)] pb-10 pt-[calc(var(--header-h)+2.5rem)]">
      <header>
        <Label>Reference · the same code the product runs</Label>
        <h1 className="display-l mt-5 uppercase">Design <span className="italic-serif normal-case">lab</span></h1>
        <p className="lede mt-8">A private luxury editorial experience that happens to contain extremely capable software. This page is where that sentence becomes rules.</p>
        <nav aria-label="Sections" className="mt-10 flex flex-wrap gap-x-7 gap-y-1">
          {toc.map((t, i) => (
            <a key={t} href={`#${t.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="label tone-muted tap inline-flex items-center py-2 hover:text-ink">
              <span className="numeral mr-1.5 text-sm normal-case tracking-normal">{String(i + 1).padStart(2, "0")}</span><span className="travel pb-0.5">{t}</span>
            </a>
          ))}
        </nav>
      </header>

      {/* 01 ------------------------------------------------------------ */}
      <Section n="01" label="Principles" title={<>Restraint first, <span className="italic-serif">then one surprise.</span></>} intro="Roughly 80% restraint, 15% expressive editorial design, 5% magic. If removing an effect makes the interface stronger, remove it.">
        <ol className="grid gap-x-8 gap-y-2 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Typography carries identity.", "Display serif for people and conclusions. Quiet Inter for everything you operate."],
            ["Whitespace is a material.", "Rhythm changes between movements, chapters and details. Nothing tries to fill the viewport."],
            ["Photography is a primitive.", "Two ratios, one finish, never an avatar. The portrait is the context, not decoration."],
            ["Software recedes.", "Rules and alignment before boxes. Motion only for continuity, hierarchy, feedback and space."],
          ].map(([h, b], i) => (
            <li key={h} className="list-none border-t border-ink/15 py-6">
              <span className="numeral tone-faint text-4xl">{["i", "ii", "iii", "iv"][i]}.</span>
              <h3 className="headline mt-3">{h}</h3>
              <p className="body-copy mt-3">{b}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 02 ------------------------------------------------------------ */}
      <Section n="02" label="Typography" title={<>Two voices, <span className="italic-serif">used sparingly.</span></>} intro="Cormorant Garamond speaks about people and conclusions. Inter carries labels, forms and metadata. Hierarchy comes from family, scale, italic and whitespace, never from making things bold.">
        <ul>
          {scale.map((s) => (
            <li key={s.cls} className="grid grid-cols-12 items-baseline gap-x-6 gap-y-3 border-t border-ink/15 py-8">
              <div className="col-span-12 md:col-span-4">
                <p className="label tone-ink">{s.name}</p>
                <p className="meta mt-1">.{s.cls}</p>
                <p className="meta mt-3 max-w-[34ch]">{s.spec}</p>
                <p className="meta tone-body mt-1 max-w-[34ch]">{s.use}</p>
              </div>
              <div className="col-span-12 md:col-span-8">
                <p className={s.cls} style={s.size ? { fontSize: s.size } : undefined}>
                  {s.cls === "display-xl" || s.cls === "name" ? <>{s.sample} <span className="italic-serif normal-case">considered.</span></> : s.sample}
                </p>
              </div>
            </li>
          ))}
          <li className="border-t border-ink/15" />
        </ul>
        <div className="mt-10 grid gap-x-8 gap-y-6 md:grid-cols-3">
          <p className="body-copy"><span className="label tone-ink block">Emphasis</span>Italic inside roman, never bold. <span className="italic-serif">More structure around the shoulders.</span></p>
          <p className="body-copy"><span className="label tone-ink block">Measure</span>Reading text stops at 52 characters; introductions at 34. Headings balance their lines; paragraphs avoid orphans.</p>
          <p className="body-copy"><span className="label tone-ink block">Spanish</span>Allow about 25% more length. Test at /design-lab#patterns with real Spanish strings.</p>
        </div>
      </Section>

      {/* 03 ------------------------------------------------------------ */}
      <Section n="03" label="Colour" title={<>Ivory and ink. <span className="italic-serif">Accent means something.</span></>} intro="Cordovan and olive never decorate. They appear only where a status, a selection, focus or an error needs them. Contrast below is computed from the hex values shown.">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-5">
          {palette.map((p) => (
            <li key={p.token} className="list-none">
              <div className="aspect-[3/4] w-full border border-ink/10" style={{ background: p.hex }} />
              <p className="label tone-ink mt-3">{p.name}</p>
              <p className="meta">{p.hex}</p>
              <p className="meta mt-1">{p.role}</p>
            </li>
          ))}
        </ul>
        <div className="mt-16 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <caption className="label tone-muted pb-4 text-left">Semantic tokens and their contrast</caption>
            <thead>
              <tr className="border-t border-ink/15">
                {["Token", "Specimen", "Ratio", "WCAG"].map((h) => <th key={h} scope="col" className="label tone-muted py-3 pr-6 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {semantic.map((r, i) => {
                const ratio = contrast(r.fg, r.bg);
                const g = grade(ratio, r.large);
                return (
                  <tr key={i} className="border-t border-ink/15">
                    <th scope="row" className="py-4 pr-6 text-left align-baseline"><code className="text-sm">{r.token}</code><span className="meta block">{r.use}</span></th>
                    <td className="py-4 pr-6"><span className="inline-block px-3 py-1.5 text-lg" style={{ background: r.bg, color: r.fg, border: "1px solid rgb(23 21 18 / 0.1)" }}>Quiet authority</span></td>
                    <td className="numeral py-4 pr-6 text-2xl">{ratio.toFixed(2)}</td>
                    <td className="py-4"><span className={`label ${g === "Fails" || g === "Large text only" ? "tone-accent" : "tone-positive"}`}>{g}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-16 grid max-w-lg gap-8 sm:grid-cols-3">
          {season.measures.map((m) => <Spectrum key={m.label} {...m} />)}
        </div>
        <p className="meta mt-4">Even her colour analysis is a position on a spectrum, not a score. Where a number is needed it is named for what it is.</p>
      </Section>

      {/* 04 ------------------------------------------------------------ */}
      <Section n="04" label="Space and rules" title={<>Rhythm <span className="italic-serif">before boxes.</span></>} intro="Three rhythm tokens separate movements, chapters and the parts of a chapter, so the page breathes unevenly on purpose. Hairlines organise; boxes are the exception, not the tool.">
        <div className="grid grid-cols-12 gap-x-6 gap-y-12">
          <ul className="col-span-12 flex items-end gap-x-14 lg:col-span-5">
            {[["--rhythm-lg", "Between movements", "5–12rem"], ["--rhythm-md", "Between chapters", "3.5–8rem"], ["--rhythm-sm", "Within a chapter", "2.5–4.5rem"]].map(([t, n, r]) => (
              <li key={t} className="list-none">
                <div className="w-px bg-ink" style={{ height: `var(${t})` }} />
                <p className="label tone-ink mt-3">{n}</p>
                <p className="meta"><code>{t}</code> · {r}</p>
              </li>
            ))}
          </ul>
          <div className="col-span-12 lg:col-span-7">
            <p className="label tone-muted">12 columns · 24px gutter · page margin clamp(1.25rem, 4vw, 3.5rem)</p>
            <div className="mt-3 grid grid-cols-12 gap-x-6" aria-hidden>{Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-16 bg-paper" />)}</div>
            <div className="mt-10 space-y-6">
              <div><p className="meta">Hairline · <code>border-ink/15</code> · lists and groups</p><div className="mt-2 border-t border-ink/15" /></div>
              <div><p className="meta">Strong rule · <code>border-ink</code> · the start of a group that leads (audiences)</p><div className="mt-2 border-t border-ink" /></div>
              <div><p className="meta">Chapter marker · draws once when reached</p><Marker n="05" label="Colour" sub="Palette" className="mt-3" /></div>
            </div>
          </div>
        </div>
        <p className="body-copy mt-12">Radius is 2px, on controls only. Circles are reserved for swatches and portrait markers. No shadows, no gradients on the page; photographs share one grain-and-falloff finish.</p>
      </Section>

      {/* 05 ------------------------------------------------------------ */}
      <Section n="05" label="Motion" title={<>Four durations. <span className="italic-serif">Nothing ambient.</span></>} intro="Motion communicates continuity, hierarchy, feedback or spatial relationship. There is no scroll-triggered fade-up and no looping animation anywhere in the product.">
        <MotionDemo />
      </Section>

      {/* 06 ------------------------------------------------------------ */}
      <Section n="06" label="Controls" title={<>Native elements, <span className="italic-serif">restyled once.</span></>} intro="Buttons, fields, select, filter, tabs and status are the same components the client dossier, wardrobe and looks use.">
        <ControlsDemo />
      </Section>

      {/* 07 ------------------------------------------------------------ */}
      <Section n="07" label="Photography" title={<>A person, <span className="italic-serif">not an avatar.</span></>} intro="Two ratios only: portrait 4:5 and landscape 16:10. One finish. Photographs are large enough to be looked at, and they take part in the layout. These are example photographs of a fictional client; a consented photograph drops in without changing anything.">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <figure className="col-span-6 m-0 md:col-span-3"><Portrait subject="today" sizes="(min-width: 768px) 22vw, 46vw" /><figcaption className="label tone-muted mt-3">4:5 · today</figcaption></figure>
          <figure className="col-span-6 m-0 md:col-span-3"><Portrait subject="direction" sizes="(min-width: 768px) 22vw, 46vw" /><figcaption className="label tone-muted mt-3">4:5 · a reference for the direction</figcaption></figure>
          <figure className="col-span-6 m-0 md:col-span-3"><PortraitPlaceholder initials="LH" name="Lucía Herrera" /><figcaption className="label tone-muted mt-3">No portrait yet</figcaption></figure>
          <figure className="col-span-12 m-0 md:col-span-3 md:self-end"><Portrait subject="direction" ratio="landscape" sizes="(min-width: 768px) 22vw, 92vw" /><figcaption className="label tone-muted mt-3">16:10 · the collar and lapel</figcaption></figure>
        </div>
        <div className="mt-12 grid gap-x-10 gap-y-6 md:grid-cols-3">
          <p className="body-copy"><span className="label tone-ink block">The grade</span>Every photograph is tone-mapped so its black point is the page’s ink and its white point is ivory, then eased in saturation. It sits inside the palette instead of beside it. Any new photograph gets the same treatment (<code>docs/IMAGE_CREDITS.md</code>).</p>
          <p className="body-copy"><span className="label tone-ink block">The finish</span>A fine grain and a soft falloff at the edges, applied in CSS (<code>.photo</code>), so every image looks like it belongs to the same shoot.</p>
          <p className="body-copy"><span className="label tone-ink block">Honesty</span>A reference is never shown as her result. The comparison says <em>Today</em> and <em>Reference</em>. Never infer character or confidence from appearance.</p>
        </div>
        <div className="mt-20"><Label>Annotation</Label><div className="mt-6"><AnnotationDemo /></div></div>
      </Section>

      {/* 08 ------------------------------------------------------------ */}
      <Section n="08" label="Patterns" title={<>Observations and advice, <span className="italic-serif">in two languages.</span></>} intro="The consultant’s judgment is the content. Recommendations are numbered editorial rows: what to change, the next action, and a quiet line of context. Try Spanish and long copy.">
        <PatternsDemo />
      </Section>

      {/* 09 ------------------------------------------------------------ */}
      <Section n="09" label="Navigation" title={<>The software recedes. <span className="italic-serif">The client is the context.</span></>} intro="Outside a client, a quiet header with four places and search. Inside one, the shell steps aside: one way back, her name, a chapter rail on wide screens and a chapter picker on small ones. Below, the real routes at 390px.">
        <div className="flex flex-wrap items-start gap-x-10 gap-y-10">
          {[["/", "Studio"], ["/clients/marisol", "Client dossier"]].map(([src, t]) => (
            <figure key={src} className="m-0">
              <iframe src={src} title={`${t} at 390 pixels`} loading="lazy" className="block border border-ink/20 bg-ivory" style={{ width: 390, height: 760, maxWidth: "100%" }} />
              <figcaption className="label tone-muted mt-3">{t} · 390 × 760</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* 10 ------------------------------------------------------------ */}
      <Section n="10" label="Overlays" title={<>Drawers and dialogs, <span className="italic-serif">native and quiet.</span></>}>
        <OverlaysDemo />
      </Section>

      {/* 11 ------------------------------------------------------------ */}
      <Section n="11" label="States" title={<>Empty, saved, failed, <span className="italic-serif">still in voice.</span></>} intro="Every state speaks like the rest of the product: first person, calm, specific about what to do next.">
        <StatesDemo />
      </Section>

      {/* 12 ------------------------------------------------------------ */}
      <Section n="12" label="Focus" title={<>Always visible, <span className="italic-serif">never loud.</span></>} intro="A 2px cordovan ring with a 3px offset on ivory; ivory on ink. Fields thicken their underline instead of ringing the box. Rows and images that are entirely links use an inset ring.">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
          <a href="#focus" className="label tone-ink is-focus inline-block py-2">Link</a>
          <Button className="is-focus">Button</Button>
          <div className="w-64"><input aria-label="Field specimen" className="field-input is-focus" defaultValue="Field" /></div>
        </div>
        <div className="on-dark -mx-[var(--gutter)] mt-10 bg-ink px-[var(--gutter)] py-8"><a href="#focus" className="label tone-inverse is-focus inline-block py-2">On ink</a></div>
      </Section>

      {/* 13 ------------------------------------------------------------ */}
      <Section n="13" label="Accessibility" title={<>Beauty may not <span className="italic-serif">cost usability.</span></>}>
        <ul className="grid gap-x-10 gap-y-3 md:grid-cols-2">
          {[
            "Every interactive element is reachable and operable by keyboard; focus is always visible.",
            "Touch targets are 44px or larger on coarse pointers. Portrait markers grow their hit area without growing their look.",
            "Status is never colour alone: each has a glyph and words, at every width.",
            "Text contrast is computed above. Decorative numerals below 4.5:1 are marked large-only and aria-hidden.",
            "prefers-reduced-motion removes transforms, reveals and view transitions. State changes stay instant and legible.",
            "Forms have programmatic labels; errors are announced and tied to their field.",
            "Portraits carry alternatives; decorative crops are hidden from assistive technology.",
            "Spanish and long English copy are exercised in Patterns. A dictionary, not stretched English, supplies the Spanish labels.",
          ].map((t) => <li key={t} className="list-none border-t border-ink/15 py-4 text-[0.95rem] leading-relaxed">{t}</li>)}
        </ul>
        <p className="meta mt-6">Not yet done: a screen-reader pass, Safari and Firefox checks, real-device touch testing.</p>
      </Section>
    </main>
  );
}

"use client";
import Link from "next/link";
import {
  useId, useRef,
  type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from "react";

/* ------------------------------------------------------------------
   Controls. Native elements, restyled once, used everywhere.
   Nothing here depends on a component library, so the identity cannot
   drift toward a library default. Shown live at /design-lab.
   ------------------------------------------------------------------ */

/* ---------------- Button ---------------- */
type Variant = "outline" | "solid" | "quiet";
const variantClass: Record<Variant, string> = { outline: "", solid: "btn-solid", quiet: "btn-quiet" };

export function Button({
  variant = "outline", busy, className = "", type = "button", children, ...rest
}: { variant?: Variant; busy?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} aria-busy={busy || undefined} className={`btn ${variantClass[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href, variant = "outline", className = "", children,
}: { href: string; variant?: Variant; className?: string; children: ReactNode }) {
  return <Link href={href} className={`btn ${variantClass[variant]} ${className}`}>{children}</Link>;
}

/* ---------------- Status ----------------
   Meaning is never carried by colour alone: every status has a glyph shape and words. */
export type StatusTone = "review" | "draft" | "approved" | "published" | "private" | "success" | "error" | "neutral";
const tones: Record<StatusTone, { cls: string; glyph: ReactNode }> = {
  review: { cls: "tone-accent", glyph: <circle cx="5" cy="5" r="3" fill="currentColor" /> },
  draft: { cls: "tone-muted", glyph: <circle cx="5" cy="5" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.2" /> },
  approved: { cls: "tone-positive", glyph: <path d="M1.5 5.4 4 7.8 8.6 2.4" fill="none" stroke="currentColor" strokeWidth="1.4" /> },
  // Workflow states are circles and a tick; who-can-see-it states are squares. Shapes differ as well as words.
  published: { cls: "tone-ink", glyph: <rect x="2" y="2" width="6" height="6" fill="currentColor" /> },
  private: { cls: "tone-muted", glyph: <rect x="2.6" y="2.6" width="4.8" height="4.8" fill="none" stroke="currentColor" strokeWidth="1.2" /> },
  success: { cls: "tone-positive", glyph: <path d="M1.5 5.4 4 7.8 8.6 2.4" fill="none" stroke="currentColor" strokeWidth="1.4" /> },
  error: { cls: "tone-accent", glyph: <path d="M5 1.6v4M5 7.6v.6" fill="none" stroke="currentColor" strokeWidth="1.6" /> },
  neutral: { cls: "tone-muted", glyph: null },
};
export function Status({ tone = "neutral", children, className = "" }: { tone?: StatusTone; children: ReactNode; className?: string }) {
  const t = tones[tone];
  return (
    <span className={`label inline-flex items-center gap-2 whitespace-nowrap ${t.cls} ${className}`}>
      {t.glyph && <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="shrink-0">{t.glyph}</svg>}
      {children}
    </span>
  );
}

/* ---------------- Field, TextArea, SelectField ---------------- */
type Feedback = { hint?: string; error?: string; success?: string };

function Shell({
  id, label, hideLabel, hint, error, success, children,
}: { id: string; label: string; hideLabel?: boolean } & Feedback & {
  children: (a: { id: string; "aria-describedby"?: string; "aria-invalid"?: true }) => ReactNode;
}) {
  const hintId = `${id}-hint`, errId = `${id}-err`, okId = `${id}-ok`;
  const described = [error ? errId : hint ? hintId : null, !error && success ? okId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "label tone-muted block"}>{label}</label>
      <div className={hideLabel ? "" : "mt-1"}>{children({ id, "aria-describedby": described, "aria-invalid": error ? true : undefined })}</div>
      {error && <p id={errId} role="alert" className="meta tone-accent mt-2"><span aria-hidden className="mr-1.5">!</span>{error}</p>}
      {!error && success && <p id={okId} role="status" className="meta tone-positive mt-2"><span aria-hidden className="mr-1.5">✓</span>{success}</p>}
      {!error && !success && hint && <p id={hintId} className="meta mt-2">{hint}</p>}
    </div>
  );
}

export function Field({
  label, hideLabel, hint, error, success, className = "", id, ...rest
}: { label: string; hideLabel?: boolean } & Feedback & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  return (
    <Shell id={id ?? auto} label={label} hideLabel={hideLabel} hint={hint} error={error} success={success}>
      {(a) => <input {...a} className={`field-input ${success && !error ? "is-valid" : ""} ${className}`} {...rest} />}
    </Shell>
  );
}

export function TextArea({
  label, hideLabel, hint, error, success, className = "", id, rows = 3, ...rest
}: { label: string; hideLabel?: boolean } & Feedback & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  return (
    <Shell id={id ?? auto} label={label} hideLabel={hideLabel} hint={hint} error={error} success={success}>
      {(a) => <textarea {...a} rows={rows} className={`field-input resize-y ${success && !error ? "is-valid" : ""} ${className}`} {...rest} />}
    </Shell>
  );
}

export function SelectField({
  label, hideLabel, hint, error, success, className = "", id, children, ...rest
}: { label: string; hideLabel?: boolean } & Feedback & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  return (
    <Shell id={id ?? auto} label={label} hideLabel={hideLabel} hint={hint} error={error} success={success}>
      {(a) => <select {...a} className={`field-input ${className}`} {...rest}>{children}</select>}
    </Shell>
  );
}

/* ---------------- Filter ----------------
   A group of toggle buttons that changes what a region shows (all / this / that). */
export function Filter<T extends string>({
  label, items, value, onChange, className = "",
}: {
  label: string; value: T; onChange: (v: T) => void; className?: string;
  items: { id: T; label: string; count?: number }[];
}) {
  return (
    <div role="group" aria-label={label} className={`flex flex-wrap gap-x-7 gap-y-1 ${className}`}>
      {items.map((it) => {
        const on = it.id === value;
        return (
          <button
            key={it.id} type="button" onClick={() => onChange(it.id)} aria-pressed={on}
            className={`label tap py-2.5 ${on ? "tone-ink" : "tone-muted hover:text-ink"}`}
          >
            <span className={`travel pb-0.5 ${on ? "travel-static" : ""}`}>{it.label}</span>
            {it.count !== undefined && <span className="numeral tone-muted ml-1.5 text-sm normal-case tracking-normal">{it.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Tabs ----------------
   Real tabs: one tablist, one panel, arrow keys, Home and End. Activation follows focus. */
export function Tabs<T extends string>({
  label, items, value, onChange, children, className = "",
}: {
  label: string; value: T; onChange: (v: T) => void; children: ReactNode; className?: string;
  items: { id: T; label: string; mark?: boolean }[];
}) {
  const base = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const move = (to: number) => {
    const next = items[(to + items.length) % items.length];
    onChange(next.id);
    refs.current[next.id]?.focus();
  };
  return (
    <div className={className}>
      <div
        role="tablist" aria-label={label}
        className="flex flex-wrap gap-x-7 gap-y-1 border-t border-ink/15 pt-3"
        onKeyDown={(e) => {
          const i = items.findIndex((t) => t.id === value);
          if (e.key === "ArrowRight") { e.preventDefault(); move(i + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); move(i - 1); }
          if (e.key === "Home") { e.preventDefault(); move(0); }
          if (e.key === "End") { e.preventDefault(); move(items.length - 1); }
        }}
      >
        {items.map((it) => {
          const on = it.id === value;
          return (
            <button
              key={it.id} ref={(el) => { refs.current[it.id] = el; }} type="button" role="tab"
              id={`${base}-tab-${it.id}`} aria-selected={on} aria-controls={`${base}-panel`} tabIndex={on ? 0 : -1}
              onClick={() => onChange(it.id)}
              className={`label tap py-2.5 ${on ? "tone-ink" : "tone-muted hover:text-ink"}`}
            >
              <span className={`travel pb-0.5 ${on ? "travel-static" : ""}`}>{it.label}</span>
              {it.mark && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-cordovan align-middle" role="img" aria-label="has a choice" />}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${value}`}>{children}</div>
    </div>
  );
}

/* ---------------- Skeleton, EmptyState, Notice ---------------- */
export function Skeleton({ className = "", label }: { className?: string; label?: string }) {
  return <div className={`skeleton ${className}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="border-t border-ink/15 py-12">
      <p className="statement !text-[clamp(1.6rem,3vw,2.4rem)] max-w-[22ch]">{title}</p>
      {children && <p className="body-copy tone-muted mt-4">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "neutral", title, children }: { tone?: "neutral" | "error" | "success"; title: string; children?: ReactNode }) {
  const status: StatusTone = tone === "error" ? "error" : tone === "success" ? "success" : "neutral";
  return (
    <div role={tone === "error" ? "alert" : "status"} className="border-l border-ink py-1 pl-5">
      <Status tone={status}>{title}</Status>
      {children && <p className="body-copy mt-2">{children}</p>}
    </div>
  );
}

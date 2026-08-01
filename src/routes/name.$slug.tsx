import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Globe, Heart, Copy, Check, Share2, Sparkles } from "lucide-react";
import { nameData, type BabyName } from "@/lib/baby-names";
import { Button } from "@/components/ui/button";

type NameSearch = {
  n: string;
  m: string;
  o: string;
  g: string;
  p: number;
  pr: string;
};

function str(v: unknown) {
  return typeof v === "string" ? v : "";
}

export function slugifyName(name: string, id: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${id}`;
}

function findBySlug(slug: string): BabyName | null {
  const id = slug.split("-").pop() ?? "";
  const byId = nameData.find((n) => n.id === id);
  if (byId) return byId;
  const base = slug.replace(/-\d+$/, "").replace(/-/g, " ");
  return nameData.find((n) => n.name.toLowerCase() === base) ?? null;
}

export const Route = createFileRoute("/name/$slug")({
  validateSearch: (search: Record<string, unknown>): NameSearch => ({
    n: str(search.n),
    m: str(search.m),
    o: str(search.o),
    g: str(search.g),
    p: Number(search.p) || 0,
    pr: str(search.pr),
  }),
  head: ({ params }) => {
    const found = findBySlug(params.slug);
    const label = found
      ? `${found.name} — ${found.meaning}`
      : "Baby name — NaamSutra";
    const desc = found
      ? `${found.name} is a ${found.gender === "unisex" ? "unisex" : found.gender} name of ${found.origin} origin meaning "${found.meaning}". Discover more baby names on NaamSutra.`
      : "Discover this baby name with meaning, origin and popularity on NaamSutra.";
    return {
      meta: [
        { title: `${label} | NaamSutra` },
        { name: "description", content: desc },
        { property: "og:title", content: label },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: NameSharePage,
});

function NameSharePage() {
  const { slug } = Route.useParams();
  const s = Route.useSearch();
  const [copied, setCopied] = useState<"link" | "text" | null>(null);

  const curated = findBySlug(slug);
  const name = curated
    ? {
        name: curated.name,
        meaning: curated.meaning,
        origin: curated.origin,
        gender: curated.gender as string,
        popularity: curated.popularity,
        pronunciation: "",
        tags: curated.tags,
      }
    : s.n
      ? {
          name: s.n,
          meaning: s.m,
          origin: s.o || "Mixed",
          gender: s.g || "unisex",
          popularity: s.p,
          pronunciation: s.pr,
          tags: [] as string[],
        }
      : null;

  if (!name) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Name not found</h1>
        <p className="mt-3 text-muted-foreground">
          This shared link doesn’t match any name in our collection.
        </p>
        <Link to="/">
          <Button className="mt-6 gap-2 rounded-full bg-sage text-white hover:bg-sage-dark">
            <ArrowLeft className="h-4 w-4" /> Explore baby names
          </Button>
        </Link>
      </div>
    );
  }

  const genderLabel =
    name.gender === "boy" ? "Boy" : name.gender === "girl" ? "Girl" : "Unisex";
  const genderColor =
    name.gender === "boy"
      ? "bg-sky-light text-sky"
      : name.gender === "girl"
        ? "bg-rose-light text-rose"
        : "bg-sage-light text-sage-dark";

  const copyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard?.writeText(url);
    setCopied("link");
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to NaamSutra
      </Link>

      <div className="mt-6 rounded-3xl border border-border/50 bg-card p-7 shadow-sm sm:p-10">
        <div className="flex items-center gap-2 text-sage">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-widest">Shared baby name</span>
        </div>
        <h1 className="mt-3 font-display text-5xl font-bold text-foreground">{name.name}</h1>
        {name.pronunciation && (
          <p className="mt-1 text-sm italic text-muted-foreground">/{name.pronunciation}/</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${genderColor}`}>
            {genderLabel}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
            <Globe className="h-3.5 w-3.5" />
            {name.origin}
          </span>
        </div>

        <div className="mt-6 rounded-2xl bg-cream p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Meaning</h2>
          <p className="mt-2 font-display text-2xl text-foreground">{name.meaning}</p>
        </div>

        {name.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {name.tags.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Popularity</h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-sage" style={{ width: `${name.popularity}%` }} />
            </div>
            <span className="text-sm font-semibold text-foreground">{name.popularity}/100</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={copyLink} variant="outline" className="flex-1 gap-2 rounded-full">
            {copied === "link" ? <Check className="h-4 w-4 text-sage" /> : <Copy className="h-4 w-4" />}
            {copied === "link" ? "Link copied" : "Copy link"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2 rounded-full"
            onClick={() => {
              const url = typeof window !== "undefined" ? window.location.href : "";
              const text = `${name.name} — ${name.meaning}`;
              if (navigator.share) navigator.share({ title: name.name, text, url }).catch(() => {});
              else navigator.clipboard?.writeText(`${text} ${url}`);
            }}
          >
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Link to="/" className="flex-1">
            <Button className="w-full gap-2 rounded-full bg-sage text-white hover:bg-sage-dark">
              <Heart className="h-4 w-4" /> Find more names
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

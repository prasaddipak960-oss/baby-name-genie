export function slugifyName(name: string, id: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base}-${id}`;
}

export function curatedShareUrl(name: { name: string; id: string }) {
  const path = `/name/${slugifyName(name.name, name.id)}`;
  return typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
}

export function generatedShareUrl(n: {
  name: string;
  meaning: string;
  origin: string;
  gender: string;
  popularity: number;
  pronunciation?: string;
}) {
  const slug = n.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const params = new URLSearchParams({
    n: n.name,
    m: n.meaning,
    o: n.origin,
    g: n.gender,
    p: String(n.popularity),
    pr: n.pronunciation ?? "",
  });
  const path = `/name/${slug}-ai?${params.toString()}`;
  return typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
}

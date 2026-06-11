import {
  Heart,
  Search,
  Shuffle,
  Baby,
  Sparkles,
  Bookmark,
  X,
  Filter,
  Star,
  Globe,
  ArrowRight,
} from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { nameData, type BabyName, origins } from "@/lib/baby-names";
import { SurpriseWizard, type GenName } from "@/components/SurpriseWizard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NaamSutra - Baby Name Generator" },
      {
        name: "description",
        content:
          "Discover the perfect baby name. Explore 200+ curated names with meanings, origins, and save your favorites.",
      },
      { property: "og:title", content: "NaamSutra - Baby Name Generator" },
      {
        property: "og:description",
        content:
          "Find beautiful baby names from around the world. Filter by meaning, origin, gender, and more.",
      },
    ],
  }),
  component: BabyNameGenerator,
});

// --- Local Storage Hook ---
function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [genFavorites, setGenFavorites] = useState<GenName[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem("babyNameFavorites") || "[]"));
      setGenFavorites(JSON.parse(localStorage.getItem("babyNameGenFavorites") || "[]"));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("babyNameFavorites", JSON.stringify(favorites));
  }, [favorites, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem("babyNameGenFavorites", JSON.stringify(genFavorites));
  }, [genFavorites, hydrated]);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }, []);

  const isFav = useCallback(
    (id: string) => favorites.includes(id) || genFavorites.some((g) => g.id === id),
    [favorites, genFavorites]
  );

  const favoriteNames = useMemo(
    () => nameData.filter((n) => favorites.includes(n.id)),
    [favorites]
  );

  const toggleGen = useCallback((n: GenName) => {
    setGenFavorites((prev) =>
      prev.some((g) => g.id === n.id)
        ? prev.filter((g) => g.id !== n.id)
        : [...prev, n]
    );
  }, []);

  return { favorites, toggle, isFav, favoriteNames, genFavorites, toggleGen, hydrated };
}

// --- Components ---

function Navbar({
  favCount,
  favoriteNames,
  onToggleFavorite,
  isFav,
}: {
  favCount: number;
  favoriteNames: BabyName[];
  onToggleFavorite: (id: string) => void;
  isFav: (id: string) => boolean;
}) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage text-white">
            <Baby className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            NaamSutra
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="relative gap-2 rounded-full border-sage/30 text-foreground hover:bg-sage-light hover:text-sage-dark"
              >
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">Saved</span>
                {favCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose text-[10px] font-bold text-white">
                    {favCount}
                  </span>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full bg-background sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 font-display text-2xl">
                  <Bookmark className="h-5 w-5 text-sage" />
                  Saved Names
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-3">
                {favoriteNames.length === 0 ? (
                  <div className="mt-10 flex flex-col items-center justify-center text-center">
                    <Heart className="h-12 w-12 text-muted-foreground/30" />
                    <p className="mt-4 text-muted-foreground">
                      No saved names yet. Start exploring and save your
                      favorites!
                    </p>
                  </div>
                ) : (
                  favoriteNames.map((name) => (
                    <div
                      key={name.id}
                      className="group flex items-center justify-between rounded-2xl border border-border/50 bg-card p-4 transition-all hover:shadow-md"
                    >
                      <div>
                        <h4 className="font-display text-lg font-semibold text-foreground">
                          {name.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {name.meaning} &middot; {name.origin}
                        </p>
                      </div>
                      <button
                        onClick={() => onToggleFavorite(name.id)}
                        className="rounded-full p-2 text-rose transition-colors hover:bg-rose-light"
                      >
                        <Heart className="h-5 w-5 fill-rose" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

function HeroSection({ onGenerate }: { onGenerate: () => void }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-light via-cream to-sky-light">
      <div className="absolute inset-0 opacity-40">
        <img
          src="/hero-baby.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-cream/70 via-cream/80 to-background" />
      {/* Cute floating baby-themed decorations */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute left-[6%] top-[18%] animate-bounce text-4xl [animation-duration:3s]">🍼</span>
        <span className="absolute right-[8%] top-[22%] animate-bounce text-4xl [animation-duration:3.6s] [animation-delay:.4s]">🧸</span>
        <span className="absolute left-[12%] bottom-[22%] animate-bounce text-3xl [animation-duration:4s] [animation-delay:.2s]">⭐</span>
        <span className="absolute right-[14%] bottom-[28%] animate-bounce text-3xl [animation-duration:3.4s] [animation-delay:.6s]">☁️</span>
        <span className="absolute left-[20%] top-[55%] text-2xl opacity-70">👣</span>
        <span className="absolute right-[22%] top-[60%] text-2xl opacity-70">🌙</span>
        <span className="absolute left-1/2 top-[8%] -translate-x-1/2 text-3xl animate-pulse">💕</span>
      </div>
      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-sage-dark shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            🍼 Discover the perfect name for your little one 🧸
          </div>
          <h1 className="font-display text-[2.25rem] font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight">
            Find a Name as{" "}
            <span className="text-sage">Beautiful</span> as Your Baby
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Explore 200+ curated baby names from around the world. Filter by
            meaning, origin, gender, and save your favorites.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={onGenerate}
              size="lg"
              className="gap-2 rounded-full bg-sage px-8 py-7 text-lg font-semibold text-white shadow-lg shadow-sage/20 transition-all hover:bg-sage-dark hover:shadow-xl hover:shadow-sage/30 w-full sm:w-auto"
            >
              <Sparkles className="h-5 w-5" />
              Generate Magical Names
            </Button>
            <a
              href="#explorer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-8 py-4 text-lg font-medium text-foreground shadow-sm transition-all hover:bg-secondary w-full sm:w-auto"
            >
              Explore Names
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function NameCard({
  name,
  isFavorite,
  onToggleFavorite,
  onClick,
}: {
  name: BabyName;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}) {
  const genderColor =
    name.gender === "boy"
      ? "bg-sky-light text-sky"
      : name.gender === "girl"
        ? "bg-rose-light text-rose"
        : "bg-sage-light text-sage-dark";

  const genderIcon =
    name.gender === "boy" ? (
      <span className="text-sky">&#9794;</span>
    ) : name.gender === "girl" ? (
      <span className="text-rose">&#9792;</span>
    ) : (
      <span className="text-sage-dark">&#9893;</span>
    );

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl shrink-0">{genderIcon}</span>
          <h3 className="font-display text-2xl font-bold text-foreground truncate">
            {name.name}
          </h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="shrink-0 rounded-full p-2.5 transition-colors hover:bg-secondary"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite
                ? "fill-rose text-rose"
                : "text-muted-foreground group-hover:text-rose"
            }`}
          />
        </button>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {name.meaning}
      </p>
      <div className="mt-5 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium ${genderColor}`}
        >
          <Globe className="h-3.5 w-3.5" />
          {name.origin}
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-3.5 w-3.5 ${
                star <= Math.ceil(name.popularity / 20)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NameDetailModal({
  name,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}: {
  name: BabyName | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  if (!name) return null;

  const genderLabel =
    name.gender === "boy"
      ? "Boy"
      : name.gender === "girl"
        ? "Girl"
        : "Unisex";

  const genderColor =
    name.gender === "boy"
      ? "bg-sky-light text-sky"
      : name.gender === "girl"
        ? "bg-rose-light text-rose"
        : "bg-sage-light text-sage-dark";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl text-foreground">
            {name.name}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium ${genderColor}`}
            >
              {genderLabel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
              <Globe className="h-3.5 w-3.5" />
              {name.origin}
            </span>
          </div>

          <div className="rounded-2xl bg-cream p-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Meaning
            </h4>
            <p className="mt-2 font-display text-xl text-foreground">
              {name.meaning}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Tags
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {name.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Popularity
            </h4>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-sage transition-all"
                  style={{ width: `${name.popularity}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground">
                {name.popularity}/100
              </span>
            </div>
          </div>

          <Button
            onClick={onToggleFavorite}
            variant="outline"
            className={`w-full gap-2 rounded-full py-6 text-lg font-semibold ${
              isFavorite
                ? "border-rose text-rose hover:bg-rose-light"
                : "border-sage text-sage hover:bg-sage-light"
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-rose" : ""}`} />
            {isFavorite ? "Remove from Saved" : "Save this Name"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RandomNameModal({
  name,
  isOpen,
  onClose,
  onNext,
  isFavorite,
  onToggleFavorite,
}: {
  name: BabyName | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  if (!name) return null;

  const genderColor =
    name.gender === "boy"
      ? "bg-sky-light text-sky"
      : name.gender === "girl"
        ? "bg-rose-light text-rose"
        : "bg-sage-light text-sage-dark";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-light">
            <Sparkles className="h-8 w-8 text-sage" />
          </div>
          <DialogTitle className="mt-4 text-center font-display text-3xl text-foreground">
            {name.name}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-6 text-center">
          <p className="text-lg text-muted-foreground">{name.meaning}</p>
          <div className="flex items-center justify-center gap-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium ${genderColor}`}
            >
              {name.gender === "boy"
                ? "Boy"
                : name.gender === "girl"
                  ? "Girl"
                  : "Unisex"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
              <Globe className="h-3.5 w-3.5" />
              {name.origin}
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onToggleFavorite}
              variant="outline"
              className={`flex-1 gap-2 rounded-full py-5 ${
                isFavorite
                  ? "border-rose text-rose hover:bg-rose-light"
                  : "border-sage text-sage hover:bg-sage-light"
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose" : ""}`} />
              {isFavorite ? "Saved" : "Save"}
            </Button>
            <Button
              onClick={onNext}
              className="flex-1 gap-2 rounded-full bg-sage py-5 text-white hover:bg-sage-dark"
            >
              <Shuffle className="h-4 w-4" />
              Next
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page ---

function BabyNameGenerator() {
  const [gender, setGender] = useState<"all" | "boy" | "girl" | "unisex">(
    "all"
  );
  const [origin, setOrigin] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState<BabyName | null>(null);
  const [randomName, setRandomName] = useState<BabyName | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [randomOpen, setRandomOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const { isFav, toggle, favoriteNames, toggleGen } = useFavorites();

  const filteredNames = useMemo(() => {
    return nameData.filter((n) => {
      const genderMatch = gender === "all" || n.gender === gender;
      const originMatch = origin === "All" || n.origin === origin;
      const searchMatch =
        !search ||
        n.name.toLowerCase().includes(search.toLowerCase()) ||
        n.meaning.toLowerCase().includes(search.toLowerCase()) ||
        n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return genderMatch && originMatch && searchMatch;
    });
  }, [gender, origin, search]);

  const handleRandom = useCallback(() => {
    setWizardOpen(true);
  }, []);

  // Silence unused-warning for legacy state
  void randomName;
  void randomOpen;
  void setRandomName;
  void setRandomOpen;

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        favCount={favoriteNames.length}
        favoriteNames={favoriteNames}
        onToggleFavorite={toggle}
        isFav={isFav}
      />

      <HeroSection onGenerate={handleRandom} />

      {/* Filter Section */}
      <section id="explorer" className="mx-auto max-w-7xl px-5 py-10 sm:px-4 sm:py-8">
        <div className="rounded-3xl border border-border/50 bg-card p-6 sm:p-6 shadow-sm">
          {/* Mobile filter toggle */}
          <div className="mb-5 flex items-center justify-between sm:hidden">
            <h2 className="font-display text-xl font-semibold">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-10 px-3"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div
            className={`space-y-5 ${showFilters ? "block" : "hidden sm:block"}`}
          >
            {/* Gender Tabs */}
            <div className="flex flex-wrap gap-2.5">
              {(
                [
                  ["all", "All Names"],
                  ["boy", "Boys"],
                  ["girl", "Girls"],
                  ["unisex", "Unisex"],
                ] as const
              ).map(([g, label]) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition-all ${
                    gender === g
                      ? g === "boy"
                        ? "bg-sky text-white shadow-md shadow-sky/20"
                        : g === "girl"
                          ? "bg-rose text-white shadow-md shadow-rose/20"
                          : g === "unisex"
                            ? "bg-sage text-white shadow-md shadow-sage/20"
                            : "bg-foreground text-background"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search & Origin */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, meaning, or tag..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-full border-border/50 py-6 pl-11 text-base"
                />
              </div>
              <Select value={origin} onValueChange={setOrigin}>
                <SelectTrigger className="w-full rounded-full border-border/50 py-6 text-base sm:w-[200px]">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Origin" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {origins.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5 text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredNames.length}
            </span>{" "}
            names
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        {filteredNames.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredNames.map((name) => (
              <NameCard
                key={name.id}
                name={name}
                isFavorite={isFav(name.id)}
                onToggleFavorite={() => toggle(name.id)}
                onClick={() => {
                  setSelectedName(name);
                  setDetailOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-16 w-16 text-muted-foreground/20" />
            <h3 className="mt-6 font-display text-2xl font-semibold text-foreground">
              No names found
            </h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
            <Button
              onClick={() => {
                setGender("all");
                setOrigin("All");
                setSearch("");
              }}
              variant="outline"
              className="mt-6 rounded-full"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage text-white">
              <Baby className="h-4 w-4" />
            </div>
            <span className="font-display text-xl font-bold">NaamSutra</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Helping parents find the perfect name for their little miracle.
          </p>
          <p className="mt-6 text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} NaamSutra. Made with{" "}
            <Heart className="inline h-3 w-3 fill-rose text-rose" /> for
            families everywhere.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <NameDetailModal
        name={selectedName}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        isFavorite={selectedName ? isFav(selectedName.id) : false}
        onToggleFavorite={() => selectedName && toggle(selectedName.id)}
      />

      <RandomNameModal
        name={randomName}
        isOpen={randomOpen}
        onClose={() => setRandomOpen(false)}
        onNext={handleRandom}
        isFavorite={randomName ? isFav(randomName.id) : false}
        onToggleFavorite={() => randomName && toggle(randomName.id)}
      />

      <SurpriseWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onSaveName={toggleGen}
        isSaved={isFav}
      />
    </div>
  );
}

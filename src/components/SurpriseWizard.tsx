import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Sparkles,
  Heart,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nameData, type BabyName } from "@/lib/baby-names";

type Gender = "boy" | "girl" | "unisex";
type Length = "any" | "short" | "medium" | "long";
type Rarity = "any" | "common" | "rare" | "ultra";

const STYLES = [
  "Modern", "Traditional", "Royal", "Cute", "Luxury", "Unique",
  "Techy", "Short", "Islamic", "Hindu", "Christian", "Japanese", "Korean",
] as const;

const MEANINGS = [
  "Powerful", "Intelligent", "Peaceful", "Nature",
  "Wealth", "Love", "Warrior", "Future/AI",
] as const;

interface Inputs {
  father: string;
  mother: string;
  nationality: string;
  religion: string;
  gender: Gender;
  firstLetter: string;
  style: string;
  length: Length;
  meaning: string;
  rarity: Rarity;
}

interface GenName {
  id: string;
  name: string;
  meaning: string;
  pronunciation: string;
  origin: string;
  popularity: number;
  gender: Gender;
}

// Suffix pools per style for synthesis
const STYLE_SUFFIXES: Record<string, { boy: string[]; girl: string[]; unisex: string[] }> = {
  Modern: { boy: ["yan", "ven", "ari", "xen", "vio"], girl: ["ara", "iya", "elle", "ova", "ina"], unisex: ["ari", "yen", "ova"] },
  Traditional: { boy: ["esh", "raj", "nath", "deep"], girl: ["mati", "shri", "devi", "lata"], unisex: ["ansh"] },
  Royal: { boy: ["raj", "veer", "singh", "raan"], girl: ["rani", "priya", "mala"], unisex: ["raj"] },
  Cute: { boy: ["bo", "ki", "no", "lu"], girl: ["ki", "mi", "lu", "pi"], unisex: ["lo"] },
  Luxury: { boy: ["zion", "kairo", "axton"], girl: ["seraph", "amara", "celest"], unisex: ["lux"] },
  Unique: { boy: ["xyon", "qen", "zev"], girl: ["lyra", "xara", "zev"], unisex: ["zen"] },
  Techy: { boy: ["byte", "neo", "zix"], girl: ["nova", "vex", "lumi"], unisex: ["axi"] },
  Short: { boy: ["an", "iv", "el", "ox"], girl: ["ia", "el", "ae", "yn"], unisex: ["ix"] },
  Islamic: { boy: ["aan", "een", "ad", "if"], girl: ["aanah", "een", "ifah"], unisex: ["aar"] },
  Hindu: { boy: ["ansh", "ish", "dev"], girl: ["isha", "ika", "shri"], unisex: ["ansh"] },
  Christian: { boy: ["iel", "ias", "ah"], girl: ["ella", "ia", "anna"], unisex: ["iel"] },
  Japanese: { boy: ["taro", "ki", "ru"], girl: ["ko", "mi", "na"], unisex: ["aki"] },
  Korean: { boy: ["jun", "min", "woo"], girl: ["ah", "yun", "soo"], unisex: ["jin"] },
};

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function pronounce(name: string) {
  const syl = name
    .replace(/([aeiouAEIOU][^aeiouAEIOU])/g, "$1-")
    .replace(/-$/, "")
    .toUpperCase();
  return syl;
}

function meaningFromStyle(style: string, meaningPref: string, fatherInitial: string, motherInitial: string) {
  const base: Record<string, string[]> = {
    Powerful: ["Strong warrior", "Mighty one", "Lion-hearted", "Fearless soul"],
    Intelligent: ["Wise mind", "Bright thinker", "Knowledge bearer", "Sage spirit"],
    Peaceful: ["Calm soul", "Serene one", "Tranquil heart", "Gentle peace"],
    Nature: ["River song", "Forest spirit", "Morning sky", "Bloom of dawn"],
    Wealth: ["Prosperous one", "Golden gift", "Abundant joy", "Fortune's child"],
    Love: ["Beloved one", "Heart's joy", "Sweet love", "Cherished soul"],
    Warrior: ["Brave warrior", "Battle's pride", "Shield of light", "Valiant"],
    "Future/AI": ["New dawn", "Bright future", "Visionary", "Light ahead"],
  };
  const styleFlavor: Record<string, string> = {
    Royal: "Of royal lineage",
    Luxury: "Crown of light",
    Islamic: "Blessed by the divine",
    Hindu: "Gift of the gods",
    Christian: "Grace of God",
    Japanese: "Child of harmony",
    Korean: "Pure brightness",
    Cute: "Little darling",
    Modern: "Born of new light",
    Techy: "Spark of the future",
    Unique: "One of a kind",
    Traditional: "Honored name",
    Short: "Pure and bright",
  };
  const arr = base[meaningPref] || base.Powerful;
  const m = arr[Math.floor(Math.random() * arr.length)];
  const flavor = styleFlavor[style] || "";
  const initials = fatherInitial && motherInitial ? ` (${fatherInitial}+${motherInitial})` : "";
  return flavor ? `${m} — ${flavor}${initials}` : `${m}${initials}`;
}

function synthesizeName(inputs: Inputs): GenName | null {
  const { father, mother, gender, firstLetter, style, length } = inputs;
  const styleKey = STYLE_SUFFIXES[style] ? style : "Modern";
  const pool = STYLE_SUFFIXES[styleKey][gender];
  const suffix = pool[Math.floor(Math.random() * pool.length)];

  // Prefix: prefer firstLetter, else father/mother first 1-2 letters
  let prefix = "";
  if (firstLetter) {
    prefix = firstLetter.toUpperCase();
    const source = Math.random() > 0.5 ? father : mother;
    if (source) prefix += source.toLowerCase().slice(1, 2);
  } else {
    const sources = [father, mother].filter(Boolean);
    const src = sources[Math.floor(Math.random() * Math.max(sources.length, 1))] || "";
    prefix = src.slice(0, 2);
  }
  if (!prefix) prefix = "Ar";

  let name = titleCase(prefix + suffix);

  // Length adjustment
  const targetMin = length === "short" ? 3 : length === "medium" ? 6 : length === "long" ? 9 : 4;
  const targetMax = length === "short" ? 5 : length === "medium" ? 8 : length === "long" ? 12 : 9;
  if (name.length < targetMin) name = name + (gender === "girl" ? "ya" : "an");
  if (name.length > targetMax) name = name.slice(0, targetMax);

  return {
    id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    meaning: meaningFromStyle(style, inputs.meaning, father?.[0]?.toUpperCase() || "", mother?.[0]?.toUpperCase() || ""),
    pronunciation: pronounce(name),
    origin: inputs.nationality || "Mixed",
    popularity:
      inputs.rarity === "ultra"
        ? Math.floor(Math.random() * 15) + 5
        : inputs.rarity === "rare"
          ? Math.floor(Math.random() * 30) + 20
          : inputs.rarity === "common"
            ? Math.floor(Math.random() * 30) + 65
            : Math.floor(Math.random() * 80) + 15,
    gender,
  };
}

function curatedMatches(inputs: Inputs): GenName[] {
  // Pull a few real curated names matching gender + firstLetter to mix in
  const pool = nameData.filter((n) => {
    if (n.gender !== inputs.gender && inputs.gender !== "unisex") return false;
    if (inputs.firstLetter && !n.name.toLowerCase().startsWith(inputs.firstLetter.toLowerCase()))
      return false;
    return true;
  });
  return pool
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
    .map((n: BabyName) => ({
      id: `cur-${n.id}`,
      name: n.name,
      meaning: n.meaning,
      pronunciation: pronounce(n.name),
      origin: n.origin,
      popularity: n.popularity,
      gender: n.gender,
    }));
}

function generateNames(inputs: Inputs, count = 16): GenName[] {
  const synth: GenName[] = [];
  const seen = new Set<string>();
  let attempts = 0;
  while (synth.length < count - 3 && attempts < count * 6) {
    attempts++;
    const n = synthesizeName(inputs);
    if (!n) continue;
    if (seen.has(n.name.toLowerCase())) continue;
    seen.add(n.name.toLowerCase());
    synth.push(n);
  }
  const curated = curatedMatches(inputs).filter((c) => {
    if (seen.has(c.name.toLowerCase())) return false;
    seen.add(c.name.toLowerCase());
    return true;
  });
  return [...synth, ...curated].slice(0, count);
}

const ANALYZING_STEPS = [
  "Analyzing personality…",
  "Mixing parental inspiration…",
  "Blending cultural roots…",
  "Finding unique combinations…",
  "Polishing the perfect names…",
];

export function SurpriseWizard({
  open,
  onOpenChange,
  onSaveName,
  isSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaveName: (n: GenName) => void;
  isSaved: (id: string) => boolean;
}) {
  const [step, setStep] = useState(0); // 0 parents, 1 prefs, 2 generating, 3 results
  const [inputs, setInputs] = useState<Inputs>({
    father: "",
    mother: "",
    nationality: "Indian",
    religion: "",
    gender: "boy",
    firstLetter: "",
    style: "Modern",
    length: "any",
    meaning: "Powerful",
    rarity: "any",
  });
  const [results, setResults] = useState<GenName[]>([]);
  const [analyzeIdx, setAnalyzeIdx] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // reset when closing
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(0);
        setResults([]);
        setAnalyzeIdx(0);
      }, 300);
    }
  }, [open]);

  // analyzing animation
  useEffect(() => {
    if (step !== 2) return;
    setAnalyzeIdx(0);
    const interval = setInterval(() => {
      setAnalyzeIdx((i) => Math.min(i + 1, ANALYZING_STEPS.length - 1));
    }, 550);
    const done = setTimeout(() => {
      setResults(generateNames(inputs, 16));
      setStep(3);
    }, 2800);
    return () => {
      clearInterval(interval);
      clearTimeout(done);
    };
  }, [step, inputs]);

  const upd = <K extends keyof Inputs>(k: K, v: Inputs[K]) =>
    setInputs((p) => ({ ...p, [k]: v }));

  const regenerate = useCallback(() => {
    setStep(2);
  }, []);

  const copy = (n: GenName) => {
    navigator.clipboard?.writeText(`${n.name} — ${n.meaning}`);
    setCopiedId(n.id);
    setTimeout(() => setCopiedId(null), 1400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-card sm:max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-light">
              <Wand2 className="h-5 w-5 text-sage" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Generate Magical Names</h2>
              <p className="text-xs text-muted-foreground">
                Step {Math.min(step + 1, 4)} of 4
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-sage" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Parents */}
        {step === 0 && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <h3 className="font-display text-lg font-semibold">Parents' Details</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LabeledInput label="Father's Name" value={inputs.father}
                onChange={(v) => upd("father", v)} placeholder="e.g. Rajesh" />
              <LabeledInput label="Mother's Name" value={inputs.mother}
                onChange={(v) => upd("mother", v)} placeholder="e.g. Sunita" />
              <LabeledInput label="Nationality" value={inputs.nationality}
                onChange={(v) => upd("nationality", v)} placeholder="Indian, Arabic, English…" />
              <LabeledInput label="Religion (optional)" value={inputs.religion}
                onChange={(v) => upd("religion", v)} placeholder="Hindu, Muslim, Christian…" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Gender</label>
              <div className="flex gap-2">
                {(["boy", "girl", "unisex"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => upd("gender", g)}
                    className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold capitalize transition-all ${
                      inputs.gender === g
                        ? "bg-sage text-white shadow-md"
                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                    }`}
                  >
                    {g === "unisex" ? "Neutral" : g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={() => setStep(1)}
                className="gap-2 rounded-full bg-sage text-white hover:bg-sage-dark"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Preferences */}
        {step === 1 && (
          <div className="mt-4 space-y-5 animate-fade-in">
            <h3 className="font-display text-lg font-semibold">Style & Preferences</h3>

            <div>
              <label className="mb-2 block text-sm font-medium">First Letter (optional)</label>
              <Input
                value={inputs.firstLetter}
                onChange={(e) => upd("firstLetter", e.target.value.slice(0, 1).toUpperCase())}
                placeholder="A, S, R…"
                className="w-24 rounded-full text-center text-lg font-bold"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Name Style</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => upd("style", s)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      inputs.style === s
                        ? "bg-sage text-white"
                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Meaning Theme</label>
              <div className="flex flex-wrap gap-2">
                {MEANINGS.map((m) => (
                  <button
                    key={m}
                    onClick={() => upd("meaning", m)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      inputs.meaning === m
                        ? "bg-rose text-white"
                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Length</label>
                <div className="flex flex-wrap gap-2">
                  {(["any", "short", "medium", "long"] as Length[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => upd("length", l)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                        inputs.length === l
                          ? "bg-sage text-white"
                          : "bg-secondary hover:bg-muted"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Rarity</label>
                <div className="flex flex-wrap gap-2">
                  {(["any", "common", "rare", "ultra"] as Rarity[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => upd("rarity", r)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                        inputs.rarity === r
                          ? "bg-sage text-white"
                          : "bg-secondary hover:bg-muted"
                      }`}
                    >
                      {r === "ultra" ? "Ultra Unique" : r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(0)}
                className="gap-2 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                onClick={() => setStep(2)}
                className="gap-2 rounded-full bg-sage text-white hover:bg-sage-dark"
              >
                <Sparkles className="h-4 w-4" />
                Generate Magical Names
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Generating */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-sage/30" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-sage-light">
                <Loader2 className="h-10 w-10 animate-spin text-sage" />
              </div>
            </div>
            <div className="mt-8 h-7 text-center">
              <p
                key={analyzeIdx}
                className="animate-fade-in font-display text-lg font-semibold text-foreground"
              >
                {ANALYZING_STEPS[analyzeIdx]}
              </p>
            </div>
            <div className="mt-4 flex gap-1">
              {ANALYZING_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-all ${
                    i <= analyzeIdx ? "bg-sage" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="mt-4 animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">
                  {results.length} Magical Names
                </h3>
                <p className="text-xs text-muted-foreground capitalize">
                  {inputs.gender === "unisex" ? "Neutral" : inputs.gender} •{" "}
                  {inputs.style} • {inputs.nationality || "Mixed"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={regenerate}
                className="gap-2 rounded-full"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {results.map((n, idx) => (
                <div
                  key={n.id}
                  className="group rounded-2xl border border-border/50 bg-background p-4 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-muted-foreground">
                          {idx + 1}.
                        </span>
                        <h4 className="font-display text-2xl font-bold text-foreground">
                          {n.name}
                        </h4>
                      </div>
                      <p className="mt-0.5 text-xs italic text-muted-foreground">
                        /{n.pronunciation}/
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => copy(n)}
                        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        title="Copy"
                      >
                        {copiedId === n.id ? (
                          <Check className="h-4 w-4 text-sage" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => onSaveName(n)}
                        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-rose-light hover:text-rose"
                        title="Save"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isSaved(n.id) ? "fill-rose text-rose" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-foreground">{n.meaning}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
                      {n.origin}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Popularity</span>
                      <span className="font-semibold text-foreground">
                        {n.popularity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-2 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" /> Edit Preferences
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="gap-2 rounded-full bg-sage text-white hover:bg-sage-dark"
              >
                <X className="h-4 w-4" /> Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LabeledInput({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-full"
      />
    </div>
  );
}

export type { GenName };
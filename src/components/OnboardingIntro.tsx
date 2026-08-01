import { useState } from "react";
import { Baby, Sparkles, Heart, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type Gender = "all" | "boy" | "girl" | "unisex";

const SLIDES = [
  {
    emoji: "🍼",
    title: "Welcome to NaamSutra",
    body: "200+ beautiful baby names with meanings, origins aur popularity — sab ek jagah.",
    icon: Baby,
  },
  {
    emoji: "✨",
    title: "Magical Name Generator",
    body: "Parents ke naam, style aur meaning se bilkul naye unique names banao.",
    icon: Sparkles,
  },
  {
    emoji: "💖",
    title: "Save Your Favourites",
    body: "Dil pe tap karo — aapke pasandida naam device par safe rehte hain.",
    icon: Heart,
  },
];

export function OnboardingIntro({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (g: Gender) => void;
}) {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const s = SLIDES[i];
  const Icon = s.icon;

  const finish = (g: Gender) => {
    onPick(g);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl bg-card sm:max-w-md">
        <div className="flex flex-col items-center py-2 text-center animate-fade-in" key={i}>
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-sage/20" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-sage-light text-4xl">
              {s.emoji}
            </div>
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold">{s.title}</h2>
          <p className="mt-2 max-w-xs text-muted-foreground">{s.body}</p>
          <Icon className="mt-4 h-5 w-5 text-sage" />
        </div>

        <div className="mt-2 flex justify-center gap-1.5">
          {SLIDES.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-6 bg-sage" : "w-1.5 bg-secondary"
              }`}
            />
          ))}
        </div>

        {last ? (
          <div className="mt-5">
            <p className="mb-3 text-center text-sm font-medium">
              Aap kis ke liye naam dhoond rahe hain?
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={() => finish("boy")} className="rounded-full bg-sky text-white hover:opacity-90">
                Boy
              </Button>
              <Button onClick={() => finish("girl")} className="rounded-full bg-rose text-white hover:opacity-90">
                Girl
              </Button>
              <Button onClick={() => finish("all")} variant="outline" className="rounded-full">
                Both
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={() => onOpenChange(false)}
              className="px-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
            <Button
              onClick={() => setI((v) => v + 1)}
              className="gap-2 rounded-full bg-sage text-white hover:bg-sage-dark"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

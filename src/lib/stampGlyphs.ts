import type { LucideIcon } from "lucide-react";
import {
  Cake,
  Check,
  Coffee,
  Crown,
  Dumbbell,
  Flower,
  Gift,
  Heart,
  Leaf,
  PawPrint,
  Pizza,
  Scissors,
  Smile,
  Sparkles,
  Star,
  Sun,
} from "lucide-react";

/** The 16 stamp glyphs the backend renderer supports (apps/wallet/glyphs.py)
 * — names match 1:1, so what the owner picks here is exactly what the
 * server bakes into the real strip images. */
export const STAMP_GLYPHS: Record<string, LucideIcon> = {
  check: Check,
  heart: Heart,
  star: Star,
  coffee: Coffee,
  scissors: Scissors,
  dumbbell: Dumbbell,
  gift: Gift,
  leaf: Leaf,
  "paw-print": PawPrint,
  pizza: Pizza,
  flower: Flower,
  sparkles: Sparkles,
  cake: Cake,
  sun: Sun,
  crown: Crown,
  smile: Smile,
};

export const STAMP_GLYPH_NAMES = Object.keys(STAMP_GLYPHS);

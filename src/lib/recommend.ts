import type { Product } from "./data";

function overlapScore(a: string[], b: string[]): number {
  const setB = new Set(b.map((s) => s.toLowerCase()));
  return a.reduce((sum, item) => sum + (setB.has(item.toLowerCase()) ? 1 : 0), 0);
}

function allNotes(p: Product): string[] {
  return [...p.notes.top, ...p.notes.heart, ...p.notes.base];
}

/**
 * Heuristic scent-profile recommendation: scores every other product against
 * a source product by fragrance-family overlap, shared notes, shared
 * occasions/seasons, and gender compatibility. No external API required.
 */
export function scoreSimilarity(source: Product, candidate: Product): number {
  if (source.id === candidate.id) return -Infinity;

  let score = 0;
  score += overlapScore(source.fragranceFamily, candidate.fragranceFamily) * 3;
  score += overlapScore(allNotes(source), allNotes(candidate)) * 2;
  score += overlapScore(source.occasions, candidate.occasions);
  score += overlapScore(source.seasons, candidate.seasons);
  if (source.dayNight === candidate.dayNight) score += 1;
  if (source.gender === candidate.gender || source.gender === "unisex" || candidate.gender === "unisex") {
    score += 2;
  }
  if (source.collection === candidate.collection) score += 1;

  return score;
}

export function getRelatedProducts(products: Product[], productId: string, limit = 4): Product[] {
  const source = products.find((p) => p.id === productId);
  if (!source) return products.slice(0, limit);

  return [...products]
    .filter((p) => p.id !== productId)
    .sort((a, b) => scoreSimilarity(source, b) - scoreSimilarity(source, a))
    .slice(0, limit);
}

export interface ScentQuizAnswers {
  gender?: "men" | "women" | "unisex";
  mood?: string;
  intensity?: "light" | "moderate" | "intense";
  time?: "day" | "night" | "both";
}

const moodFamilyMap: Record<string, string[]> = {
  seductive: ["Oriental", "Sweet", "Warm", "Magnetic"],
  fresh: ["Fresh", "Citrus", "Aqua"],
  powerful: ["Oud", "Woody", "Spicy"],
  romantic: ["Floral", "Sweet", "Powdery"],
  bold: ["Woody", "Spicy", "Oriental"],
  mysterious: ["Oriental", "Warm", "Magnetic"],
};

/**
 * Ranks every product against a small set of quiz answers. Used by the
 * homepage Scent Finder to recommend a signature fragrance without needing
 * a paid AI/LLM API — purely a weighted heuristic over real product data.
 */
export function recommendFromQuiz(products: Product[], answers: ScentQuizAnswers, limit = 3): Product[] {
  const wantedFamilies = answers.mood ? moodFamilyMap[answers.mood] ?? [] : [];

  const scored = products.map((p) => {
    let score = 0;
    if (answers.gender) {
      if (p.gender === answers.gender) score += 4;
      else if (p.gender === "unisex" || answers.gender === "unisex") score += 2;
    }
    if (wantedFamilies.length) score += overlapScore(wantedFamilies, p.fragranceFamily) * 3;
    if (answers.intensity) {
      const projection = p.projection;
      const target = answers.intensity === "light" ? [0, 6] : answers.intensity === "moderate" ? [6, 8] : [8, 10];
      if (projection >= target[0] && projection <= target[1]) score += 3;
    }
    if (answers.time) {
      if (p.dayNight === answers.time || p.dayNight === "both") score += 2;
    }
    return { product: p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.product);
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDisplayRank(officer: { rank?: string | null; rank_id?: string | null } | null | undefined, ranks: Array<{ id?: string; title?: string; order_index?: number }> = []): string {
  if (!officer) return 'N/A';

  // Try to resolve from rank_definitions first
  const rankDef = ranks.find(r => r.id === officer.rank_id);
  if (rankDef?.title) {
    if (rankDef.order_index === 1 || rankDef.title.toLowerCase() === 'chief') {
      return 'Chief of Police';
    }
    return rankDef.title;
  }

  // Fallback to rank string
  if (officer.rank) {
    if (officer.rank.toLowerCase() === 'chief') {
      return 'Chief of Police';
    }
    return officer.rank;
  }

  return 'N/A';
}

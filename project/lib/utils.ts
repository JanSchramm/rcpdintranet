import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDisplayRank(officer: { rank?: string | number | null; rank_id?: string | null } | null | undefined, ranks: Array<{ id?: string; title?: string; order_index?: number }> = []): string {
  if (!officer) return 'N/A';

  // If rank_id is set, prefer rank_definitions lookup
  if (officer.rank_id) {
    const rankDef = ranks.find(r => r.id === officer.rank_id);
    if (rankDef?.title) {
      if (rankDef.order_index === 1 || typeof rankDef.title === 'string' && rankDef.title.toLowerCase() === 'chief') {
        return 'Chief of Police';
      }
      return rankDef.title;
    }
    // rank_id exists but definitions not loaded yet; avoid showing raw numeric rank
    return 'Loading...';
  }

  // Fallback only when no rank_id is set
  if (officer.rank != null) {
    const rankStr = typeof officer.rank === 'string' ? officer.rank : String(officer.rank);
    if (rankStr.toLowerCase() === 'chief') {
      return 'Chief of Police';
    }
    return rankStr;
  }

  return 'N/A';
}

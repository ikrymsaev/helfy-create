export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  bio: string;
}

/** Team note — used for @useMutation optimistic updates. */
export interface Note {
  id: string;
  title: string;
  pending?: boolean;
}

export type AddNoteVars = { clientId: string; title: string; fail?: boolean };

/** Activity feed item — used for @useInfiniteQuery pagination. */
export interface ActivityItem {
  id: string;
  text: string;
  at: string;
}

/** "Ada Lovelace" → "AL" */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

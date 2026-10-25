export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  bio: string;
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

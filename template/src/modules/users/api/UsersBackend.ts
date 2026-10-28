import { Service } from "@helfy/helfy";
import type { ActivityItem, Note, User } from "../model/types";

/** Source of users data, notes and activity. */
export interface IUsersBackend {
  list(): Promise<User[]>;
  get(id: string): Promise<User>;
  listNotes(): Promise<Note[]>;
  addNote(title: string, fail?: boolean): Promise<Note>;
  listActivity(page: number, pageSize: number): Promise<ActivityItem[]>;
}

const USERS: User[] = [
  {
    id: "1",
    name: "Ada Lovelace",
    role: "Analyst",
    email: "ada@example.com",
    bio: "Wrote the first program before the first computer.",
  },
  {
    id: "2",
    name: "Alan Turing",
    role: "Researcher",
    email: "alan@example.com",
    bio: "Asked whether machines can think.",
  },
  {
    id: "3",
    name: "Grace Hopper",
    role: "Engineer",
    email: "grace@example.com",
    bio: "Built the first compiler and found the first bug.",
  },
  {
    id: "4",
    name: "Linus Torvalds",
    role: "Maintainer",
    email: "linus@example.com",
    bio: "Talk is cheap. Show me the code.",
  },
];

const NOTES: Note[] = [
  { id: "n1", title: "Ship the overview page" },
  { id: "n2", title: "Wire DI by interface" },
];

const ACTIVITY: ActivityItem[] = Array.from({ length: 18 }, (_, i) => ({
  id: `a${i + 1}`,
  text: `Event #${i + 1}: mock activity from the backend`,
  at: `Day ${Math.floor(i / 3) + 1}`,
}));

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * A mock server: data in memory and a network delay. To use a real API, write
 * `HttpUsersBackend implements IUsersBackend` with HttpClient and register it instead —
 * UsersApi and the views stay as they are.
 */
@Service<IUsersBackend>()
export class MockUsersBackend implements IUsersBackend {
  async list() {
    await delay(600);
    return USERS;
  }

  async get(id: string) {
    await delay(400);
    const user = USERS.find((u) => u.id === id);
    if (!user) throw new Error(`User ${id} not found`);
    return user;
  }

  async listNotes() {
    await delay(400);
    return [...NOTES];
  }

  async addNote(title: string, fail = false) {
    await delay(900);
    if (fail) throw new Error("Server rejected the note");
    const note: Note = { id: `n${crypto.randomUUID().slice(0, 8)}`, title };
    NOTES.push(note);
    return note;
  }

  async listActivity(page: number, pageSize: number) {
    await delay(500);
    const start = (page - 1) * pageSize;
    return ACTIVITY.slice(start, start + pageSize);
  }
}

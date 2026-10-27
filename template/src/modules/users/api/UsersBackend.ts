import { Service } from "@helfy/helfy";
import type { User } from "../model/types";

/** Source of users data. */
export interface IUsersBackend {
  list(): Promise<User[]>;
  get(id: string): Promise<User>;
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
}

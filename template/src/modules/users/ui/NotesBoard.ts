import { View, useQuery, useMutation, state, type Query, type Mutation } from "@helfy/helfy";
import type { UsersApi } from "../api/UsersApi";
import type { AddNoteVars, Note } from "../model/types";
import template from "./NotesBoard.hf";

/**
 * @useMutation with optimistic update: the note appears before the mock answers.
 * Toggle "simulate fail" to see the list roll back.
 */
@View({ template })
export class NotesBoard {
  @useQuery<UsersApi>("notes") notes!: Query<Note[]>;
  @useMutation<UsersApi>("addNote") addNote!: Mutation<Note, AddNoteVars>;

  @state title = "";
  @state fail = false;
  @state lastError: string | null = null;

  submit = async (e: Event) => {
    e.preventDefault();
    const title = this.title.trim();
    if (!title) return;
    this.title = "";
    this.lastError = null;
    try {
      await this.addNote.mutateAsync({
        clientId: `temp-${Date.now()}`,
        title,
        fail: this.fail,
      });
    } catch (err) {
      this.lastError = err instanceof Error ? err.message : String(err);
    }
  };
}

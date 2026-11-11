1. **TaskBoard · view**

   On submit calls addTask.execute(title). Nothing else — no rules in the view.

2. **AddTaskUseCase · use case**

   Checks the rules: empty, too long, a duplicate. Returns an error the view shows — or goes on.

3. **TaskStore + ITaskStorage**

   The task goes into the store; the list is saved by LocalTaskStorage.

4. **Signals**

   Only what reads TaskStore.tasks updates: the new row and the counter. No re-render of the page.

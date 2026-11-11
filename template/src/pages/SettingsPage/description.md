A `@Form` context holds `@field` state. The page wraps the form in that
context; the view takes it with `@useForm`, wraps inputs in a `$field`
component, and focuses the first field through `@ref` / `@expose`.
Saving goes through a use case and localStorage.

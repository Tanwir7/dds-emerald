---
'@dds/emerald': major
---

Split `@dds/emerald-tokens` into an explicit peer dependency for `@dds/emerald`.

Consumers must now install both packages:

```bash
pnpm add @dds/emerald @dds/emerald-tokens
```

`@dds/emerald/styles` still remains the stylesheet entrypoint, but it no longer publishes inlined token variables or font CSS. Instead it preserves package imports to `@dds/emerald-tokens/styles` and `@dds/emerald-tokens/fonts`, so consumer apps must have `@dds/emerald-tokens` installed directly.

---
'@dds/emerald-tokens': minor
---

Generate the `tokens` JS export from `tokens.css` so it can no longer drift from the source CSS. This corrects stale values that had diverged (e.g. `theme.*.color.border.default`, dark `bg.default`) and adds previously-missing groups to the export (`primitive.shadow.md`, `primitive.zIndex`, `primitive.layout`, `primitive.dialogWidth`, `theme.*.color.upload`, and the full set of `action` hover variants).

# Hanzo Team

The tracker and the workspace, on `@hanzo/gui` + `@hanzo/ui`, over the team
backend at `api.hanzo.ai/v1/team`.

```
pnpm install
pnpm dev
```

Regions, and who owns which:

| directory | region |
|---|---|
| `src/frame` | the four regions, the rail, the navigator, the address model |
| `src/board` | the board: breadcrumb, title, tabs, filter, columns, cards |
| `src/inbox` | the notification panel's contents |
| `src/chat` | the channel surface |

`src/frame/surfaces.tsx` is the one declaration of what the product contains: a
surface is one entry there and is thereafter a rail icon, a navigator and a set
of addresses.

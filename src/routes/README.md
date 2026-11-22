# Routes

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
defines a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.


## Current application routes

| File | URL | Purpose |
| --- | --- | --- |
| `index.tsx` | `/` | Homeowner and Buyer journey selection |
| `owner.tsx` | `/owner` | Property onboarding and homeowner dashboard |
| `owner_.sell.tsx` | `/owner/sell` | Demo agent request or listing draft |
| `buyer.tsx` | `/buyer` | Client-only catalog loader and shared Buyer layout |
| `buyer.index.tsx` | `/buyer/` | Redirect to property search |
| `buyer.properties.tsx` | `/buyer/properties` | Historical catalog search with URL-based filters, sorting and pagination |
| `buyer.properties_.$id.tsx` | `/buyer/properties/:id` | Listing details, liquidity insights and buying demo |
| `buyer.plan.tsx` | `/buyer/plan` | Saved property watchlist |

The trailing underscore in `owner_` and `properties_` prevents nesting under the corresponding content route while retaining the URL path. The Buyer layout renders its children through `<Outlet />`.

Markets and selected-listing comparison routes have been removed. Keep market benchmarks within property details. Each content route owns its title, description and social metadata. Keep the generated route tree untouched.

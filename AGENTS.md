<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Property prototype
- Keep the app-wide visual identity in shared CSS tokens and the shared Brand component; serve its logo from public/assets with a same-origin static URL for portable deployments, and use semantic tokens for page-specific colors so all journeys remain consistent.
- Scope homeowner score color overrides to score and liquidity-history wrappers, and pass optional reference titles so homeowner presentation changes do not restyle Buyer.
- Keep branding, Back and Buyer tabs in one sticky shared header; Back reverses active journey steps before using router history, preserving query-based search state and in-session forms.
- Keep shared community calculations unchanged; buyer liquidity explorers adapt the browser-safe homeowner property model so both journeys show consistent indicators without altering legacy finance estimates.
- Normalize extended owner details at the homeowner boundary to retain compatibility with properties created by the buyer journey and older local records.
- Persist owner setup drafts and confirmed details in separate browser storage keys, so incomplete edits do not overwrite the active property.
- Derive homeowner segment indicators and activity from one price-independent mock model; ignore legacy asking premiums so unvalidated pricing predictions cannot reappear.
- Retain closed homeowner monthly snapshots in a separate browser ledger and update only the current month; historical seed records use a fixed sample profile so edits never rewrite past scores.
- Share the accessible monthly line chart between homeowner activity and liquidity history so tap, hover and keyboard month selection stay consistent.
- Keep Buyer property-only without selected-listing comparison state or routes and redirect its index to property search; retain similar-property benchmarks in individual property insights.
- Archive confirmed owner details and their snapshot ledger by property identity before switching, restoring a retained property's details when reselected so a different home never overwrites its records.
- Keep prototype buyer watchlists in a device-local key separate from legacy purchase plans; capture score at save time so tracking can distinguish monthly change from change since saving.
- Transfer purchased listings into the homeowner review draft, never directly into the active property; confirmation protects any existing home from accidental replacement.
- Keep uploaded transaction references separate from simulated liquidity inputs; use deduplicated Sale registrations with explicit area/subtype/status/bedroom/size matching and disclose source units assumptions so real references never imply validated predictions.
- Keep historical listing data separate from simulated model inputs; preserve source addresses/types, omit missing unit-size adjustments, use a deterministic Buyer-only illustrative fallback for unmatched configurations, and require actual size before homeowner review because building-level fields are not unit facts.
- Run purchase and agent-request demos entirely in browser state without transmitting or retaining contact details; keep owner selling drafts in property-scoped device storage and photo previews in temporary object URLs because no action represents a real enquiry or publication.
- Load the complete historical catalog from committed JSON partitions under 5 MB in public/data through the client-only Buyer layout and Query cache; same-origin static files support Vercel without Lovable asset proxies or oversized JavaScript bundles.

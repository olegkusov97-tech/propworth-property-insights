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
- Keep shared community calculations unchanged; buyer liquidity explorers adapt the browser-safe homeowner property model so both journeys show consistent indicators without altering legacy finance estimates.
- Normalize extended owner details at the homeowner boundary to retain compatibility with properties created by the buyer journey and older local records.
- Persist owner setup drafts and confirmed details in separate browser storage keys, so incomplete edits do not overwrite the active property.
- Derive homeowner segment indicators and activity from one price-independent mock model; ignore legacy asking premiums so unvalidated pricing predictions cannot reappear.
- Retain closed homeowner monthly snapshots in a separate browser ledger and update only the current month; historical seed records use a fixed sample profile so edits never rewrite past scores.
- Share the accessible monthly line chart between homeowner activity and liquidity history so tap, hover and keyboard month selection stay consistent.
- Keep buyer catalog, filtering and comparison rules in a browser-safe adapter; market segments use neutral home details while individual listings use their sample characteristics.
- Keep prototype buyer watchlists in a device-local key separate from legacy purchase plans; capture score at save time so tracking can distinguish monthly change from change since saving.
- Transfer purchased listings into the homeowner review draft, never directly into the active property; confirmation protects any existing home from accidental replacement.

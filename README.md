# Property Liquidity by Property Finder

A mobile-first prototype for exploring how easily a home could sell, with separate homeowner and buyer journeys. Built with [Lovable](https://lovable.dev/projects/bc2152e4-ca77-4c37-b305-5a4389e2d319).

## Current experience

### Homeowners
- Select or import a property through the demo onboarding flow and confirm its details.
- Explore estimated value, Property Liquidity Score, comparison with similar homes, buyer demand, supply competition and monthly changes.
- Switch properties without overwriting retained property details or closed monthly snapshots.
- Open the [Property Finder home-value estimator](https://www.propertyfinder.ae/en/tools/home-value-estimator) in a new tab.
- Use the selling demo to prepare a listing draft or select a sample agent. Nothing is published and no agent is contacted.

### Buyers
- Enter directly into historical property search, defaulting to Dubai, residential properties and Ready status.
- Search, filter, sort and paginate the full uploaded Bayut catalog; other available configurations remain accessible through filters.
- Open individual property details with liquidity scores, similar-property benchmarks, demand, competition, activity, history and matching transaction references.
- Save properties to a device-local watchlist.
- Try the viewing or offer demo, then mark a property as purchased and review it in the homeowner flow. Actual unit size is required before confirmation.

There is no standalone Markets page or selected-listing comparison page. Similar-property and market benchmarks remain inside individual property analysis.

## Market activity and presentation

“What’s happening in your market?” retains the comparison segment and five selectable metrics: Buyer Searches, Property Saves, Enquiries, Active Similar Listings and Comparable Sales. Cards use an evenly spaced two-column grid, with the final card spanning the full width. Icons, labels, muted periods and values follow a consistent hierarchy. Selecting a card updates the shared chart; 6M / 12M controls and month selection remain interactive.

Searches, saves and enquiries are monthly figures; active listings are month-end figures; comparable sales use a rolling 90-day period. Liquidity History uses teal for Your Property and orange for Similar Properties, with matching legends.

The shared design uses Open Sans, semantic CSS tokens and a compact sticky header. Back reverses active journey steps before navigating through history. Buyer search filters, sorting and pagination are represented in the URL.

## Data and limitations

- **Listings:** `bayut_selling_properties.csv` supplies the full 41,381-record historical catalog, covering 2021–2024. Advertised asking prices are not completed sale prices, and listings are not confirmed currently available.
- **Transactions:** `transactions-2026-11-22.csv` supplies uploaded DLD transaction references. The retained reference subset is matched conservatively by available property characteristics. These records are user-supplied and not independently verified.
- **Simulations:** valuations, liquidity, demand, competition and activity snapshots are illustrative and unvalidated, not predictions. Real transaction references stay separate from simulated model inputs.
- **Incomplete benchmarks:** Buyer listings retain the full analysis using stable, property-specific illustrative simulations when matching benchmarks are insufficient.
- **Missing details:** missing unit size is not inferred from building area. Available source addresses, property types and characteristics are retained.
- **Demo actions:** viewing requests, offers, purchases, agent requests and listing preparation do not submit real enquiries, payments or transactions. Contact details remain in session memory and are not sent or persisted.

Owner details, drafts, retained homes, monthly snapshots and saved Buyer properties are stored locally on the device. This prototype has no connected login or shared database. Photo previews use temporary object URLs.

## Technical structure

- React 19 and TanStack Start with file-based TanStack Router routes.
- Tailwind CSS v4 and shared design-system controls.
- `src/components/pw/`: journey UI, shared navigation and interactive charts.
- `src/lib/`: property models, Buyer adapters, browser storage and reference matching.
- `src/assets/`: asset pointers, including the immutable full historical catalog.
- `src/data/`: compact reference datasets.
- `src/test/`: model, data-matching, navigation and routing tests.

The Buyer layout loads the full historical catalog client-side through the Query cache rather than embedding it in source bundles. See [route documentation](src/routes/README.md) and [project rules](AGENTS.md) for conventions.

## Local development

Install Bun and use a current Node.js version compatible with the project dependencies. From the repository root:

```sh
bun install
bun run dev
```

Run checks:

```sh
bun run test
bun run lint
bun run build
```

The historical catalog requires access to its hosted asset URL. Do not commit credentials, repository metadata, dependencies or generated build output as deliverables.

### Vercel catalog portability limitation

The current catalog URL uses Lovable's `/__l5e/assets-v1/` infrastructure, which is not served by a standalone Vercel deployment. A complete static copy at `/data/bayut-buyer-listings.json` was verified locally with all 41,381 records, including direct Buyer navigation and refresh, but could not be committed: the file is 17.9 MB and this project's Git commit check enforces a 10 MB per-file limit. The attempted loader change was rolled back so it does not reference an absent deployment file. The original hosted catalog remains intact. Production portability requires a supported way to deploy the full file or suitable public storage; Vercel verification remains pending.

## GitHub and publishing

Changes committed in Lovable sync to the connected repository through Lovable’s Git integration. Manage the repository connection and check sync status in **Project settings → Git**. Repository sync saves source code; publishing the app is a separate action.

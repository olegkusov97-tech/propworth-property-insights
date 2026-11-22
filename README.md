# PropWorth Property Insights

I want to build a mobile-first prototype for Property Finder called PropWorth.

The product is designed for two different types of users with different problems and different user journeys. These should be treated as two separate scenarios within the same product, not as one shared flow.

Scenario 1: Existing Homeowners

These are people who already own a property in the UAE.

Their main problem is that they may know the estimated market value of their property, but they don't know how liquid it is, how strong buyer demand is, or how likely they are to sell it at a particular price.

For these users, I want to build a property liquidity dashboard that shows:

Estimated property value

Buyer demand for similar properties

Competition from other properties for sale

Liquidity Score

Indicative probability of selling within 90 days

How these indicators change over time

The goal is to help homeowners understand how easily they could sell their property and give them a reason to return regularly.

Scenario 2: Renters and Potential Buyers

These are people who currently rent in the UAE and are considering buying their first property.

Their problem is different. They are not trying to sell a property. They want to understand what they can afford and which types of properties would be a good purchase.

For these users, I want to build a buyer-focused experience that helps them:

Understand their purchase budget and financial readiness

Discover which communities and property types have the strongest buyer demand

Compare properties based on liquidity, not just price

Understand which properties may be easier to resell in the future

Save a purchase plan and monitor relevant market changes

The goal is to help renters make more informed buying decisions and eventually become homeowners.

Important product structure

The first screen must clearly offer two options:

I Own a Property → Homeowner journey

I'm Looking to Buy → Buyer journey

Each option should lead to its own experience, with different screens, information and actions.

Both journeys use the same underlying property market data and liquidity indices, but present them differently based on the user's needs.

The journeys should connect when a buyer purchases a property and becomes a homeowner. At that point, they can start tracking the liquidity and value of their own property.

The central feature of PropWorth is Property Liquidity Intelligence, using aggregated buyer search activity, property saves, enquiries, available supply and comparable transactions to estimate demand and liquidity.

Use simulated data for the prototype and clearly identify any indicative sale probabilities as unvalidated estimates.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bc2152e4-ca77-4c37-b305-5a4389e2d319).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

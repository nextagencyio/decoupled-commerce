# Decoupled Commerce

A hybrid e-commerce starter combining **Drupal CMS** for content management with **Shopify** for commerce functionality.

## Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    Next.js Frontend                       │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │  Drupal Content  │         │ Shopify Commerce │        │
│  │  (via GraphQL)   │         │ (Storefront API) │        │
│  ├──────────────────┤         ├──────────────────┤        │
│  │ • Blog posts     │         │ • Products       │        │
│  │ • Landing pages  │         │ • Collections    │        │
│  │ • About/Contact  │         │ • Cart           │        │
│  └────────┬─────────┘         │ • Checkout →     │        │
│           │                   └────────┬─────────┘        │
│           ▼                            ▼                  │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │  Decoupled.io    │         │  Shopify Store   │        │
│  │  Drupal Space    │         │                  │        │
│  └──────────────────┘         └──────────────────┘        │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## Features

- **Products & Collections** - Browse Shopify products with filtering and sorting
- **Cart & Checkout** - Slide-out cart with Shopify-hosted secure checkout
- **Blog** - CMS-powered blog with categories and rich content
- **Static Pages** - About, Contact, and other editorial pages from Drupal
- **Loading Skeletons** - Smooth loading states for all pages
- **Responsive Design** - Mobile-first, works on all devices

## Quick Start

### Interactive Setup (Recommended)

```bash
npm install
npm run setup
```

The setup wizard will:
1. Connect to your Decoupled.io account (or create one)
2. Create a Drupal space for blog content
3. Import sample blog posts and pages
4. Prompt for your Shopify credentials
5. Seed sample products (if your store is empty)

### Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Shopify Setup

### Required: Create a Custom App

1. Go to **Shopify Admin** → **Settings** → **Apps and sales channels**
2. Click **Develop apps** → **Create an app**
3. Name it (e.g., "Storefront API")

### Required: Configure Storefront API

1. In your app, go to **Configuration** tab
2. Under **Storefront API integration**, click **Configure**
3. Enable these scopes:
   - `unauthenticated_read_product_listings` - Read products
   - `unauthenticated_read_product_inventory` - Read inventory
   - `unauthenticated_read_checkouts` - Read cart
   - `unauthenticated_write_checkouts` - Create/update cart
4. Click **Save**

### Required: Install the App

1. Go to **API credentials** tab
2. Click **Install app**
3. Copy the **Storefront API access token** (not the Admin API token)

### Optional: Admin API for Seeding Products

If you want the setup script to seed sample products:

1. Go to **Configuration** tab
2. Under **Admin API integration**, click **Configure**
3. Enable these scopes:
   - `write_products` - Create products
   - `read_products` - Read products
   - `write_publications` - Publish to sales channels
   - `read_publications` - Read sales channels
4. Click **Save** and reinstall the app
5. Copy the **Admin API access token** from API credentials

### Publish Products to Storefront API

Products must be published to the "Storefront API" sales channel to be visible:

1. Go to **Products** in Shopify Admin
2. Select products → **More actions** → **Manage sales channels**
3. Enable the **Storefront API** channel

<details>
<summary><strong>Manual Environment Setup</strong></summary>

### 1. Copy Environment File

```bash
cp .env.example .env.local
```

### 2. Configure Drupal (Decoupled.io)

```env
NEXT_PUBLIC_DRUPAL_BASE_URL=https://your-space.decoupled.website
DRUPAL_CLIENT_ID=your-client-id
DRUPAL_CLIENT_SECRET=your-client-secret
DRUPAL_REVALIDATE_SECRET=your-random-secret
```

### 3. Configure Shopify

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-token
```

### 4. Import Content

```bash
npm run setup-content
```

</details>

## Project Structure

```
├── app/
│   ├── components/          # Shared UI components
│   ├── products/            # Product listing & detail pages
│   ├── collections/         # Collection listing & detail pages
│   ├── blog/                # Blog listing & article pages
│   ├── cart/                # Cart page
│   ├── [...slug]/           # Catch-all for Drupal pages
│   ├── api/                 # API routes
│   └── page.tsx             # Homepage
├── lib/
│   ├── apollo-client.ts     # Drupal GraphQL client
│   ├── shopify-client.ts    # Shopify Storefront client
│   ├── cart-context.tsx     # Cart state management
│   ├── types.ts             # TypeScript types
│   └── *-queries.ts         # GraphQL queries
├── data/
│   └── commerce-content.json # Drupal content model
└── scripts/
    └── setup.ts             # Interactive setup wizard
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run setup` | Run interactive setup wizard |
| `npm run setup-content` | Import sample Drupal content |
| `npm run lint` | Run ESLint |

## Routes

| Path | Source | Description |
|------|--------|-------------|
| `/` | Shopify + Drupal | Homepage with featured products |
| `/products` | Shopify | All products listing |
| `/products/[handle]` | Shopify | Product detail page |
| `/collections` | Shopify | All collections |
| `/collections/[handle]` | Shopify | Collection products |
| `/cart` | Shopify | Shopping cart |
| `/blog` | Drupal | Blog listing |
| `/blog/[slug]` | Drupal | Blog post |
| `/[...slug]` | Drupal | CMS pages (about, contact) |

## Customization

### Styling

This starter uses Tailwind CSS with a purple theme. Customize in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your brand colors
      },
    },
  },
},
```

### Adding Content Types

Edit `data/commerce-content.json` to add new content types, then run:

```bash
npm run setup-content
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build the production bundle:

```bash
npm run build
npm run start
```

## Troubleshooting

### Products not showing
- Ensure products are published to the "Storefront API" sales channel
- Check that your Storefront API token has `unauthenticated_read_product_listings` scope
- Clear `.next` cache and restart: `rm -rf .next && npm run dev`

### Cart not working (401 error)
- Your Storefront API token needs `unauthenticated_write_checkouts` scope
- Go to app Configuration → Storefront API → add the scope → reinstall app

### Blog not loading
- Run `npm run setup` to create a Drupal space and import content
- Or manually configure Drupal credentials in `.env.local`

## Resources

- [Decoupled.io Documentation](https://decoupled.io/docs)
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT

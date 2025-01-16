## Recommended Folder Structure

```
src/
├── app/                    # Next.js app router pages and API routes
│   ├── (auth)/            # Auth group routes
│   ├── (marketing)/       # Marketing group routes
│   ├── api/               # API routes
│   ├── analytics/         # Analytics page
│   ├── market/           # Market page
│   └── ...               # Other pages
├── components/            # Reusable components
│   ├── features/         # Feature-specific components
│   │   ├── analytics/    # Analytics-specific components
│   │   ├── portfolio/    # Portfolio-specific components
│   │   └── ...
│   ├── ui/              # Generic UI components
│   └── layout/          # Layout components
├── lib/                 # Utilities and helpers
└── styles/             # Global styles
```

Guidelines:
1. `src/app/*` - Only page components and API routes
2. `src/components/features/*` - Feature-specific components
3. `src/components/ui/*` - Reusable UI components
4. `src/components/layout/*` - Layout components

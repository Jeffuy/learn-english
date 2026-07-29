# Word Rally

A classroom team game for learning English. The entire codebase uses JavaScript
and runs on Next.js.

## Requirements

- Node.js `>=22.13.0`

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm test
```

## Project structure

- `app/` contains the game interface and metadata
- `public/` contains the favicon and social preview image
- `tests/` checks the core game flow and deployment configuration

## Deploying to Vercel

Import the repository and use the **Next.js** framework preset. Keep the Build
Command as `npm run build` and leave Output Directory empty so Vercel uses the
standard `.next` output automatically.

## Useful commands

- `npm run dev`: start local development
- `npm run build`: create the standard Next.js `.next` output
- `npm run start`: run the production build locally
- `npm run lint`: check the JavaScript source
- `npm test`: build and verify the Word Rally flow

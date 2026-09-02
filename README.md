# Dark Universe — Free Learning Platform

The main app is the supplied Next.js portal. The supplied Unacademy project is kept in
`apps/unacademy/` without changing its UI/source structure.

## Local development

Terminal 1:
```bash
npm install
npm run dev:portal
```

Terminal 2:
```bash
cd apps/unacademy
npm install
npm run dev -- --port 3001
```

Then open `http://localhost:3000`. The Unacademy card/navigation item opens `/unacademy`,
which isolates the supplied Unacademy app in a full-screen iframe.

## Production

Deploy `apps/unacademy` separately and set this environment variable on the main Next.js app:
```env
NEXT_PUBLIC_UNACADEMY_APP_URL=https://YOUR-UNACADEMY-APP-DOMAIN
```

The portal does not rewrite Unacademy's CSS/components, so its supplied interface remains isolated.

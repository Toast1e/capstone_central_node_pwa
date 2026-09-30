# Central Node PWA

A [Next.js](https://nextjs.org) progressive web app. This guide covers getting the project onto your machine, the git workflow we use, and running the app locally.

## 1. Clone the project

```bash
git clone https://github.com/Toast1e/capstone_central_node_pwa.git
cd central_node_pwa
npm install
```

## 2. Run the app

```bash
npm run dev
```

The terminal will print two URLs:

```
- Local:    http://localhost:3000
- Network:  http://192.xxx.xxx.xxx:3000
```

- **Local** – open this in a browser of the machine.
- **Network** – open this on any other device (phone, tablet, laptop) connected to the **same Wi-Fi / LAN** to test the app there. The IP address is your machine's local network address and will differ per machine.

Other scripts:

| Command         | What it does                     |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the development server     |
| `npm run build` | Create a production build in `out/` |
| `npm run start` | Serve the production build from `out/` |
| `npm run lint`  | Run ESLint                       |
| `npm run icons` | Regenerate the app icons (see [Deployment](#deployment)) |

## 3. Git workflow

### Pull the latest changes

Always start from an up-to-date `main`:

```bash
git checkout main
git pull origin main
```

### Create a branch

Branch names use the ticket ID followed by a short, kebab-case description:

```
CAPST-<ticket-number>-<short-description>
```

Examples: `BUS-93-login-page`, `BUS-104-fix-navbar-overflow`

```bash
git checkout -b BUS-93-login-page
```

### Commit and push your work

```bash
git add .
git commit -m "BUS-93: add login page"
git push -u origin BUS-93-login-page
```

Keep your branch up to date with `main` while you work:

```bash
git pull origin main
```

### Open a pull request

1. Go to the repository on GitHub. After pushing, GitHub shows a **Compare & pull request** button for your branch – click it (or go to **Pull requests → New pull request**).
2. Set **base** to `main` and **compare** to your branch (e.g. `BUS-93-login-page`).
3. Title the PR with the ticket ID, e.g. `BUS-93: Add login page`, and describe what changed and how to test it.
4. Request a reviewer and create the pull request.
5. Once approved, merge the PR and delete the branch.

Then switch back to `main` and pull so you're ready for the next task:

```bash
git checkout main
git pull origin main
```

## Project structure

```
src/
  app/            Routes only (Next.js App Router) - thin files that wire things up
    layout.jsx      Root layout: <html>, Ant Design setup, providers
    providers.jsx   Ant Design theme + AuthProvider
    manifest.js     Web app manifest (home-screen install)
    login/          /login - stands alone, no app bar
    (main)/         Pages that use MainLayout   -> /home, /profile
  layouts/        MainLayout (page content + bottom app bar)
  views/          The actual page components (Login, Home, Profile)
  components/     Shared components (RequireAuth)
  contexts/       React contexts (AuthContext)
public/           Static assets (icons/ is generated)
scripts/          generate-icons.mjs - draws the app icons
next.config.ts
package.json
```

A folder in parentheses is a [route group](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups): it picks the layout but does not appear in the URL. Every page inside `(main)` gets the bottom app bar.

The Home and Profile pages currently hold **example content only**, to demonstrate the components and the navigation.

> **Do not create a `src/pages` folder.** Next.js reserves that name for its older Pages Router and would turn every file in it into a URL. Page components go in `src/views`.

### Adding a page

1. Create the component in `src/views/<Name>/<Name>.jsx`. Start the file with `"use client";` if it uses Ant Design components, state or event handlers.
2. Create `src/app/(main)/<url>/page.jsx` that imports and renders it (copy `src/app/(main)/home/page.jsx`).
3. To show it in the bottom app bar, add an entry to `NAV_ITEMS` in `src/layouts/MainLayout.jsx`.

### Authentication

The app has login only - there is no registration. Authentication is currently **stubbed**: the login form checks nothing and every login succeeds. `src/contexts/AuthContext.jsx` holds the placeholder `login()` and an `AUTH_ENABLED` flag (off). When it is switched on, `RequireAuth` redirects signed-out visitors away from every page in `(main)` to `/login`.

### Styling

UI components come from [Ant Design](https://ant.design); the brand colour is set once in `src/app/providers.jsx`. Ant Design's styles are placed in a CSS layer (see `src/app/globals.css`), so rules in our own `.css` files always override its defaults without needing `!important`.

## Deployment

The app runs on the central node's Raspberry Pi. Phones join the Pi's Wi-Fi and open it in the browser, or install it to the home screen.

- **Static export.** `next.config.ts` sets `output: "export"`, so `npm run build` produces plain HTML/CSS/JS in `out/` and no Node.js server runs on the Pi. That rules out anything that needs a server: route handlers, server actions, `cookies()`/`headers()`, and `redirects`/`rewrites` in `next.config.ts`. Fetch data from the Pi's API with relative URLs, e.g. `fetch("/api/latest")`. Cookies the API sets are sent along automatically.
- **Built and served by the backend repo.** The `web` container in [capstone_central_node_backend](https://github.com/Toast1e/capstone_central_node_backend) builds this repo and serves `out/` with NGINX, next to the API. It expects the two repos in the same folder. Its README has the deploy steps.
- **Installable app.** `src/app/manifest.js` describes the app to phones (name, colours, icons). Installing only works when the site is served over HTTPS.
- **Icons.** `scripts/generate-icons.mjs` draws the icon and writes `public/icons/*`, `src/app/apple-icon.png` and `src/app/favicon.ico`. To change it, edit the SVG in that script, run `npm run icons`, and commit the new images.

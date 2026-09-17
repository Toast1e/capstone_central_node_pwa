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
| `npm run build` | Create a production build        |
| `npm run start` | Serve the production build       |
| `npm run lint`  | Run ESLint                       |

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
BUS-<ticket-number>-<short-description>
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
app/          Pages, layouts and global styles (Next.js App Router)
public/       Static assets
next.config.ts
package.json
```

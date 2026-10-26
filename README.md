# Chessboard Memory Task (SDT)

A static Next.js web app for a change-detection working-memory experiment using chess
positions, scored with Signal Detection Theory.

## 1. Create the project from scratch

```bash
npx create-next-app@15 chess-sdt --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd chess-sdt
npm install react-chessboard chess.js jstat
```

(Or just clone this repo and run `npm ci`.)

## Run locally

```bash
npm run dev          # http://localhost:3000
npm run build        # static export -> ./out
npx serve out        # preview the exported site
```

## Structure

```
next.config.ts                 static export + basePath for GitHub Pages
.github/workflows/deploy.yml   build & deploy on every push to main
public/.nojekyll
src/
  app/page.tsx                 welcome -> trials -> results
  app/layout.tsx, globals.css
  hooks/useExperiment.ts       participant, trial list, responses, stage
  hooks/useTrialTimeline.ts    fixation 500 ms -> memory 3000 ms -> delay 2000 ms -> probe
  components/WelcomeScreen.tsx instructions + Participant ID + Elo dropdown
  components/TrialRunner.tsx   one trial on a constant gray background
  components/Board.tsx         read-only react-chessboard
  components/ConfidenceScale.tsx  1–6 buttons (keys 1–6 also work)
  components/ResultsScreen.tsx SDT table, trial log, CSV download
  lib/positions.ts             random legal-looking placements, one-piece displacement (chess.js)
  lib/trials.ts                16-trial block: 2,4,6,8 × (2 Same + 2 Different, shuffled)
  lib/sdt.ts                   H, F, 1/(2n) correction, z via jStat, d', c, CSV
  types/jstat.d.ts             type declarations for jstat
```

## Deploy to GitHub Pages

1. Create an empty repository on GitHub, e.g. `chess-sdt`.
2. Push the code:
   ```bash
   git add -A
   git commit -m "Chess SDT experiment"
   git branch -M main
   git remote add origin https://github.com/<your-user>/chess-memory-task.git
   git push -u origin main
   ```
3. On GitHub go to **Settings → Pages → Build and deployment → Source** and choose
   **GitHub Actions**.
4. Open the **Actions** tab. The *Deploy to GitHub Pages* workflow runs on each push to
   `main` (you can also start it by hand with *Run workflow*). When it finishes, the site is at
   `https://<your-user>.github.io/chess-memory-task/`.

The workflow gets the correct base path (`/chess-memory-task`) from `actions/configure-pages` and
passes it to the build as `NEXT_PUBLIC_BASE_PATH`, so renaming the repo or using a custom
domain needs no code changes.

### Alternative: `gh-pages` branch (no Actions)

```bash
npm install --save-dev gh-pages
```
Add to `package.json` scripts:
```json
"deploy": "NEXT_PUBLIC_BASE_PATH=/chess-memory-task next build && touch out/.nojekyll && gh-pages -d out --dotfiles"
```
Run `npm run deploy`, then set **Settings → Pages → Source** to *Deploy from a branch*,
`gh-pages` / `(root)`.

## Notes on the method

* **Positions:** pieces are drawn without replacement from the 32 pieces of a normal set, with
  no pawns on ranks 1/8, at most one king per side, and no king in check (checked with
  chess.js). On *Different* trials one piece moves one king-step to an empty adjacent square,
  and the resulting position must pass the same checks.
* **Scoring:** a "Same" response is a rating of 4–6. H = P("Same" | Same trial),
  F = P("Same" | Different trial). Rates of 0 or 1 are replaced by 1/(2n) or 1 − 1/(2n),
  where n is the number of trials of that type at that set size (n = 2, so 0.25 or 0.75).
  d′ = Z(H) − Z(F), c = −Z(F) as specified. The conventional c = −½[Z(H)+Z(F)] is also shown
  under the table.
* **Timing** uses `setTimeout`, which is accurate to about one frame (~16 ms) in a browser.
  It is fine for 500/3000/2000 ms intervals but not for millisecond-precise presentation.
* **Data** stays in the browser. Use *Download data (CSV)* on the results screen to save
  trial-level data (rating, correctness, RT, which piece moved, both FENs).

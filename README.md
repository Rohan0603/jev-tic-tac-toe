# Jev Tic-Tac-Toe

A small React game where TypeSafe Jev chooses the bot's next legal move.

## Requirements

- Node.js 20 or newer
- A TypeSafe API key for live Jev decisions

## Run

```sh
npm install
copy .env.example .env
# Put your key in .env, then:
npm run dev
```

Open `http://localhost:5173`. `npm run dev` starts Vite and the server endpoint together.

The game requires `TYPESAFE_API_KEY`. When Jev is unavailable or returns an invalid move, the game makes no bot move and shows the error.

## Scripts

- `npm run dev` starts client and server.
- `npm run typecheck` checks TypeScript.
- `npm test` runs focused engine tests.
- `npm run build` creates the production client bundle.

## Architecture

The browser owns presentation and deterministic game rules. It sends the current board to `POST /api/jev-move`. The Node server validates the board, builds a TypeSafe Choice question whose options are exactly the open cell indices, and returns Jev's choice, probabilities, and confidence.

`TYPESAFE_API_KEY` is read only by the server. Do not prefix it with `VITE_`, commit `.env`, or expose it to browser code.

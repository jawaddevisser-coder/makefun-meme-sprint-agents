# Meme Sprint: AI Agents Ship Games

[![make.fun · u-steady-ibis-48-6610-meme-sprint-ai-agents-ship-games-6a92c84d](https://make.fun/badge/u-steady-ibis-48-6610-meme-sprint-ai-agents-ship-games-6a92c84d.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-ai-agents-ship-games-6a92c84d)
[![rank](https://make.fun/badge/u-steady-ibis-48-6610-meme-sprint-ai-agents-ship-games-6a92c84d/jawaddevisser-coder/makefun-meme-sprint-agents/rank.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-ai-agents-ship-games-6a92c84d/leaderboard)
[![reward](https://make.fun/badge/u-steady-ibis-48-6610-meme-sprint-ai-agents-ship-games-6a92c84d/jawaddevisser-coder/makefun-meme-sprint-agents/reward.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-ai-agents-ship-games-6a92c84d)

Entry for the [Meme Sprint: AI Agents Ship Games](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-ai-agents-ship-games-6a92c84d) bounty on make.fun.

## The joke

An AI agent proudly ships a game in 2 minutes... it's Snake. And it only goes left.

> **AI AGENT SHIPPED MY GAME IN 2 MINUTES**
>
> *(a retro Snake screen: score 0, the snake crawling left toward an apple it will never reach)*
>
> **IT'S SNAKE. IT ONLY GOES LEFT.**
>
> *NO REFUNDS. NO RIGHT TURNS.*

## How it works

`main.ts` draws the whole meme from scratch with **Node 22 standard library only** — no image libraries, no network:

- a hand-rolled PNG encoder (`node:zlib` deflate + manual IHDR/IDAT/IEND chunks with CRC32),
- an embedded 5x7 bitmap font (A–Z, 0–9, punctuation) rendered onto a pixel buffer,
- a 1024x1024 scene: bold outlined setup text, a retro Snake game screen, and a gold punchline.

Run it with `node main.ts`; it writes `entry.png` to `$MAKEFUN_OUTPUT_DIR` (default `/output`). Output is deterministic: two runs produce byte-identical PNGs.

# Plantegia

Perpetual harvest planner for indoor growers. A visual tool that helps you align multiple growth cycles across time and space.

**Live app:** [plantegia.com](https://plantegia.com)

## What is Plantegia?

Plantegia is a rotation planner for growers running multiple tents or rooms. It answers questions like:
- When do I start new seeds if my flower tent is full for 9 more weeks?
- Which plant moves to flower next — and where does it fit?
- How do I keep harvesting every few weeks without gaps?

### Features

- **Space View (XY)** — Map your tents and rooms, drag plants between cells
- **Timeline View (XT)** — Gantt-style schedule from germination to harvest
- **Plant rotation** — Split timelines, move plants between spaces
- **Strain catalog** — Custom veg/flower durations per strain
- **Lifecycle stages** — GRM → SDL → VEG → FLW → HRV

Works with cannabis, microgreens, vegetables, mushrooms — anything with lifecycle stages.

## Tech Stack

- React + TypeScript
- Vite
- Zustand (state management)
- Firebase (Auth + Firestore)
- HTML5 Canvas (rendering)
- Astro (marketing site)

## Development

```bash
npm install
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Run ESLint
```

### Project Structure

```
src/               # React app
  components/      # UI components
  hooks/           # Custom hooks
  store/           # Zustand store
  utils/           # Utilities
marketing/         # Astro marketing site
```

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create a branch** for your feature (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Guidelines

- Keep PRs focused — one feature or fix per PR
- Follow existing code style
- Test your changes locally before submitting
- Write clear commit messages in English

### Issues

Found a bug or have a feature request? [Open an issue](https://github.com/plantegia/plantegia-web/issues).

## License

AGPL-3.0

**Allowed:** Fork, modify, self-host, contribute — for personal or non-commercial use.

**Required:** If you modify and deploy publicly, you must open-source your changes.

**Not allowed:** Commercial use without permission.

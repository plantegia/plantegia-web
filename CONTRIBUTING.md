# Contributing to Plantegia

Thanks for your interest in contributing! This document provides guidelines for contributing to Plantegia.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/plantegia-web.git`
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`

## Development Setup

```bash
npm install      # Install dependencies
npm run dev      # Start Vite dev server (React app)
npm run lint     # Run ESLint
npm run build    # Build for production
```

The app runs at `http://localhost:5173/p/`

## Project Structure

```
src/               # React app source
  components/      # UI components
  hooks/           # Custom React hooks
  store/           # Zustand state management
  utils/           # Utility functions
  lib/             # Firebase and external services
marketing/         # Astro marketing site (optional)
```

## Making Changes

### Before You Start

- Check existing [issues](https://github.com/plantegia/plantegia-web/issues) to avoid duplicates
- For large changes, open an issue first to discuss the approach
- Read the architecture overview in CLAUDE.md for context

### Code Style

- TypeScript for all new code
- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Keep components focused and small

### Commit Messages

- Write in English
- Use present tense ("Add feature" not "Added feature")
- Keep the first line under 72 characters
- Reference issues when relevant: "Fix #123: description"

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test locally: `npm run dev` and `npm run lint`
4. Commit with clear messages
5. Push to your fork
6. Open a PR against `main`

### PR Guidelines

- Keep PRs focused — one feature or fix per PR
- Include a clear description of what changed and why
- Add screenshots for UI changes
- Ensure lint passes

## What We're Looking For

- Bug fixes
- Performance improvements
- Accessibility improvements
- Documentation improvements
- New features that align with project goals

## Questions?

- Open an issue for bugs or feature requests
- Email builder@plantegia.com for other questions

## License

By contributing, you agree that your contributions will be licensed under AGPL-3.0.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vite-based React application with TypeScript, featuring a component-based architecture for demonstrating React patterns and examples.

## Development Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint on the codebase
- `npm run preview` - Preview production build locally

## Architecture

### Project Structure
- `/src/components/` - Reusable components organized by feature/demo
- `/src/components/demo1/`, `/src/components/demo2/` - Demo components showcasing different React patterns
- `/src/components/component1/` - Shared/base components
- Main App renders demos side-by-side with flexbox layout

### Tech Stack
- **Vite**: Using rolldown-vite (latest) as the build tool
- **React 19.1.0**: Latest React with modern features
- **TypeScript**: Strict type checking enabled
- **SWC**: Fast refresh via @vitejs/plugin-react-swc
- **ESLint**: Code quality with React-specific rules

### Key Patterns
- Components use default exports
- Functional components with TypeScript
- CSS imports for styling
- Component composition pattern (Demo components wrap base components)

## Development Notes

This project uses the newer React-SWC plugin for faster builds compared to Babel. The codebase follows a demo-oriented structure where each demo showcases different React capabilities or patterns.
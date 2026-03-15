# System Latency Estimator

An interactive web-based tool for estimating end-to-end latency in distributed system architectures. Build pipelines by dragging infrastructure components onto a canvas, configure latency profiles, simulate request loads, and identify bottlenecks.

## Features

- **Drag-and-drop canvas** — Build system diagrams with 15+ pre-configured components (DNS, CDN, API Gateway, Lambda, Redis, SQL/NoSQL databases, message queues, etc.)
- **Latency simulation** — Model optimistic (p50), realistic (p50–p95), and pessimistic (p95–p99) scenarios across configurable RPS (1–100,000)
- **Bottleneck detection** — Queuing theory (M/M/1) identifies saturated components, queue depths, and utilization levels
- **Critical path analysis** — Automatically finds the longest latency path, handling parallel and sequential branches
- **Load curve visualization** — Charts showing how latency degrades as request rate increases
- **Preset templates** — Simple Web App, Microservice Pipeline, and Event-Driven architectures
- **Persistence** — Auto-save to LocalStorage, export/import as JSON files
- **Undo/redo** — Full history with keyboard shortcuts

## Tech Stack

- **React 19** + **TypeScript** — UI framework
- **Zustand** + **Zundo** — State management with undo/redo
- **@xyflow/react** — Interactive node-based flow canvas
- **Recharts** — Data visualization
- **Dagre** — Automatic graph layout
- **Tailwind CSS 4** — Styling
- **Vite 8** — Build tooling
- **Vitest** + **Testing Library** — Testing

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── domain/           # Business logic & calculation engine
│   ├── engine/       # Graph analysis, queuing theory, scenario modeling
│   ├── types.ts      # Core type definitions
│   ├── component-catalog.ts  # Pre-configured component library
│   └── validation.ts
├── store/            # Zustand store (canvas, simulation, UI slices)
├── features/
│   ├── canvas/       # Interactive diagram editor
│   ├── sidebar/      # Component library panel
│   ├── results/      # Analysis & visualization panels
│   ├── simulation/   # RPS controls
│   ├── config/       # Node configuration drawer
│   ├── presets/      # Template pipelines
│   └── persistence/  # Save/load/export
├── layout/           # Page layout components
└── shared/           # Reusable UI components & utilities
```

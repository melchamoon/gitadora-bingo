# Project Architecture Map: GITADORA BINGO

## 1. Project Purpose
A React-based web application for creating and customizing bingo cards for the music video game "GITADORA". Users can search for songs, assign difficulties/levels, arrange them in a grid via drag-and-drop, and export the final bingo card as an image.

### Tech Stack
- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Drag & Drop**: @dnd-kit
- **Image Export**: html-to-image
- **Icons**: Lucide React

---

## 2. Module Directory

| Directory / File | Responsibility |
|:---|:---|
| `src/` | Main source code directory. |
| `src/main.tsx` | Application entry point. Renders the root `App` component. |
| `src/App.tsx` | Core application component. Manages global state (selected songs, grid size, search), layout, and primary event handlers. |
| `src/components/` | Reusable UI components. |
| `src/components/BingoCell.tsx` | Individual cell component within the bingo grid, supporting drag-and-drop and song display. |
| `src/types/` | Global TypeScript type definitions. |
| `src/types/bingo.ts` | Domain types for `Music`, `Difficulty`, `BingoSize`, and related utility functions for colors/URLs. |
| `src/lib/` | Infrastructure and helper utilities. |
| `src/lib/utils.ts` | Standard styling utilities (tailwind-merge, clsx). |
| `src/data/` | Static data and mock assets (e.g., `musics.ts` for song lists). |
| `public/images/` | Static assets, including song jackets. |

---

## 3. Key Logic & Functions Map

- **Entry Point**: `src/main.tsx`
- **Global State Management**: `App.tsx` uses `useState` for:
  - `selectedMusics`: Array of `BingoCellData` representing the grid contents.
  - `bingoSize`: Current grid dimensions (e.g., 3x3).
- **Search Logic**: `filteredMusics` (memoized) in `App.tsx` filters `MOCK_MUSICS` based on user input.
- **Drag & Drop**: Implemented in `App.tsx` using `DndContext` and `SortableContext`. `handleDragEnd` manages array reordering.
- **Image Generation**: `handleDownload` in `App.tsx` uses `toPng` from `html-to-image` to capture the `bingoRef` DOM element.
- **Dynamic Styling**: `getDifficultyColor` and `getDifficultyTextColor` in `src/types/bingo.ts` provide difficulty-specific UI colors.

---

## 4. Data & Control Flow

1. **Input**: User searches for a song via the search bar and selects difficulty/level.
2. **Action**: `handleAddMusic` updates `selectedMusics` state.
3. **Display**: `App.tsx` renders a grid of `BingoCell` components based on `selectedMusics`.
4. **Interaction**: User reorders songs via pointer/touch events (managed by `@dnd-kit`).
5. **Output**: `handleDownload` captures the rendered grid as a PNG file for the user to save.

---

## 5. Implementation Rules

- **Component Design**: Functional components with hooks.
- **State Flow**: Unidirectional data flow from `App.tsx` down to components.
- **Styling**: Atomic CSS via Tailwind. Custom styles for the grid are handled via inline styles in `App.tsx` for dynamic grid sizing.
- **Type Safety**: All domain data must strictly follow types defined in `src/types/bingo.ts`.
- **Naming Conventions**:
  - Components: PascalCase (e.g., `BingoCell.tsx`)
  - Types: PascalCase (e.g., `Music`)
  - Functions/Variables: camelCase (e.g., `handleDragEnd`)
- **Asset Management**: Song jacket URLs are generated via `getImageUrl` utility using the song's numeric ID.

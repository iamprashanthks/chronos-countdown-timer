# ⏳ Chronos Countdown Timer

A modern, high-precision, cyberpunk-inspired event countdown timer built with **React 19**, **Vite**, and **Tailwind CSS**. Chronos delivers a sleek stage display for tracking important milestones, product launches, events, personal goals, and holidays.

---

## ✨ Features

- ⏱️ **High-Precision Tracking**: Millisecond-accurate live countdowns with visual progress indicators.
- 🎨 **Dynamic Theme System**: Choose between 6 distinct visual themes:
  - 🟡 **Amber Glow** (Warm Cyberpunk)
  - 🩵 **Neon Cyan** (Futuristic Blue)
  - 🟢 **Emerald Matrix** (Terminal Green)
  - 🌅 **Sunset Horizon** (Vibrant Violet & Rose)
  - ⚪ **Monochrome Dark** (Clean Minimalist)
  - ⬛ **Obsidian Glass** (Deep Dark Glassmorphism)
- 📐 **Flexible Display Modes**: Standard, Large, and Monumental display sizes tailored for any screen.
- 🖥️ **Distraction-Free Fullscreen Stage**: Fullscreen mode for live event displays and streams.
- 🎆 **Celebration & Audio Effects**: Built-in Web Audio completion chimes and interactive celebratory confetti.
- 🔗 **Instant Sharing**: Share countdown timers effortlessly via URL parameters.
- 🗂️ **Timer Management**: Organize by category (*Milestone, Work, Holiday, Personal, Launch, Event*), pin favorites, edit, and search.
- ⌨️ **Keyboard Shortcuts**: Power-user friendly hotkeys for seamless navigation.
- 💾 **Local Storage Persistence**: Automatically saves custom timers and active selections locally.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `F` | Toggle Fullscreen mode |
| `N` | Open Create New Timer modal |
| `E` | Edit current active timer |
| `→` (Right Arrow) | Switch to Next timer |
| `←` (Left Arrow) | Switch to Previous timer |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher recommended)
- **npm** or **bun**

### Installation

1. Clone the repository and navigate to the project root:
   ```bash
   cd chronos-countdown-timer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   # Standard start command
   npm run dev
   ```

   *Note for Windows PowerShell users:* If script execution policy blocks `npm.ps1`, run:
   ```powershell
   cmd /c npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Analytics**: [@vercel/analytics](https://vercel.com/docs/analytics)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)


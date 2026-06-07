# TextGo — Typing Speed Practice Game

A fast, minimal typing speed test built with Next.js. Practice your WPM and accuracy with real-time feedback, a visual keyboard, multiple color themes, and downloadable result cards. No database required.

---

## Preview

![TextGo Landing Page](public/text-go.png)

---

## Features

- **Real-time WPM tracking** — words per minute calculated live as you type
- **Accuracy & error tracking** — see exactly how precise you are
- **Visual keyboard** — keys light up green on correct input, red on mistakes
- **15s / 30s timer modes** — choose your preferred test duration
- **5 color themes** — green, purple, pink, yellow, orange
- **Downloadable result card** — saves a PNG image with your name and score
- **No database** — fully client-side, no account needed
- **Persistent nickname** — your name is remembered via localStorage

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org) | React framework |
| [TypeScript](https://typescriptlang.org) | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [shadcn/ui](https://ui.shadcn.com) | UI components |
| [Lucide React](https://lucide.dev) | Icons |
| [Vercel Analytics](https://vercel.com/analytics) | Usage analytics |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/textgo.git

# Navigate into the project
cd textgo

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
textgo/
├── app/
│   ├── game/
│   │   └── page.tsx        # Typing game page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── leaderboard.tsx      # Leaderboard component
│   ├── theme-provider.tsx   # Theme context provider
│   └── theme-switcher.tsx   # Theme switcher button
└── public/
    └── text-go.png          # App logo
```

---

## How It Works

1. Visit the home page and click **Start Typing Test**
2. Start typing — the timer begins on your first keystroke
3. Typed characters turn green (correct) or flash red (wrong)
4. When the timer ends, your results appear: WPM, Accuracy, Errors
5. Enter your name and click **Save as Image** to download your result card

---

## Deployment

Deploy instantly on [Vercel](https://vercel.com):

```bash
npm run build
```

Or click below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/

---

## License

MIT License — feel free to use, modify, and distribute.

---

Made with ⌨️ by [your-username](https://github.com/hizbullah-khalifa)
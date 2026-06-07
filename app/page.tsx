import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { ArrowRight } from "lucide-react"
import { Leaderboard } from "@/components/leaderboard"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex flex-col transition-colors duration-500">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Image src="/text-go.png" alt="TextGo logo" width={36} height={36} />
          <h1 className="text-2xl font-bold text-foreground">TextGo</h1>
        </div>
        <ThemeSwitcher />
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 max-w-4xl mx-auto w-full">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            Master Your <span className="text-primary">Typing Speed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Challenge yourself with our advanced typing test. Improve your WPM, accuracy, and muscle memory with
            real-time feedback and detailed statistics.
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <Link href="/game">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-primary/25 transition-all"
            >
              Start Typing Test <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        <Leaderboard />
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        <p>© 2025 TextGo. Keep practicing!</p>
      </footer>
    </div>
  )
}
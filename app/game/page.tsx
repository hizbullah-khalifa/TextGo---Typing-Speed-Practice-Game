"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, BarChart3, Download, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeSwitcher } from "@/components/theme-switcher"
import Link from "next/link"

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog while the moon shines bright in the darkening sky above the hills where ancient trees stand tall and proud among the whispering winds that carry tales of old adventures and forgotten dreams across the vast expanse of time and space.",
  "In the heart of the forest where shadows dance between towering oaks and pines there lives a community of creatures both large and small who work together to maintain the delicate balance of nature through seasons of change and growth where every leaf and branch tells a story of survival and adaptation.",
  "Technology advances at an incredible pace bringing new innovations and discoveries that reshape our world and challenge our understanding of what is possible as we venture into uncharted territories of science and exploration seeking answers to questions that have puzzled humanity for generations.",
  "Music flows through the air like liquid gold touching hearts and souls with melodies that transcend language and culture bringing people together in moments of pure joy and celebration where rhythm and harmony create a universal language that speaks to the deepest parts of our human experience.",
  "The ocean waves crash against the rocky shore in an eternal dance of power and grace where countless mysteries lie hidden beneath the surface waiting to be discovered by brave explorers who dare to venture into the depths where light fades and pressure builds creating an alien world.",
]

const KEYBOARD_LAYOUT = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
]

function generateResultImage(name: string, wpm: number, accuracy: number, errors: number, duration: number) {
  const canvas = document.createElement("canvas")
  canvas.width = 800
  canvas.height = 420
  const ctx = canvas.getContext("2d")!

  // Background
  ctx.fillStyle = "#0f1117"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Subtle grid pattern
  ctx.strokeStyle = "rgba(255,255,255,0.03)"
  ctx.lineWidth = 1
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
  }

  // Top accent bar
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0)
  grad.addColorStop(0, "#00d4aa")
  grad.addColorStop(1, "#00a080")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, 5)

  // Logo
  ctx.font = "bold 28px monospace"
  ctx.fillStyle = "#ffffff"
  ctx.fillText("TypeMaster", 50, 60)
  ctx.font = "14px monospace"
  ctx.fillStyle = "#00d4aa"
  ctx.fillText("Practice Your Speed", 50, 82)

  // Duration badge
  ctx.fillStyle = "rgba(0, 212, 170, 0.15)"
  ctx.beginPath()
  ctx.roundRect(canvas.width - 130, 38, 80, 32, 8)
  ctx.fill()
  ctx.font = "bold 14px monospace"
  ctx.fillStyle = "#00d4aa"
  ctx.fillText(`${duration}s test`, canvas.width - 110, 59)

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.08)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(50, 105)
  ctx.lineTo(canvas.width - 50, 105)
  ctx.stroke()

  // Player name
  ctx.font = "bold 22px monospace"
  ctx.fillStyle = "rgba(255,255,255,0.5)"
  ctx.fillText("Player", 50, 150)
  ctx.font = "bold 36px monospace"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(name || "Anonymous", 50, 192)

  // Stats cards
  const stats = [
    { label: "WPM", value: String(wpm), color: "#00d4aa" },
    { label: "Accuracy", value: `${accuracy}%`, color: "#00d4aa" },
    { label: "Errors", value: String(errors), color: errors > 10 ? "#ff6b6b" : "#00d4aa" },
  ]

  stats.forEach((stat, i) => {
    const x = 50 + i * 240
    const y = 240

    // Card bg
    ctx.fillStyle = "rgba(255,255,255,0.05)"
    ctx.beginPath()
    ctx.roundRect(x, y, 210, 110, 12)
    ctx.fill()

    // Card accent border top
    ctx.fillStyle = stat.color
    ctx.beginPath()
    ctx.roundRect(x, y, 210, 4, [12, 12, 0, 0])
    ctx.fill()

    // Value
    ctx.font = "bold 52px monospace"
    ctx.fillStyle = stat.color
    ctx.fillText(stat.value, x + 20, y + 68)

    // Label
    ctx.font = "14px monospace"
    ctx.fillStyle = "rgba(255,255,255,0.4)"
    ctx.fillText(stat.label, x + 20, y + 95)
  })

  // Footer
  ctx.font = "12px monospace"
  ctx.fillStyle = "rgba(255,255,255,0.2)"
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  ctx.fillText(`typemaster.app  ·  ${date}`, 50, canvas.height - 22)

  return canvas.toDataURL("image/png")
}

export default function TypingGame() {
  const [sampleText, setSampleText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLimit, setTimeLimit] = useState(30)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isActive, setIsActive] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [errors, setErrors] = useState(0)
  const [totalTyped, setTotalTyped] = useState(0)
  const [pressedKey, setPressedKey] = useState<string | null>(null)
  const [errorFlash, setErrorFlash] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [nickname, setNickname] = useState("")
  const [hasSaved, setHasSaved] = useState(false)

  const timeLimitRef = useRef(timeLimit)
  const finalStatsRef = useRef({ wpm: 0, accuracy: 100, errors: 0 })

  useEffect(() => { timeLimitRef.current = timeLimit }, [timeLimit])

  const resetGame = useCallback((newTimeLimit?: number) => {
    const limit = newTimeLimit ?? timeLimitRef.current
    const randomText = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]
    setSampleText(randomText)
    setCurrentIndex(0)
    setTimeLeft(limit)
    setIsActive(false)
    setIsFinished(false)
    setErrors(0)
    setTotalTyped(0)
    setPressedKey(null)
    setErrorFlash(false)
    setShowResults(false)
    setHasSaved(false)
    finalStatsRef.current = { wpm: 0, accuracy: 100, errors: 0 }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("typing-game-nickname")
    if (stored) setNickname(stored)
    resetGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isActive) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false)
          setIsFinished(true)
          setShowResults(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isActive])

  // Save final stats when game ends
  useEffect(() => {
    if (isFinished) {
      const elapsed = timeLimitRef.current / 60
      const finalWpm = totalTyped > 0 ? Math.round(currentIndex / 5 / elapsed) : 0
      const finalAccuracy = totalTyped > 0 ? Math.round(((totalTyped - errors) / totalTyped) * 100) : 100
      finalStatsRef.current = { wpm: finalWpm, accuracy: finalAccuracy, errors }
    }
  }, [isFinished, currentIndex, totalTyped, errors])

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (isFinished || currentIndex >= sampleText.length) return
      const key = e.key
      if (key.length > 1 && key !== " ") return
      if (key === " ") e.preventDefault()

      if (!isActive) setIsActive(true)

      setPressedKey(key === " " ? "Space" : key.toLowerCase())
      setTimeout(() => setPressedKey(null), 150)

      const expectedChar = sampleText[currentIndex]
      setTotalTyped((prev) => prev + 1)

      if (key === expectedChar) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        setErrors((prev) => prev + 1)
        setErrorFlash(true)
        setTimeout(() => setErrorFlash(false), 200)
      }
    },
    [isFinished, currentIndex, sampleText, isActive],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  const changeTimeLimit = (newLimit: number) => {
    setTimeLimit(newLimit)
    timeLimitRef.current = newLimit
    resetGame(newLimit)
  }

  const handleDownloadImage = () => {
    const name = nickname.trim() || "Anonymous"
    if (nickname.trim()) {
      localStorage.setItem("typing-game-nickname", nickname.trim())
    }
    const dataUrl = generateResultImage(
      name,
      finalStatsRef.current.wpm,
      finalStatsRef.current.accuracy,
      finalStatsRef.current.errors,
      timeLimitRef.current,
    )
    const link = document.createElement("a")
    link.download = `typemaster-${name}-${finalStatsRef.current.wpm}wpm.png`
    link.href = dataUrl
    link.click()
    setHasSaved(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4 transition-colors duration-500">
      <div className="w-full max-w-6xl bg-card rounded-3xl shadow-2xl p-8 md:p-12 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">TypeMaster</h1>
              <p className="text-sm text-primary font-medium">Practice Your Speed</p>
            </Link>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Timer</p>
            <p className="text-4xl font-bold text-muted-foreground">{String(timeLeft).padStart(2, "0")}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeLimit === 15 ? "default" : "outline"}
              onClick={() => changeTimeLimit(15)}
              className={timeLimit === 15 ? "bg-primary text-primary-foreground" : ""}
            >15s</Button>
            <Button
              variant={timeLimit === 30 ? "default" : "outline"}
              onClick={() => changeTimeLimit(30)}
              className={timeLimit === 30 ? "bg-primary text-primary-foreground" : ""}
            >30s</Button>
            <ThemeSwitcher />
          </div>
        </div>

        {/* Text Display */}
        <div className="bg-background/50 rounded-2xl p-8 max-h-[200px] relative overflow-hidden transition-colors duration-500">
          <div
            className="text-2xl md:text-3xl font-mono leading-relaxed transition-all duration-300 ease-out"
            style={{ transform: `translateY(-${Math.floor(currentIndex / 50) * 3}rem)` }}
          >
            {sampleText.split("").map((char, idx) => (
              <span
                key={idx}
                className={`${
                  idx < currentIndex
                    ? "text-primary"
                    : idx === currentIndex && errorFlash
                      ? "text-destructive bg-destructive/20"
                      : "text-muted-foreground/40"
                } relative`}
              >
                {idx === currentIndex && !isFinished && (
                  <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary blink" />
                )}
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button onClick={() => resetGame()} variant="outline" className="gap-2 bg-transparent">
            <RotateCcw className="w-4 h-4" /> Start Over
          </Button>
          {isFinished && !showResults && (
            <Button onClick={() => setShowResults(true)} variant="default" className="gap-2">
              <BarChart3 className="w-4 h-4" /> View Results
            </Button>
          )}
        </div>

        {/* Keyboard */}
        <div className="bg-black/40 p-6 rounded-3xl border border-white/10 shadow-2xl">
          <div className="space-y-3">
            {KEYBOARD_LAYOUT.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-3">
                {row.map((key) => {
                  const isPressed = pressedKey === key
                  const isError = isPressed && errorFlash
                  return (
                    <div
                      key={key}
                      className={`w-12 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-xl font-mono text-lg font-bold transition-all duration-75 ${
                        isPressed
                          ? `translate-y-1.5 shadow-none ${isError ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`
                          : "bg-gray-100 text-gray-800 border-t border-white/50 shadow-[0_6px_0_#a3a3a3,0_12px_12px_-4px_rgba(0,0,0,0.3)]"
                      }`}
                    >
                      {key.toUpperCase()}
                    </div>
                  )
                })}
              </div>
            ))}
            <div className="flex justify-center pt-2">
              <div
                className={`w-96 h-14 md:h-16 flex items-center justify-center rounded-xl font-mono text-sm font-bold transition-all duration-75 ${
                  pressedKey === "Space"
                    ? `translate-y-1.5 shadow-none ${errorFlash ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`
                    : "bg-gray-100 text-gray-800 border-t border-white/50 shadow-[0_6px_0_#a3a3a3,0_12px_12px_-4px_rgba(0,0,0,0.3)]"
                }`}
              >
                SPACE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-primary">Test Complete!</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{finalStatsRef.current.wpm}</p>
              <p className="text-sm text-muted-foreground">WPM</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{finalStatsRef.current.accuracy}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{finalStatsRef.current.errors}</p>
              <p className="text-sm text-muted-foreground">Errors</p>
            </div>
          </div>

          <div className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-muted-foreground">Your Name (for result card)</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
                placeholder="Enter your name"
                className="text-center font-medium text-lg"
                maxLength={20}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDownloadImage}
                disabled={hasSaved}
                className="flex-1"
                variant="secondary"
              >
                {hasSaved ? (
                  <><Check className="mr-2 h-4 w-4" />Downloaded!</>
                ) : (
                  <><Download className="mr-2 h-4 w-4" />Save as Image</>
                )}
              </Button>
              <Button onClick={() => resetGame()} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" /> Try Again
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Downloads a result card image with your name and score
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
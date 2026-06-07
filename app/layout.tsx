import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TextGo - Typing Practice Game",
  description: "Practice your typing speed and accuracy with TextGo",
  icons: {
    icon: "/text-go.png",
    apple: "/text-go.png",
    shortcut: "/text-go.png",
  },
  verification: {
    google: "TxgSXLMu5zlf3ihJNr8psrStRSXph5Kt7q3DZV7O0_U",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
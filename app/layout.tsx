import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'PocketCFO — Your AI CFO Works 24/7',
  description: "You're losing money right now. PocketCFO's AI agents scan every expense, subscription, and vendor contract to show you exactly where — and how to stop it.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}

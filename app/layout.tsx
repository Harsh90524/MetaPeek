import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MetaPeek — See what your files are hiding',
  description: 'Extract, view, edit, and strip hidden metadata from your images and documents. 100% in-browser, fully private.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

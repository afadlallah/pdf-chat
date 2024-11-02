import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'PDF Chat',
  description: 'Chat with your PDF files using AI',
  icons: {
    icon: [{ url: '/favicon.svg' }],
    apple: [{ url: '/favicon.svg' }]
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html suppressHydrationWarning className={cn('h-full antialiased', inter.variable, jetbrainsMono.variable)} lang='en'>
        <body className='flex h-full flex-col font-sans antialiased'>
          <Header />
          <div className='flex-1 overflow-y-auto'>{children}</div>
        </body>
      </html>
    </ClerkProvider>
  )
}

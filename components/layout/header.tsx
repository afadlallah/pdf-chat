'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export async function Header() {
  return (
    <header className='relative z-10 border-b'>
      <div className='container mx-auto flex h-16 items-center justify-between'>
        <Link className='flex items-center' href='/'>
          <div className='flex size-8 items-center justify-center'>
            <FileText size={20} />
          </div>
          <span className='text-lg font-semibold'>PDF Chat</span>
        </Link>
        <nav>
          <ul className='flex items-center space-x-4'>
            <SignedOut>
              <SignInButton>
                <Button asChild variant='outline'>
                  <Link href='/sign-in'>Sign In</Link>
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button asChild variant='default'>
                  <Link href='/sign-in'>Sign Up</Link>
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button asChild variant='ghost'>
                <Link href='/dashboard'>Dashboard</Link>
              </Button>
              <UserButton />
            </SignedIn>
          </ul>
        </nav>
      </div>
    </header>
  )
}

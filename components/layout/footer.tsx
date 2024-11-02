import React from 'react'
import Link from 'next/link'
import { FileText, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className='relative z-10 border-t bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900'>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
          <Link className='flex items-center gap-2' href='/'>
            <div className='flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 shadow-lg'>
              <FileText className='text-white' size={20} />
            </div>
            <span className='bg-gradient-to-r from-white to-gray-300 bg-clip-text text-xl font-bold text-transparent'>PDF Chat</span>
          </Link>
          <div className='flex items-center gap-3'>
            <Button
              asChild
              className='group border-gray-700 bg-gray-800/50 text-gray-300 transition-all hover:border-gray-600 hover:bg-gray-700/50 hover:text-white'
              size='sm'
              variant='outline'
            >
              <Link href='https://github.com/afadlallah/pdf-chat' rel='noopener noreferrer' target='_blank'>
                <Github className='mr-2 size-4 transition-transform group-hover:scale-110' />
                <span>GitHub</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}

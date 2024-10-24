import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className='flex h-full flex-col items-center justify-center p-8 text-center'>
      <h1 className='mb-4 text-4xl font-bold'>404 - Page Not Found</h1>
      <p className='mb-8 text-lg'>Oops! The page you're looking for doesn't exist.</p>
      <Button asChild>
        <Link href='/'>Return to Home</Link>
      </Button>
    </div>
  )
}

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className='mt-5 flex h-full flex-col items-center justify-center'>
      <div className='mx-auto mt-10 flex items-center justify-center'>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'bg-black hover:bg-gray-700 transition text-sm normal-case'
            }
          }}
          forceRedirectUrl='/dashboard'
        />
      </div>
    </div>
  )
}

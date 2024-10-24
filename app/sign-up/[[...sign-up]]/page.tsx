import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className='mt-5 flex h-full flex-col items-center justify-center'>
      <div className='mx-auto mt-10 flex items-center justify-center'>
        <SignUp
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

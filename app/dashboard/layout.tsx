export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-full flex-col'>
      <div className='grow'>{children}</div>
    </div>
  )
}

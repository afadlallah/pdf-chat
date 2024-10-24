import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import DashboardComponent from '@/components/layout/dashboard'

export default async function DashboardPage() {
  const user = await currentUser()

  const docsList = await prisma.documents.findMany({
    where: {
      userId: user?.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div>
      <DashboardComponent docsList={docsList} />
    </div>
  )
}

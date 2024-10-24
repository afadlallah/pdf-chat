import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import DocumentComponent from '@/components/layout/document'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const user = await currentUser()

  const currentDoc = await prisma.documents.findFirst({
    where: {
      id: params.id,
      userId: user?.id
    }
  })

  if (!currentDoc) {
    return <div>This document was not found.</div>
  }

  return <DocumentComponent currentDoc={currentDoc} userImage={user?.imageUrl} />
}

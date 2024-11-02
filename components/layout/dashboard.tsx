'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadDropzone } from '@bytescale/upload-widget-react'
import { formatDistanceToNow } from 'date-fns'
import { FileText, HelpCircle, Trash } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { formatBytes } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Document {
  id: string
  pdfTitle: string
  pdfSize: number
  createdAt: Date
}

const HeadingWithTooltip = ({ text }: { text: string }) => (
  <h1 className='text-center text-4xl font-medium tracking-tighter'>
    {text}
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <HelpCircle className='ml-2 inline-block size-5 text-muted-foreground' />
        </TooltipTrigger>
        <TooltipContent>
          <p>If you don&apos;t see your document, please try refreshing the page.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </h1>
)

export default function DashboardComponent({ docsList }: { docsList: Document[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const vectorize = useCallback(
    async (pdfUrl: string, pdfTitle: string) => {
      setLoading(true)
      try {
        let res = await fetch('/api/vectorize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pdfUrl,
            pdfTitle
          })
        })

        if (!res.ok) {
          throw new Error('Failed to process PDF.')
        }

        let data = await res.json()
        router.push(`/document/${data.id}`)
      } catch (error) {
        console.error('Error processing PDF:', error)
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  const options = useMemo(
    () => ({
      apiKey: process.env.NEXT_PUBLIC_BYTESCALE_API_KEY || 'No Bytescale API key found.',
      maxFileCount: 1,
      mimeTypes: ['application/pdf'],
      editor: { images: { crop: false } },
      styles: {
        colors: {
          error: '#dc2626',
          primary: '#000'
        }
      },
      onValidate: async (file: File): Promise<undefined | string> => {
        if (docsList.length > 3) {
          return `Only 3 files can be uploaded at a time.`
        }
        if (file.size > 5 * 1024 * 1024) {
          return `Error: The maximum file size is 5MB.`
        }
        return undefined
      }
    }),
    [docsList.length]
  )

  const UploadDropZone = useMemo(
    () => () => (
      <UploadDropzone
        height='250px'
        options={options}
        onUpdate={({ uploadedFiles }) => {
          if (uploadedFiles.length !== 0) {
            setLoading(true)
            const file = uploadedFiles[0]
            vectorize(file.fileUrl, file.originalFile.originalFileName || file.filePath)
          }
        }}
      />
    ),
    [options, vectorize]
  )

  async function deletePdf(id: string) {
    try {
      const res = await fetch(`/api/deletePdf?id=${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Failed to delete PDF.')
      }

      toast({
        title: 'Success',
        description: 'PDF deleted successfully.'
      })
      router.refresh()
    } catch (error) {
      console.error('Error deleting PDF:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete PDF.'
      })
    }
  }

  return (
    <div className='container mx-auto mt-10 flex flex-col gap-4 pb-12 md:pb-0'>
      <HeadingWithTooltip text={docsList.length > 0 ? 'Continue your conversation...' : 'Upload your first PDF to get started!'} />
      {docsList.length > 0 && (
        <div className='mx-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {docsList.map((doc: Document) => (
            <Card key={doc.id} className='relative cursor-pointer overflow-hidden' onClick={() => router.push(`/document/${doc.id}`)}>
              <CardHeader className='pb-2'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <FileText className='size-5' />
                  <span className='truncate'>{doc.pdfTitle}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-gray-500'>Uploaded {formatDistanceToNow(doc.createdAt)} ago</p>
                <p className='text-sm text-gray-500'>Size: {formatBytes(doc.pdfSize)}</p>
              </CardContent>
              <Button
                className='absolute right-2 top-2 transition-colors hover:bg-transparent hover:text-red-500'
                size='icon'
                variant='ghost'
                onClick={(e) => {
                  e.stopPropagation()
                  deletePdf(doc.id)
                }}
              >
                <Trash className='size-5' />
              </Button>
            </Card>
          ))}
        </div>
      )}
      {docsList.length > 0 ? <h1 className='text-center text-4xl font-medium tracking-tighter'>...or upload a new file</h1> : null}
      <div className='mx-auto flex justify-center'>{loading ? <LoadingButton /> : <UploadDropZone />}</div>
    </div>
  )
}

const LoadingButton = () => (
  <Button
    className='mt-4 cursor-not-allowed font-semibold shadow transition duration-150 ease-in-out hover:bg-transparent'
    variant='outline'
  >
    <svg className='-ml-1 mr-3 size-5 animate-spin text-black' fill='none' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4'></circle>
      <path
        className='opacity-75'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        fill='currentColor'
      ></path>
    </svg>
    Processing your file...
  </Button>
)

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      toastOptions={{
        style: {
          background: '#1e1e2a',
          color: '#f4f4f5',
          border: '1px solid #3f3f46',
        },
      }}
    />
  )
}

export { toast } from 'sonner'

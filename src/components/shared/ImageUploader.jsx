import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toaster'

export function ImageUploader({ value = [], onChange, uploadFn, label = 'Images' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadFn(file)
      const url = result.url || result.data?.url
      if (!url) throw new Error('Upload response had no url field')
      onChange([...value, url])
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeAt(index) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-zinc-300">{label}</p>
      <div className="mb-2 flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url + i} className="relative h-16 w-16 overflow-hidden rounded-md border border-zinc-700">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-0 top-0 rounded-bl-md bg-black/70 p-0.5 text-white"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <Button type="button" variant="secondary" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
        <Upload size={14} />
        {uploading ? 'Uploading...' : 'Add image'}
      </Button>
    </div>
  )
}

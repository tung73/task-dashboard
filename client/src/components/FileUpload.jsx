import { useState, useRef } from 'react'
import axios from 'axios'
import { Upload, FileText, Book, Loader2, CheckCircle, XCircle } from 'lucide-react'

const API = ''

export default function FileUpload({ dark, taskId, onComplete }) {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const ext = file.name.toLowerCase().split('.').pop()
    if (!['epub', 'mobi'].includes(ext)) {
      setError('Only epub and mobi files are supported')
      return
    }

    setError(null)
    setUploading(true)
    setProcessing(true)

    const formData = new FormData()
    formData.append('    if (taskId) formfile', file)
Data.append('taskId', taskId)

    try {
      // Upload and process
      const res = await axios.post(`${API}/api/ebook/process`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
      if (onComplete) onComplete(res.data)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setUploading(false)
      setProcessing(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!result && !error && (
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dark 
              ? 'border-slate-600 hover:border-slate-500 bg-slate-700/50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            id="ebook-upload" 
            className="hidden" 
            accept=".epub,.mobi"
            onChange={handleFile}
            disabled={uploading}
          />
          <label htmlFor="ebook-upload" className="cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="mx-auto mb-2 animate-spin" size={32} />
                <p>Processing ebook...</p>
              </>
            ) : (
              <>
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="font-medium">Drop ebook here or click to upload</p>
                <p className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Supports epub and mobi files
                </p>
              </>
            )}
          </label>
        </div>
      )}

      {/* Processing State */}
      {uploading && processing && (
        <div className={`p-4 rounded-lg ${dark ? 'bg-blue-900/30' : 'bg-blue-50'} flex items-center gap-3`}>
          <Loader2 className="animate-spin" size={20} />
          <span>Extracting text and metadata...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`p-4 rounded-lg ${dark ? 'bg-red-900/30' : 'bg-red-50'} flex items-center gap-3`}>
          <XCircle className="text-red-500" size={20} />
          <span className="text-red-600">{error}</span>
          <button onClick={reset} className="ml-auto text-sm underline">Try again</button>
        </div>
      )}

      {/* Result State */}
      {result && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${dark ? 'bg-green-900/30' : 'bg-green-50'} flex items-center gap-3`}>
            <CheckCircle className="text-green-500" size={20} />
            <span className="font-medium">Ebook processed successfully!</span>
            <button onClick={reset} className="ml-auto text-sm underline">Process another</button>
          </div>

          {/* Metadata */}
          <div className={`p-4 rounded-lg ${dark ? 'bg-slate-700' : 'bg-white'} space-y-3`}>
            <h4 className="font-semibold flex items-center gap-2">
              <Book size={18} /> Book Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Title:</span>
                <span className="ml-2 font-medium">{result.metadata?.title || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-gray-500">Author:</span>
                <span className="ml-2 font-medium">{result.metadata?.author || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-gray-500">Words:</span>
                <span className="ml-2">{result.word_count?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Characters:</span>
                <span className="ml-2">{result.char_count?.toLocaleString()}</span>
              </div>
            </div>
            
            {result.metadata?.description && (
              <div className="mt-3 pt-3 border-t">
                <span className="text-gray-500 text-sm">Description:</span>
                <p className="text-sm mt-1">{result.metadata.description.substring(0, 300)}...</p>
              </div>
            )}
          </div>

          {/* Text Preview */}
          <div className={`p-4 rounded-lg ${dark ? 'bg-slate-700' : 'bg-white'}`}>
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <FileText size={18} /> Text Preview
            </h4>
            <p className={`text-sm ${dark ? 'text-slate-300' : 'text-gray-600'} whitespace-pre-wrap line-clamp-10`}>
              {result.text?.substring(0, 2000)}...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

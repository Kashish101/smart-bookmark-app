'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddBookmark({ userId }: { userId: string }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({})
  const [success, setSuccess] = useState(false)

  // Strict URL validation — must be a real domain like google.com or https://google.com
  const validateUrl = (input: string): { valid: boolean; formatted: string; error?: string } => {
    const raw = input.trim()

    if (!raw) {
      return { valid: false, formatted: '', error: '⚠️ Please enter a URL — e.g. google.com' }
    }

    // Reject if it's just random text with no dot (e.g. "abcdef", "hello world")
    const hasDot = raw.replace(/^https?:\/\//i, '').includes('.')
    if (!hasDot) {
      return { valid: false, formatted: '', error: '⚠️ Enter a valid URL — e.g. google.com or youtube.com' }
    }

    // Auto-add https:// if missing
    let formatted = raw
    if (!formatted.match(/^https?:\/\//i)) {
      formatted = `https://${formatted}`
    }

    // Must pass URL constructor
    try {
      const parsed = new URL(formatted)

      // Hostname must have at least one dot and a real TLD (min 2 chars)
      const hostname = parsed.hostname
      const parts = hostname.split('.')
      const tld = parts[parts.length - 1]

      if (parts.length < 2 || tld.length < 2) {
        return { valid: false, formatted: '', error: '⚠️ Enter a valid URL — e.g. google.com or youtube.com' }
      }

      // Reject localhost and IP-only addresses for production use
      if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        return { valid: false, formatted: '', error: '⚠️ Please enter a real website URL — e.g. google.com' }
      }

      return { valid: true, formatted }
    } catch {
      return { valid: false, formatted: '', error: '⚠️ Enter a valid URL — e.g. google.com or youtube.com' }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)

    const newErrors: { title?: string; url?: string } = {}

    if (!title.trim()) {
      newErrors.title = '⚠️ Please enter a title'
    }

    const urlCheck = validateUrl(url)
    if (!urlCheck.valid) {
      newErrors.url = urlCheck.error
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert([{ user_id: userId, title: title.trim(), url: urlCheck.formatted }])

      if (insertError) throw insertError
      setTitle('')
      setUrl('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setErrors({ url: 'Failed to save. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-card">
      <div className="add-card-header">
        <div className="add-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <h2 className="add-title">New Bookmark</h2>
      </div>

      <form onSubmit={handleSubmit} className="add-form">
        {success && (
          <div className="success-msg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Bookmark saved successfully!
          </div>
        )}

        {/* Title */}
        <div className="field-group">
          <label className="field-label">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })) }}
            placeholder="e.g. My Favorite Blog"
            className={`field-input ${errors.title ? 'field-input-error' : ''}`}
            disabled={loading}
          />
          {errors.title && <div className="field-error">{errors.title}</div>}
        </div>

        {/* URL */}
        <div className="field-group">
          <label className="field-label">URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setErrors(p => ({ ...p, url: undefined })) }}
            placeholder="e.g. google.com or youtube.com"
            className={`field-input ${errors.url ? 'field-input-error' : ''}`}
            disabled={loading}
          />
          {errors.url
            ? <div className="field-error">{errors.url}</div>
            : <span className="field-hint">No need to type https:// — we'll add it for you</span>
          }
        </div>

        <button type="submit" disabled={loading} className="btn-add">
          {loading ? (
            <>
              <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Bookmark
            </>
          )}
        </button>
      </form>
    </div>
  )
}

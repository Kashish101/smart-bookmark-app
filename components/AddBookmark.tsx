'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddBookmark({ userId }: { userId: string }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateUrl = (urlString: string): string | null => {
    try {
      let formatted = urlString.trim()
      if (!formatted.match(/^https?:\/\//i)) formatted = `https://${formatted}`
      new URL(formatted)
      return formatted
    } catch { return null }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!title.trim()) return setError('Please enter a title')
    if (!url.trim()) return setError('Please enter a URL')

    const validUrl = validateUrl(url)
    if (!validUrl) return setError('Please enter a valid URL')

    setLoading(true)
    try {
      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert([{ user_id: userId, title: title.trim(), url: validUrl }])

      if (insertError) throw insertError
      setTitle('')
      setUrl('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch {
      setError('Failed to add bookmark. Please try again.')
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
        <h2 className="add-title">Add New Bookmark</h2>
      </div>

      <form onSubmit={handleSubmit} className="add-form">
        {error && (
          <div className="error-msg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="success-msg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Bookmark added!
          </div>
        )}

        <div className="field-group">
          <label className="field-label">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. My Favorite Blog"
            className="field-input"
            disabled={loading}
          />
        </div>

        <div className="field-group">
          <label className="field-label">URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. example.com"
            className="field-input"
            disabled={loading}
          />
          <span className="field-hint">https:// is added automatically</span>
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
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Bookmark
            </>
          )}
        </button>
      </form>
    </div>
  )
}

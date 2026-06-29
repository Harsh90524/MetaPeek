'use client'

import { useState } from 'react'
import { MetaStore, SENSITIVE_KEYS, KEY_LABELS, CATEGORIES, fmtVal, stripJpegExif, downloadBlob, getFileKind } from './types'

interface EditorPaneProps {
  store: MetaStore | null
  setStore: (s: MetaStore | null) => void
}

export default function EditorPane({ store, setStore }: EditorPaneProps) {
  const [downloading, setDownloading] = useState(false)

  if (!store) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">✏️</div>
        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>No file loaded yet</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Go to the Viewer tab and upload a file first.</p>
      </div>
    )
  }

  const { file, parsedMeta, editedMeta } = store

  function updateField(key: string, val: string) {
    setStore({ ...store!, editedMeta: { ...editedMeta, [key]: val } })
  }

  function clearField(key: string) {
    setStore({ ...store!, editedMeta: { ...editedMeta, [key]: '' } })
  }

  function clearAllSensitive() {
    const next = { ...editedMeta }
    for (const k of SENSITIVE_KEYS) if (k in next) next[k] = ''
    setStore({ ...store!, editedMeta: next })
  }

  function clearAll() {
    const next: Record<string, string> = {}
    for (const k of Object.keys(editedMeta)) next[k] = ''
    setStore({ ...store!, editedMeta: next })
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const kind = getFileKind(file)

      if (kind === 'pdf') {
        const { PDFDocument } = await import('pdf-lib')
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
        // Clear all standard metadata fields
        pdf.setTitle('')
        pdf.setAuthor('')
        pdf.setSubject('')
        pdf.setKeywords([])
        pdf.setCreator('')
        pdf.setProducer('')
        pdf.setCreationDate(new Date(0))
        pdf.setModificationDate(new Date(0))
        const pdfBytes = await pdf.save()
        downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'clean_' + file.name)

      } else if (kind === 'docx') {
        const JSZip = (await import('jszip')).default
        const arrayBuffer = await file.arrayBuffer()
        const zip = await JSZip.loadAsync(arrayBuffer)

        // Overwrite core.xml with blank metadata
        if (zip.file('docProps/core.xml')) {
          zip.file('docProps/core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
</cp:coreProperties>`)
        }

        // Overwrite app.xml removing company/manager/etc
        if (zip.file('docProps/app.xml')) {
          zip.file('docProps/app.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
</Properties>`)
        }

        const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
        downloadBlob(blob, 'clean_' + file.name)

      } else {
        // Image — existing JPEG EXIF strip
        const bytes = new Uint8Array(await file.arrayBuffer())
        const blob = stripJpegExif(bytes, file.type)
        downloadBlob(blob, 'clean_' + file.name)
      }
    } finally {
      setDownloading(false)
    }
  }

  const clearedCount = Object.values(editedMeta).filter(v => v === '').length

  // Build category rows
  const categorized: Record<string, string[]> = {}
  const used = new Set<string>()
  for (const [cat, keys] of Object.entries(CATEGORIES)) {
    const rows = keys.filter(k => k in parsedMeta)
    if (rows.length) { categorized[cat] = rows; rows.forEach(k => used.add(k)) }
  }
  const other = Object.keys(parsedMeta).filter(k => !used.has(k))
  if (other.length) categorized['Other'] = other

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Edit Metadata</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {file.name} · {clearedCount > 0 ? `${clearedCount} field${clearedCount > 1 ? 's' : ''} will be removed` : 'No changes yet'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={clearAllSensitive}
            className="text-xs px-3 py-2 rounded-lg font-medium transition-opacity"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            🛡️ Clear sensitive
          </button>
          <button
            onClick={clearAll}
            className="text-xs px-3 py-2 rounded-lg font-medium transition-opacity"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            🗑️ Clear all
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="text-xs px-4 py-2 rounded-lg font-medium"
            style={{ background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: downloading ? 0.7 : 1 }}
          >
            {downloading ? 'Downloading…' : '⬇️ Download clean file'}
          </button>
        </div>
      </div>

      {/* Fields */}
      {Object.entries(categorized).map(([cat, keys]) => (
        <section key={cat}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{cat}</h3>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {keys.map((k, i) => {
              const sensitive = SENSITIVE_KEYS.includes(k)
              const original = fmtVal(k, parsedMeta[k])
              const current = editedMeta[k] ?? original
              const cleared = current === ''
              return (
                <div key={k} style={{
                  background: cleared ? '#f0fdf4' : sensitive ? '#fff5f5' : i % 2 === 0 ? 'var(--surface-2)' : 'var(--surface-1)',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  padding: '12px 16px',
                }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {KEY_LABELS[k] ?? k}
                    </span>
                    {sensitive && !cleared && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#fecaca', color: '#b91c1c', fontSize: 10 }}>sensitive</span>
                    )}
                    {cleared && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#bbf7d0', color: '#15803d', fontSize: 10 }}>will be removed</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={current}
                      onChange={e => updateField(k, e.target.value)}
                      placeholder="(will be removed)"
                      className="flex-1 font-mono text-sm px-3 py-1.5 rounded-lg outline-none"
                      style={{
                        background: cleared ? '#dcfce7' : 'var(--surface-0)',
                        border: `1px solid ${cleared ? '#86efac' : 'var(--border-strong)'}`,
                        color: 'var(--text-primary)',
                        fontFamily: 'DM Mono, monospace',
                        fontSize: 13,
                      }}
                    />
                    <button
                      onClick={() => cleared ? updateField(k, original) : clearField(k)}
                      title={cleared ? 'Restore' : 'Clear field'}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 8,
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: 14,
                        color: 'var(--text-secondary)',
                        flexShrink: 0,
                      }}
                    >
                      {cleared ? '↩' : '×'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {/* Download footer */}
      <div className="pt-2">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full rounded-xl py-3 text-sm font-medium"
          style={{ background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: downloading ? 0.7 : 1 }}
        >
          {downloading ? 'Downloading…' : `⬇️ Download cleaned file${clearedCount > 0 ? ` (${clearedCount} field${clearedCount > 1 ? 's' : ''} removed)` : ''}`}
        </button>
      </div>
    </div>
  )
}

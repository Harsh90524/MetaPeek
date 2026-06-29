'use client'

import { useRef, useState, useCallback } from 'react'
import { MetaStore, SENSITIVE_KEYS, KEY_LABELS, CATEGORIES, fmtVal, formatBytes, getRiskLevel, flattenMeta, stripJpegExif, downloadBlob, toDecimalDegrees, getFileKind, exportMetaAsJson, exportMetaAsCsv } from './types'

interface ViewerPaneProps {
  store: MetaStore | null
  setStore: (s: MetaStore | null) => void
  onEdit: () => void
}

export default function ViewerPane({ store, setStore, onEdit }: ViewerPaneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const [rawGpsDebug, setRawGpsDebug] = useState('')
  const [stripping, setStripping] = useState(false)
  // debugInfo and rawGpsDebug kept for console logging only, not rendered

  const processFile = useCallback(async (file: File) => {
    setError('')
    setDebugInfo('')
    setRawGpsDebug('')
    setLoading(true)
    setProgress(10)
    try {
      const kind = getFileKind(file)
      let flat: Record<string, unknown> = {}

      if (kind === 'pdf') {
        // ── PDF ──────────────────────────────────────────────────────────────
        setProgress(40)
        const { PDFDocument } = await import('pdf-lib')
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
        setProgress(75)
        const raw: Record<string, unknown> = {
          Title:       pdf.getTitle(),
          Author:      pdf.getAuthor(),
          Subject:     pdf.getSubject(),
          Keywords:    pdf.getKeywords(),
          Creator:     pdf.getCreator(),
          Producer:    pdf.getProducer(),
          CreationDate: pdf.getCreationDate(),
          ModDate:     pdf.getModificationDate(),
          PageCount:   pdf.getPageCount(),
        }
        for (const k of Object.keys(raw)) if (raw[k] == null) delete raw[k]
        flat = raw
        setDebugInfo(`PDF fields: ${Object.keys(flat).length}`)
        console.debug('[MetaPeek] PDF fields:', Object.keys(flat).length)

      } else if (kind === 'docx') {
        // ── DOCX ─────────────────────────────────────────────────────────────
        setProgress(40)
        const JSZip = (await import('jszip')).default
        const arrayBuffer = await file.arrayBuffer()
        const zip = await JSZip.loadAsync(arrayBuffer)
        setProgress(65)

        const getText = (doc: Document, tag: string): string | undefined =>
          doc.querySelector(tag)?.textContent ?? undefined

        const parseXml = (xml: string) =>
          new DOMParser().parseFromString(xml, 'application/xml')

        const raw: Record<string, unknown> = {}

        const coreFile = zip.file('docProps/core.xml')
        if (coreFile) {
          const core = parseXml(await coreFile.async('string'))
          Object.assign(raw, {
            Title:          getText(core, 'title'),
            Author:         getText(core, 'creator'),
            LastModifiedBy: getText(core, 'lastModifiedBy'),
            Created:        getText(core, 'created'),
            Modified:       getText(core, 'modified'),
            Description:    getText(core, 'description'),
            Keywords:       getText(core, 'keywords'),
            Subject:        getText(core, 'subject'),
            Revision:       getText(core, 'revision'),
          })
        }

        const appFile = zip.file('docProps/app.xml')
        if (appFile) {
          const app = parseXml(await appFile.async('string'))
          Object.assign(raw, {
            Company:     getText(app, 'Company'),
            Manager:     getText(app, 'Manager'),
            Application: getText(app, 'Application'),
            AppVersion:  getText(app, 'AppVersion'),
            Pages:       getText(app, 'Pages'),
            Words:       getText(app, 'Words'),
            Characters:  getText(app, 'Characters'),
            CharactersWithSpaces: getText(app, 'CharactersWithSpaces'),
            Paragraphs:  getText(app, 'Paragraphs'),
            Lines:       getText(app, 'Lines'),
            Template:    getText(app, 'Template'),
            TotalTime:   getText(app, 'TotalTime'),
            DocSecurity: getText(app, 'DocSecurity'),
          })
        }

        for (const k of Object.keys(raw)) if (raw[k] == null || raw[k] === '') delete raw[k]
        flat = raw
        setProgress(85)
        setDebugInfo(`DOCX fields: ${Object.keys(flat).length}`)
        console.debug('[MetaPeek] DOCX fields:', Object.keys(flat).length)

      } else {
        // ── IMAGE (existing exifr logic) ──────────────────────────────────────
        const exifr = (await import('exifr')).default
        setProgress(30)

        let raw: Record<string, unknown> | undefined
        try {
          raw = await exifr.parse(file, {
            tiff: true, exif: true, gps: true, iptc: true,
            icc: true, jfif: true, ihdr: true, xmp: true,
            translateValues: true, reviveValues: true,
            sanitize: true, mergeOutput: true,
          }) as Record<string, unknown> | undefined
        } catch {
          raw = await exifr.parse(file) as Record<string, unknown> | undefined
        }

        setProgress(70)

        let rawUntranslated: Record<string, unknown> | undefined
        try {
          rawUntranslated = await exifr.parse(file, {
            tiff: true, exif: true, gps: true,
            translateValues: false, reviveValues: false, mergeOutput: true,
          }) as Record<string, unknown> | undefined
        } catch { /* ignore */ }

        const merged: Record<string, unknown> = {}
        if (rawUntranslated) Object.assign(merged, rawUntranslated)
        if (raw) Object.assign(merged, raw)

        // Debug: show exact GPS values and types
        const gpsKeys = ['GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSLatitudeRef', 'GPSLongitudeRef']
        const gpsDebugParts: string[] = []
        for (const k of gpsKeys) {
          if (k in merged) {
            const v = merged[k]
            gpsDebugParts.push(`${k}: ${JSON.stringify(v)} (${typeof v}${Array.isArray(v) ? `[${(v as unknown[]).length}]` : ''})`)
          }
        }
        setRawGpsDebug(gpsDebugParts.join('\n') || 'No GPS keys found in merged output')
        console.debug('[MetaPeek] GPS:\n' + (gpsDebugParts.join('\n') || 'No GPS keys found'))

        setProgress(85)
        flat = Object.keys(merged).length > 0 ? flattenMeta(merged) : {}
        console.debug(`[MetaPeek] Raw keys: ${Object.keys(merged).length} → Flat: ${Object.keys(flat).length}`)
      }

      const initEdited: Record<string, string> = {}
      for (const [k, v] of Object.entries(flat)) initEdited[k] = fmtVal(k, v)

      setStore({ file, kind, parsedMeta: flat, editedMeta: initEdited })
      setProgress(100)
    } catch (err) {
      console.error('MetaPeek parse error:', err)
      setError(`Could not read metadata: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 600)
    }
  }, [setStore])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }, [processFile])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
    e.target.value = ''
  }

  async function handleStrip() {
    if (!store) return
    setStripping(true)
    try {
      const kind = store.kind

      if (kind === 'pdf') {
        const { PDFDocument } = await import('pdf-lib')
        const arrayBuffer = await store.file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
        pdf.setTitle('')
        pdf.setAuthor('')
        pdf.setSubject('')
        pdf.setKeywords([])
        pdf.setCreator('')
        pdf.setProducer('')
        pdf.setCreationDate(new Date(0))
        pdf.setModificationDate(new Date(0))
        const pdfBytes = await pdf.save()
        downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'clean_' + store.file.name)

      } else if (kind === 'docx') {
        const JSZip = (await import('jszip')).default
        const arrayBuffer = await store.file.arrayBuffer()
        const zip = await JSZip.loadAsync(arrayBuffer)
        if (zip.file('docProps/core.xml')) {
          zip.file('docProps/core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
</cp:coreProperties>`)
        }
        if (zip.file('docProps/app.xml')) {
          zip.file('docProps/app.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
</Properties>`)
        }
        const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
        downloadBlob(blob, 'clean_' + store.file.name)

      } else {
        const bytes = new Uint8Array(await store.file.arrayBuffer())
        const blob = stripJpegExif(bytes, store.file.type)
        downloadBlob(blob, 'clean_' + store.file.name)
      }
    } finally {
      setStripping(false)
    }
  }

  const meta = store?.parsedMeta ?? {}
  const risk = store ? getRiskLevel(meta) : null
  const riskColors = {
    low:    { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', label: '🟢 Low Risk' },
    medium: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', label: '🟡 Medium Risk' },
    high:   { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', label: '🔴 High Risk' },
  }
  const rc = risk ? riskColors[risk] : null

  const categorized: Record<string, [string, unknown][]> = {}
  const used = new Set<string>()
  for (const [cat, keys] of Object.entries(CATEGORIES)) {
    const rows = keys.filter(k => k in meta).map(k => [k, meta[k]] as [string, unknown])
    if (rows.length) { categorized[cat] = rows; rows.forEach(([k]) => used.add(k)) }
  }
  const other = Object.entries(meta).filter(([k]) => !used.has(k))
  if (other.length) categorized['Other'] = other

  const totalFields = Object.keys(meta).length
  const sensitiveCount = Object.keys(meta).filter(k => SENSITIVE_KEYS.includes(k)).length

  // GPS link only relevant for images
  let gpsLink: string | null = null
  if (store?.kind === 'image') {
    const latRaw = meta['GPSLatitude']
    const lonRaw = meta['GPSLongitude']
    const latRef = meta['GPSLatitudeRef'] as string | undefined
    const lonRef = meta['GPSLongitudeRef'] as string | undefined
    if (latRaw !== undefined && lonRaw !== undefined) {
      let latD = toDecimalDegrees(latRaw)
      let lonD = toDecimalDegrees(lonRaw)
      if (latD !== null && lonD !== null) {
        if (latRef === 'S' && latD > 0) latD = -latD
        if (lonRef === 'W' && lonD > 0) lonD = -lonD
        if (isFinite(latD) && isFinite(lonD) && (latD !== 0 || lonD !== 0)) {
          gpsLink = `https://www.openstreetmap.org/?mlat=${latD.toFixed(6)}&mlon=${lonD.toFixed(6)}&zoom=15`
        }
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Upload zone */}
      <div
        className="upload-zone border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 py-12 cursor-pointer transition-all"
        style={{ borderColor: dragging ? 'var(--accent)' : 'var(--border-strong)', background: dragging ? 'var(--accent-bg)' : 'var(--surface-2)' }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
      >
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <rect width="44" height="44" rx="11" fill="#eff6ff" />
          <path d="M14 28l6-6 4 4 4-5 6 7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="17" cy="20" r="2" fill="#2563eb" opacity=".5" />
          <rect x="11" y="11" width="22" height="22" rx="4" stroke="#2563eb" strokeWidth="1.5" fill="none" opacity=".25" />
        </svg>
        <div className="text-center">
          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
            {dragging ? 'Drop it here!' : 'Drop a file here, or click to browse'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Supports JPG, PNG, WEBP, TIFF, PDF, DOCX</p>
        </div>
        <input ref={inputRef} type="file" accept="image/*,.tif,.tiff,.pdf,.docx" className="hidden" onChange={onFileChange} />
      </div>

      {loading && (
        <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 rounded-full" style={{ borderTopColor: 'transparent', animation: 'spin 0.75s linear infinite' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Scanning metadata…</span>
          </div>
          <div className="h-1" style={{ background: 'var(--surface-0)' }}>
            <div className="h-1" style={{ width: `${progress}%`, background: '#2563eb', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>⚠️ {error}</div>
      )}

      {/* Debug panels removed — check browser console for [MetaPeek] logs */}

      {store && !loading && (
        <>
          <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--surface-0)' }}>
              {store.kind === 'image' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={URL.createObjectURL(store.file)} alt="preview" className="w-full h-full object-cover" />
              )}
              {store.kind === 'pdf' && (
                <div className="w-full h-full flex items-center justify-center text-2xl">📄</div>
              )}
              {store.kind === 'docx' && (
                <div className="w-full h-full flex items-center justify-center text-2xl">📝</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{store.file.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{store.file.type || 'Unknown'} · {formatBytes(store.file.size)}</p>
            </div>
            {rc && (
              <span className="text-xs font-medium px-3 py-1 rounded-full flex-shrink-0" style={{ background: rc.bg, border: `1px solid ${rc.border}`, color: rc.text }}>{rc.label}</span>
            )}
          </div>

          {totalFields > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total fields', value: totalFields },
                { label: 'Sensitive fields', value: sensitiveCount, danger: sensitiveCount > 0 },
                { label: 'Risk level', value: risk === 'high' ? 'High' : risk === 'medium' ? 'Medium' : 'Low', danger: risk === 'high', warn: risk === 'medium' },
              ].map(s => (
                <div key={s.label} className="rounded-xl px-4 py-3 text-center" style={{ background: 'var(--surface-2)', border: `1px solid ${s.danger ? '#fecaca' : s.warn ? '#fde68a' : 'var(--border)'}` }}>
                  <div className="text-xl font-semibold" style={{ color: s.danger ? '#b91c1c' : s.warn ? '#92400e' : 'var(--text-primary)', fontFamily: 'DM Mono, monospace' }}>{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl px-5 py-8 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <p className="text-2xl mb-2">🟢</p>
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>No metadata found</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {store.kind === 'image'
                  ? 'Try a photo taken directly from your phone camera (not a screenshot).'
                  : store.kind === 'pdf'
                  ? 'This PDF has no readable metadata fields.'
                  : 'This document has no readable metadata fields.'}
              </p>
            </div>
          )}

          {gpsLink && (
            <a href={gpsLink} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', textDecoration: 'none' }}>
              📍 GPS location detected — tap to view on OpenStreetMap ↗
            </a>
          )}

          {Object.entries(categorized).map(([cat, rows]) => (
            <section key={cat}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{cat}</h3>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {rows.map(([k, v], i) => {
                  const sensitive = SENSITIVE_KEYS.includes(k)
                  return (
                    <div key={k} className="meta-card flex items-start gap-3 px-4 py-3" style={{
                      background: sensitive ? '#fff5f5' : i % 2 === 0 ? 'var(--surface-2)' : 'var(--surface-1)',
                      borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{KEY_LABELS[k] ?? k}</span>
                          {sensitive && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#fecaca', color: '#b91c1c', fontSize: 10 }}>sensitive</span>}
                        </div>
                        <div className="text-sm mt-0.5 break-all" style={{ color: 'var(--text-primary)', fontFamily: 'DM Mono, monospace' }}>
                          {fmtVal(k, v)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}

          {totalFields > 0 && (
            <div className="flex flex-wrap gap-3 pt-2 pb-6">
              <button onClick={onEdit} className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit' }}>
                ✏️ Edit / Remove fields
              </button>
              <button onClick={handleStrip} disabled={stripping} className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium"
                style={{ background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: stripping ? 0.7 : 1 }}>
                {stripping ? 'Stripping…' : '🛡️ Strip all & download'}
              </button>
              <div className="w-full flex gap-3">
                <button
                  onClick={() => exportMetaAsJson(meta, store!.file.name)}
                  className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  ⬇️ Export JSON
                </button>
                <button
                  onClick={() => exportMetaAsCsv(meta, store!.file.name)}
                  className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  ⬇️ Export CSV
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

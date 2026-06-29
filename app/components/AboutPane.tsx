export default function AboutPane() {
  const steps = [
    {
      icon: '📁',
      title: 'What is file metadata?',
      body: 'When you take a photo or create a document, hidden data gets embedded inside the file automatically. This is called metadata — it\'s invisible when you view the file normally but can reveal a lot of private information.',
    },
    {
      icon: '📍',
      title: 'GPS location',
      body: 'Smartphones with location services enabled embed the exact GPS coordinates (latitude & longitude) into every photo. If you share a photo online, anyone can extract these coordinates and see exactly where you took the picture.',
    },
    {
      icon: '📱',
      title: 'Device information',
      body: 'EXIF data records the make and model of your camera or phone, the lens used, and even the serial number in some cases. This can be used to link multiple photos back to the same device.',
    },
    {
      icon: '🕐',
      title: 'Timestamps',
      body: 'Metadata stores the exact date and time a photo was taken — sometimes to the millisecond. Combined with GPS data, this can reveal your daily routine or confirm your presence at a specific location.',
    },
    {
      icon: '👤',
      title: 'Identity clues',
      body: 'Documents (DOCX, PDF) often store the author\'s name, the organization, software version used, and revision history. Sharing a Word document could unintentionally expose your real name or company name.',
    },
    {
      icon: '🛡️',
      title: 'How MetaPeek protects you',
      body: 'MetaPeek reads all EXIF and document metadata, highlights the sensitive fields in red, and lets you strip or edit them before sharing. Everything runs 100% in your browser — your files never leave your device.',
    },
  ]

  const faqs = [
    {
      q: 'Does MetaPeek upload my files anywhere?',
      a: 'No. All processing happens entirely inside your browser using JavaScript. Your files never leave your device.',
    },
    {
      q: 'What file types are supported?',
      a: 'MetaPeek works best with JPG, JPEG, PNG, WEBP, and TIFF images. EXIF stripping currently works on JPEG files only.',
    },
    {
      q: 'Will stripping metadata change how the image looks?',
      a: 'No. Metadata is separate from the actual image pixels. Stripping it removes only the hidden information — the visual image remains identical.',
    },
    {
      q: 'What does the "Privacy Risk Score" mean?',
      a: 'It counts the number of sensitive fields (GPS, device ID, author name, etc.) detected. Low = 0 sensitive fields. Medium = 1–3. High = 4 or more.',
    },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>How MetaPeek Works</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Understanding hidden metadata and why it matters for your privacy</p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map(s => (
          <div key={s.title} className="rounded-xl px-5 py-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{s.icon}</span>
              <div>
                <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual flow */}
      <div className="rounded-xl p-5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>The MetaPeek flow</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {['Upload file', 'Extract metadata', 'Review risks', 'Edit / clear fields', 'Download clean file'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: 'var(--accent-bg)', border: '1px solid #bfdbfe' }}>
                <span className="text-xs font-semibold" style={{ color: 'var(--accent-text)', minWidth: 16, textAlign: 'center' }}>{i + 1}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--accent-text)' }}>{step}</span>
              </div>
              {i < arr.length - 1 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>FAQ</h3>
        <div className="space-y-3">
          {faqs.map(f => (
            <div key={f.q} className="rounded-xl px-5 py-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{f.q}</p>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy note */}
      <div className="rounded-xl px-5 py-4 flex gap-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <span className="text-xl flex-shrink-0">🔒</span>
        <div>
          <p className="font-medium text-sm" style={{ color: '#15803d' }}>100% private by design</p>
          <p className="text-sm mt-1" style={{ color: '#166534' }}>
            MetaPeek has no server, no database, and no analytics. Everything you see happens inside your browser tab. Close the tab and all data is gone.
          </p>
        </div>
      </div>
    </div>
  )
}

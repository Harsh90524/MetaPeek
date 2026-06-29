export type FileKind = 'image' | 'pdf' | 'docx'

export interface MetaStore {
  file: File
  kind: FileKind
  parsedMeta: Record<string, unknown>
  editedMeta: Record<string, string>
}

// ── Sensitive keys ────────────────────────────────────────────────────────────
export const SENSITIVE_KEYS = [
  // Image / EXIF
  'GPSLatitude', 'GPSLongitude', 'GPSAltitude',
  'GPSLatitudeRef', 'GPSLongitudeRef', 'GPSPosition',
  'GPSSpeed', 'GPSTrack', 'GPSImgDirection',
  'Make', 'Model', 'LensModel', 'Software', 'Artist',
  'Copyright', 'HostComputer', 'CameraOwnerName',
  'BodySerialNumber', 'LensSerialNumber', 'OwnerName',
  'SerialNumber', 'InternalSerialNumber',
  // PDF / DOCX
  'Author', 'Creator', 'Producer', 'Company', 'Manager',
  'LastModifiedBy', 'CreatedBy', 'ModifiedBy',
  'Template', 'HyperlinkBase',
]

// ── Human-readable labels ─────────────────────────────────────────────────────
export const KEY_LABELS: Record<string, string> = {
  // Image
  Make: 'Camera make', Model: 'Camera model', Software: 'Software',
  DateTime: 'Date taken', DateTimeOriginal: 'Original date', DateTimeDigitized: 'Digitized date',
  ImageWidth: 'Image width', ImageHeight: 'Image height',
  ExifImageWidth: 'EXIF width', ExifImageHeight: 'EXIF height',
  PixelXDimension: 'Pixel width', PixelYDimension: 'Pixel height',
  GPSLatitude: 'GPS latitude', GPSLongitude: 'GPS longitude', GPSAltitude: 'GPS altitude',
  GPSLatitudeRef: 'GPS lat ref', GPSLongitudeRef: 'GPS lon ref',
  GPSSpeed: 'GPS speed', GPSSpeedRef: 'GPS speed unit',
  GPSTrack: 'GPS direction', GPSImgDirection: 'Image direction',
  Artist: 'Artist', Copyright: 'Copyright', HostComputer: 'Host computer',
  CameraOwnerName: 'Camera owner', BodySerialNumber: 'Body serial',
  LensSerialNumber: 'Lens serial', SerialNumber: 'Serial number',
  LensModel: 'Lens model', LensMake: 'Lens make',
  FNumber: 'Aperture (f/)', ExposureTime: 'Shutter speed',
  ISO: 'ISO', ISOSpeedRatings: 'ISO speed',
  FocalLength: 'Focal length', FocalLengthIn35mmFormat: 'Focal length (35mm)',
  Flash: 'Flash', Orientation: 'Orientation',
  ColorSpace: 'Color space', WhiteBalance: 'White balance',
  ExposureMode: 'Exposure mode', ExposureProgram: 'Exposure program',
  MeteringMode: 'Metering mode', SceneCaptureType: 'Scene type',
  XResolution: 'X resolution', YResolution: 'Y resolution',
  BitsPerSample: 'Bits per sample', ResolutionUnit: 'Resolution unit',
  Compression: 'Compression', SamplesPerPixel: 'Samples per pixel',
  SubSecTime: 'Sub-second time', SubSecTimeOriginal: 'Sub-second original',
  ExifVersion: 'EXIF version', MaxApertureValue: 'Max aperture',
  LightSource: 'Light source', SensingMethod: 'Sensing method',
  DigitalZoomRatio: 'Digital zoom', Contrast: 'Contrast',
  Saturation: 'Saturation', Sharpness: 'Sharpness',
  OwnerName: 'Owner name',
  // PDF
  Title: 'Title', Author: 'Author', Subject: 'Subject',
  Keywords: 'Keywords', Creator: 'Creator app', Producer: 'PDF producer',
  CreationDate: 'Created', ModDate: 'Modified',
  Trapped: 'Trapped', PDFFormatVersion: 'PDF version',
  PageCount: 'Page count', IsAcroFormPresent: 'Has form fields',
  IsXFAPresent: 'Has XFA form',
  // DOCX
  Company: 'Company', Manager: 'Manager',
  LastModifiedBy: 'Last modified by', CreatedBy: 'Created by',
  Template: 'Template used', HyperlinkBase: 'Hyperlink base',
  TotalTime: 'Total editing time', Revision: 'Revision number',
  Words: 'Word count', Characters: 'Character count',
  CharactersWithSpaces: 'Chars with spaces', Paragraphs: 'Paragraphs',
  Lines: 'Lines', Pages: 'Pages', Slides: 'Slides',
  AppVersion: 'App version', Application: 'Application',
  DocSecurity: 'Document security',
  Created: 'Date created', Modified: 'Date modified',
  Description: 'Description',
}

// ── Category definitions ──────────────────────────────────────────────────────
export const CATEGORIES: Record<string, string[]> = {
  // Shared / image
  'Location': [
    'GPSLatitude', 'GPSLongitude', 'GPSAltitude',
    'GPSLatitudeRef', 'GPSLongitudeRef',
    'GPSSpeed', 'GPSSpeedRef', 'GPSTrack', 'GPSImgDirection',
  ],
  'Device': [
    'Make', 'Model', 'LensModel', 'LensMake',
    'BodySerialNumber', 'LensSerialNumber', 'SerialNumber', 'InternalSerialNumber',
    'HostComputer', 'CameraOwnerName', 'OwnerName',
  ],
  'Identity': ['Artist', 'Copyright', 'Software', 'Author', 'Creator', 'Producer', 'Company', 'Manager', 'LastModifiedBy', 'CreatedBy', 'ModifiedBy'],
  'Timing': ['DateTime', 'DateTimeOriginal', 'DateTimeDigitized', 'SubSecTime', 'SubSecTimeOriginal', 'CreationDate', 'ModDate', 'Created', 'Modified', 'TotalTime'],
  'Document info': ['Title', 'Subject', 'Keywords', 'Description', 'Template', 'HyperlinkBase', 'Revision', 'DocSecurity', 'PDFFormatVersion', 'Trapped', 'IsAcroFormPresent', 'IsXFAPresent', 'Application', 'AppVersion'],
  'Statistics': ['PageCount', 'Pages', 'Words', 'Characters', 'CharactersWithSpaces', 'Paragraphs', 'Lines', 'Slides'],
  'Image info': [
    'ImageWidth', 'ImageHeight', 'ExifImageWidth', 'ExifImageHeight',
    'PixelXDimension', 'PixelYDimension',
    'XResolution', 'YResolution', 'ResolutionUnit',
    'BitsPerSample', 'ColorSpace', 'Orientation', 'Compression', 'SamplesPerPixel',
  ],
  'Camera settings': [
    'FNumber', 'ExposureTime', 'ISO', 'ISOSpeedRatings',
    'FocalLength', 'FocalLengthIn35mmFormat',
    'Flash', 'WhiteBalance', 'ExposureMode', 'ExposureProgram',
    'MeteringMode', 'SceneCaptureType',
    'DigitalZoomRatio', 'Contrast', 'Saturation', 'Sharpness',
    'MaxApertureValue', 'LightSource', 'SensingMethod',
  ],
}

// Keys to skip — binary blobs, thumbnails, internal buffers
const SKIP_KEYS = new Set([
  'MakerNote', 'UserComment', 'JPEGThumbnail', 'thumbnail',
  'ThumbnailImage', 'PreviewImage', 'JpgFromRaw',
  'CFAPattern', 'ComponentsConfiguration', 'StripOffsets',
  'StripByteCounts', 'TileOffsets', 'TileByteCounts',
  'InterColorProfile', 'PrintIM', 'ImageSourceData',
  'XMLPacket', 'PhotoshopSettings',
])

// ── GPS helpers ───────────────────────────────────────────────────────────────
export function toDecimalDegrees(val: unknown): number | null {
  if (typeof val === 'number' && isFinite(val)) return val
  if (Array.isArray(val) && val.length === 3 && val.every(x => typeof x === 'number')) {
    const dd = val[0] + val[1] / 60 + val[2] / 3600
    return isFinite(dd) ? dd : null
  }
  return null
}

function fmtGPS(key: string, val: unknown): string {
  if (key === 'GPSAltitude') {
    const n = typeof val === 'number' ? val
      : Array.isArray(val) && val.length >= 1 ? val[0] : null
    if (n !== null && isFinite(n as number)) return `${(n as number).toFixed(1)} m`
    return String(val)
  }
  const dd = toDecimalDegrees(val)
  if (dd === null) return String(val)
  if (key === 'GPSLatitude' || key === 'GPSLongitude') {
    const abs = Math.abs(dd)
    const deg = Math.floor(abs)
    const minFull = (abs - deg) * 60
    const min = Math.floor(minFull)
    const sec = ((minFull - min) * 60).toFixed(2)
    return `${dd.toFixed(6)}° (${deg}° ${min}' ${sec}")`
  }
  return `${dd.toFixed(6)}`
}

// ── General value formatter ───────────────────────────────────────────────────
export function fmtVal(key: string, val: unknown): string {
  if (val === null || val === undefined) return ''
  if (val instanceof Date) return val.toLocaleString()
  if (val instanceof Uint8Array || val instanceof ArrayBuffer) return '[binary data]'
  if (key.startsWith('GPS')) return fmtGPS(key, val)
  if (Array.isArray(val)) {
    if (val.length > 64) return `[${val.length} values]`
    return val.map(x => (typeof x === 'number' ? String(Math.round(x * 10000) / 10000) : String(x))).join(', ')
  }
  if (typeof val === 'number') {
    if (!isFinite(val)) return String(val)
    if (key === 'ExposureTime' && val > 0 && val < 1) return `1/${Math.round(1 / val)}s`
    if (key === 'FNumber') return `f/${val}`
    if (key === 'FocalLength' || key === 'FocalLengthIn35mmFormat') return `${val}mm`
    if (key === 'TotalTime') return `${val} min`
    return String(Math.round(val * 10000) / 10000)
  }
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

export function formatBytes(b: number): string {
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  return (b / (1024 * 1024)).toFixed(1) + ' MB'
}

export function getRiskLevel(meta: Record<string, unknown>): 'low' | 'medium' | 'high' {
  const found = Object.keys(meta).filter(k => SENSITIVE_KEYS.includes(k))
  if (found.length === 0) return 'low'
  if (found.length <= 3) return 'medium'
  return 'high'
}

export function flattenMeta(obj: Record<string, unknown>, depth = 0): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (depth > 3) return out
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue
    if (SKIP_KEYS.has(k)) continue
    if (k.startsWith('_') || k === 'rawData' || k === 'data') continue
    if (
      typeof v === 'object' &&
      !Array.isArray(v) &&
      !(v instanceof Date) &&
      !(v instanceof Uint8Array) &&
      !(v instanceof ArrayBuffer)
    ) {
      Object.assign(out, flattenMeta(v as Record<string, unknown>, depth + 1))
    } else {
      out[k] = v
    }
  }
  return out
}

// ── File stripping helpers ────────────────────────────────────────────────────
export function stripJpegExif(bytes: Uint8Array, type: string): Blob {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return new Blob([bytes], { type })
  const out: Uint8Array[] = [bytes.slice(0, 2)]
  let i = 2
  while (i < bytes.length - 1) {
    if (bytes[i] !== 0xff) break
    const marker = bytes[i + 1]
    if (marker === 0xd9) { out.push(bytes.slice(i)); break }
    if (i + 3 >= bytes.length) break
    const segLen = (bytes[i + 2] << 8) | bytes[i + 3]
    const remove = marker === 0xe1 || marker === 0xed || marker === 0xee
    if (!remove) out.push(bytes.slice(i, i + 2 + segLen))
    i += 2 + segLen
  }
  if (i < bytes.length) out.push(bytes.slice(i))
  return new Blob(out, { type })
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportMetaAsJson(meta: Record<string, unknown>, filename: string) {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(meta)) {
    const label = KEY_LABELS[k] ?? k
    out[label] = fmtVal(k, v)
  }
  const json = JSON.stringify(out, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(blob, filename.replace(/\.[^.]+$/, '') + '_metadata.json')
}

export function exportMetaAsCsv(meta: Record<string, unknown>, filename: string) {
  const rows = [['Field', 'Key', 'Value']]
  for (const [k, v] of Object.entries(meta)) {
    const label = KEY_LABELS[k] ?? k
    const value = fmtVal(k, v)
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`
    rows.push([escape(label), escape(k), escape(value)])
  }
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  downloadBlob(blob, filename.replace(/\.[^.]+$/, '') + '_metadata.csv')
}

export function getFileKind(file: File): FileKind {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return 'pdf'
  if (name.endsWith('.docx')) return 'docx'
  return 'image'
}

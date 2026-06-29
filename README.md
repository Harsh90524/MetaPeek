# 🔍 MetaPeek

> **See what your files are hiding.**

MetaPeek is a privacy-focused metadata inspector that runs entirely in your browser. Upload an image, PDF, or Word document and instantly see every piece of hidden metadata embedded in it — GPS coordinates, author names, company info, device serials, creation timestamps, and more. No files are ever uploaded to a server.

---

## ✨ Features

### 📂 File Support
- **Images** — JPG, PNG, WEBP, TIFF (full EXIF, GPS, IPTC, XMP, ICC)
- **PDFs** — title, author, creator app, producer, dates, page count
- **DOCX** — author, company, manager, last modified by, word count, revision history, template used, and more

### 🔎 Metadata Viewer
- Parses and displays all metadata fields grouped by category: Location, Device, Identity, Timing, Document Info, Statistics, Camera Settings, Image Info
- Flags **sensitive fields** (GPS, serial numbers, author names, company) with a visual warning badge
- Shows an overall **risk level** — 🟢 Low / 🟡 Medium / 🔴 High — based on how much identifying information is present
- Clickable **GPS map link** for images with location data (opens OpenStreetMap)

### ✏️ Metadata Editor
- Edit any individual field inline before downloading
- Clear specific fields or all fields at once with one click
- **"Clear sensitive"** button removes only the privacy-risky fields in one shot
- Visual diff — cleared fields are highlighted green with a "will be removed" badge

### 🛡️ Strip & Download
- **Images** — strips EXIF segments from JPEG at the binary level, downloads a clean copy
- **PDFs** — zeroes out all standard metadata fields using `pdf-lib`, re-saves the PDF
- **DOCX** — replaces `docProps/core.xml` and `docProps/app.xml` with blank stubs, preserves document content

### 📤 Export Metadata
- **Export JSON** — downloads all fields as a formatted `.json` file with human-readable keys
- **Export CSV** — downloads a three-column `.csv` (`Field`, `Key`, `Value`) ready to open in Excel or Google Sheets, useful for auditing multiple documents

### 🌙 Dark Mode
- Toggle between light and dark theme from the header
- Preference is saved in `localStorage` and persists across sessions

### 🔒 Privacy First
- **100% client-side** — all parsing, stripping, and exporting happens in your browser
- No backend, no file uploads, no analytics
- Your files never leave your device

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| Image metadata | `exifr` |
| PDF metadata | `pdf-lib` |
| DOCX metadata | `jszip` (raw XML parsing) |
| Animations | `framer-motion` |
| Icons | `lucide-react` |

---

## 🚀 Running Locally

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Harsh90524/MetaPeek.git
cd MetaPeek

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
metapeek/
├── app/
│   ├── components/
│   │   ├── Header.tsx        # App header with dark mode toggle
│   │   ├── TabBar.tsx        # Viewer / Editor / About tabs
│   │   ├── ViewerPane.tsx    # File upload, metadata display, export
│   │   ├── EditorPane.tsx    # Inline field editor, strip & download
│   │   ├── AboutPane.tsx     # About page
│   │   └── types.ts          # Shared types, formatters, export utils
│   ├── globals.css           # CSS variables, light/dark themes
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── next.config.js
└── package.json
```

---

## 🔬 How It Works

1. **Upload** — drag and drop or click to browse. File type is detected by extension.
2. **Parse** — the appropriate parser runs entirely in-browser:
   - Images → `exifr` extracts all EXIF/GPS/IPTC/XMP segments
   - PDFs → `pdf-lib` reads the info dictionary
   - DOCX → `jszip` unpacks the zip and reads `docProps/core.xml` + `docProps/app.xml`
3. **Display** — fields are flattened, formatted, and grouped into categories. Sensitive fields are flagged automatically.
4. **Act** — choose to edit fields, strip all metadata, or export as JSON/CSV.

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server at localhost:3000 |
| `npm run build` | Build for production |
| `npm start` | Start production server |

---

## 📄 License

MIT — feel free to use, modify, and distribute.

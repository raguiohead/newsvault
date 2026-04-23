# 🛡️ NewsVault

NewsVault is a performant, 100% client-side web application designed to automatically catalog and read your collection of PDF-based newsletters. It parses PDF documents directly in your browser, extracting their content, and presents them in a beautiful, accessible, glassmorphism-themed frontend.

## Key Features

- **100% Client-Side Architecture**: No backend required. Your PDFs never leave your machine, ensuring maximum privacy and security.
- **In-Browser PDF Parsing**: Uses `pdf.js` to automatically extract text, themes, authors, and dates from PDF newsletters securely in the browser.
- **Persistent Local Storage**: Data is saved locally using IndexedDB, so your library is always available instantly.
- **Dynamic Frontend**: Modern React interface with fluid GSAP animations.
- **Accessible Design**: Compliant with Vercel Web Interface Guidelines. Features `Google Sans` typography, semantic HTML elements (`role`, `aria-label`), visible focus states, and high contrast support.
- **Side-Drawer Reader**: Clean, distraction-free reading experience for your newsletters.

## Tech Stack

- **Language**: JavaScript (ES6+ Modules)
- **Frontend**: React 18 with Vite
- **Animations**: GSAP (GreenSock)
- **Storage**: IndexedDB (via `idb`)
- **PDF Extraction**: `pdfjs-dist` (running in-browser)

## Prerequisites

- Node.js 18 or higher (only for local development/building)
- npm (comes with Node.js)

## Getting Started (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/raguiohead/newsvault.git
cd newsvault
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

### 4. Access the App

Open [http://localhost:5173](http://localhost:5173) in your browser. Since it is 100% client-side, the app will guide you to upload your PDFs directly through the interface!

## Architecture

### Directory Structure

```text
newsvault/
├── public/              # Static assets
├── src/                 # React frontend source code
│   ├── components/      # Reusable UI components (ArticleCard, ArticleDrawer, etc.)
│   ├── db.js            # IndexedDB configuration and wrapper
│   ├── pdfParser.js     # In-browser PDF parsing logic (pdf.js)
│   ├── App.jsx          # Main application component
│   └── main.jsx         # React entry point
├── package.json         # Project metadata and scripts
└── vite.config.js       # Vite bundler configuration
```

### Request Lifecycle & Data Flow

1. User clicks "+ Adicionar PDFs" in the browser and selects local PDF files.
2. The React frontend passes the files to `src/pdfParser.js`.
3. `pdf.js` reads the file buffer directly in the browser memory and extracts the text content and metadata.
4. The extracted metadata and content are saved to the browser's native database (`IndexedDB`) via `src/db.js`.
5. The React state updates, reading from IndexedDB, and renders the articles using the `ArticleGrid` and `ArticleCard` components.
6. The user can view the full content in the `ArticleDrawer`.

**Important**: Because of this architecture, your files are never uploaded to any server.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Builds the React frontend for production into the `dist/` folder. |
| `npm run preview` | Previews the production build locally. |

## Deployment (Zero Cost & Serverless)

Because NewsVault is now a **Static Single Page Application (SPA)** that uses IndexedDB, deploying it is entirely free and doesn't require a Node.js server to run.

You can deploy it in 3 clicks to platforms like Vercel, Netlify, or GitHub Pages.

### Vercel Deployment (Recommended)

1. Push your code to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click "Add New... -> Project".
3. Import the `newsvault` repository.
4. Vercel will automatically detect Vite. The build command (`npm run build`) and output directory (`dist`) will be pre-filled.
5. Click **Deploy**.

### GitHub Pages

1. Install the `gh-pages` package: `npm install -D gh-pages`
2. Add a `base: '/newsvault/'` property in `vite.config.js`.
3. Add a script to `package.json`: `"deploy": "vite build && gh-pages -d dist"`
4. Run `npm run deploy`.

## Troubleshooting

### PDF Upload Fails

**Error**: "Erro ao processar o arquivo PDF."

**Solution**: The PDF might be encrypted or corrupted. Ensure the file is a standard text-based PDF (not just scanned images). If it is a scanned image, `pdf.js` cannot extract text without OCR.

### App Won't Start Locally

**Error**: `EADDRINUSE` for port 5173.

**Solution**: Another process is using the default port. Stop the conflicting process or change the port in `vite.config.js`.

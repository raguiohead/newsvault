# 🛡️ NewsVault

NewsVault is a performant local web application designed to automatically catalog and read your collection of PDF-based newsletters. It parses PDF documents, extracts their content, and presents them in a beautiful, dynamic, and glassmorphism-themed frontend.

## Key Features

- **Automated PDF Parsing**: Automatically extracts text, themes, authors, and dates from PDF newsletters.
- **Dynamic Frontend**: Modern React interface with fluid GSAP animations.
- **Local-First Architecture**: Runs entirely on your local machine for privacy and speed.
- **Side-Drawer Reader**: Clean, distraction-free reading experience for your newsletters.

## Tech Stack

- **Language**: JavaScript (ES6+ Modules)
- **Frontend**: React 18 with Vite
- **Animations**: GSAP (GreenSock)
- **Backend**: Express.js
- **PDF Extraction**: pdf-parse
- **Process Management**: concurrently

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/raguiohead/newsvault.git
cd newsvault
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Your Newsletters

Place your PDF files inside the `docs/` (or `pdfs/`) folder at the root of the project.

### 4. Start the Application

To parse the PDFs and start both the backend and frontend servers simultaneously:

```bash
npm start
```

### 5. Access the App

Open [http://localhost:5173](http://localhost:5173) in your browser. The backend API will be running at `http://localhost:3001`.

## Architecture

### Directory Structure

```text
newsvault/
├── docs/                # Place your PDF newsletters here (or in pdfs/)
├── pdfs/                # Alternative folder for PDF newsletters
├── public/              # Static assets and generated data.json
├── scripts/             # Automation scripts
│   └── parse-pdfs.js    # Extracts data from PDFs to data.json
├── server/              # Express backend server
│   └── server.js        # API endpoints and static file serving
├── src/                 # React frontend source code
│   ├── components/      # Reusable UI components (ArticleCard, ArticleDrawer, etc.)
│   ├── App.jsx          # Main application component
│   └── main.jsx         # React entry point
├── package.json         # Project metadata and scripts
└── vite.config.js       # Vite bundler configuration
```

### Request Lifecycle

1. PDFs are added to the `docs/` or `pdfs/` folder.
2. Running `npm run parse` executes `scripts/parse-pdfs.js`, which reads the PDFs, extracts the text using `pdf-parse`, and generates a `data.json` file inside the `public/` directory.
3. The Express backend (`server/server.js`) serves this `data.json` via the `/api/articles` endpoint.
4. The React frontend fetches the data from the API and renders the articles using the `ArticleGrid` and `ArticleCard` components.
5. Users can view the full content in the `ArticleDrawer`.

### Data Flow

```text
PDF Files → parse-pdfs.js → public/data.json
                                  ↓
Express Server (/api/articles) ← React Frontend (Fetch)
                                  ↓
                             Article Components
```

### Key Components

**Backend (Express)**
- Serves the parsed data (`/api/articles`).
- Provides an endpoint to trigger re-indexing dynamically (`/api/reindex`).
- Serves static PDF files directly to the frontend (`/pdfs`).

**Frontend (React)**
- `ArticleGrid` & `ArticleCard`: Displays the catalog of newsletters.
- `ArticleDrawer`: A side-drawer component for reading the selected newsletter.
- `FilterBar`: Allows users to filter the content by author, date, or theme.
- Proxies API requests to the backend via Vite's proxy configuration in `vite.config.js`.

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Parses the PDFs and starts both development servers concurrently. |
| `npm run dev` | Starts the Express server and Vite frontend concurrently (without parsing). |
| `npm run parse` | Runs the `parse-pdfs.js` script to manually generate/update `data.json`. |
| `npm run server` | Starts only the Express backend server on port 3001. |
| `npm run build` | Builds the React frontend for production into the `dist/` folder. |
| `npm run preview` | Previews the production build locally. |

## Deployment

While NewsVault is designed primarily as a local application, it can be deployed to a cloud provider. The Express backend is configured to serve the Vite frontend from the `dist/` directory in production.

### Manual VPS Deployment

1. Clone the repository on your server.
2. Install dependencies: `npm install`
3. Add your PDFs to the `docs/` or `pdfs/` directory.
4. Parse the PDFs: `npm run parse`
5. Build the frontend: `npm run build`
6. Start the server: `npm run server` (or use PM2/systemd to keep it running in the background).

## Troubleshooting

### No Articles Showing Up

**Error**: The frontend is empty or displays a "data.json not found" error.

**Solution**: Ensure you have run the parsing script after placing your PDFs in the folder:
```bash
npm run parse
```

### Port Conflicts

**Error**: `EADDRINUSE` for port 5173 or 3001.

**Solution**: Another process is using the default ports. Stop the conflicting process or change the ports in `vite.config.js` and `server/server.js`.

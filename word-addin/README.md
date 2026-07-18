# Word Add-in: Gemini for Word

A Microsoft Word Office Web Add-in that lets you chat with Google Gemini (gemini.google.com) and easily insert its responses into your Word document. No API key needed — uses your existing Google account.

## How It Works

1. **Copy Selection** — grabs selected text from your Word doc to the clipboard
2. **Open Gemini** — opens gemini.google.com in a new browser window
3. **Chat** — paste your text into Gemini and ask it to generate/modify content
4. **Paste & Insert** — copy Gemini's response, paste it into the add-in, and insert it into your document

## Setup

### 1. Install dependencies

```bash
cd word-addin
npm install
```

### 2. Generate SSL certificates (required for Office Add-ins)

```bash
npm run generate-certs
```

### 3. Start the local server

```bash
npm start
```

### 4. Sideload the add-in in Word

**Word on Windows:**
1. Open Word → **Insert** → **My Add-ins** → **Upload My Add-in**
2. Browse to `word-addin/manifest.xml`

**Word on Mac:**
1. Open Word → **Insert** → **My Add-ins** → dropdown → **Upload My Add-in**
2. Browse to `word-addin/manifest.xml`

**Word on the Web:**
1. Open Word Online → **Insert** → **Office Add-ins** → **Upload My Add-in**
2. Browse to `word-addin/manifest.xml`

### 5. Use it

1. Open the task pane from the ribbon
2. Select text in your document and click **Copy Selected Text** (optional)
3. Click **Open Gemini Chat** — a new window opens with gemini.google.com
4. Paste your text and chat with Gemini
5. Copy Gemini's response
6. Paste it into the text area in the add-in
7. Choose where to insert (at cursor, at end, or replace selection)
8. Click **Insert into Document**

## Insert Options

- **At cursor** — inserts after your current cursor position
- **At end** — appends to the end of the document
- **Replace selection** — replaces the currently selected text

## Project Structure

```
word-addin/
├── manifest.xml        # Office Add-in manifest
├── package.json        # Dev dependencies
├── README.md           # This file
└── src/
    ├── taskpane.html   # Add-in UI
    └── taskpane.js     # Clipboard, Gemini launcher, and Word insertion logic
```

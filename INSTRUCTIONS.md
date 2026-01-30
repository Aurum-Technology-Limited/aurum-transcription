# Aurum Transcription

A premium React web application for transcribing audio files using OpenAI's Whisper API, with support for PDF and DOCX exports.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- An OpenAI API Key (starts with `sk-...`)

### Installation

1. Open your terminal in the project directory:
   ```bash
   cd /Users/marcymoo/Downloads/Transcription
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown (usually `http://localhost:5173`).

## 🔑 Configuration

### OpenAI Whisper API
The application uses the OpenAI API to perform transcriptions. 
- You will be prompted to enter your API key when you first load the app.
- The key is **stored locally** in your browser (`localStorage`) and is never sent to any other server.
- The app uses the `whisper-1` model via the `https://api.openai.com/v1/audio/transcriptions` endpoint.

### Export Configuration
Exports are handled entirely client-side:
- **PDF**: Uses `jspdf` to generate clean, paginated PDF documents.
- **DOCX**: Uses `docx` (and `file-saver`) to generate Microsoft Word compatible files.

## 🛠 Tech Stack

- **Frontend**: React + Vite
- **Styling**: Vanilla CSS (CSS Modules approach with global variables)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Services**: OpenAI API (Axios)

## 📁 Project Structure

- `src/components/`: Reusable UI components.
  - `FileUploader`: Drag & drop interface.
  - `TranscriptionEditor`: Text editor for results.
  - `ExportActions`: Export buttons and logic.
  - `ApiKeyModal`: Settings modal.
- `src/services/`: API integration.
  - `openaiService.js`: Whisper API wrapper.
- `src/index.css`: Global styles and design system.

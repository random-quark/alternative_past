# 🎨 Alternative Past

A full-stack web application that uses AI to generate alternative versions of your images based on audio descriptions. Upload an image, record or upload audio describing what you want to see, and watch as AI creates your "alternative past."

## ✨ Features

- **Image Upload**: Drag & drop or click to upload images
- **Audio Input**: Record directly in the browser or upload audio files
- **AI Transcription**: Automatic speech-to-text using OpenAI Whisper
- **Smart Analysis**: ChatGPT analyzes your image and audio to understand the context
- **Image Generation**: Creates new images using Replicate's AI models
- **Real-time Progress**: Visual indicators for each processing step
- **Mobile Friendly**: Responsive design that works on all devices

## 🏗️ Tech Stack

### Frontend
- **Vue.js 3** with Composition API
- **Vite** for fast development and building
- **Modern CSS** with responsive design
- **Fetch API** for backend communication

### Backend
- **Vercel Serverless Functions** for scalable API endpoints
- **OpenAI Whisper API** for audio transcription
- **OpenAI GPT-4 Vision** for image analysis
- **Replicate API** for AI image generation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Vercel CLI installed (`npm i -g vercel`)
- OpenAI API key
- Replicate API key

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd alternative_past

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# OpenAI API Key (required for transcription and analysis)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Replicate API Key (required for image generation)
REPLICATE_API_KEY=r8_your-replicate-api-key-here
```

### 3. Run Locally

```bash
# Start the frontend development server
npm run dev

# In another terminal, start the Vercel development server
vercel dev
```

The app will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:3001

## 📁 Project Structure

```
alternative_past/
├── frontend/                 # Vue.js 3 + Vite frontend
│   ├── src/
│   │   ├── App.vue          # Main Vue component
│   │   └── main.js          # Vue app entry point
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── api/                     # Vercel Serverless Functions
│   ├── transcribe.js        # Audio transcription endpoint
│   ├── analyze.js          # Image + text analysis endpoint
│   └── generate.js         # Image generation endpoint
├── vercel.json             # Vercel deployment configuration
├── package.json            # Root package.json
└── README.md               # This file
```

## 🔧 API Endpoints

### POST `/api/transcribe`
Transcribes audio files using OpenAI Whisper.

**Request:**
- `Content-Type: multipart/form-data`
- `audio`: Audio file (WAV, MP3, etc.)

**Response:**
```json
{
  "text": "Transcribed text content",
  "success": true
}
```

### POST `/api/analyze`
Analyzes image and transcription using ChatGPT.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ...",
  "transcription": "Audio transcription text"
}
```

**Response:**
```json
{
  "description": "Brief image description",
  "prompt": "Detailed image generation prompt",
  "style": "artistic style suggestion",
  "mood": "atmospheric mood",
  "success": true
}
```

### POST `/api/generate`
Generates new images using Replicate.

**Request:**
```json
{
  "originalImage": "data:image/jpeg;base64,/9j/4AAQ...",
  "prompt": "Image generation prompt"
}
```

**Response:**
```json
{
  "imageUrl": "https://replicate.delivery/...",
  "success": true,
  "predictionId": "prediction-id"
}
```

## 🌐 Deployment on Vercel

### Method 1: Deploy via GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the project structure

3. **Configure Environment Variables**
   - In your Vercel dashboard, go to Project Settings
   - Navigate to "Environment Variables"
   - Add the following variables:
     ```
     OPENAI_API_KEY=sk-your-openai-api-key-here
     REPLICATE_API_KEY=r8_your-replicate-api-key-here
     ```
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy" and wait for the build to complete
   - Your app will be available at `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add REPLICATE_API_KEY

# Deploy to production
vercel --prod
```

## 🔑 Getting API Keys

### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to "API Keys" in your dashboard
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### Replicate API Key
1. Go to [replicate.com](https://replicate.com)
2. Sign up or log in to your account
3. Go to your account settings
4. Navigate to "API tokens"
5. Create a new token
6. Copy the token (starts with `r8_`)

## 📝 Usage Instructions

1. **Upload an Image**: Click or drag an image into the upload area
2. **Add Audio**: Either record directly using the microphone or upload an audio file
3. **Generate**: Click "Generate Alternative Past" to start the AI process
4. **Wait**: The app will show progress through three steps:
   - 🎤 Transcribing your audio
   - 🧠 Analyzing the content
   - 🎨 Generating the new image
5. **View Results**: See your original image transformed into an alternative version

## ⚠️ Important Notes

### File Upload Limits
- **Images**: Maximum 10MB per image
- **Audio**: Maximum 25MB per audio file
- **Supported formats**: JPG, PNG, GIF for images; WAV, MP3, M4A for audio

### API Rate Limits
- **OpenAI**: Check your OpenAI usage limits in your dashboard
- **Replicate**: Free tier includes limited generations per month
- **Vercel**: Serverless functions have execution time limits

### Testing Endpoints

You can test each endpoint individually:

```bash
# Test transcription
curl -X POST http://localhost:3001/api/transcribe \
  -F "audio=@your-audio-file.wav"

# Test analysis
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,/9j/4AAQ...","transcription":"Your text here"}'

# Test generation
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"originalImage":"data:image/jpeg;base64,/9j/4AAQ...","prompt":"Your prompt here"}'
```

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
vercel dev
```

### Building for Production
```bash
cd frontend
npm run build
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure you're running both frontend and backend servers
2. **API Key Errors**: Verify your environment variables are set correctly
3. **File Upload Issues**: Check file size limits and supported formats
4. **Timeout Errors**: Some AI operations can take time; the app includes progress indicators

### Debug Mode
Set `NODE_ENV=development` in your environment variables to see detailed error messages.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify your API keys are correct
3. Check the browser console for error messages
4. Open an issue on GitHub with detailed error information

---

**Happy creating! 🎨✨**

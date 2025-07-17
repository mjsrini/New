# AI Voice-to-Song Conversion Web App

A modern web application that uses Hugging Face RVC (Retrieval-based Voice Conversion) to transform any song with your voice.

## Features

- 🎤 **Voice Recording/Upload**: Record directly in browser or upload voice files
- 🎵 **Song Upload**: Support for MP3, WAV audio files (max 20MB)
- 🤖 **AI Voice Conversion**: Uses Hugging Face RVC model for high-quality voice cloning
- 📱 **Mobile-Friendly**: Responsive design optimized for all devices
- 🎧 **Audio Player**: Built-in player with controls and download functionality
- ⚡ **Real-time Progress**: Live updates during AI processing

## Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **AI Model**: Hugging Face RVC (audo/Retrieval-based-Voice-Conversion-WebUI)
- **Build Tool**: Vite
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Deploy Edge Functions
```bash
# If using Supabase CLI
supabase functions deploy voice-conversion
```

### 4. Start Development Server
```bash
npm run dev
```

## How It Works

1. **Upload Voice**: Record or upload a voice sample (your voice)
2. **Upload Song**: Upload the song you want to convert
3. **AI Processing**: The app sends both files to Hugging Face RVC model
4. **Voice Conversion**: AI replaces original vocals with your voice characteristics
5. **Download Result**: Play and download your personalized song

## API Integration

The app uses the Hugging Face Inference API with the following RVC parameters:
- `f0_method`: "harvest" (pitch detection)
- `index_rate`: 0.5 (voice feature extraction)
- `filter_radius`: 3 (audio filtering)
- `rms_mix_rate`: 0.25 (volume mixing)
- `protect`: 0.33 (voice protection)

## File Structure

```
src/
├── components/
│   ├── VoiceToSongConverter.tsx    # Main app component
│   ├── FileUpload.tsx              # File upload with drag-and-drop
│   ├── AudioRecorder.tsx           # Voice recording functionality
│   ├── AudioPlayer.tsx             # Audio playback controls
│   └── ProcessingStatus.tsx        # Progress tracking UI
├── utils/
│   └── voiceConversion.ts          # API integration logic
└── App.tsx                         # Root component

supabase/
└── functions/
    ├── voice-conversion/
    │   └── index.ts                # RVC processing endpoint
    └── _shared/
        └── cors.ts                 # CORS configuration
```

## Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Supabase)
The edge functions are automatically deployed with Supabase.

## Troubleshooting

**Model Loading Issues**: The Hugging Face model may take 20-30 seconds to load initially. The app includes automatic retry logic.

**File Size Limits**: Maximum file size is 20MB per file. Larger files may cause processing timeouts.

**Processing Time**: Voice conversion typically takes 1-3 minutes depending on file size and model availability.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using Hugging Face RVC technology
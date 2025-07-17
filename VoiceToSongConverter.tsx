import React, { useState, useRef } from 'react';
import { FileUpload } from './FileUpload';
import { AudioRecorder } from './AudioRecorder';
import { ProcessingStatus } from './ProcessingStatus';
import { AudioPlayer } from './AudioPlayer';
import { convertVoiceToSong } from '../utils/voiceConversion';
import { Mic, Music, Sparkles, Download } from 'lucide-react';

interface ProcessingState {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  currentStep: string;
}

export const VoiceToSongConverter: React.FC = () => {
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [songFile, setSongFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    currentStep: ''
  });
  const [resultAudio, setResultAudio] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceUpload = (file: File) => {
    setVoiceFile(file);
  };

  const handleSongUpload = (file: File) => {
    setSongFile(file);
  };

  const handleRecordingComplete = (audioBlob: Blob) => {
    const file = new File([audioBlob], 'voice-recording.wav', { type: 'audio/wav' });
    setVoiceFile(file);
    setIsRecording(false);
  };

  const simulateProcessing = async () => {
    if (!voiceFile || !songFile) return;

    setProcessing({ status: 'processing', progress: 0, currentStep: 'Starting voice conversion...' });

    try {
      const result = await convertVoiceToSong(
        voiceFile,
        songFile,
        (progress, step) => {
          setProcessing({ status: 'processing', progress, currentStep: step });
        }
      );

      if (result.success && result.audioUrl) {
        setResultAudio(result.audioUrl);
        setProcessing({ status: 'completed', progress: 100, currentStep: 'Voice conversion complete!' });
      } else {
        setProcessing({ status: 'error', progress: 0, currentStep: result.error || 'Conversion failed' });
      }
    } catch (error) {
      console.error('Processing error:', error);
      setProcessing({ 
        status: 'error', 
        progress: 0, 
        currentStep: 'An error occurred during processing' 
      });
    }
  };

  const handleDownload = () => {
    if (resultAudio) {
      const link = document.createElement('a');
      link.href = resultAudio;
      link.download = 'voice-converted-song.mp3';
      link.click();
    }
  };

  const resetApp = () => {
    setVoiceFile(null);
    setSongFile(null);
    setProcessing({ status: 'idle', progress: 0, currentStep: '' });
    setResultAudio(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-purple-400 mr-2" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              AI Voice-to-Song Converter
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Transform any song with your voice using advanced AI technology
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Step 1: Voice Input */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <Mic className="h-6 w-6 text-purple-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Step 1: Your Voice</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-white font-medium mb-3">Upload Voice Note</h3>
                <FileUpload
                  onFileSelect={handleVoiceUpload}
                  acceptedTypes=".wav,.mp3,.m4a"
                  maxSize={20}
                  label="Drop your voice recording here"
                  icon={<Mic className="h-6 w-6" />}
                />
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-3">Or Record Now</h3>
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                />
              </div>
            </div>

            {voiceFile && (
              <div className="mt-4 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                <p className="text-green-300 font-medium">Voice file uploaded: {voiceFile.name}</p>
              </div>
            )}
          </div>

          {/* Step 2: Song Input */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <Music className="h-6 w-6 text-purple-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Step 2: Choose Song</h2>
            </div>
            
            <FileUpload
              onFileSelect={handleSongUpload}
              acceptedTypes=".mp3,.wav"
              maxSize={20}
              label="Drop your song file here"
              icon={<Music className="h-6 w-6" />}
            />

            {songFile && (
              <div className="mt-4 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                <p className="text-green-300 font-medium">Song file uploaded: {songFile.name}</p>
              </div>
            )}
          </div>

          {/* Step 3: Process */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <Sparkles className="h-6 w-6 text-purple-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Step 3: AI Processing</h2>
            </div>

            {processing.status === 'idle' && (
              <button
                onClick={simulateProcessing}
                disabled={!voiceFile || !songFile}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  voiceFile && songFile
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transform hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {!voiceFile || !songFile ? 'Upload both files to continue' : '🎤 Start RVC Voice Conversion'}
              </button>
            )}

            {(processing.status === 'processing' || processing.status === 'error') && (
              <ProcessingStatus 
                progress={processing.progress}
                currentStep={processing.currentStep}
                isError={processing.status === 'error'}
              />
            )}

            {processing.status === 'completed' && resultAudio && (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                  <p className="text-green-300 font-medium text-center">
                    🎉 Your voice-converted song is ready!
                  </p>
                </div>
                
                <AudioPlayer audioUrl={resultAudio} />
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download Song
                  </button>
                  
                  <button
                    onClick={resetApp}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                  >
                    Create Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p>Powered by Hugging Face RVC (Retrieval-based Voice Conversion) AI</p>
        </div>
      </div>
    </div>
  );
};
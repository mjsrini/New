import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  isRecording,
  setIsRecording
}) => {
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        onRecordingComplete(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setCurrentTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDuration(currentTime);
      setCurrentTime(0);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !recordedAudio) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      {!isRecording && !recordedAudio && (
        <div className="text-center">
          <button
            onClick={startRecording}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center mx-auto"
          >
            <Mic className="h-5 w-5 mr-2" />
            Start Recording
          </button>
          <p className="text-gray-400 text-sm mt-2">Click to record your voice</p>
        </div>
      )}

      {isRecording && (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">Recording...</span>
          </div>
          
          <div className="text-2xl font-mono text-white">
            {formatTime(currentTime)}
          </div>
          
          <button
            onClick={stopRecording}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center mx-auto"
          >
            <Square className="h-5 w-5 mr-2" />
            Stop Recording
          </button>
        </div>
      )}

      {recordedAudio && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Recorded Audio</span>
            <span className="text-gray-400 text-sm">{formatTime(duration)}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlayback}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors duration-200"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full transition-all duration-200" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <audio
            ref={audioRef}
            src={recordedAudio}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
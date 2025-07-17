export interface VoiceConversionResult {
  success: boolean;
  audioUrl?: string;
  error?: string;
  processingTime?: number;
}

export const convertVoiceToSong = async (
  voiceFile: File,
  songFile: File,
  onProgress?: (progress: number, step: string) => void
): Promise<VoiceConversionResult> => {
  try {
    // Convert files to base64
    const voiceBase64 = await fileToBase64(voiceFile);
    const songBase64 = await fileToBase64(songFile);

    onProgress?.(10, 'Uploading files to Hugging Face RVC...');

    // Call our Supabase edge function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-conversion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        voiceFile: voiceBase64,
        songFile: songBase64,
        voiceFileName: voiceFile.name,
        songFileName: songFile.name,
      }),
    });

    onProgress?.(30, 'Analyzing voice characteristics...');
    
    // Simulate progress updates during processing
    setTimeout(() => onProgress?.(50, 'Extracting vocal features...'), 2000);
    setTimeout(() => onProgress?.(70, 'Converting voice with RVC model...'), 5000);
    setTimeout(() => onProgress?.(90, 'Finalizing audio output...'), 8000);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Voice conversion failed');
    }

    onProgress?.(100, 'RVC voice conversion complete!');

    return result;
  } catch (error) {
    console.error('Voice conversion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};
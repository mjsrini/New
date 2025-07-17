import { corsHeaders } from '../_shared/cors.ts';

const HUGGINGFACE_API_TOKEN = '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';

interface VoiceConversionRequest {
  voiceFile: string; // base64 encoded
  songFile: string; // base64 encoded
  voiceFileName: string;
  songFileName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { voiceFile, songFile, voiceFileName, songFileName }: VoiceConversionRequest = await req.json();

    if (!HUGGINGFACE_API_TOKEN) {
      throw new Error('Hugging Face API token not configured');
    }

    // Convert base64 to blob
    const voiceBlob = Uint8Array.from(atob(voiceFile), c => c.charCodeAt(0));
    const songBlob = Uint8Array.from(atob(songFile), c => c.charCodeAt(0));

    // Save files temporarily for processing
    const voicePath = `/tmp/${voiceFileName}`;
    const songPath = `/tmp/${songFileName}`;
    
    await Deno.writeFile(voicePath, voiceBlob);
    await Deno.writeFile(songPath, songBlob);

    // Use Hugging Face RVC model
    const response = await fetch(
      'https://api-inference.huggingface.co/models/audo/Retrieval-based-Voice-Conversion-WebUI',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            source_audio: voiceFile,
            target_audio: songFile,
            f0_method: "harvest",
            index_rate: 0.5,
            filter_radius: 3,
            rms_mix_rate: 0.25,
            protect: 0.33,
            hop_length: 512,
            f0_up_key: 0
          },
          parameters: {
            return_full_text: false,
            wait_for_model: true
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      
      // If model is loading, wait and retry
      if (response.status === 503) {
        await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds
        
        const retryResponse = await fetch(
          'https://api-inference.huggingface.co/models/audo/Retrieval-based-Voice-Conversion-WebUI',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${HUGGINGFACE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: {
                source_audio: voiceFile,
                target_audio: songFile,
                f0_method: "harvest",
                index_rate: 0.5,
                filter_radius: 3,
                rms_mix_rate: 0.25,
                protect: 0.33,
                hop_length: 512,
                f0_up_key: 0
              }
            })
          }
        );
        
        if (!retryResponse.ok) {
          throw new Error(`Hugging Face API error: ${await retryResponse.text()}`);
        }
        
        const audioBuffer = await retryResponse.arrayBuffer();
        const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        const audioUrl = `data:audio/wav;base64,${audioBase64}`;
        
        return new Response(
          JSON.stringify({
            success: true,
            audioUrl: audioUrl,
            processingTime: 20
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      throw new Error(`Hugging Face API error: ${errorText}`);
    }

    // Get the converted audio
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64 data URL for frontend
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const audioUrl = `data:audio/wav;base64,${audioBase64}`;

    // Clean up temporary files
    try {
      await Deno.remove(voicePath);
      await Deno.remove(songPath);
    } catch (e) {
      console.warn('Failed to clean up temp files:', e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: audioUrl,
        processingTime: 15
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Voice conversion error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Voice conversion failed'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
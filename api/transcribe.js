/**
 * Vercel Serverless Function: Transcribe Audio
 * 
 * This endpoint accepts an audio file via multipart/form-data
 * and uses OpenAI's Whisper API to transcribe the audio.
 * 
 * Environment Variables Required:
 * - OPENAI_API_KEY: Your OpenAI API key
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY environment variable is not set');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
      });
    }

    // Parse the multipart form data
    const formData = await parseMultipartForm(req);
    
    if (!formData.audio) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Create FormData for OpenAI API
    const openaiFormData = new FormData();
    openaiFormData.append('file', formData.audio.buffer, formData.audio.filename || 'audio.wav');
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('language', 'en'); // You can make this configurable

    // Call OpenAI Whisper API
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openaiFormData,
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to transcribe audio. Please check your OpenAI API key and try again.' 
      });
    }

    const transcriptionResult = await openaiResponse.json();
    
    // Return the transcribed text
    return res.status(200).json({
      text: transcriptionResult.text,
      success: true
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during transcription',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Parse multipart form data from the request
 * This is a simplified parser for Vercel serverless functions
 */
async function parseMultipartForm(req) {
  const boundary = req.headers['content-type']?.split('boundary=')[1];
  if (!boundary) {
    throw new Error('No boundary found in content-type header');
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  
  const buffer = Buffer.concat(chunks);
  const parts = buffer.toString('binary').split(`--${boundary}`);
  
  const formData = {};
  
  for (const part of parts) {
    if (part.includes('Content-Disposition: form-data')) {
      const nameMatch = part.match(/name="([^"]+)"/);
      const filenameMatch = part.match(/filename="([^"]+)"/);
      
      if (nameMatch) {
        const name = nameMatch[1];
        const contentStart = part.indexOf('\r\n\r\n');
        if (contentStart !== -1) {
          const content = part.substring(contentStart + 4);
          const contentEnd = content.lastIndexOf('\r\n');
          const fileContent = content.substring(0, contentEnd);
          
          formData[name] = {
            buffer: Buffer.from(fileContent, 'binary'),
            filename: filenameMatch ? filenameMatch[1] : null,
            contentType: part.includes('Content-Type:') ? 
              part.match(/Content-Type: ([^\r\n]+)/)?.[1] : 'application/octet-stream'
          };
        }
      }
    }
  }
  
  return formData;
}

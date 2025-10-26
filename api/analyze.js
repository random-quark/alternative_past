/**
 * Vercel Serverless Function: Analyze Content
 * 
 * This endpoint accepts an image (base64) and transcription text,
 * then uses ChatGPT API to analyze both inputs and generate a prompt
 * for image generation.
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

    const { image, transcription } = req.body;

    // Validate input
    if (!image || !transcription) {
      return res.status(400).json({ 
        error: 'Both image and transcription are required' 
      });
    }

    // Prepare the analysis prompt
    const systemPrompt = `You are an AI assistant that analyzes images and audio transcriptions to create detailed prompts for image generation. 

Your task is to:
1. Analyze the provided image to understand its content, style, and mood
2. Consider the audio transcription as a description or narrative about the image
3. Generate a detailed, creative prompt that could be used to generate an "alternative past" version of the image

The prompt should be:
- Detailed and descriptive
- Include artistic style suggestions
- Incorporate elements from the audio description
- Be suitable for AI image generation
- Focus on creating an "alternative past" or "what if" scenario

Respond with a JSON object containing:
- "description": A brief description of what you see in the image
- "prompt": A detailed prompt for image generation
- "style": Suggested artistic style
- "mood": The mood or atmosphere to convey`;

    const userPrompt = `Please analyze this image and the following audio transcription to create a detailed image generation prompt:

Audio Transcription: "${transcription}"

Image: [Base64 image data provided]

Create a prompt for generating an "alternative past" version of this image based on the audio description.`;

    // Call OpenAI ChatGPT API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to analyze content. Please check your OpenAI API key and try again.' 
      });
    }

    const analysisResult = await openaiResponse.json();
    const analysisText = analysisResult.choices[0].message.content;

    // Try to parse the JSON response, fallback to plain text
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from the text
      analysis = {
        description: "Image analysis completed",
        prompt: analysisText,
        style: "realistic",
        mood: "atmospheric"
      };
    }

    // Ensure we have a prompt field
    if (!analysis.prompt) {
      analysis.prompt = analysisText;
    }

    return res.status(200).json({
      ...analysis,
      success: true
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during analysis',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

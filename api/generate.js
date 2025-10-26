/**
 * Vercel Serverless Function: Generate Image
 * 
 * This endpoint accepts an original image and analysis prompt,
 * then uses Replicate.com's API to generate a new image.
 * 
 * Environment Variables Required:
 * - REPLICATE_API_KEY: Your Replicate API key
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
    // Check if Replicate API key is configured
    if (!process.env.REPLICATE_API_KEY) {
      console.error('REPLICATE_API_KEY environment variable is not set');
      return res.status(500).json({ 
        error: 'Replicate API key not configured. Please set REPLICATE_API_KEY environment variable.' 
      });
    }

    const { originalImage, prompt } = req.body;

    // Validate input
    if (!originalImage || !prompt) {
      return res.status(400).json({ 
        error: 'Both originalImage and prompt are required' 
      });
    }

    // Prepare the image for Replicate (convert base64 to data URL if needed)
    let imageUrl = originalImage;
    if (!originalImage.startsWith('data:') && !originalImage.startsWith('http')) {
      imageUrl = `data:image/jpeg;base64,${originalImage}`;
    }

    // Create a prediction using Replicate's Stable Diffusion model
    // Using a popular image-to-image model for better results
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", // Stable Diffusion XL
        input: {
          prompt: prompt,
          image: imageUrl,
          num_inference_steps: 20,
          guidance_scale: 7.5,
          strength: 0.8, // How much to transform the original image
          scheduler: "K_EULER"
        }
      })
    });

    if (!replicateResponse.ok) {
      const errorData = await replicateResponse.text();
      console.error('Replicate API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to generate image. Please check your Replicate API key and try again.' 
      });
    }

    const prediction = await replicateResponse.json();
    
    // Poll for completion (Replicate predictions are async)
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max (10s intervals)
    
    while (result.status === 'starting' || result.status === 'processing') {
      if (attempts >= maxAttempts) {
        return res.status(408).json({ 
          error: 'Image generation timed out. Please try again.' 
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error('Failed to check prediction status');
      }
      
      result = await statusResponse.json();
      attempts++;
    }

    if (result.status === 'failed') {
      return res.status(500).json({ 
        error: 'Image generation failed',
        details: result.error || 'Unknown error occurred'
      });
    }

    if (result.status !== 'succeeded' || !result.output) {
      return res.status(500).json({ 
        error: 'Unexpected status from image generation service' 
      });
    }

    // Return the generated image URL
    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    
    return res.status(200).json({
      imageUrl: imageUrl,
      success: true,
      predictionId: result.id
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during image generation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

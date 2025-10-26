<template>
  <div id="app">
    <header class="header">
      <h1>🎨 Alternative Past</h1>
      <p>Transform your images with AI-powered audio descriptions</p>
    </header>

    <main class="main">
      <div class="upload-section">
        <!-- Image Upload -->
        <div class="upload-card">
          <h3>📸 Upload Image</h3>
          <div class="upload-area" @click="triggerImageUpload" @dragover.prevent @drop.prevent="handleImageDrop">
            <input 
              ref="imageInput" 
              type="file" 
              accept="image/*" 
              @change="handleImageUpload" 
              style="display: none"
            />
            <div v-if="!selectedImage" class="upload-placeholder">
              <p>Click or drag to upload an image</p>
            </div>
            <div v-else class="image-preview">
              <img :src="selectedImage" alt="Selected image" />
              <button @click.stop="clearImage" class="clear-btn">✕</button>
            </div>
          </div>
        </div>

        <!-- Audio Upload/Record -->
        <div class="upload-card">
          <h3>🎵 Audio Input</h3>
          <div class="audio-controls">
            <button 
              @click="toggleRecording" 
              :class="['record-btn', { recording: isRecording }]"
              :disabled="isProcessing"
            >
              {{ isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording' }}
            </button>
            <span class="divider">or</span>
            <div class="upload-area" @click="triggerAudioUpload" @dragover.prevent @drop.prevent="handleAudioDrop">
              <input 
                ref="audioInput" 
                type="file" 
                accept="audio/*" 
                @change="handleAudioUpload" 
                style="display: none"
              />
              <div v-if="!selectedAudio" class="upload-placeholder">
                <p>Click or drag to upload audio</p>
              </div>
              <div v-else class="audio-preview">
                <p>📁 {{ selectedAudio.name }}</p>
                <button @click.stop="clearAudio" class="clear-btn">✕</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Process Button -->
      <div class="process-section">
        <button 
          @click="processImage" 
          :disabled="!canProcess || isProcessing"
          class="process-btn"
        >
          {{ isProcessing ? 'Processing...' : '🚀 Generate Alternative Past' }}
        </button>
      </div>

      <!-- Progress Indicators -->
      <div v-if="isProcessing" class="progress-section">
        <div class="progress-step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <div class="step-icon">🎤</div>
          <div class="step-content">
            <h4>Transcribing Audio</h4>
            <p>Converting your audio to text...</p>
          </div>
        </div>
        
        <div class="progress-step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <div class="step-icon">🧠</div>
          <div class="step-content">
            <h4>Analyzing Content</h4>
            <p>AI is understanding your image and audio...</p>
          </div>
        </div>
        
        <div class="progress-step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
          <div class="step-icon">🎨</div>
          <div class="step-content">
            <h4>Generating Image</h4>
            <p>Creating your alternative past...</p>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-if="resultImage" class="results-section">
        <h3>✨ Your Alternative Past</h3>
        <div class="result-container">
          <div class="original-image">
            <h4>Original</h4>
            <img :src="selectedImage" alt="Original image" />
          </div>
          <div class="arrow">→</div>
          <div class="generated-image">
            <h4>Generated</h4>
            <img :src="resultImage" alt="Generated image" />
          </div>
        </div>
        <button @click="resetApp" class="reset-btn">🔄 Try Another</button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="error-section">
        <h3>❌ Error</h3>
        <p>{{ error }}</p>
        <button @click="error = null" class="dismiss-btn">Dismiss</button>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'App',
  setup() {
    // Reactive state
    const selectedImage = ref(null)
    const selectedAudio = ref(null)
    const isRecording = ref(false)
    const isProcessing = ref(false)
    const currentStep = ref(0)
    const resultImage = ref(null)
    const error = ref(null)
    const mediaRecorder = ref(null)
    const audioChunks = ref([])

    // Template refs
    const imageInput = ref(null)
    const audioInput = ref(null)

    // Computed properties
    const canProcess = computed(() => {
      return selectedImage.value && (selectedAudio.value || audioChunks.value.length > 0)
    })

    // Image handling
    const triggerImageUpload = () => {
      imageInput.value?.click()
    }

    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          selectedImage.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const handleImageDrop = (event) => {
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          selectedImage.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const clearImage = () => {
      selectedImage.value = null
      if (imageInput.value) {
        imageInput.value.value = ''
      }
    }

    // Audio handling
    const triggerAudioUpload = () => {
      audioInput.value?.click()
    }

    const handleAudioUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        selectedAudio.value = file
      }
    }

    const handleAudioDrop = (event) => {
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('audio/')) {
        selectedAudio.value = file
      }
    }

    const clearAudio = () => {
      selectedAudio.value = null
      if (audioInput.value) {
        audioInput.value.value = ''
      }
    }

    // Recording functionality
    const toggleRecording = async () => {
      if (isRecording.value) {
        stopRecording()
      } else {
        startRecording()
      }
    }

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorder.value = new MediaRecorder(stream)
        audioChunks.value = []

        mediaRecorder.value.ondataavailable = (event) => {
          audioChunks.value.push(event.data)
        }

        mediaRecorder.value.onstop = () => {
          const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' })
          selectedAudio.value = new File([audioBlob], 'recording.wav', { type: 'audio/wav' })
          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.value.start()
        isRecording.value = true
      } catch (err) {
        error.value = 'Could not access microphone. Please check permissions.'
      }
    }

    const stopRecording = () => {
      if (mediaRecorder.value) {
        mediaRecorder.value.stop()
        isRecording.value = false
      }
    }

    // Main processing function
    const processImage = async () => {
      if (!canProcess.value) return

      isProcessing.value = true
      currentStep.value = 0
      error.value = null
      resultImage.value = null

      try {
        // Step 1: Transcribe audio
        currentStep.value = 1
        const transcription = await transcribeAudio()
        
        // Step 2: Analyze image and transcription
        currentStep.value = 2
        const analysis = await analyzeContent(transcription)
        
        // Step 3: Generate new image
        currentStep.value = 3
        const generatedImageUrl = await generateImage(analysis)
        
        resultImage.value = generatedImageUrl
        currentStep.value = 4
      } catch (err) {
        error.value = err.message || 'An error occurred during processing'
      } finally {
        isProcessing.value = false
      }
    }

    // API calls
    const transcribeAudio = async () => {
      const formData = new FormData()
      formData.append('audio', selectedAudio.value)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const data = await response.json()
      return data.text
    }

    const analyzeContent = async (transcription) => {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: selectedImage.value,
          transcription: transcription
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      return await response.json()
    }

    const generateImage = async (analysis) => {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          originalImage: selectedImage.value,
          prompt: analysis.prompt
        })
      })

      if (!response.ok) {
        throw new Error('Image generation failed')
      }

      const data = await response.json()
      return data.imageUrl
    }

    // Reset function
    const resetApp = () => {
      selectedImage.value = null
      selectedAudio.value = null
      resultImage.value = null
      error.value = null
      currentStep.value = 0
      audioChunks.value = []
    }

    return {
      // State
      selectedImage,
      selectedAudio,
      isRecording,
      isProcessing,
      currentStep,
      resultImage,
      error,
      
      // Refs
      imageInput,
      audioInput,
      
      // Computed
      canProcess,
      
      // Methods
      triggerImageUpload,
      handleImageUpload,
      handleImageDrop,
      clearImage,
      triggerAudioUpload,
      handleAudioUpload,
      handleAudioDrop,
      clearAudio,
      toggleRecording,
      processImage,
      resetApp
    }
  }
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  text-align: center;
  padding: 2rem 1rem;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

.upload-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.upload-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.upload-card h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #667eea;
  background-color: #f8f9ff;
}

.upload-placeholder p {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.image-preview {
  position: relative;
  width: 100%;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
}

.clear-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.record-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.record-btn:hover:not(:disabled) {
  background: #ff5252;
  transform: translateY(-2px);
}

.record-btn.recording {
  background: #4caf50;
  animation: pulse 1.5s infinite;
}

.record-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.divider {
  text-align: center;
  color: #666;
  font-weight: bold;
}

.audio-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
}

.audio-preview p {
  margin: 0;
  color: #333;
}

.process-section {
  text-align: center;
  margin: 2rem 0;
}

.process-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.process-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.process-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.progress-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.progress-step:last-child {
  border-bottom: none;
}

.progress-step.active {
  opacity: 1;
  color: #667eea;
}

.progress-step.completed {
  opacity: 1;
  color: #4caf50;
}

.step-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.step-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.step-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.results-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
}

.results-section h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.result-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.original-image,
.generated-image {
  text-align: center;
}

.original-image h4,
.generated-image h4 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.original-image img,
.generated-image img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.arrow {
  font-size: 1.5rem;
  color: #667eea;
  font-weight: bold;
}

.reset-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.error-section {
  background: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
}

.error-section h3 {
  margin: 0 0 0.5rem 0;
  color: #c62828;
}

.error-section p {
  margin: 0 0 1rem 0;
  color: #d32f2f;
}

.dismiss-btn {
  background: #c62828;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.dismiss-btn:hover {
  background: #b71c1c;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }
  
  .result-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .arrow {
    transform: rotate(90deg);
  }
  
  .upload-section {
    grid-template-columns: 1fr;
  }
}
</style>

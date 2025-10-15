
interface PhonemeMapping {
  [phoneme: string]: string
}

interface LipsyncFrame {
  time: number
  mouthShape: string
  intensity: number
}

export class LipsyncEngine {
  
  // Basic phoneme to viseme mapping for Portuguese
  private phonemeMap: PhonemeMapping = {
    'A': 'A',
    'E': 'E', 
    'I': 'I',
    'O': 'O',
    'U': 'U',
    'M': 'M',
    'B': 'M',
    'P': 'M',
    'F': 'F',
    'V': 'F',
    'T': 'T',
    'D': 'T',
    'S': 'S',
    'Z': 'S',
    'L': 'L',
    'R': 'R',
    'N': 'T'
  }

  async generateLipsyncFromAudio(
    audioBuffer: Buffer, 
    duration: number,
    text: string
  ): Promise<LipsyncFrame[]> {
    console.log(`Generating lipsync for ${duration}s audio...`)
    
    // For MVP, use text-based phoneme estimation
    // In production, would use actual audio analysis
    const frames = this.generateFramesFromText(text, duration)
    
    console.log(`✅ Generated ${frames.length} lipsync frames`)
    return frames
  }

  private generateFramesFromText(text: string, duration: number): LipsyncFrame[] {
    const frames: LipsyncFrame[] = []
    const fps = 30
    const totalFrames = Math.floor(duration * fps)
    
    // Clean text and split into phonemes approximation
    const cleanText = text.toLowerCase().replace(/[^a-záàâãéèêíïóôõöúçñ\s]/g, '')
    const characters = cleanText.split('')
    
    for (let frame = 0; frame < totalFrames; frame++) {
      const time = frame / fps
      const progress = time / duration
      
      // Map time to character in text
      const charIndex = Math.floor(progress * characters.length)
      const char = characters[charIndex] || 'A'
      
      // Get mouth shape for character
      const mouthShape = this.getVisemeForCharacter(char.toUpperCase())
      
      // Calculate intensity (mouth opening)
      const intensity = this.calculateIntensity(time, char)
      
      frames.push({
        time,
        mouthShape,
        intensity
      })
    }
    
    return frames
  }

  private getVisemeForCharacter(char: string): string {
    // Map character to mouth shape
    if (this.phonemeMap[char]) {
      return this.phonemeMap[char]
    }
    
    // Vowel/consonant fallbacks
    if ('AEIOU'.includes(char)) {
      return char
    }
    
    return 'A' // Default neutral position
  }

  private calculateIntensity(time: number, char: string): number {
    // More intensity for vowels, less for consonants
    const baseIntensity = 'AEIOU'.includes(char.toUpperCase()) ? 0.8 : 0.4
    
    // Add natural variation
    const variation = Math.sin(time * 12) * 0.2
    
    // Add random micro-movements
    const microMovement = (Math.random() - 0.5) * 0.1
    
    return Math.max(0, Math.min(1, baseIntensity + variation + microMovement))
  }

  // Add natural movements (blinking, head movement)
  generateNaturalMovements(duration: number): {
    eyeBlinks: Array<{ time: number; duration: number }>
    headMovements: Array<{ time: number; rotation: { x: number; y: number; z: number } }>
  } {
    const eyeBlinks = []
    const headMovements = []
    
    // Generate eye blinks every 2-4 seconds
    let blinkTime = 2
    while (blinkTime < duration) {
      eyeBlinks.push({
        time: blinkTime,
        duration: 0.15 // 150ms blink
      })
      blinkTime += 2 + Math.random() * 2 // 2-4 seconds between blinks
    }
    
    // Generate subtle head movements every 3-6 seconds
    let headTime = 3
    while (headTime < duration) {
      headMovements.push({
        time: headTime,
        rotation: {
          x: (Math.random() - 0.5) * 10, // ±5 degrees
          y: (Math.random() - 0.5) * 15, // ±7.5 degrees  
          z: (Math.random() - 0.5) * 8   // ±4 degrees
        }
      })
      headTime += 3 + Math.random() * 3 // 3-6 seconds between movements
    }
    
    return { eyeBlinks, headMovements }
  }

  // Optimize lipsync for performance
  optimizeLipsyncData(frames: LipsyncFrame[]): LipsyncFrame[] {
    // Remove redundant frames (same mouth shape)
    const optimized: LipsyncFrame[] = []
    let lastShape = ''
    
    for (const frame of frames) {
      if (frame.mouthShape !== lastShape) {
        optimized.push(frame)
        lastShape = frame.mouthShape
      }
    }
    
    console.log(`Optimized lipsync: ${frames.length} → ${optimized.length} frames`)
    return optimized
  }

  // Validate lipsync timing
  validateSync(lipsyncFrames: LipsyncFrame[], audioDuration: number): boolean {
    if (lipsyncFrames.length === 0) return false
    
    const lastFrame = lipsyncFrames[lipsyncFrames.length - 1]
    const maxAllowedDrift = 0.1 // 100ms tolerance
    
    return Math.abs(lastFrame.time - audioDuration) <= maxAllowedDrift
  }
}

// Singleton instance
export const lipsyncEngine = new LipsyncEngine()

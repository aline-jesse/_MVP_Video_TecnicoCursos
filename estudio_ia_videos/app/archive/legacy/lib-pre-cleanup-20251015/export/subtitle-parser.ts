/**
 * 📝 Subtitle Parser
 * Parse and convert subtitle files (SRT, VTT, ASS)
 */

import {
  SubtitleFile,
  SubtitleCue,
  SubtitleFormat,
  SubtitleTimeUtils,
  DEFAULT_SUBTITLE_STYLE,
} from '@/types/subtitle.types'

export class SubtitleParser {
  /**
   * Parse subtitle file from string content
   */
  static parse(content: string, format: SubtitleFormat): SubtitleFile {
    switch (format) {
      case SubtitleFormat.SRT:
        return this.parseSRT(content)
      case SubtitleFormat.VTT:
        return this.parseVTT(content)
      case SubtitleFormat.ASS:
        return this.parseASS(content)
      default:
        throw new Error(`Unsupported subtitle format: ${format}`)
    }
  }

  /**
   * Parse SRT (SubRip) format
   */
  private static parseSRT(content: string): SubtitleFile {
    const cues: SubtitleCue[] = []
    const blocks = content.trim().split(/\n\s*\n/)

    for (const block of blocks) {
      const lines = block.trim().split('\n')
      if (lines.length < 3) continue

      const index = parseInt(lines[0])
      const [startStr, endStr] = lines[1].split(' --> ')
      const text = lines.slice(2).join('\n')

      cues.push({
        index,
        startTime: SubtitleTimeUtils.srtToSeconds(startStr.trim()),
        endTime: SubtitleTimeUtils.srtToSeconds(endStr.trim()),
        text: text.trim(),
      })
    }

    return {
      format: SubtitleFormat.SRT,
      cues,
    }
  }

  /**
   * Parse VTT (WebVTT) format
   */
  private static parseVTT(content: string): SubtitleFile {
    const cues: SubtitleCue[] = []
    const lines = content.split('\n')

    let index = 0
    let inCue = false
    let currentCue: Partial<SubtitleCue> = {}

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Skip WEBVTT header
      if (line.startsWith('WEBVTT')) continue

      // Skip empty lines
      if (!line) {
        if (inCue && currentCue.text) {
          cues.push(currentCue as SubtitleCue)
          currentCue = {}
          inCue = false
        }
        continue
      }

      // Timing line
      if (line.includes('-->')) {
        const [startStr, endStr] = line.split('-->').map((s) => s.trim())
        currentCue = {
          index: ++index,
          startTime: SubtitleTimeUtils.vttToSeconds(startStr),
          endTime: SubtitleTimeUtils.vttToSeconds(endStr),
          text: '',
        }
        inCue = true
      }
      // Text line
      else if (inCue) {
        currentCue.text = currentCue.text ? `${currentCue.text}\n${line}` : line
      }
    }

    // Add last cue if exists
    if (inCue && currentCue.text) {
      cues.push(currentCue as SubtitleCue)
    }

    return {
      format: SubtitleFormat.VTT,
      cues,
    }
  }

  /**
   * Parse ASS (Advanced SubStation Alpha) format
   */
  private static parseASS(content: string): SubtitleFile {
    const cues: SubtitleCue[] = []
    const lines = content.split('\n')

    let inEvents = false
    let formatFields: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed.startsWith('[Events]')) {
        inEvents = true
        continue
      }

      if (!inEvents) continue

      if (trimmed.startsWith('Format:')) {
        formatFields = trimmed
          .substring(7)
          .split(',')
          .map((s) => s.trim())
        continue
      }

      if (trimmed.startsWith('Dialogue:')) {
        const values = trimmed.substring(9).split(',')
        const cue = this.parseASSDialogue(formatFields, values, cues.length + 1)
        if (cue) cues.push(cue)
      }
    }

    return {
      format: SubtitleFormat.ASS,
      cues,
      defaultStyle: DEFAULT_SUBTITLE_STYLE,
    }
  }

  /**
   * Parse single ASS dialogue line
   */
  private static parseASSDialogue(
    formatFields: string[],
    values: string[],
    index: number
  ): SubtitleCue | null {
    const fieldMap: Record<string, string> = {}

    formatFields.forEach((field, i) => {
      fieldMap[field] = values[i]?.trim() || ''
    })

    if (!fieldMap['Start'] || !fieldMap['End'] || !fieldMap['Text']) {
      return null
    }

    return {
      index,
      startTime: this.assTimeToSeconds(fieldMap['Start']),
      endTime: this.assTimeToSeconds(fieldMap['End']),
      text: this.cleanASSText(fieldMap['Text']),
      speaker: fieldMap['Name'] || undefined,
    }
  }

  /**
   * Convert ASS timestamp to seconds
   */
  private static assTimeToSeconds(timestamp: string): number {
    // Format: H:MM:SS.cc (centiseconds)
    const [time, centiseconds] = timestamp.split('.')
    const [hours, minutes, seconds] = time.split(':').map(Number)
    return hours * 3600 + minutes * 60 + seconds + Number(centiseconds) / 100
  }

  /**
   * Clean ASS text (remove formatting tags)
   */
  private static cleanASSText(text: string): string {
    return text
      .replace(/\{[^}]*\}/g, '') // Remove override blocks
      .replace(/\\N/g, '\n') // Replace \N with newline
      .trim()
  }

  /**
   * Convert subtitle file to different format
   */
  static convert(file: SubtitleFile, targetFormat: SubtitleFormat): string {
    switch (targetFormat) {
      case SubtitleFormat.SRT:
        return this.toSRT(file)
      case SubtitleFormat.VTT:
        return this.toVTT(file)
      case SubtitleFormat.ASS:
        return this.toASS(file)
      default:
        throw new Error(`Unsupported target format: ${targetFormat}`)
    }
  }

  /**
   * Convert to SRT format
   */
  private static toSRT(file: SubtitleFile): string {
    return file.cues
      .map((cue) => {
        const start = SubtitleTimeUtils.secondsToSRT(cue.startTime)
        const end = SubtitleTimeUtils.secondsToSRT(cue.endTime)
        return `${cue.index}\n${start} --> ${end}\n${cue.text}\n`
      })
      .join('\n')
  }

  /**
   * Convert to VTT format
   */
  private static toVTT(file: SubtitleFile): string {
    const header = 'WEBVTT\n\n'
    const cues = file.cues
      .map((cue) => {
        const start = SubtitleTimeUtils.secondsToVTT(cue.startTime)
        const end = SubtitleTimeUtils.secondsToVTT(cue.endTime)
        return `${start} --> ${end}\n${cue.text}\n`
      })
      .join('\n')

    return header + cues
  }

  /**
   * Convert to ASS format
   */
  private static toASS(file: SubtitleFile): string {
    const header = `[Script Info]
Title: Converted Subtitle
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,24,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2,2,2,10,10,20,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`

    const dialogues = file.cues
      .map((cue) => {
        const start = this.secondsToASSTime(cue.startTime)
        const end = this.secondsToASSTime(cue.endTime)
        const text = cue.text.replace(/\n/g, '\\N')
        const speaker = cue.speaker || ''
        return `Dialogue: 0,${start},${end},Default,${speaker},0,0,0,,${text}`
      })
      .join('\n')

    return header + dialogues
  }

  /**
   * Convert seconds to ASS timestamp
   */
  private static secondsToASSTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const centisecs = Math.floor((seconds % 1) * 100)

    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`
  }

  /**
   * Auto-detect subtitle format from content
   */
  static detectFormat(content: string): SubtitleFormat {
    const trimmed = content.trim()

    if (trimmed.startsWith('WEBVTT')) {
      return SubtitleFormat.VTT
    }

    if (trimmed.includes('[Script Info]') || trimmed.includes('[V4+ Styles]')) {
      return SubtitleFormat.ASS
    }

    // Default to SRT
    return SubtitleFormat.SRT
  }

  /**
   * Generate subtitles from text with timestamps
   */
  static generate(
    text: string,
    wordsPerMinute: number = 150,
    maxCharsPerCue: number = 80
  ): SubtitleFile {
    const words = text.split(/\s+/)
    const cues: SubtitleCue[] = []
    
    let currentCue = ''
    let currentTime = 0
    let index = 1
    const secondsPerWord = 60 / wordsPerMinute

    for (const word of words) {
      if ((currentCue + ' ' + word).length > maxCharsPerCue) {
        // Save current cue
        if (currentCue) {
          const duration = currentCue.split(/\s+/).length * secondsPerWord
          cues.push({
            index: index++,
            startTime: currentTime,
            endTime: currentTime + duration,
            text: currentCue.trim(),
          })
          currentTime += duration
          currentCue = ''
        }
      }

      currentCue += (currentCue ? ' ' : '') + word
    }

    // Add last cue
    if (currentCue) {
      const duration = currentCue.split(/\s+/).length * secondsPerWord
      cues.push({
        index: index++,
        startTime: currentTime,
        endTime: currentTime + duration,
        text: currentCue.trim(),
      })
    }

    return {
      format: SubtitleFormat.SRT,
      cues,
    }
  }
}

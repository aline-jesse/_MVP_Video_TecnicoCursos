import JSZip from 'jszip'

export type ParsedSlide = {
  index: number
  title: string
  textContent: string
  notes: string | null
}

const SLIDE_PREFIX = 'ppt/slides/slide'
const NOTES_PREFIX = 'ppt/notesSlides/notesSlide'

const xmlEntityMap: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
}

function decodeXmlEntities(value: string): string {
  return value.replace(/&(amp|lt|gt|quot|#39|apos);/g, (match) => xmlEntityMap[match] ?? match)
}

function extractTextBlocks(xml: string): string[] {
  const matches = xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)
  const blocks: string[] = []

  for (const match of matches) {
    const raw = match[1] ?? ''
    const trimmed = decodeXmlEntities(raw).trim()
    if (trimmed.length > 0) {
      blocks.push(trimmed)
    }
  }

  return blocks
}

function getSlideIndexFromPath(path: string): number {
  const match = path.match(/slide(\d+)\.xml$/)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

export async function parsePptxSlides(buffer: ArrayBuffer): Promise<ParsedSlide[]> {
  const zip = await JSZip.loadAsync(buffer)
  const slideEntries = Object.keys(zip.files)
    .filter((name) => name.startsWith(SLIDE_PREFIX) && name.endsWith('.xml'))
    .sort((a, b) => getSlideIndexFromPath(a) - getSlideIndexFromPath(b))

  const parsedSlides: ParsedSlide[] = []

  for (const slidePath of slideEntries) {
    const slideIndex = getSlideIndexFromPath(slidePath)
    const slideXml = await zip.files[slidePath].async('string')
    const blocks = extractTextBlocks(slideXml)
    const textContent = blocks.join('\n')
    const title = blocks[0] ?? `Slide ${slideIndex}`

    let notes: string | null = null
    const notesPath = `${NOTES_PREFIX}${slideIndex}.xml`
    if (zip.files[notesPath]) {
      const notesXml = await zip.files[notesPath].async('string')
      const notesBlocks = extractTextBlocks(notesXml)
      if (notesBlocks.length > 0) {
        notes = notesBlocks.join('\n')
      }
    }

    parsedSlides.push({
      index: slideIndex,
      title,
      textContent,
      notes,
    })
  }

  return parsedSlides
}

import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  type ParagraphChild
} from 'docx'

type TextStyle = { bold?: boolean; italics?: boolean; underline?: {}; font?: string }

function inlineChildren(node: Node, style: TextStyle = {}): ParagraphChild[] {
  if (node.nodeType === Node.TEXT_NODE) return [new TextRun({ text: node.textContent ?? '', ...style })]
  if (!(node instanceof HTMLElement)) return []

  const tag = node.tagName.toLowerCase()
  if (tag === 'br') return [new TextRun({ break: 1 })]
  if (node instanceof HTMLImageElement) {
    const source = node.currentSrc || node.src
    return source ? [new TextRun({ text: `Imagem: ${source}`, italics: true })] : []
  }
  if (node instanceof HTMLIFrameElement) {
    const source = node.getAttribute('src') ?? ''
    return source ? [new TextRun({ text: `Vídeo: ${source}`, italics: true })] : []
  }

  const nextStyle: TextStyle = { ...style }
  if (tag === 'strong' || tag === 'b') nextStyle.bold = true
  if (tag === 'em' || tag === 'i') nextStyle.italics = true
  if (tag === 'u') nextStyle.underline = {}
  if (tag === 'code') nextStyle.font = 'Courier New'

  const children = [...node.childNodes].flatMap(child => inlineChildren(child, nextStyle))
  if (tag === 'a' && node.getAttribute('href')) {
    return [new ExternalHyperlink({ children, link: new URL(node.getAttribute('href')!, window.location.href).toString() })]
  }
  return children
}

function paragraphFrom(element: HTMLElement, options: { heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel]; bullet?: boolean; prefix?: string } = {}) {
  const children = inlineChildren(element)
  if (options.prefix) children.unshift(new TextRun({ text: options.prefix }))
  return new Paragraph({
    children,
    heading: options.heading,
    bullet: options.bullet ? { level: 0 } : undefined,
    spacing: { after: options.heading ? 160 : 120 }
  })
}

function contentParagraphs(root: HTMLElement) {
  const paragraphs: Paragraph[] = []
  const headingLevels = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6]

  for (const node of root.children) {
    const element = node as HTMLElement
    const tag = element.tagName.toLowerCase()
    if (/^h[1-6]$/.test(tag)) paragraphs.push(paragraphFrom(element, { heading: headingLevels[Number(tag[1]) - 1] }))
    else if (tag === 'p' || tag === 'blockquote' || tag === 'pre') paragraphs.push(paragraphFrom(element))
    else if (tag === 'ul' || tag === 'ol') {
      ;[...element.children].forEach((item, index) => paragraphs.push(paragraphFrom(item as HTMLElement, tag === 'ul' ? { bullet: true } : { prefix: `${index + 1}. ` })))
    } else if (tag === 'table') {
      element.querySelectorAll('tr').forEach(row => paragraphs.push(new Paragraph({ children: [new TextRun([...row.querySelectorAll('th, td')].map(cell => cell.textContent?.trim()).join('   |   '))], spacing: { after: 100 } })))
    } else if (tag === 'img' || tag === 'iframe') paragraphs.push(paragraphFrom(element))
    else if (element.textContent?.trim()) paragraphs.push(paragraphFrom(element))
  }
  return paragraphs
}

export async function exportArticleDocx(title: string, summary: string | null | undefined, root: HTMLElement, filename: string) {
  const children: Paragraph[] = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE, spacing: { after: 220 } })
  ]
  if (summary) children.push(new Paragraph({ children: [new TextRun({ text: summary, italics: true, color: '666666' })], spacing: { after: 280 } }))
  children.push(...contentParagraphs(root))

  const document = new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 }, paragraph: { spacing: { line: 300 } } } },
      paragraphStyles: [{ id: 'Title', name: 'Title', basedOn: 'Normal', next: 'Normal', run: { bold: true, color: '000000', size: 40 }, paragraph: { alignment: AlignmentType.LEFT, spacing: { after: 220 } } }]
    },
    sections: [{ properties: {}, children }]
  })
  const blob = await Packer.toBlob(document)
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = `${filename}.docx`
  link.click()
  URL.revokeObjectURL(url)
}

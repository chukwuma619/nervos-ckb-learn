import fs from 'fs'
import path from 'path'

export type LessonMetadata = {
  title: string
  orderIndex?: string
  description: string
  publishedAt?: string
  summary?: string
  image?: string
}

function parseFrontmatter(fileContent: string) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  const match = frontmatterRegex.exec(fileContent)
  const content = match
    ? fileContent.replace(frontmatterRegex, '').trim()
    : fileContent.trim()
  const frontMatterBlock = match?.[1] ?? ''
  const frontMatterLines = frontMatterBlock.trim().split('\n').filter(Boolean)
  const metadata: Partial<LessonMetadata> = {}

  frontMatterLines.forEach((line) => {
    const [key, ...valueArr] = line.split(': ')
    let value = valueArr.join(': ').trim()
    value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
    metadata[key.trim() as keyof LessonMetadata] = value
  })

  return { metadata: metadata as LessonMetadata, content }
}

function getMDXFiles(dir: string): string[] {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx')
}

function readMDXFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter(rawContent)
}

function getMDXData(dir: string) {
  const mdxFiles = getMDXFiles(dir)
  return mdxFiles.map((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file))
    const slug = path.basename(file, path.extname(file))

    return {
      metadata,
      slug,
      content,
    }
  })
}

const LESSON_CONTENTS_DIR = path.join(process.cwd(), 'app', 'lesson', 'contents')

export type LessonPost = {
  metadata: LessonMetadata
  slug: string
  content: string
}

export function getLessons(): LessonPost[] {
  return getMDXData(LESSON_CONTENTS_DIR)
}

/** @deprecated Use getLessons() instead. Kept for compatibility. */
export function getBloglessons(): LessonPost[] {
  return getLessons()
}

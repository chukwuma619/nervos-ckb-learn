import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CustomMDX } from '@/components/mdx'
import { getLessons } from '@/lib/lessons'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export async function generateStaticParams() {
  return getLessons().map((lesson) => ({ slug: lesson.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const lesson = getLessons().find((l) => l.slug === slug)
  if (!lesson) return { title: 'Lesson not found' }
  return {
    title: lesson.metadata.title,
    description: lesson.metadata.description,
  }
}

export default async function Lesson({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const lessons = getLessons().sort((a, b) => {
    const orderA = parseInt(a.metadata.orderIndex ?? '0', 10)
    const orderB = parseInt(b.metadata.orderIndex ?? '0', 10)
    return orderA - orderB
  })
  const currentIndex = lessons.findIndex((l) => l.slug === slug)
  const lesson = lessons[currentIndex]

  if (!lesson) {
    notFound()
  }

  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex >= 0 && currentIndex < lessons.length - 1
      ? lessons[currentIndex + 1]
      : null

  return (

    <>
      <div className="px-4 md:px-6 min-h-svh">
        <div className="flex-1 max-w-5xl">
          <CustomMDX mode="static">
            {lesson.content ?? ""}
          </CustomMDX>
        </div>
      </div>
      
      <nav
        className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-6 sm:pt-8 mt-6 sm:mt-8 px-4 md:px-6 border-t border-border"
        aria-label="Lesson navigation"
      >
        {previousLesson ? (
          <Link
            href={`/lesson/${previousLesson.slug}`}
            className="inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg border border-input bg-background px-4 py-3 sm:py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors min-w-0"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-none">
              Previous: {previousLesson.metadata.title}
            </span>
          </Link>
        ) : (
          <span className="sm:min-w-[120px]" />
        )}
        {nextLesson ? (
          <Link
            href={`/lesson/${nextLesson.slug}`}
            className="inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg border border-input bg-background px-4 py-3 sm:py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors sm:ml-auto min-w-0"
          >
            <span className="truncate max-w-[200px] sm:max-w-none">
              Next: {nextLesson.metadata.title}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </Link>
        ) : (
          <span className="sm:min-w-[120px]" />
        )}
      </nav>
    </>
  )
} 
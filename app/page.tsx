import Link from 'next/link'
import { getLessons } from '@/lib/lessons'

export default function HomePage() {
  const lessons = getLessons().sort((a, b) => {
    const orderA = parseInt(a.metadata.orderIndex ?? '0', 10)
    const orderB = parseInt(b.metadata.orderIndex ?? '0', 10)
    return orderA - orderB
  })

  return (
    <div className="min-h-svh px-4 md:px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">
          Nervos CKB Lessons
        </h1>
        <p className="mt-2 text-muted-foreground">
          Learn blockchain fundamentals and CKB concepts step by step.
        </p>
        <ul className="mt-10 space-y-6">
          {lessons.map((lesson) => (
            <li key={lesson.slug}>
              <Link
                href={`/lesson/${lesson.slug}`}
                className="block rounded-lg border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <h2 className="font-semibold">{lesson.metadata.title}</h2>
                {lesson.metadata.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {lesson.metadata.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

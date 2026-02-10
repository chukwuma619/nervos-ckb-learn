import { cn } from "@/lib/utils";
import { getLessons } from "@/lib/lessons";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function LessonLayout({ children, params }: { children: React.ReactNode, params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lessons = getLessons();

  if (!lessons) {
    return <div>No lessons found</div>;
  }

  lessons.sort((a, b) => {
    const orderA = parseInt(a.metadata.orderIndex ?? '0', 10)
    const orderB = parseInt(b.metadata.orderIndex ?? '0', 10)
    return orderA - orderB
  })
  return (
    <div className="flex min-h-0 flex-1">
      <aside className="w-64 shrink-0 overflow-y-auto  inset-y-0 fixed border-r bg-muted/40 p-4">
        <Link
          href="/"
          className="mb-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back
        </Link>
        <h2 className="mb-2 px-2 text-lg font-semibold">Lessons</h2>
        <nav className="flex flex-col gap-1">
          {lessons.map((lesson) => (
            <Link
              key={lesson.slug}
              href={`/lesson/${lesson.slug}`}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors",
                lesson.slug === slug
                  ? "bg-primary font-medium text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {lesson.metadata.title}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="relative min-w-0 ml-64 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
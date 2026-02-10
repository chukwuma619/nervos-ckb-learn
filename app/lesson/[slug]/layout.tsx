import { getLessons } from "@/lib/lessons";
import { LessonSidebarLayout } from "./lesson-sidebar-layout";

export default async function LessonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lessons = getLessons();

  if (!lessons?.length) {
    return <div>No lessons found</div>;
  }

  const sortedLessons = [...lessons].sort((a, b) => {
    const orderA = parseInt(a.metadata.orderIndex ?? "0", 10);
    const orderB = parseInt(b.metadata.orderIndex ?? "0", 10);
    return orderA - orderB;
  });

  return (
    <LessonSidebarLayout lessons={sortedLessons} slug={slug}>
      {children}
    </LessonSidebarLayout>
  );
}
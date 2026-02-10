"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { LessonPost } from "@/lib/lessons";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";



function LessonNav({
  lessons,
  currentSlug,
}: {
  lessons: LessonPost[];
  currentSlug: string;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <nav className="flex flex-col gap-1">
      <SidebarMenu>
        {lessons.map((lesson) => (
          <SidebarMenuItem key={lesson.slug}>
            <SidebarMenuButton asChild className="line-clamp-1" isActive={lesson.slug === currentSlug}>
              <Link
                href={`/lesson/${lesson.slug}`}
                onClick={() => setOpenMobile(false)}
              >
                {lesson.metadata.title}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}

export function LessonSidebarLayout({
  lessons,
  slug,
  children,
}: {
  lessons: LessonPost[];
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
       
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Lessons</SidebarGroupLabel>
            <SidebarGroupContent>
              <LessonNav lessons={lessons} currentSlug={slug} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:h-12 transition-[height] ease-linear">
          <SidebarTrigger className="-ml-1" aria-label="Open lessons menu" />
          <span className="text-sm font-medium text-muted-foreground">
            Lessons
          </span>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

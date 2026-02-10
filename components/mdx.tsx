"use client";

import Link from "next/link";
import Image from "next/image";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";
import { math } from "@streamdown/math";
import { cjk } from "@streamdown/cjk";
import React, { ComponentProps } from "react";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ai-elements/code-block";
import {
  Snippet,
  SnippetAddon,
  SnippetCopyButton,
  SnippetInput,
} from "@/components/ai-elements/snippet";
import {
  Terminal,
  TerminalHeader,
  TerminalTitle,
  TerminalActions,
  TerminalCopyButton,
  TerminalContent,
} from "@/components/ai-elements/terminal";
import {
  StackTrace,
  StackTraceHeader,
  StackTraceError,
  StackTraceErrorType,
  StackTraceErrorMessage,
  StackTraceActions,
  StackTraceCopyButton,
  StackTraceExpandButton,
  StackTraceContent,
  StackTraceFrames,
} from "@/components/ai-elements/stack-trace";
import {
  EnvironmentVariables,
  EnvironmentVariablesHeader,
  EnvironmentVariablesTitle,
  EnvironmentVariablesToggle,
  EnvironmentVariablesContent,
  EnvironmentVariable,
} from "@/components/ai-elements/environment-variables";
import type { BundledLanguage } from "shiki";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircleIcon,
  LightbulbIcon,
  AlertTriangleIcon,
  InfoIcon,
  ChevronDownIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href?: string | null;
  children?: React.ReactNode;
}

function CustomLink({ href, children, ...restProps }: LinkProps) {
  if (!href) return <a {...restProps}>{children}</a>;
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...restProps}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} {...restProps}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...restProps}>
      {children}
    </a>
  );
}

function RoundedImage(
  props: React.ImgHTMLAttributes<HTMLImageElement> & { node?: unknown }
) {
  const {
    alt = "",
    src,
    width,
    height,
    className = "rounded-lg",
    ...restProps
  } = props;
  const srcStr = src != null ? String(src) : "";
  if (!srcStr) return null;
  const w = width != null ? Number(width) : 800;
  const h = height != null ? Number(height) : 400;
  return (
    <Image
      alt={String(alt)}
      src={srcStr}
      width={w}
      height={h}
      className={className}
      unoptimized={width == null && height == null}
      {...restProps}
    />
  );
}

function getCodeText(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => (typeof child === "string" ? child : ""))
    .join("");
}

/** Recursively get plain text from React children (for blockquote callout parsing). */
function getTextContent(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node || !React.isValidElement(node)) return "";
  const el = node as React.ReactElement<{ children?: React.ReactNode }>;
  const children = el.props?.children;
  return React.Children.toArray(children).map(getTextContent).join("");
}

const CALLOUT_MATCH = /^\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]\s*/i;
type CalloutType = "note" | "tip" | "warning" | "caution" | "important";

const CALLOUT_CONFIG: Record<
  CalloutType,
  { title: string; Icon: LucideIcon; className: string }
> = {
  note: {
    title: "Note",
    Icon: InfoIcon,
    className: "border-primary/40 bg-primary/5",
  },
  tip: {
    title: "Tip",
    Icon: LightbulbIcon,
    className: "border-amber-500/40 bg-amber-500/5",
  },
  warning: {
    title: "Warning",
    Icon: AlertTriangleIcon,
    className: "border-amber-600/50 bg-amber-600/5",
  },
  caution: {
    title: "Caution",
    Icon: AlertCircleIcon,
    className: "border-destructive/40 bg-destructive/5",
  },
  important: {
    title: "Important",
    Icon: AlertCircleIcon,
    className: "border-primary/50 bg-primary/10",
  },
};

function BlockquoteCallout({
  children,
  ...props
}: React.BlockquoteHTMLAttributes<HTMLQuoteElement> & { node?: unknown }) {
  const fullText = getTextContent(children).trim();
  const match = fullText.match(CALLOUT_MATCH);
  if (!match) {
    return (
      <blockquote
        className={cn(
          "my-4 border-l-4 border-muted-foreground/30 bg-muted/30 pl-4 pr-4 py-3 rounded-r-md text-muted-foreground italic"
        )}
        {...props}
      >
        {children}
      </blockquote>
    );
  }
  const type = match[1].toLowerCase() as CalloutType;
  const config = CALLOUT_CONFIG[type];
  const bodyText = fullText.slice(match[0].length).trim();
  return (
    <Alert
      className={cn("my-4 rounded-lg border pl-4 pr-4 py-3", config.className)}
      role="note"
    >
      <config.Icon className="size-4 shrink-0 text-current opacity-80" />
      <AlertTitle className="mb-0 font-semibold">{config.title}</AlertTitle>
      <AlertDescription className="mb-0 whitespace-pre-wrap [&_a]:underline">
        {bodyText}
      </AlertDescription>
    </Alert>
  );
}

// Map common markdown code fence aliases to shiki BundledLanguage
const LANGUAGE_ALIASES: Record<string, BundledLanguage> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  yml: "yaml",
  md: "markdown",
  rb: "ruby",
  go: "go",
  rs: "rust",
  vue: "vue",
  svelte: "svelte",
};

function normalizeCodeBlockLanguage(lang: string): BundledLanguage {
  const lower = lang.toLowerCase();
  return (LANGUAGE_ALIASES[lower] ?? lower) as BundledLanguage;
}

function PreWithCodeBlock({
  children,
  ...props
}: React.HTMLAttributes<HTMLPreElement> & { node?: unknown }) {
  const childArray = React.Children.toArray(children);
  const child = childArray.length === 1 ? childArray[0] : null;
  if (!React.isValidElement(child)) {
    return <pre {...props}>{children}</pre>;
  }
  const childProps = child.props as { className?: string; children?: React.ReactNode };
  const className = childProps.className ?? "";
  const match = className.match(/language-(\w+)/);
  if (!match) {
    return <pre {...props}>{children}</pre>;
  }
  const rawLang = match[1].toLowerCase();
  const code = getCodeText(childProps.children).replace(/\n$/, "").trim();

  // Command/snippet: single-line or short copyable command (Snippet component)
  if (rawLang === "snippet" || rawLang === "command") {
    return (
      <div className="my-4">
        <Snippet code={code} className="rounded-lg border bg-muted/30">
          <SnippetInput className="min-h-9 text-sm" />
          <SnippetAddon align="inline-end">
            <SnippetCopyButton />
          </SnippetAddon>
        </Snippet>
      </div>
    );
  }

  // Terminal output: render in Terminal component (supports ANSI)
  if (rawLang === "terminal" || rawLang === "output") {
    return (
      <div className="my-4">
        <Terminal output={code} isStreaming={false} className="not-prose">
          <TerminalHeader>
            <TerminalTitle>Output</TerminalTitle>
            <TerminalActions>
              <TerminalCopyButton />
            </TerminalActions>
          </TerminalHeader>
          <TerminalContent />
        </Terminal>
      </div>
    );
  }

  // Stack trace / error: parsed collapsible trace with copy
  if (rawLang === "stack-trace" || rawLang === "error") {
    return (
      <div className="my-4 not-prose dark">
        <StackTrace trace={code} defaultOpen={false}>
          <StackTraceHeader>
            <StackTraceError>
              <StackTraceErrorType />
              <StackTraceErrorMessage />
            </StackTraceError>
            <StackTraceActions>
              <StackTraceCopyButton />
              <StackTraceExpandButton />
            </StackTraceActions>
          </StackTraceHeader>
          <StackTraceContent>
            <StackTraceFrames />
          </StackTraceContent>
        </StackTrace>
      </div>
    );
  }

  // Environment variables: KEY=value lines; show/hide values toggle
  if (rawLang === "env") {
    const pairs = code
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const eq = line.indexOf("=");
        if (eq < 0) return { name: line, value: "" };
        return {
          name: line.slice(0, eq).trim(),
          value: line.slice(eq + 1).trim().replace(/^["']|["']$/g, ""),
        };
      });
    return (
      <div className="my-4 not-prose">
        <EnvironmentVariables defaultShowValues={false}>
          <EnvironmentVariablesHeader>
            <EnvironmentVariablesTitle>Environment variables</EnvironmentVariablesTitle>
            <EnvironmentVariablesToggle />
          </EnvironmentVariablesHeader>
          <EnvironmentVariablesContent>
            {pairs.map(({ name, value }) => (
              <EnvironmentVariable key={name} name={name} value={value} />
            ))}
          </EnvironmentVariablesContent>
        </EnvironmentVariables>
      </div>
    );
  }

  const language = normalizeCodeBlockLanguage(rawLang);
  return (
    <div className="my-4 dark">  
    <CodeBlock code={code} language={language} showLineNumbers>
      <CodeBlockHeader>
        <CodeBlockTitle>
          <CodeBlockFilename>{rawLang}</CodeBlockFilename>
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton />
        </CodeBlockActions>
      </CodeBlockHeader>
    </CodeBlock>
    </div>
  );
}

function Code({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"code">) {
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

function slugify(str: string | number) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const Heading = ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = getCodeText(children);
    const slug = slugify(text || "");
    return React.createElement(
      Tag,
      { id: slug, ...props },
      [
        React.createElement("a", {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: "anchor",
        }),
        children,
      ]
    );
  };
  Heading.displayName = `Heading${level}`;
  return Heading;
}

function MarkdownTable({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement> & { node?: unknown }) {
  return (
    <div className="my-6 w-full overflow-x-auto rounded-lg border border-border">
      <Table className={cn("w-full border-collapse", className)} {...props}>
        {children}
      </Table>
    </div>
  );
}

function MarkdownTableHead({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & { node?: unknown }) {
  return (
    <TableHead
      className={cn(
        "border-border border-b border-r bg-muted/50 px-4 py-2.5 text-left font-semibold last:border-r-0",
        className
      )}
      {...props}
    >
      {children}
    </TableHead>
  );
}

function MarkdownTableCell({
  children,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { node?: unknown }) {
  return (
    <TableCell
      className={cn(
        "border-border border-b border-r px-4 py-2.5 text-foreground last:border-r-0 [tr:last-child_&]:border-b-0",
        className
      )}
      {...props}
    >
      {children}
    </TableCell>
  );
}

function MarkdownHr({ className }: React.HTMLAttributes<HTMLHRElement> & { node?: unknown }) {
  return (
    <div className="my-6 w-full">
      <Separator orientation="horizontal" className={className} />
    </div>
  );
}

/** Used by MarkdownDetails to detect the summary child; render as collapsible trigger. */
function MarkdownSummary({
  children,
}: React.HTMLAttributes<HTMLElement> & { node?: unknown }) {
  return <>{children}</>;
}
MarkdownSummary.displayName = "MarkdownSummary";

function MarkdownDetails({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { node?: unknown }) {
  const childArray = React.Children.toArray(children);
  const first = childArray[0];
  const rest = childArray.slice(1);
  const isSummary =
    React.isValidElement(first) && first.type === MarkdownSummary;
  const triggerContent = isSummary
    ? (first as React.ReactElement<{ children?: React.ReactNode }>).props
        .children
    : "Details";
  const contentChildren = isSummary ? rest : childArray;
  return (
    <Collapsible
      defaultOpen={false}
      className={cn(
        "my-4 rounded-lg border border-border overflow-hidden",
        className
      )}
      {...props}
    >
      <CollapsibleTrigger
        className={cn(
          "group flex w-full cursor-pointer list-none items-center gap-2 px-4 py-3 text-left text-sm font-medium",
          "hover:bg-muted/50 [&::-webkit-details-marker]:hidden"
        )}
      >
        {triggerContent}
        <ChevronDownIcon className="ml-auto size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t border-border px-4 py-3 text-muted-foreground [&_p]:my-2 [&_ol]:my-2 [&_ul]:my-2">
          {contentChildren}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  img: RoundedImage,
  a: CustomLink,
  blockquote: BlockquoteCallout,
  pre: PreWithCodeBlock,
  code: Code,
  table: MarkdownTable,
  thead: ({ children, className, ...props }) => (
    <TableHeader className={cn("bg-muted/30", className)} {...props}>
      {children}
    </TableHeader>
  ),
  tbody: (props) => <TableBody {...props} />,
  tr: (props) => <TableRow {...props} />,
  th: MarkdownTableHead,
  td: MarkdownTableCell,
  hr: MarkdownHr,
  details: MarkdownDetails,
  summary: MarkdownSummary,
} as React.ComponentProps<typeof Streamdown>["components"];

export function CustomMDX({
  children,
  
}: ComponentProps<typeof Streamdown>) {
  return (
    <Streamdown
      components={components}
      className="prose"
      plugins={{ code, mermaid, math, cjk }}
    >
      {children}
    </Streamdown>
  );
}

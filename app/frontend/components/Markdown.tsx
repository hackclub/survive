import type { ReactNode } from "react"

type Props = { children: string }

function inlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^\)]+\))/g)

  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) return <strong key={index}>{part.slice(2, -2)}</strong>
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) return <em key={index}>{part.slice(1, -1)}</em>

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      const [, label, href] = link
      const safeHref = /^(https?:\/\/|mailto:|\/|#)/i.test(href) ? href : "#"
      return <a key={index} href={safeHref}>{label}</a>
    }

    return <span key={index}>{part}</span>
  })
}

export function Markdown({ children }: Props) {
  const lines = children.replace(/\r\n?/g, "\n").split("\n")
  const nodes: ReactNode[] = []
  let paragraph: string[] = []
  let list: string[] = []
  let ordered = false
  let code: string[] = []
  let inCode = false

  const flushParagraph = () => {
    if (!paragraph.length) return
    nodes.push(<p key={nodes.length}>{inlineMarkdown(paragraph.join(" ").trim())}</p>)
    paragraph = []
  }

  const flushList = () => {
    if (!list.length) return
    const Tag = ordered ? "ol" : "ul"
    nodes.push(<Tag key={nodes.length}>{list.map((item, index) => <li key={index}>{inlineMarkdown(item)}</li>)}</Tag>)
    list = []
  }

  const flushCode = () => {
    if (!inCode) return
    nodes.push(<pre key={nodes.length}><code>{code.join("\n")}</code></pre>)
    code = []
    inCode = false
  }

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      flushParagraph()
      flushList()
      if (inCode) flushCode()
      else inCode = true
      return
    }

    if (inCode) {
      code.push(line)
      return
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      flushParagraph()
      flushList()
      const level = Math.min(heading[1].length + 1, 6) as 2 | 3 | 4 | 5 | 6
      const Tag = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6"
      nodes.push(<Tag key={nodes.length}>{inlineMarkdown(heading[2])}</Tag>)
      return
    }

    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      flushParagraph()
      flushList()
      nodes.push(<hr key={nodes.length} />)
      return
    }

    const unordered = line.match(/^\s*[-*+]\s+(.+)$/)
    const numbered = line.match(/^\s*\d+[.)]\s+(.+)$/)
    if (unordered || numbered) {
      flushParagraph()
      const isOrdered = Boolean(numbered)
      if (list.length && ordered !== isOrdered) flushList()
      ordered = isOrdered
      list.push((unordered ?? numbered)![1])
      return
    }

    if (/^\s*>\s?/.test(line)) {
      flushParagraph()
      flushList()
      nodes.push(<blockquote key={nodes.length}>{inlineMarkdown(line.replace(/^\s*>\s?/, ""))}</blockquote>)
      return
    }

    if (!line.trim()) {
      flushParagraph()
      flushList()
      return
    }

    paragraph.push(line.trim())
  })

  flushCode()
  flushParagraph()
  flushList()

  return <div className="markdown">{nodes}</div>
}

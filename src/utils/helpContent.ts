import helpMarkdown from './config/help.md?raw'

export type HelpSection = {
  title: string
  content: string
}

export type HelpContent = {
  title: string
  sections: HelpSection[]
}

function parseMd(markdown: string): HelpContent {
  const lines = markdown.split('\n')
  let title = ''
  const sections: HelpSection[] = []
  let currentSection: HelpSection | null = null

  const pushCurrentSection = (section: HelpSection | null) => {
    if (!section) return
    sections.push({
      title: section.title,
      content: section.content.trim()
    })
  }

  lines.forEach((line) => {
    if (line.startsWith('# ')) {
      title = line.slice(2).trim()
    }
    else if (line.startsWith('## ')) {
      pushCurrentSection(currentSection)
      currentSection = {
        title: line.slice(3).trim(),
        content: ''
      }
    }
    else if (currentSection && line.trim()) {
      currentSection.content += `${line} `
    }
  })

  pushCurrentSection(currentSection)

  return { title, sections }
}

export const helpContent = parseMd(helpMarkdown)

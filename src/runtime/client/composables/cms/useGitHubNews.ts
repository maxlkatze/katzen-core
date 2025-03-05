// composables/cms/useGitHubNews.ts
import type { Ref } from 'vue'
import { ref, onMounted } from 'vue'

export interface NewsArticle {
  id: string
  title: string
  content: string
  date: string
  author: string
  tags: string[]
}

interface GitHubFileContent {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: string
  content: string
  encoding: string
  _links: {
    self: string
    git: string
    html: string
  }
}

interface GitHubDirectoryItem {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: 'file' | 'dir'
  _links: {
    self: string
    git: string
    html: string
  }
}

interface ParsedFrontmatter {
  frontmatter: Record<string, string | string[]>
  body: string
}

export function useGitHubNews() {
  const newsArticles: Ref<NewsArticle[]> = ref([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Base URL for GitHub API
  const baseUrl = `https://api.github.com/repos/maxlkatze/katzen-core/contents`

  // Directory path where news markdown files are stored
  const newsPath = 'content/news'

  // Function to parse frontmatter from markdown content
  const parseFrontmatter = (content: string): ParsedFrontmatter => {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
    const match = content.match(frontmatterRegex)

    if (!match) {
      return { frontmatter: {}, body: content }
    }

    const [, frontmatterStr, body] = match
    const frontmatter: Record<string, string | string[]> = {}

    frontmatterStr.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length) {
        let value = valueParts.join(':').trim()

        // Handle array values (tags)
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1)
          frontmatter[key.trim()] = value
            .split(',')
            .map(v => v.trim().replace(/"/g, '').replace(/'/g, ''))
        }
        else {
          // Handle string values, removing quotes
          frontmatter[key.trim()] = value.replace(/"/g, '').replace(/'/g, '')
        }
      }
    })

    return { frontmatter, body: body.trim() }
  }

  // Function to fetch and decode a single file
  const fetchFile = async (path: string): Promise<NewsArticle | null> => {
    try {
      const response = await fetch(`${baseUrl}/${path}?ref=master`)

      if (!response.ok) {
        const errorData: { message: string } = await response.json()
        throw new Error(errorData.message || 'Failed to fetch file')
      }

      const data: GitHubFileContent = await response.json()

      // GitHub API returns content as base64 encoded
      const content = atob(data.content)
      const { frontmatter, body } = parseFrontmatter(content)

      // Safe access to frontmatter with type guards
      const id = typeof frontmatter.id === 'string' ? frontmatter.id : data.sha.substring(0, 8)
      const title = typeof frontmatter.title === 'string' ? frontmatter.title : 'Untitled'
      const date = typeof frontmatter.date === 'string' ? frontmatter.date : new Date().toISOString().split('T')[0]
      const author = typeof frontmatter.author === 'string' ? frontmatter.author : 'Unknown'
      const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : []

      return {
        id,
        title,
        content: body,
        date,
        author,
        tags,
      }
    }
    catch (err) {
      console.error(`Error fetching file ${path}:`, err)
      return null
    }
  }

  // Function to fetch all news articles
  const fetchNewsArticles = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${baseUrl}/${newsPath}?ref=master`)

      if (!response.ok) {
        const errorData: { message: string } = await response.json()
        throw new Error(errorData.message || 'Failed to fetch news directory')
      }

      const data: GitHubDirectoryItem[] = await response.json()

      // Filter for markdown files only
      const markdownFiles = data.filter(file =>
        file.type === 'file' && file.name.endsWith('.md'),
      )

      // Fetch each file content in parallel
      const articlesPromises = markdownFiles.map(file =>
        fetchFile(`${newsPath}/${file.name}`),
      )

      const articles = await Promise.all(articlesPromises)

      // Filter out null results and sort by date (newest first)
      newsArticles.value = articles
        .filter((article): article is NewsArticle => article !== null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
    catch (err) {
      console.error('Error fetching news articles:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
    }
    finally {
      isLoading.value = false
    }
  }

  onMounted(async () => {
    await fetchNewsArticles()
  })

  return {
    newsArticles,
    isLoading,
    error,
    refreshNews: fetchNewsArticles,
  }
}

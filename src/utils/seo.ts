// SEO utility functions
export const generateMetaTitle = (title: string, siteName: string = "ISLE & ECHO") => {
  return title === siteName ? title : `${title} | ${siteName}`
}

export const generateMetaDescription = (description: string, maxLength: number = 160) => {
  if (description.length <= maxLength) return description
  return description.substring(0, maxLength - 3) + '...'
}

export const generateKeywords = (baseKeywords: string[], additionalKeywords: string[] = []) => {
  return [...baseKeywords, ...additionalKeywords].join(', ')
}

// Common SEO keywords for Sri Lanka tourism
export const SRI_LANKA_KEYWORDS = [
  "Sri Lanka tours",
  "Sri Lanka travel",
  "Sri Lanka holidays",
  "Sri Lanka vacation",
  "Sri Lanka tourism",
  "cultural tours Sri Lanka",
  "beach holidays Sri Lanka",
  "adventure tours Sri Lanka",
  "wildlife safaris Sri Lanka",
  "tea plantation tours",
  "Sigiriya rock fortress",
  "Ella train journey",
  "Galle fort",
  "Yala national park",
  "Nuwara Eliya",
  "Kandy",
  "Colombo",
  "Anuradhapura",
  "Polonnaruwa",
  "Dambulla cave temple",
  "ISLE & ECHO"
]

// Generate canonical URL
export const generateCanonicalUrl = (path: string, baseUrl: string = "https://isleandecho.com") => {
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

// Generate Open Graph image URL
export const generateOGImageUrl = (title: string, baseUrl: string = "https://isleandecho.com") => {
  const encodedTitle = encodeURIComponent(title)
  return `${baseUrl}/api/og?title=${encodedTitle}`
}

// Generate Twitter image URL
export const generateTwitterImageUrl = (title: string, baseUrl: string = "https://isleandecho.com") => {
  return generateOGImageUrl(title, baseUrl)
}

// SEO-friendly slug generation
export const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Generate breadcrumb data
export const generateBreadcrumbs = (path: string, baseUrl: string = "https://isleandecho.com") => {
  const segments = path.split('/').filter(Boolean)
  const breadcrumbs = [{ name: "Home", url: baseUrl }]
  
  let currentPath = ''
  segments.forEach((segment, _index) => {
    currentPath += `/${segment}`
    const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    breadcrumbs.push({
      name,
      url: `${baseUrl}${currentPath}`
    })
  })
  
  return breadcrumbs
}

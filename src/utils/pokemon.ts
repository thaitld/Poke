export const formatName = (value?: string) => {
  if (!value) return 'Unknown'
  return value
    .replace(/-/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const extractId = (url?: string) => {
  if (!url) return null
  const match = url.match(/\/(\d+)\/?$/)
  return match ? Number(match[1]) : null
}

export const spriteFor = (id: number | null, name?: string) => {
  if (id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
  }
  if (name) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${name.toLowerCase()}.png`
  }
  return ''
}


export type ImportKind = 'listing' | 'scholarship'

export type ImportRow = Record<string, string>

export function parseCsv(text: string): ImportRow[] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const next = text[index + 1]
    if (character === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(cell.trim())
      cell = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(cell.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += character
    }
  }
  if (cell || row.length) {
    row.push(cell.trim())
    rows.push(row)
  }

  const headers = (rows.shift() ?? []).map((header) => header.toLowerCase().replace(/\s+/g, '_'))
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
}

export function duplicateKey(kind: ImportKind, row: ImportRow) {
  const primary = kind === 'listing' ? `${row.company}|${row.title}` : row.name
  return `${kind}:${primary.toLowerCase().replace(/[^a-z0-9]+/g, '')}:${row.apply_url.toLowerCase().replace(/\/$/, '')}`
}

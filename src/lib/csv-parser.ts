/**
 * 마침표 CSV Parser
 *
 * Parses CSV files from e프라이버시 클린서비스 (Korean ePrivacy Clean Service)
 * as well as generic CSV formats with service names.
 *
 * Typical ePrivacy CSV columns (Korean):
 *   - 서비스명 / 사이트명 / 업체명 (service name)
 *   - URL / 사이트주소 (service URL)
 *   - 아이디 / ID / 로그인ID (login ID)
 *   - 가입일 / 등록일 (registration date)
 *
 * Also supports generic 1-column CSV (just service names per line).
 */

export interface ParsedAccount {
  service_name: string
  category: string
  login_id: string
  url?: string
}

const CATEGORY_KEYWORDS: { pattern: RegExp; category: string }[] = [
  // SNS / Social
  { pattern: /인스타그램|instagram|페이스북|facebook|트위터|twitter|x\.com|링크드인|linkedin|밴드|band\.us|틱톡|tiktok|핀터레스트|pinterest|스레드|threads/i, category: 'sns' },
  // Messengers
  { pattern: /카카오톡|kakaotalk|카카오|kakao|라인|line\.me|텔레그램|telegram|디스코드|discord|슬랙|slack/i, category: 'messenger' },
  // Portals
  { pattern: /네이버|naver|다음|daum|구글|google|네이트|nate|줌|zum|MSN|msn|야후|yahoo/i, category: 'portal' },
  // Gaming
  { pattern: /리그오브레전드|lol|league of legends|넥슨|nexon|넷마블|netmarble|블리자드|blizzard|에픽게임즈|epic games|스팀|steam|라이엇|riot|크래프톤|krafton|엔씨|ncsoft|카카오게임즈|펄어비스|pearl abyss/i, category: 'game' },
  // Commerce
  { pattern: /쿠팡|coupang|배달의민족|baedal|요기요|yogiyo|G마켓|gmarket|11번가|11st|티몬|tmon|위메프|wemakeprice|옥션|auction|컬리|kurly|오늘의집|ohou|무신사|musinsa|지그재그|zigzag/i, category: 'commerce' },
  // Brokers / Data brokers
  { pattern: /e프라이버시|eprivacy|클린서비스|cleanservice|나이스|nice평가|KG모빌리언스|kg mobilians|KCB|한국신용평가/i, category: 'broker' },
  // Subscription / Media
  { pattern: /넷플릭스|netflix|웨이브|wavve|티빙|tving|왓챠|watcha|디즈니|disney|apple music|스포티파이|spotify|멜론|melon|지니|genie|플로|flo|유튜브|youtube/i, category: 'subscription' },
  // Adult
  { pattern: /성인|adult|야동|porn/i, category: 'adult' },
]

export function detectCategory(serviceName: string): string {
  for (const { pattern, category } of CATEGORY_KEYWORDS) {
    if (pattern.test(serviceName)) return category
  }
  return 'other'
}

export function normalizeServiceName(raw: string): string {
  return raw
    .trim()
    .replace(/['"]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^(http|https):\/\//i, '')
    .replace(/^www\./i, '')
}

export function parseCSV(content: string): ParsedAccount[] {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) return []

  // Split first line to detect delimiter
  const firstLine = lines[0]
  const delimiter = firstLine.includes('\t') ? '\t'
    : firstLine.includes(';') ? ';'
    : firstLine.includes(',') ? ','
    : null

  const accounts: ParsedAccount[] = []
  const seen = new Set<string>()

  if (delimiter) {
    // Structured CSV — parse headers
    const headers = firstLine.split(delimiter).map(h => normalizeServiceName(h.toLowerCase()))

    // Detect column indices by Korean/English header names
    const nameIdx = headers.findIndex(h =>
      /^(서비스명|사이트명|업체명|service_name|service|name|사이트|업체)$/i.test(h)
    )
    const urlIdx = headers.findIndex(h =>
      /^(url|사이트주소|주소|link|링크)$/i.test(h)
    )
    const idIdx = headers.findIndex(h =>
      /^(아이디|id|로그인|login_id|login|userid|username)$/i.test(h)
    )
    const dateIdx = headers.findIndex(h =>
      /^(가입일|등록일|date|created_at|registration)/i.test(h)
    )

    const dataLines = lines.slice(1)

    for (const line of dataLines) {
      const cols = splitCSVLine(line, delimiter)
      if (cols.length < 2) continue

      let serviceName = ''
      let loginId = ''
      let url = ''

      if (nameIdx >= 0) {
        serviceName = normalizeServiceName(cols[nameIdx] || '')
      } else {
        // No header match — use first column
        serviceName = normalizeServiceName(cols[0] || '')
      }
      if (idIdx >= 0) {
        loginId = (cols[idIdx] || '').trim()
      }
      if (urlIdx >= 0) {
        url = (cols[urlIdx] || '').trim()
      } else if (!url && cols.length > 1 && dateIdx !== 1) {
        // Use second column as URL if no explicit URL column
        url = normalizeServiceName(cols[1] || '')
      }

      if (!serviceName || seen.has(serviceName.toLowerCase())) continue
      seen.add(serviceName.toLowerCase())

      accounts.push({
        service_name: serviceName,
        category: detectCategory(serviceName),
        login_id: loginId,
        url: url || undefined,
      })
    }
  } else {
    // Plain text (one service per line, or comma-separated names)
    for (const line of lines) {
      // Try comma-separated names first
      if (line.includes(',') && !line.startsWith('http')) {
        const items = line.split(',').map(s => normalizeServiceName(s)).filter(Boolean)
        for (const item of items) {
          if (!item || seen.has(item.toLowerCase())) continue
          seen.add(item.toLowerCase())
          accounts.push({
            service_name: item,
            category: detectCategory(item),
            login_id: '',
          })
        }
      } else {
        const name = normalizeServiceName(line)
        if (!name || seen.has(name.toLowerCase())) continue
        seen.add(name.toLowerCase())
        accounts.push({
          service_name: name,
          category: detectCategory(name),
          login_id: '',
        })
      }
    }
  }

  return accounts
}

/**
 * Splits a CSV line respecting quoted fields.
 */
function splitCSVLine(line: string, delimiter: string): string[] {
  const cols: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === delimiter && !inQuotes) {
      cols.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  cols.push(current.trim())
  return cols
}

// 候補の記事ページを取得し、AI の下読みに渡す材料を取り出す（#107）。
//
// - Exa を経由せず、元のページを直接開く（Exa の規約 4.2(a) の対象外にするため）。
// - 取り出した本文は下読みに渡すだけで、どこにも保存しない。
// - 有料記事・書き手・コピーサイトの見分けに使えるよう、メタ情報も拾う。

const TIMEOUT_MS = 15_000
const MAX_BYTES = 2_000_000
// 下読みに渡す本文の長さ。冒頭で記事の性質はほぼ分かるので、費用を抑えるために切る
const EXCERPT_CHARS = 3000

const USER_AGENT =
  'Mozilla/5.0 (compatible; YoridoArticleCollector/0.1; +https://github.com/yuai-project/yuai)'

const decodeEntities = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')

const clean = (s) => decodeEntities(s ?? '').replace(/\s+/g, ' ').trim()

function meta(html, key) {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${key}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${key}["']`,
    'i',
  )
  const m = html.match(re)
  return m ? clean(m[1] ?? m[2]) : null
}

function bodyText(html) {
  // 本文以外（スクリプト・ナビ・フッターなど）を落としてからタグを外す
  const main =
    html.match(/<article[\s\S]*?<\/article>/i)?.[0] ??
    html.match(/<main[\s\S]*?<\/main>/i)?.[0] ??
    html.match(/<body[\s\S]*?<\/body>/i)?.[0] ??
    html
  return clean(
    main
      .replace(/<(script|style|noscript|svg|nav|header|footer|aside|form)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<br\s*\/?>|<\/(p|div|li|h\d)>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
}

function charsetOf(contentType, head) {
  const fromHeader = contentType.match(/charset=([\w-]+)/i)?.[1]
  const fromMeta = head.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1]
  return (fromHeader ?? fromMeta ?? 'utf-8').toLowerCase()
}

// 戻り値: { ok, status, finalUrl, contentType, kind, title, description, siteName, author, excerpt, error }
// 取得できなくても例外にせず ok: false で返す（下読みは URL とタイトルだけで続ける）
export async function fetchPage(url) {
  const base = { ok: false, status: null, finalUrl: url, contentType: null, kind: null }
  let res
  try {
    res = await fetch(url, {
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml,application/pdf;q=0.8,*/*;q=0.5' },
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (e) {
    return { ...base, error: e.name === 'TimeoutError' ? 'timeout' : e.message }
  }

  const contentType = res.headers.get('content-type') ?? ''
  const result = { ...base, status: res.status, finalUrl: res.url, contentType }
  if (!res.ok) return { ...result, error: `HTTP ${res.status}` }

  if (/application\/pdf/i.test(contentType) || /\.pdf($|\?)/i.test(res.url)) {
    // PDF の本文抽出はしない（依存を増やさないため）。URL とタイトルで判断させる
    await res.body?.cancel()
    return { ...result, ok: true, kind: 'pdf' }
  }
  if (!/html/i.test(contentType)) {
    await res.body?.cancel()
    return { ...result, error: `HTML ではない（${contentType || '不明'}）` }
  }

  const buf = new Uint8Array(await res.arrayBuffer()).slice(0, MAX_BYTES)
  const head = new TextDecoder('latin1').decode(buf.slice(0, 4096))
  let html
  try {
    html = new TextDecoder(charsetOf(contentType, head)).decode(buf)
  } catch {
    html = new TextDecoder('utf-8').decode(buf)
  }

  return {
    ...result,
    ok: true,
    kind: 'html',
    title: clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]) || null,
    description: meta(html, 'description') ?? meta(html, 'og:description'),
    siteName: meta(html, 'og:site_name'),
    author: meta(html, 'author') ?? meta(html, 'article:author'),
    excerpt: bodyText(html).slice(0, EXCERPT_CHARS),
  }
}

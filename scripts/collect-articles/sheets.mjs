// 判定用スプレッドシート（#100）の読み書き（#107）。
//
// - 認証はサービスアカウント。依存を増やさないよう、googleapis は使わず JWT を自前で署名する。
// - シートは「見たことのある URL の台帳」でもある。却下した行も消さない前提で、全行の URL を重複判定に使う。
// - 読めなかったら例外にして止める。読めないまま進むと、全件を新規として追記してしまうため。

import { createSign } from 'node:crypto'

const SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const API = 'https://sheets.googleapis.com/v4/spreadsheets'

// .env.local / Secrets には JSON をそのままか、base64 にしたものを入れる（改行を含むため base64 が扱いやすい）
function loadKey(raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY が設定されていません（.env.local か Actions Secrets）')
  const json = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
  const key = JSON.parse(json)
  if (!key.client_email || !key.private_key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY がサービスアカウントの鍵の形ではありません')
  }
  return key
}

const b64url = (s) => Buffer.from(s).toString('base64url')

async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(
    JSON.stringify({ iss: key.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  )}`
  const signature = createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url')

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  })
  if (!res.ok) throw new Error(`Google の認証に失敗しました（${res.status}）: ${(await res.text()).slice(0, 300)}`)
  return (await res.json()).access_token
}

const quoteTab = (tab) => `'${tab.replace(/'/g, "''")}'`

export async function openSheet({
  spreadsheetId = process.env.GOOGLE_SHEET_ID,
  key = loadKey(),
} = {}) {
  if (!spreadsheetId) throw new Error('GOOGLE_SHEET_ID が設定されていません（.env.local か Actions Secrets）')
  const token = await getAccessToken(key)

  async function api(path, { method = 'GET', body } = {}) {
    const res = await fetch(`${API}/${spreadsheetId}${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: body && JSON.stringify(body),
    })
    if (!res.ok) {
      const hint = res.status === 403 || res.status === 404
        ? `（シートを ${key.client_email} に編集者として共有しているか確認してください）`
        : ''
      throw new Error(`スプレッドシートの操作に失敗しました（${res.status}）${hint}: ${(await res.text()).slice(0, 300)}`)
    }
    return res.json()
  }

  const getValues = async (range) =>
    (await api(`/values/${encodeURIComponent(range)}`)).values ?? []

  return {
    serviceAccount: key.client_email,

    async listTabs() {
      const data = await api('?fields=sheets.properties(sheetId,title)')
      return data.sheets.map((s) => s.properties)
    },

    // タブが無ければ作って見出しを書く。あれば見出しが一致するか確かめる（違えば止める）
    async ensureTab(tab, header, { judgmentColumn, judgmentValues } = {}) {
      const existing = (await this.listTabs()).find((t) => t.title === tab)
      if (!existing) {
        const created = await api(':batchUpdate', {
          method: 'POST',
          body: {
            requests: [
              { addSheet: { properties: { title: tab, gridProperties: { frozenRowCount: 1 } } } },
            ],
          },
        })
        const sheetId = created.replies[0].addSheet.properties.sheetId
        await this.writeHeader(tab, header)
        if (judgmentColumn != null) {
          // 判定の列はプルダウンにする（入力の揺れを防ぐ）
          await api(':batchUpdate', {
            method: 'POST',
            body: {
              requests: [
                {
                  setDataValidation: {
                    range: { sheetId, startRowIndex: 1, startColumnIndex: judgmentColumn, endColumnIndex: judgmentColumn + 1 },
                    rule: {
                      condition: { type: 'ONE_OF_LIST', values: judgmentValues.map((v) => ({ userEnteredValue: v })) },
                      showCustomUi: true,
                      strict: true,
                    },
                  },
                },
              ],
            },
          })
        }
        return { created: true }
      }

      const [current = []] = await getValues(`${quoteTab(tab)}!1:1`)
      if (current.length === 0) {
        await this.writeHeader(tab, header)
        return { created: false }
      }
      const mismatch = header.findIndex((h, i) => current[i] !== h)
      if (mismatch !== -1) {
        throw new Error(
          `「${tab}」の見出しが想定と違います（${mismatch + 1} 列目: "${current[mismatch] ?? ''}" ≠ "${header[mismatch]}"）。列を動かした場合は collect-articles/sheetRow.mjs も合わせてください`,
        )
      }
      return { created: false }
    },

    async writeHeader(tab, header) {
      await api(`/values/${encodeURIComponent(`${quoteTab(tab)}!A1`)}?valueInputOption=RAW`, {
        method: 'PUT',
        body: { values: [header] },
      })
    },

    // タブの全行（見出しを含む）
    readRows(tab) {
      return getValues(quoteTab(tab))
    },

    // タブの中で、見出しに「URL」を含む列の値をすべて返す
    async readUrls(tab) {
      const rows = await this.readRows(tab)
      const [header = [], ...body] = rows
      const col = header.findIndex((h) => /url/i.test(h))
      if (col === -1) throw new Error(`「${tab}」に見出しが URL の列が見つかりません`)
      return body.map((r) => r[col]).filter(Boolean)
    },

    // { 見出し: 値 } の配列を、タブの見出しの順に並べて追記する。見出しに無い列は空のまま。
    // 見出しは先頭が一致すれば同じ列とみなす（「AIの下書きメモ（参考。…）」のような補足を許す）
    async appendByHeader(tab, objects, requiredHeaders) {
      const [header = []] = await getValues(`${quoteTab(tab)}!1:1`)
      const columnOf = (key) => header.findIndex((h) => h === key || h.startsWith(`${key}（`) || h.startsWith(`${key}(`))
      const missing = requiredHeaders.filter((h) => columnOf(h) === -1)
      if (missing.length > 0) {
        throw new Error(`「${tab}」の見出しに ${missing.map((h) => `"${h}"`).join(' / ')} がありません`)
      }
      const rows = objects.map((o) => {
        const row = header.map(() => '')
        for (const [key, value] of Object.entries(o)) {
          const col = columnOf(key)
          if (col !== -1) row[col] = value ?? ''
        }
        return row
      })
      await this.appendRows(tab, rows)
    },

    // 最後の行の次から、A 列を起点に書く。
    // values.append は追記先の「表」を推測し、列の途中から書き始めることがある（「レビュー」タブで M 列から書かれた）ので使わない
    async appendRows(tab, rows) {
      if (rows.length === 0) return
      const start = (await getValues(quoteTab(tab))).length + 1
      await this.updateRange(`${quoteTab(tab)}!A${start}`, rows)
    },

    async updateRange(range, values) {
      await api(`/values/${encodeURIComponent(range)}?valueInputOption=RAW`, { method: 'PUT', body: { values } })
    },

    async clearRange(range) {
      await api(`/values/${encodeURIComponent(range)}:clear`, { method: 'POST', body: {} })
    },
  }
}

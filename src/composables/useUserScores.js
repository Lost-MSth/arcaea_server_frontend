import service from '@/plugins/axios'

// PTT on this server = Σ(best50)·w50 + Σ(best30)·w30 + Σ(best10)·w10 + Σ(recent10)·w10
// (weights are server config, exposed by /system/constants). The profile shows
// the four components as averages (Σ/N — the server's own convention for
// b30_ptt / r10_ptt) plus the Best 50 list they are built from.

export const bestAverages = (scores) => {
  const r = scores.map((s) => Number(s.rating) || 0)
  const sum = (n) => r.slice(0, n).reduce((a, b) => a + b, 0)
  return { b50: sum(50) / 50, b30: sum(30) / 30, b10: sum(10) / 10 }
}

// Song metadata from the cached song list (1 request / hour): fills missing
// names and the chart constant shown on score cards. Needs select or
// select_song_info; without it names stay as the server sent them and the
// constant is simply not shown.
export async function fillSongMeta(scores) {
  if (!scores.length || scores.every((s) => s.song_name && s.chart_const != null)) return
  try {
    const res = await service.cachedGet('/songs', null, { silent: true })
    const meta = new Map(res.data.map((s) => [s.song_id, s]))
    scores.forEach((s) => {
      const m = meta.get(s.song_id)
      if (!m) return
      if (!s.song_name) s.song_name = m.name || ''
      if (s.chart_const == null) {
        const ch = (m.charts || []).find((c) => c.difficulty === s.difficulty)
        if (ch && ch.chart_const >= 0) s.chart_const = ch.chart_const
      }
    })
  } catch (e) {
    /* metadata stays absent */
  }
}

// Most recent play from the r30 list (seconds -> ms), null when unknown.
const lastPlayedOf = (rows) => {
  const t = Math.max(0, ...rows.map((x) => Number(x.time_played) || 0))
  return t > 1e9 ? t * 1000 : null
}

// Two cached requests: best (top 50 by rating) + r30 (for its r10_ptt only).
export async function fetchUserScores(userId, { silent = true, songMeta = false, force = false } = {}) {
  const [best, r30] = await Promise.allSettled([
    service.cachedGet(`/users/${userId}/best`, { limit: 50 }, { silent, force }),
    service.cachedGet(`/users/${userId}/r30`, null, { silent, force }),
  ])
  const scores = best.status === 'fulfilled' ? best.value.data.data || [] : []
  if (songMeta) await fillSongMeta(scores)
  const r30rows = r30.status === 'fulfilled' ? r30.value.data.data || [] : []
  return {
    scores,
    ...bestAverages(scores),
    r10: r30.status === 'fulfilled' ? r30.value.data.r10_ptt : null,
    lastPlayed: lastPlayedOf(r30rows),
  }
}

export async function fetchPttWeights() {
  try {
    const res = await service.cachedGet('/system/constants', null, { silent: true })
    const d = res.data || {}
    if (d.best50_weight === undefined) return null
    return { b50: d.best50_weight, b30: d.best30_weight, b10: d.best10_weight, r10: d.recent10_weight }
  } catch (e) {
    return null
  }
}

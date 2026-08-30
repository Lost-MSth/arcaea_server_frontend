<template>
  <div>
    <PageHeader :eyebrow="t('route.song_search')" :title="t('song.song_search_title')" :subtitle="t('song.song_search_subtitle')" />

    <n-card class="search-card" :bordered="true">
      <div class="search-row">
        <div class="segmented">
          <button :class="{ on: mode === 0 }" @click="mode = 0">{{ t('song.search_by_id') }}</button>
          <button :class="{ on: mode === 1 }" @click="mode = 1">{{ t('song.search_by_name') }}</button>
        </div>
        <n-input v-model:value="query" :placeholder="mode === 0 ? t('song.search_by_id') : t('song.search_by_name')" class="q" @keyup.enter="searchSong">
          <template #prefix><AppIcon name="search" :size="16" /></template>
        </n-input>
        <n-button type="primary" :loading="loading" @click="searchSong">{{ t('common.search') }}</n-button>
      </div>
    </n-card>

    <n-spin :show="loading">
      <div v-if="results.length > 1" class="results glass">
        <span class="hud results-cap">{{ t('song.results_n', { n: results.length }) }}</span>
        <button
          v-for="r in results"
          :key="r.song_id"
          class="result-chip"
          :class="{ on: song && song.song_id === r.song_id }"
          @click="selectSong(r)"
        >
          <b>{{ r.name || r.song_id }}</b>
          <small class="hud">{{ r.song_id }}</small>
        </button>
      </div>

      <div v-if="song" class="song-card glass">
        <SongJacket :song-id="song.song_id" :size="104" :radius="14" :alt="song.name" />
        <div class="song-meta">
          <div class="song-title">
            <h3 class="font-display">{{ song.name || song.song_id }}</h3>
            <span class="hud sid">{{ song.song_id }}</span>
          </div>
          <div class="chips">
            <button
              v-for="c in song.charts"
              :key="c.difficulty"
              class="diff-btn diff"
              :class="['diff-' + c.difficulty, { active: selected === c.difficulty, disabled: c.chart_const < 0 }]"
              :disabled="c.chart_const < 0"
              @click="selectDifficulty(c.difficulty)"
            >
              {{ diffName[c.difficulty] }} {{ c.chart_const >= 0 ? c.chart_const.toFixed(1) : t('song.no_chart') }}
            </button>
          </div>
          <p v-if="selected === null" class="hint hud">{{ t('song.select_difficulty') }}</p>
        </div>
      </div>

      <template v-if="selected !== null">
        <div class="rank-head">
          <h3 class="font-display">{{ t('song.rank_title') }} · {{ t('song.top20') }}</h3>
          <span class="diff" :class="'diff-' + selected">{{ diffName[selected] }}</span>
        </div>
        <div v-if="ranks.length" class="rank-list">
          <RankRow v-for="(r, i) in ranks" :key="i" :data="r" />
        </div>
        <div v-else class="empty glass hud">{{ t('common.no_data') }}</div>
      </template>
    </n-spin>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { NCard, NInput, NButton, NSpin } from 'naive-ui'

import PageHeader from '@/components/PageHeader.vue'
import SongJacket from '@/components/SongJacket.vue'
import RankRow from '@/components/RankRow.vue'
import service from '@/plugins/axios'
import { difficulty_short_name } from '@/config'

const { t } = useI18n()
const route = useRoute()
const diffName = difficulty_short_name

// Deep link from the song-management table: /song/search?song_id=xxx
onMounted(() => {
  const sid = route.query.song_id
  if (typeof sid === 'string' && sid) {
    mode.value = 0
    query.value = sid
    searchSong()
  }
})

const mode = ref(0)
const query = ref('')
const loading = ref(false)
const song = ref(null)
const selected = ref(null)
const ranks = ref([])
const results = ref([])

const selectSong = (s) => {
  song.value = s
  selected.value = null
  ranks.value = []
}

const searchSong = async () => {
  if (!query.value.trim()) return
  loading.value = true
  selected.value = null
  ranks.value = []
  song.value = null
  results.value = []
  try {
    const key = mode.value === 0 ? 'song_id' : 'name'
    const res = await service.cachedGet('/songs', {
      fuzzy_query: { [key]: query.value.trim() },
      limit: 12,
    })
    results.value = res.data
    if (res.data.length === 1) selectSong(res.data[0])
  } catch (e) {
    /* surfaced */
  } finally {
    loading.value = false
  }
}

const selectDifficulty = async (d) => {
  if (selected.value === d) {
    selected.value = null
    ranks.value = []
    return
  }
  selected.value = d
  loading.value = true
  try {
    const res = await service.cachedGet('/songs/' + song.value.song_id + '/' + d + '/rank', {
      limit: 20,
    })
    ranks.value = res.data
  } catch (e) {
    ranks.value = []
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.search-card {
  border-radius: 16px;
  margin-bottom: 18px;
}
.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.segmented {
  display: inline-flex;
  padding: 3px;
  gap: 3px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
}
.segmented button {
  font-family: 'Chakra Petch', monospace;
  font-size: 12px;
  padding: 7px 13px;
  border-radius: 7px;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--text-muted);
  font-weight: 600;
}
.segmented button.on {
  background: var(--accent-soft);
  color: var(--text);
}
.q {
  flex: 1;
  min-width: 180px;
}
.results {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 14px;
  margin-bottom: 14px;
}
.results-cap {
  font-size: 11px;
  color: var(--text-muted);
  margin-right: 4px;
}
.result-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  padding: 6px 12px;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  cursor: pointer;
  font-size: 12.5px;
  transition:
    border-color 0.15s,
    background 0.15s;
}
.result-chip small {
  color: var(--text-muted);
  font-size: 10.5px;
}
.result-chip:hover {
  border-color: var(--border-strong);
}
.result-chip.on {
  background: var(--accent-soft);
  border-color: var(--accent);
}

.song-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 20px;
  align-items: center;
  padding: 20px;
  margin-bottom: 18px;
}
.song-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.song-title h3 {
  font-size: 20px;
  font-weight: 600;
}
.sid {
  color: var(--text-muted);
  font-size: 12px;
}
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.diff-btn {
  cursor: pointer;
  font-size: 12px;
  padding: 5px 11px;
  transition:
    transform 0.14s,
    box-shadow 0.14s;
}
.diff-btn.active {
  box-shadow: 0 0 0 2px var(--c);
  transform: translateY(-1px);
}
.diff-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.hint {
  color: var(--text-muted);
  font-size: 12px;
  margin: 10px 0 0;
}
.rank-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.rank-head h3 {
  font-size: 15px;
  font-weight: 600;
}
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.empty {
  padding: 36px;
  text-align: center;
  color: var(--text-muted);
}
@media (max-width: 620px) {
  .song-card {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }
}
</style>

<template>
  <div class="rank-row" :class="{ top: data.rank <= 3 }">
    <div class="no hud">{{ data.rank }}</div>
    <div class="who">
      {{ data.name }}
      <small class="hud">#{{ String(data.user_id).padStart(3, '0') }}</small>
    </div>
    <div class="scv hud">{{ data.score.toLocaleString('en-US') }}</div>
    <div class="cl">
      <div class="hud clear">{{ clear_type_name[data.clear_type] }}</div>
      <div class="counts hud">P{{ data.perfect_count }}/F{{ data.near_count }}/L{{ data.miss_count }}</div>
    </div>
    <n-tooltip v-if="validTime" trigger="hover">
      <template #trigger>
        <div class="when hud">{{ fromNow }}</div>
      </template>
      {{ fullTime }}
    </n-tooltip>
    <div v-else class="when hud">—</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NTooltip } from 'naive-ui'

import { clear_type_name } from '@/config'
import dayjs from '@/plugins/day'

const props = defineProps({
  data: { type: Object, required: true },
})

const validTime = computed(() => props.data.time_played && props.data.time_played > 1e9)
const fromNow = computed(() => dayjs(props.data.time_played * 1000).fromNow())
const fullTime = computed(() => dayjs(props.data.time_played * 1000).format('YYYY-MM-DD HH:mm:ss'))
</script>

<style scoped>
.rank-row {
  display: grid;
  /* Fixed first/last columns + minmax(0,fr) middle so every row shares the
     same column widths and the columns line up vertically. */
  grid-template-columns: 44px minmax(0, 1.6fr) minmax(0, 1.1fr) minmax(0, 1.4fr) 88px;
  gap: 12px;
  align-items: center;
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-2);
}
.no {
  font-weight: 700;
  font-size: 17px;
  color: var(--text-muted);
  text-align: center;
}
.rank-row.top .no {
  color: #ffd76a;
}
.who {
  font-weight: 600;
  font-size: 13.5px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.who small {
  display: block;
  color: var(--text-muted);
  font-size: 11px;
}
.scv {
  font-weight: 700;
  font-size: 15px;
}
.clear {
  font-size: 12px;
  color: var(--text-2);
}
.counts {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}
.when {
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
  cursor: default;
}
@media (max-width: 560px) {
  .rank-row {
    grid-template-columns: 34px 1fr auto;
  }
  .cl,
  .when {
    display: none;
  }
}
</style>

<template>
  <n-icon :size="size" :component="cmp" />
</template>

<script setup>
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import {
  GridOutline,
  PersonOutline,
  PeopleOutline,
  SearchOutline,
  MusicalNotesOutline,
  MusicalNoteOutline,
  PersonCircleOutline,
  CubeOutline,
  CardOutline,
  GiftOutline,
  TicketOutline,
  GlobeOutline,
  SettingsOutline,
  MoonOutline,
  SunnyOutline,
  LanguageOutline,
  LogOutOutline,
  RefreshOutline,
  AddOutline,
  TrashOutline,
  CreateOutline,
  MenuOutline,
  ChevronForwardOutline,
  ChevronDownOutline,
  WarningOutline,
  PlayOutline,
  ServerOutline,
  PulseOutline,
  TrophyOutline,
  SwapHorizontalOutline,
  CloseOutline,
  ColorPaletteOutline,
  BanOutline,
  EyeOutline,
  DownloadOutline,
  CopyOutline,
} from '@vicons/ionicons5'

const map = {
  grid: GridOutline,
  person: PersonOutline,
  people: PeopleOutline,
  search: SearchOutline,
  music: MusicalNotesOutline,
  note: MusicalNoteOutline,
  character: PersonCircleOutline,
  cube: CubeOutline,
  card: CardOutline,
  gift: GiftOutline,
  ticket: TicketOutline,
  globe: GlobeOutline,
  settings: SettingsOutline,
  moon: MoonOutline,
  sun: SunnyOutline,
  language: LanguageOutline,
  logout: LogOutOutline,
  refresh: RefreshOutline,
  add: AddOutline,
  trash: TrashOutline,
  edit: CreateOutline,
  menu: MenuOutline,
  chevron: ChevronForwardOutline,
  'chevron-down': ChevronDownOutline,
  warning: WarningOutline,
  play: PlayOutline,
  server: ServerOutline,
  pulse: PulseOutline,
  trophy: TrophyOutline,
  swap: SwapHorizontalOutline,
  close: CloseOutline,
  palette: ColorPaletteOutline,
  ban: BanOutline,
  eye: EyeOutline,
  download: DownloadOutline,
  copy: CopyOutline,
}

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 18 },
})

const cmp = computed(() => map[props.name] || GridOutline)
</script>

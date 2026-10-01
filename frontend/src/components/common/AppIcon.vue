<template><svg class="app-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name] || paths.cube" /></svg></template>
<script setup>
defineProps({ name: { type: String, default: 'cube' } })
const paths = {
  cube: 'M12 3 3 8v9l9 5 9-5V8L12 3ZM3 8l9 5 9-5M12 13v9M7.5 5.5l9 5',
  sphere: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z',
  cone: 'M12 3 3 18c4 4 14 4 18 0L12 3ZM3 18c4-3 14-3 18 0',
  cylinder: 'M3 6c0-4 18-4 18 0s-18 4-18 0Zm0 0v12c0 4 18 4 18 0V6',
  ring: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  plane: 'm3 12 9-6 9 6-9 6-9-6Z',
  layers: 'm3 7 9-4 9 4-9 4-9-4Zm0 5 9 4 9-4M3 17l9 4 9-4',
  text: 'M4 5h16M12 5v15M8 20h8M4 5v3M20 5v3',
  light: 'M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
  search: 'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-1 5 6 6',
  upload: 'M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5',
  download: 'M12 3v13m-5-5 5 5 5-5M4 16v5h16v-5',
  save: 'M5 3h12l4 4v14H3V3h2Zm2 0v6h10V3M7 21v-8h10v8',
  folder: 'M3 7V4h6l3 3h9v13H3V7Z',
  template: 'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z',
  play: 'm8 4 12 8-12 8V4Z',
  edit: 'm4 16 12-12 4 4L8 20H4v-4ZM13 7l4 4',
  undo: 'M8 5 3 10l5 5M3 10h11a6 6 0 0 1 0 12',
  redo: 'm16 5 5 5-5 5M21 10H10a6 6 0 0 0 0 12',
  left: 'm14 6-6 6 6 6', right: 'm10 6 6 6-6 6', down: 'm6 9 6 6 6-6',
  close: 'm6 6 12 12M6 18 18 6', plus: 'M12 5v14M5 12h14',
  cursor: 'm5 3 14 11-7 1-3 7L5 3Z',
  move: 'M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3',
  rotate: 'M3 10a9 9 0 1 1 2 8M3 4v6h6',
  scale: 'M14 3h7v7m0-7-8 8M3 14v7h7m-7 0 8-8',
  check: 'm5 12 4 4L19 6', sliders: 'M4 7h16M4 17h16M8 4v6M16 14v6',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
}
</script>
<style scoped>.app-icon { width: 18px; height: 18px; flex-shrink: 0; vertical-align: middle; }</style>

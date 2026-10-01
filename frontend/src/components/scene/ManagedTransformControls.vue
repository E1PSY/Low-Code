<template>
  <TransformControls ref="control" :object="object" :mode="mode" @dragging="$emit('dragging', $event)" />
</template>
<script setup>
import { shallowRef, onBeforeUnmount } from 'vue'
import { TransformControls } from '@tresjs/cientos'
import { resolveObject3D } from '../../utils/threeHelpers.js'
defineProps({ object: { type: Object, required: true }, mode: { type: String, default: 'translate' } })
defineEmits(['dragging'])
const control = shallowRef(null)
// Cientos 5.7 clears its exposed ref before onUnmounted. Dispose while it is still available.
onBeforeUnmount(() => resolveObject3D(control.value)?.dispose())
</script>

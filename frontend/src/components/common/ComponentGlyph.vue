<template><AppIcon :name="icon" /></template>
<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
const props = defineProps({ type: String })
const icon = computed(() => ({ Sphere: 'sphere', Cylinder: 'cylinder', Cone: 'cone', Plane: 'plane', Ring: 'ring', Torus: 'ring', TextSprite: 'text', CompositeGroup: 'layers' }[props.type] || (props.type?.includes('Light') ? 'light' : 'cube')))
</script>

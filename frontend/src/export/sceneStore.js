import { ref, shallowReactive } from 'vue'
import { defineStore } from 'pinia'
import scene from '../scene.json'
export const useSceneStore = defineStore('scene', () => {
  const objects = ref(scene.objects)
  const objectRefs = shallowReactive(new Map())
  function setObjectRef(id, object) { if (object) objectRefs.set(id, object); else objectRefs.delete(id) }
  return { objects, runtimeObjects: objects, objectRefs, setObjectRef }
})

import shared2 from '../composables/useSceneRuntime.js?raw'
import shared1 from '../config/componentRegistry.js?raw'
import shared0 from '../runtime/frameScheduler.js?raw'
import sceneCanvas from './SceneCanvas.vue?raw'
import sceneStore from './sceneStore.js?raw'
import assetStorage from './assetStorage.js?raw'
import sceneNode from '../components/scene/SceneNode.vue?raw'
import animatedModel from '../components/model/AnimatedModel.vue?raw'
import interactions from '../composables/useInteractions.js?raw'
import dataBinding from '../composables/useDataBinding.js?raw'
import bindings from '../config/bindings.js?raw'
import threeHelpers from '../utils/threeHelpers.js?raw'
export const runtimeSources = {
  'src/runtime/frameScheduler.js': shared0,
  'src/config/componentRegistry.js': shared1,
  'src/composables/useSceneRuntime.js': shared2,

  'src/components/scene/SceneCanvas.vue': sceneCanvas,
  'src/components/scene/SceneNode.vue': sceneNode,
  'src/components/model/AnimatedModel.vue': animatedModel,
  'src/stores/sceneStore.js': sceneStore,
  'src/utils/assetStorage.js': assetStorage,
  'src/utils/threeHelpers.js': threeHelpers,
  'src/composables/useInteractions.js': interactions,
  'src/composables/useDataBinding.js': dataBinding,
  'src/config/bindings.js': bindings,
}

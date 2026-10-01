/**
 * codeGenerator.js — scene code generator
 *
 * Output mode: project-scaffold (full project zip)
 * Also supports: vue-sfc, npm-package, web-component (backward compatible)
 */

// ========== shared utilities ==========

function pos(o) { return '[' + o.position.join(', ') + ']'; }
function rot(o) { return '[' + o.rotation.join(', ') + ']'; }
function sca(o) { return '[' + o.scale[0] + ', ' + o.scale[1] + ', ' + o.scale[2] + ']'; }

function hasInteraction(o) {
  var i = o.interactions || {};
  return (i.onClick && i.onClick.enabled) || (i.onHover && i.onHover.enabled) || (i.autoRotate && i.autoRotate.enabled);
}

function hasBindings(objects) {
  return objects.some(function(o) { return o.binding && o.binding.enabled && o.binding.targetProp !== 'none' && o.binding.dataSource !== 'none'; });
}

function hasTextSprites(objects) { return objects.some(function(o) { return o.type === 'TextSprite'; }); }
function hasModels(objects) { return objects.some(function(o) { return o.type === 'Model'; }); }

function interStr(o) {
  var i = o.interactions || {};
  var onClick = i.onClick || { enabled: false, action: 'none' };
  var onHover = i.onHover || { enabled: false, action: 'none' };
  var autoRotate = i.autoRotate || { enabled: false, speed: 1, axis: 'y' };

  var onClickPos = onClick.moveToPosition || onClick.moveTo || [0, 1, 0];

  return buildJsObj({
    objId: o.id,
    onClick: {
      enabled: !!onClick.enabled,
      action: onClick.action || 'none',
      highlightColor: onClick.highlightColor || '#ffff00',
      animationName: onClick.animationName || '',
      moveToPosition: onClickPos,
      targetColor: onClick.targetColor || '#ff0000',
      tweenDuration: onClick.tweenDuration != null ? onClick.tweenDuration : 1000
    },
    onHover: {
      enabled: !!onHover.enabled,
      action: onHover.action || 'none',
      highlightColor: onHover.highlightColor || '#00ff88',
      scaleMultiplier: onHover.scaleMultiplier != null ? onHover.scaleMultiplier : 1.15
    },
    autoRotate: {
      enabled: !!autoRotate.enabled,
      speed: autoRotate.speed != null ? autoRotate.speed : 1,
      axis: autoRotate.axis || 'y'
    }
  });
}

function bindStr(o) {
  var b = o.binding || {};
  return buildJsObj({
    enabled: !!b.enabled,
    targetProp: b.targetProp || 'none',
    dataSource: b.dataSource || 'none',
    min: b.min != null ? b.min : 0,
    max: b.max != null ? b.max : 1,
    speed: b.speed != null ? b.speed : 1,
    format: b.format || '{value}'
  });
}

function sanitizeName(str, fallback) {
  return (str || fallback || 'scene').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function escJs(str) {
  return String(str).replace(/[\\'"\x00-\x1f<>&\u2028\u2029]/g, char =>
    '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'));
}

function buildJsObj(props) {
  var parts = [];
  for (var key in props) {
    if (!props.hasOwnProperty(key)) continue;
    var val = props[key];
    if (val === null || val === undefined) continue;
    if (typeof val === 'string') {
      parts.push(key + ": '" + escJs(val) + "'");
    } else if (Array.isArray(val)) {
      parts.push(key + ': [' + val.join(', ') + ']');
    } else if (typeof val === 'boolean') {
      parts.push(key + ': ' + (val ? 'true' : 'false'));
    } else if (typeof val === 'number') {
      parts.push(key + ': ' + val);
    } else if (typeof val === 'object') {
      parts.push(key + ': ' + buildJsObj(val));
    }
  }
  return '{ ' + parts.join(', ') + ' }';
}

// ========== vue template tag generators ==========

var vueGens = {
  Box: function(o) { return geom('TresBoxGeometry', '[1,1,1]', o); },
  Sphere: function(o) { return geom('TresSphereGeometry', '[0.5,32,32]', o); },
  Cylinder: function(o) { return geom('TresCylinderGeometry', '[0.5,0.5,1,32]', o); },
  Cone: function(o) { return geom('TresConeGeometry', '[0.5,1,32]', o); },
  Plane: function(o) { return geom('TresPlaneGeometry', '[5,5]', o, ':side="2"'); },
  Torus: function(o) { return geom('TresTorusGeometry', '[0.5,0.2,16,32]', o); },
  Ring: function(o) { return geom('TresRingGeometry', '[0.3,0.6,32]', o, ':side="2"'); },
  Icosahedron: function(o) { return geom('TresIcosahedronGeometry', '[0.7,0]', o, ':flat-shading="true"'); },
  Octahedron: function(o) { return geom('TresOctahedronGeometry', '[0.7,0]', o, ':flat-shading="true"'); },
  Tetrahedron: function(o) { return geom('TresTetrahedronGeometry', '[0.7,0]', o, ':flat-shading="true"'); },
  Dodecahedron: function(o) { return geom('TresDodecahedronGeometry', '[0.7,0]', o, ':flat-shading="true"'); },
  Lathe: function(o) { return geom('TresLatheGeometry', 'lathePoints', o); },
  DirectionalLight: function(o) {
    var c = escJs(o.color || '#ffffff');
    return '        <TresGroup :position="' + pos(o) + '" :rotation="' + rot(o) + '">\n          <TresDirectionalLight :intensity="2" :color="\'' + c + '\'" />\n          <TresMesh><TresSphereGeometry :args="[0.2,16,16]" /><TresMeshBasicMaterial :color="\'' + c + '\'" /></TresMesh>\n        </TresGroup>';
  },
  PointLight: function(o) {
    var c = escJs(o.color || '#fef3c7');
    return '        <TresGroup :position="' + pos(o) + '">\n          <TresPointLight :intensity="10" :color="\'' + c + '\'" />\n          <TresMesh><TresSphereGeometry :args="[0.15,16,16]" /><TresMeshBasicMaterial :color="\'' + c + '\'" /></TresMesh>\n        </TresGroup>';
  },
  SpotLight: function(o) {
    var c = escJs(o.color || '#ffffff');
    return '        <TresGroup :position="' + pos(o) + '" :rotation="' + rot(o) + '">\n          <TresSpotLight :intensity="10" :color="\'' + c + '\'" :angle="0.5" :penumbra="0.3" />\n          <TresMesh><TresConeGeometry :args="[0.15,0.3,8]" /><TresMeshBasicMaterial :color="\'' + c + '\'" /></TresMesh>\n        </TresGroup>';
  },
  HemisphereLight: function(o) {
    var c = escJs(o.color || '#87ceeb');
    return '        <TresGroup :position="' + pos(o) + '">\n          <TresHemisphereLight :intensity="2" :color="\'' + c + '\'" ground-color="#444444" />\n          <TresMesh><TresSphereGeometry :args="[0.25,16,16]" /><TresMeshBasicMaterial :color="\'' + c + '\'" /></TresMesh>\n        </TresGroup>';
  },
  TextSprite: function(o) {
    var id = escJs(o.id);
    return '        <TextSpriteRenderer :obj-id="\'' + id + '\'" />';
  },
  Model: function(o) {
    var anim = o.activeAnimation ? ', activeAnimation: \'' + escJs(o.activeAnimation) + '\'' : '';
    var url = escJs(o.url || '');
    return '        <TresGroup :position="' + pos(o) + '" :rotation="' + rot(o) + '" :scale="' + sca(o) + '">\n          <Suspense>\n            <AnimatedModel :obj="{ url: \'' + url + '\'' + anim + ' }" />\n          </Suspense>\n        </TresGroup>';
  },
};

function geom(geometry, args, o, matExtra) {
  var hi = hasInteraction(o);
  var me = matExtra ? ' ' + matExtra : '';
  var c = escJs(o.color || '#ffffff');
  if (hi) {
    var intStr = interStr(o);
    return '        <InteractableMesh :position="' + pos(o) + '" :rotation="' + rot(o) + '" :scale="' + sca(o) + '" :interactions="' + intStr + '" @interact="intHandle.onInteract" @register="intHandle.registerMesh">\n          <' + geometry + ' :args="' + args + '" />\n          <TresMeshStandardMaterial :color="\'' + c + '\'"' + me + ' />\n        </InteractableMesh>';
  }
  return '        <TresMesh :position="' + pos(o) + '" :rotation="' + rot(o) + '" :scale="' + sca(o) + '">\n          <' + geometry + ' :args="' + args + '" />\n          <TresMeshStandardMaterial :color="\'' + c + '\'"' + me + ' />\n        </TresMesh>';
}

// ========== js object literal for store ==========

function jsObj(o) {
  var lines = [];
  lines.push('  {');
  lines.push('    id: \'' + escJs(o.id || ('obj_' + Math.random().toString(36).slice(2,8))) + '\',');
  lines.push('    type: \'' + escJs(o.type) + '\',');
  if (o.name) lines.push('    name: \'' + escJs(o.name) + '\',');
  lines.push('    position: ' + pos(o) + ',');
  lines.push('    rotation: ' + rot(o) + ',');
  lines.push('    scale: ' + sca(o) + ',');
  if (o.color !== undefined) lines.push('    color: \'' + escJs(o.color) + '\',');
  lines.push('    visible: ' + (o.visible!==false) + ',');
  if (o.type === 'TextSprite') {
    lines.push('    text: \'' + escJs(o.text || 'Hello') + '\',');
    lines.push('    fontSize: ' + (o.fontSize||48) + ',');
    lines.push('    textColor: \'' + escJs(o.textColor || '#ffffff') + '\',');
    lines.push('    bgColor: \'' + escJs(o.bgColor || 'transparent') + '\',');
    lines.push('    bold: ' + (o.bold||false) + ',');
  }
  if (o.type === 'Model') {
    lines.push('    url: \'' + escJs(o.url || '') + '\',');
    lines.push('    activeAnimation: \'' + escJs(o.activeAnimation || '') + '\',');
    lines.push('    animations: ' + JSON.stringify(o.animations||[]) + ',');
  }
  if (o.interactions) lines.push('    interactions: ' + interStr(o) + ',');
  if (o.binding) lines.push('    binding: ' + bindStr(o) + ',');
  lines.push('  }');
  return lines.join('\n');
}

// ================================================================
//  MODE 1: vue-sfc — single-file .vue (backward compatible)
// ================================================================

export function generateVueTemplate(objects) {
  var tags = objects.map(function(o) { return vueGens[o.type] ? vueGens[o.type](o) : ''; }).join('\n');
  var hasInteractions = objects.some(hasInteraction);
  var hasTextSprites = objects.some(function(o) { return o.type === 'TextSprite'; });
  var hasLathe = objects.some(function(o) { return o.type === 'Lathe'; });
  var hasModel = objects.some(function(o) { return o.type === 'Model'; });

  var needVueHelpers = hasInteractions || hasTextSprites || hasModel;
  var needThree = hasModel || hasTextSprites || hasLathe;
  var needCientos = hasModel;

  var vueImportNames = [];
  if (needVueHelpers) {
    var names = ['defineComponent', 'h'];
    if (hasTextSprites || hasModel) { names.push('ref'); names.push('onMounted'); names.push('watch'); }
    if (hasModel) { names.push('shallowRef'); }
    var deduped = [];
    names.forEach(function(x) { if (deduped.indexOf(x) < 0) deduped.push(x); });
    vueImportNames = deduped;
  }

  var cientosImports = ['OrbitControls'];
  if (needCientos) { cientosImports.push('useGLTF'); }

  var importLines = [
    "import { TresCanvas } from '@tresjs/core'",
    "import { " + cientosImports.join(', ') + " } from '@tresjs/cientos'"
  ];
  if (vueImportNames.length > 0) {
    importLines.push("import { " + vueImportNames.join(', ') + " } from 'vue'");
  }
  if (needThree) { importLines.push("import * as THREE from 'three'"); }

  var componentDefs = [];
  if (hasInteractions) { componentDefs.push(genInteractableMeshInline()); }
  if (hasTextSprites) { componentDefs.push(genTextSpriteRendererInline()); }
  if (hasModel) { componentDefs.push(genAnimatedModelInline()); }

  var result = '<template>\n  <div class="scene-container">\n    <TresCanvas clear-color="#18181a" window-size>\n      <TresPerspectiveCamera :position="[5,5,5]" :look-at="[0,0,0]" />\n      <OrbitControls />\n      <TresAmbientLight :intensity="0.8" />\n' + tags + '\n    </TresCanvas>\n  </div>\n</template>\n\n<script setup>\n' + importLines.join('\n');

  if (hasLathe) {
    result += '\n\nconst lathePoints = [\n  new THREE.Vector2(0.0,1.2),\n  new THREE.Vector2(0.15,1.15),\n  new THREE.Vector2(0.15,0.9),\n  new THREE.Vector2(0.5,0.75),\n  new THREE.Vector2(0.7,0.5),\n  new THREE.Vector2(0.6,0.25),\n  new THREE.Vector2(0.4,0.05),\n  new THREE.Vector2(0.35,0.0),\n]';
  }

  if (componentDefs.length > 0) {
    result += '\n\n' + componentDefs.join('\n\n');
  }

  result += '\n<\/script>\n\n<style scoped>\n.scene-container { width: 100vw; height: 100vh; overflow: hidden; background-color: #18181a; }\n</style>';
  return result;
}

function genInteractableMeshInline() {
  return [
    'const InteractableMesh = defineComponent({',
    '  name: \'InteractableMesh\',',
    '  props: {',
    '    position: { type: Array, default: function() { return [0,0,0] } },',
    '    rotation: { type: Array, default: function() { return [0,0,0] } },',
    '    scale: { type: Array, default: function() { return [1,1,1] } },',
    '    interactions: { type: Object, default: function() { return {} } }',
    '  },',
    '  setup: function(props, ctx) {',
    '    return function() { return ctx.slots.default ? ctx.slots.default() : null }',
    '  }',
    '})',
    ''
  ].join('\n');
}

function genTextSpriteRendererInline() {
  return [
    'const TextSpriteRenderer = defineComponent({',
    '  name: \'TextSpriteRenderer\',',
    '  props: { obj: { type: Object, required: true } },',
    '  setup: function(props) {',
    '    var texture = ref(null)',
    '    function buildTexture() {',
    '      var c = document.createElement(\'canvas\')',
    '      var fs = props.obj.fontSize || 48',
    '      c.width = fs * 8',
    '      c.height = fs * 2',
    '      var ctx = c.getContext(\'2d\')',
    '      if (props.obj.bgColor && props.obj.bgColor !== \'transparent\') {',
    '        ctx.fillStyle = props.obj.bgColor',
    '        ctx.fillRect(0, 0, c.width, c.height)',
    '      }',
    '      ctx.font = (props.obj.bold ? \'bold \' : \'\') + fs + \'px sans-serif\'',
    '      ctx.fillStyle = props.obj.textColor || \'#fff\'',
    '      ctx.textAlign = \'center\'',
    '      ctx.textBaseline = \'middle\'',
    '      ctx.fillText(props.obj.text || \'?\', c.width / 2, c.height / 2)',
    '      texture.value = new THREE.CanvasTexture(c)',
    '    }',
    '    onMounted(function() { buildTexture() })',
    '    watch(function() { return [props.obj.text, props.obj.fontSize, props.obj.textColor, props.obj.bgColor, props.obj.bold] }, function() { buildTexture() })',
    '    return function() {',
    '      var t = texture.value',
    '      if (!t) return null',
    '      return h(\'TresSprite\', {',
    '        position: [props.obj.position[0], props.obj.position[1], props.obj.position[2]],',
    '        scale: [props.obj.scale[0], props.obj.scale[1], 1]',
    '      }, function() {',
    '        return h(\'TresSpriteMaterial\', { map: t, transparent: true, depthTest: false })',
    '      })',
    '    }',
    '  }',
    '})',
    ''
  ].join('\n');
}

function genAnimatedModelInline() {
  return [
    'const AnimatedModel = defineComponent({',
    '  name: \'AnimatedModel\',',
    '  props: { obj: { type: Object, required: true } },',
    '  setup: function(props) {',
    '    var groupRef = shallowRef(null)',
    '    var modelScene = shallowRef(null)',
    '    async function load() {',
    '      try {',
    '        var result = await useGLTF(props.obj.url, { draco: true })',
    '        var scene = result.scene || (result.scenes && result.scenes[0])',
    '        if (scene) modelScene.value = scene',
    '      } catch(e) { console.error(\'Model load error:\', e) }',
    '    }',
    '    onMounted(function() { load() })',
    '    watch(function() { return props.obj.url }, function() { load() })',
    '    return function() {',
    '      return h(\'TresGroup\', {',
    '        ref: function(el) { groupRef.value = el; if (el && modelScene.value) el.add(modelScene.value) }',
    '      })',
    '    }',
    '  }',
    '})',
    ''
  ].join('\n');
}

// ================================================================
//  MODE 2: project-scaffold — full project (PRIMARY EXPORT MODE)
// ================================================================

export function generateProjectScaffold(objects, projectName) {
  var name = projectName || 'tresjs-scene';
  var sceneName = sanitizeName(name, 'scene');
  var files = {};

  // package.json
  files['package.json'] = JSON.stringify({
    name: sceneName,
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    dependencies: {
      '@tresjs/cientos': '^5.8.0',
      '@tresjs/core': '^5.8.0',
      'pinia': '^3.0.4',
      'three': '^0.184.0',
      'vue': '^3.5.25'
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^6.0.2',
      'vite': '^7.3.1'
    }
  }, null, 2);

  // vite.config.js
  files['vite.config.js'] = [
    'import { defineConfig } from \'vite\'',
    'import vue from \'@vitejs/plugin-vue\'',
    'import { templateCompilerOptions } from \'@tresjs/core\'',
    '',
    'export default defineConfig({',
    '  plugins: [vue({ ...templateCompilerOptions })],',
    '  resolve: { alias: { \'@\': \'/src\' } },',
    '  server: { port: 5173, open: true },',
    '})',
    ''
  ].join('\n');

  // index.html
  files['index.html'] = [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '  <title>' + sceneName + '</title>',
    '</head>',
    '<body>',
    '  <div id="app"></div>',
    '  <script type="module" src="/src/main.js"></script>',
    '</body>',
    '</html>',
    ''
  ].join('\n');

  // src/main.js
  files['src/main.js'] = [
    'import { createApp } from \'vue\'',
    'import { createPinia } from \'pinia\'',
    'import Tres from \'@tresjs/core\'',
    'import App from \'./App.vue\'',
    '',
    'const app = createApp(App)',
    'app.use(createPinia())',
    'app.use(Tres)',
    'app.mount(\'#app\')',
    ''
  ].join('\n');

  // src/App.vue
  files['src/App.vue'] = genAppVue(objects, false);

  // src/stores/sceneStore.js
  files['src/stores/sceneStore.js'] = genSceneStore(objects);

  // src/components/scene/SceneCanvas.vue
  files['src/components/scene/SceneCanvas.vue'] = genSceneCanvas(objects);

  // src/composables/useNavigation.js
  files['src/composables/useNavigation.js'] = genNavComposable();

  // src/composables/useDataBinding.js
  files['src/composables/useDataBinding.js'] = genDbComposable();

  // src/composables/useSceneInteractions.js — interaction engine
  var hasInt = objects.some(hasInteraction);
  if (hasInt) files['src/composables/useSceneInteractions.js'] = genSceneInteractionsComposable();

  // conditional sub-components
  var nedInter = objects.some(hasInteraction);
  var nedSprite = hasTextSprites(objects);
  var nedModel = hasModels(objects);

  if (nedInter) files['src/components/scene/InteractableMesh.vue'] = genInteractableMesh();
  if (nedSprite) files['src/components/scene/TextSpriteRenderer.vue'] = genTextSpriteRenderer();
  if (nedModel) files['src/components/scene/AnimatedModel.vue'] = genAnimatedModel();

  return files;
}

// ========== scaffold sub-generators ==========

function genAppVue(objects, isPackage) {
  var hasBinding = hasBindings(objects);
  return [
    '<template>',
    '  <div class="app">',
    '    <SceneCanvas />',
    '  </div>',
    '</template>',
    '',
    '<script setup>',
    'import SceneCanvas from \'./components/scene/SceneCanvas.vue\'',
    'import { useNavigation } from \'./composables/useNavigation.js\'',
    hasBinding ? 'import { useDataBinding } from \'./composables/useDataBinding.js\'' : null,
    '',
    'const nav = useNavigation()',
    hasBinding ? 'const binding = useDataBinding()' : null,
    hasBinding ? 'binding.start()' : null,
    '</script>',
    '',
    '<style>',
    '* { margin: 0; padding: 0; box-sizing: border-box; }',
    'html, body, #app { width: 100%; height: 100%; overflow: hidden; }',
    '.app { width: 100%; height: 100%; background-color: #18181a; }',
    '</style>',
    ''
  ].filter(function(l) { return l !== null; }).join('\n');
}

function genSceneCanvas(objects) {
  var tags = objects.map(function(o) { return vueGens[o.type] ? vueGens[o.type](o) : ''; }).join('\n');
  var hasInt = objects.some(hasInteraction);
  var hasSprite = hasTextSprites(objects);
  var hasModel = hasModels(objects);
  var hasLathe = objects.some(function(o) { return o.type === 'Lathe'; });
  var hasBind = hasBindings(objects);

  var importLines = [
    '<script setup>',
    'import { ref, onMounted, onUnmounted } from \'vue\'',
    'import { TresCanvas } from \'@tresjs/core\'',
    'import { OrbitControls } from \'@tresjs/cientos\'',
    'import { useSceneStore } from \'../../stores/sceneStore.js\'',
    hasSprite ? 'import TextSpriteRenderer from \'./TextSpriteRenderer.vue\'' : null,
    hasInt ? 'import InteractableMesh from \'./InteractableMesh.vue\'' : null,
    hasInt ? 'import { useSceneInteractions } from \'../../composables/useSceneInteractions.js\'' : null,
    hasModel ? 'import AnimatedModel from \'./AnimatedModel.vue\'' : null,
    '',
  ].filter(function(l) { return l !== null; });

  importLines.push('const sceneStore = useSceneStore()');
  importLines.push('const canvasRef = ref(null)');
  importLines.push('const cameraRef = ref(null)');
  importLines.push('const controlsRef = ref(null)');

  if (hasInt) {
    importLines.push('');
    importLines.push('var intHandle = useSceneInteractions()');
    importLines.push('');
    importLines.push('onMounted(function() {');
    importLines.push('  var objs = sceneStore.objects');
    importLines.push('  objs.forEach(function(o) {');
    importLines.push('    if (o.interactions && o.interactions.autoRotate && o.interactions.autoRotate.enabled) {');
    importLines.push('      intHandle.addAutoRotate(o)');
    importLines.push('    }');
    importLines.push('  })');
    importLines.push('  intHandle.startAutoRotateLoop()');
    importLines.push('})');
    importLines.push('');
    importLines.push('onUnmounted(function() {');
    importLines.push('  intHandle.stopAutoRotateLoop()');
    importLines.push('})');
  }

  if (hasLathe) {
    importLines.push('');
    importLines.push('import * as THREE from \'three\'');
    importLines.push('');
    importLines.push('var lathePoints = [');
    importLines.push('  new THREE.Vector2(0.0, 1.2), new THREE.Vector2(0.15, 1.15), new THREE.Vector2(0.15, 0.9),');
    importLines.push('  new THREE.Vector2(0.5, 0.75), new THREE.Vector2(0.7, 0.5), new THREE.Vector2(0.6, 0.25),');
    importLines.push('  new THREE.Vector2(0.4, 0.05), new THREE.Vector2(0.35, 0.0),');
    importLines.push(']');
  }

  importLines.push('');
  importLines.push('defineExpose({ canvasRef, cameraRef, controlsRef })');
  importLines.push('<\/script>');

  return [
    '<template>',
    '  <div class="scene-container">',
    '    <TresCanvas ref="canvasRef" clear-color="#18181a" window-size>',
    '      <TresPerspectiveCamera ref="cameraRef" :position="[5, 5, 5]" :look-at="[0, 0, 0]" />',
    '      <OrbitControls ref="controlsRef" make-default />',
    '      <TresAmbientLight :intensity="0.8" />',
    '      <TresGridHelper :args="[20, 20, \'#3f3f46\', \'#27272a\']" />',
    tags,
    '    </TresCanvas>',
    '  </div>',
    '</template>',
    '',
    importLines.join('\n'),
    '',
    '<style scoped>',
    '.scene-container { width: 100%; height: 100%; overflow: hidden; }',
    '</style>',
    ''
  ].join('\n');
}

function genSceneStore(objects) {
  var objarr = objects.map(jsObj).join(',\n');
  return [
    'import { defineStore } from \'pinia\'',
    'import { ref, computed } from \'vue\'',
    '',
    'export var useSceneStore = defineStore(\'scene\', function() {',
    '  var objects = ref([' + objarr + '])',
    '  var activeObjectId = ref(null)',
    '',
    '  var activeObject = computed(function() {',
    '    return objects.value.find(function(obj) { return obj.id === activeObjectId.value }) || null',
    '  })',
    '',
    '  function selectObject(id) { activeObjectId.value = id }',
    '  function deselectAll() { activeObjectId.value = null }',
    '',
    '  function updateObject(id, updates) {',
    '    var idx = objects.value.findIndex(function(o) { return o.id === id })',
    '    if (idx !== -1) Object.assign(objects.value[idx], updates)',
    '  }',
    '',
    '  return { objects, activeObjectId, activeObject,',
    '    selectObject, deselectAll, updateObject }',
    '})',
    ''
  ].join('\n');
}

function genNavComposable() {
  return [
    '/**',
    ' * useNavigation — first-person fly / orbit navigation',
    ' */',
    'import { ref, onMounted, onUnmounted } from \'vue\'',
    'import * as THREE from \'three\'',
    '',
    'export function useNavigation() {',
    '  var mode = ref(\'orbit\')',
    '  var speed = ref(5)',
    '  var isFlying = ref(false)',
    '  var keys = {}',
    '',
    '  var camera = null',
    '  var controls = null',
    '  var clock = new THREE.Clock()',
    '  var animFrame = null',
    '',
    '  function bind(cam, ctl) {',
    '    camera = cam',
    '    controls = ctl',
    '  }',
    '',
    '  function toggleMode() {',
    '    mode.value = mode.value === \'orbit\' ? \'fly\' : \'orbit\'',
    '    if (controls && controls.value) {',
    '      controls.value.enabled = mode.value === \'orbit\'',
    '    }',
    '    isFlying.value = mode.value === \'fly\'',
    '  }',
    '',
    '  function onKeyDown(e) {',
    '    if (e.target.tagName === \'INPUT\' || e.target.tagName === \'TEXTAREA\') return',
    '    keys[e.key.toLowerCase()] = true',
    '  }',
    '',
    '  function onKeyUp(e) { keys[e.key.toLowerCase()] = false }',
    '',
    '  function flyLoop() {',
    '    if (mode.value !== \'fly\' || !camera) {',
    '      animFrame = requestAnimationFrame(flyLoop)',
    '      return',
    '    }',
    '    var dt = Math.min(clock.getDelta(), 0.1)',
    '    var s = speed.value * dt',
    '    var cam = camera.value || camera',
    '    if (!cam) { animFrame = requestAnimationFrame(flyLoop); return }',
    '',
    '    var dir = new THREE.Vector3()',
    '    cam.getWorldDirection(dir)',
    '    var right = new THREE.Vector3().crossVectors(dir, cam.up).normalize()',
    '',
    '    if (keys[\'w\'] || keys[\'arrowup\']) cam.position.addScaledVector(dir, s)',
    '    if (keys[\'s\'] || keys[\'arrowdown\']) cam.position.addScaledVector(dir, -s)',
    '    if (keys[\'a\'] || keys[\'arrowleft\']) cam.position.addScaledVector(right, -s)',
    '    if (keys[\'d\'] || keys[\'arrowright\']) cam.position.addScaledVector(right, s)',
    '    if (keys[\'q\']) cam.position.y -= s',
    '    if (keys[\'e\']) cam.position.y += s',
    '',
    '    animFrame = requestAnimationFrame(flyLoop)',
    '  }',
    '',
    '  onMounted(function() {',
    '    window.addEventListener(\'keydown\', onKeyDown)',
    '    window.addEventListener(\'keyup\', onKeyUp)',
    '    animFrame = requestAnimationFrame(flyLoop)',
    '  })',
    '',
    '  onUnmounted(function() {',
    '    window.removeEventListener(\'keydown\', onKeyDown)',
    '    window.removeEventListener(\'keyup\', onKeyUp)',
    '    if (animFrame) cancelAnimationFrame(animFrame)',
    '  })',
    '',
    '  return { mode, speed, isFlying, bind, toggleMode }',
    '}',
    ''
  ].join('\n');
}

function genDbComposable() {
  return [
    'import { useSceneStore } from \'../stores/sceneStore.js\'',
    '',
    '/**',
    ' * useDataBinding — data binding runtime engine',
    ' * Updates object properties every frame based on binding config',
    ' */',
    'export function useDataBinding() {',
    '  var sceneStore = useSceneStore()',
    '  var frameCount = 0',
    '  var active = false',
    '  var rafId = null',
    '  var counters = new Map()',
    '',
    '  function start() { active = true; tick() }',
    '',
    '  function stop() { active = false; if (rafId) { cancelAnimationFrame(rafId); rafId = null } }',
    '',
    '  function tick() {',
    '    if (!active) return',
    '    frameCount++',
    '',
    '    sceneStore.objects.forEach(function(obj) {',
    '      var b = obj.binding',
    '      if (!b || !b.enabled || b.targetProp === \'none\' || b.dataSource === \'none\') return',
    '',
    '      var val = getDataValue(b.dataSource, b, frameCount, obj.id)',
    '      var target = b.targetProp',
    '',
    '      if (typeof val === \'string\') {',
    '        if (target === \'text\' && obj.text !== undefined) {',
    '          var fmt = b.format || \'{value}\'',
    '          obj.text = fmt.replace(\'{value}\', val)',
    '        }',
    '        return',
    '      }',
    '',
    '      var range = b.max - b.min || 1',
    '      var t = (val - b.min) / range',
    '',
    '      switch (target) {',
    '        case \'scaleX\': obj.scale[0] = b.min + t * (b.max - b.min) * 2; break',
    '        case \'scaleY\': obj.scale[1] = b.min + t * (b.max - b.min) * 2; break',
    '        case \'scaleZ\': obj.scale[2] = b.min + t * (b.max - b.min) * 2; break',
    '        case \'positionY\': obj.position[1] = b.min + t * (b.max - b.min) * 3; break',
    '      }',
    '    })',
    '',
    '    rafId = requestAnimationFrame(tick)',
    '  }',
    '',
    '  return { start, stop }',
    '}',
    '',
    'function getDataValue(source, opts, frame, objId) {',
    '  var t = (frame || 0) * (opts.speed || 1) * 0.016',
    '  switch (source) {',
    '    case \'sine\': return opts.min + ((Math.sin(t * 2) + 1) / 2) * (opts.max - opts.min)',
    '    case \'random\': return opts.min + Math.random() * (opts.max - opts.min)',
    '    case \'clock\': {',
    '      var now = new Date()',
    '      return String(now.getHours()).padStart(2, \'0\') + \':\' + String(now.getMinutes()).padStart(2, \'0\') + \':\' + String(now.getSeconds()).padStart(2, \'0\')',
    '    }',
    '    case \'counter\': {',
    '      var key = objId || \'global\'',
    '      var count = (counters.get(key) || 0) + 1',
    '      counters.set(key, count)',
    '      return opts.min + (count % Math.max(opts.max - opts.min + 1, 1))',
    '    }',
    '    default: return 0',
    '  }',
    '}',
    ''
  ].join('\n');
}

function genSceneInteractionsComposable() {
  return [
    '/**',
    ' * useSceneInteractions — scene-wide interaction engine',
    ' * Handles click, hover, and autoRotate for all interactive objects',
    ' */',
    'import * as THREE from \'three\'',
    '',
    'export function useSceneInteractions() {',
    '  var registeredMeshes = new Map()',
    '  var savedStates = new Map()',
    '  var autoRotateItems = []',
    '  var autoRotateClock = null',
    '  var autoRotateFrameId = null',
    '',
    '  // ========== mesh registry ==========',
    '  function registerMesh(objId, meshEl) {',
    '    if (meshEl) registeredMeshes.set(objId, meshEl)',
    '    else registeredMeshes.delete(objId)',
    '  }',
    '',
    '  function resolveMaterial(mesh) {',
    '    if (!mesh) return null',
    '    var m = mesh.material',
    '    return Array.isArray(m) ? m[0] : m',
    '  }',
    '',
    '  // ========== interaction handler (called from template by InteractableMesh) ==========',
    '  function onInteract(event, config) {',
    '    if (!event || !config) return',
    '    switch (event) {',
    '      case \'click\': handleClick(config); break',
    '      case \'hoverEnter\': handleHoverEnter(config); break',
    '      case \'hoverLeave\': handleHoverLeave(config); break',
    '    }',
    '  }',
    '',
    '  function handleClick(cfg) {',
    '    if (!cfg || !cfg.enabled || cfg.action === \'none\') return',
    '    var mesh = registeredMeshes.get(cfg.objId)',
    '    if (!mesh) return',
    '    var mat = resolveMaterial(mesh)',
    '    switch (cfg.action) {',
    '      case \'highlight\': highlightFlash(mesh, cfg.highlightColor || \'#ffff00\'); break',
    '      case \'changeColor\': if (cfg.targetColor && mat && mat.color) mat.color.set(cfg.targetColor); break',
    '      case \'bounce\': bounceEffect(mesh); break',
    '      case \'toggleVisible\': mesh.visible = !mesh.visible; break',
    '      case \'wireframe\': if (mat) mat.wireframe = !mat.wireframe; break',
    '      case \'moveTo\': tweenTo(mesh, cfg.moveToPosition || [0,1,0], cfg.tweenDuration || 1000); break',
    '    }',
    '  }',
    '',
    '  function handleHoverEnter(cfg) {',
    '    if (!cfg || !cfg.enabled || cfg.action === \'none\') return',
    '    var mesh = registeredMeshes.get(cfg.objId)',
    '    if (!mesh) return',
    '    var mat = resolveMaterial(mesh)',
    '    var key = cfg.objId',
    '    switch (cfg.action) {',
    '      case \'highlight\':',
    '        if (mat && mat.color) {',
    '          savedStates.set(key + \'_color\', mat.color.getHex())',
    '          mat.color.set(cfg.highlightColor || \'#00ff88\')',
    '        }',
    '        break',
    '      case \'scaleUp\':',
    '        savedStates.set(key + \'_scale\', mesh.scale.clone())',
    '        mesh.scale.multiplyScalar(cfg.scaleMultiplier || 1.15)',
    '        break',
    '      case \'rotate\':',
    '        savedStates.set(key + \'_rot\', mesh.rotation.clone())',
    '        mesh.rotation.y += Math.PI * 0.25',
    '        break',
    '      case \'wireframe\':',
    '        if (mat && mat.wireframe === false) {',
    '          savedStates.set(key + \'_wf\', true)',
    '          mat.wireframe = true',
    '        }',
    '        break',
    '      case \'emissive\':',
    '        if (mat && mat.emissive) {',
    '          savedStates.set(key + \'_emissive\', mat.emissive.getHex())',
    '          mat.emissive.set(cfg.highlightColor || \'#555555\')',
    '        }',
    '        break',
    '    }',
    '  }',
    '',
    '  function handleHoverLeave(cfg) {',
    '    if (!cfg || !cfg.enabled || cfg.action === \'none\') return',
    '    var mesh = registeredMeshes.get(cfg.objId)',
    '    if (!mesh) return',
    '    var mat = resolveMaterial(mesh)',
    '    var key = cfg.objId',
    '    switch (cfg.action) {',
    '      case \'highlight\':',
    '        if (savedStates.has(key + \'_color\') && mat && mat.color) {',
    '          mat.color.set(savedStates.get(key + \'_color\'))',
    '          savedStates.delete(key + \'_color\')',
    '        }',
    '        break',
    '      case \'scaleUp\':',
    '        if (savedStates.has(key + \'_scale\')) {',
    '          mesh.scale.copy(savedStates.get(key + \'_scale\'))',
    '          savedStates.delete(key + \'_scale\')',
    '        }',
    '        break',
    '      case \'rotate\':',
    '        if (savedStates.has(key + \'_rot\')) {',
    '          mesh.rotation.copy(savedStates.get(key + \'_rot\'))',
    '          savedStates.delete(key + \'_rot\')',
    '        }',
    '        break',
    '      case \'wireframe\':',
    '        if (mat && savedStates.has(key + \'_wf\')) {',
    '          mat.wireframe = false',
    '          savedStates.delete(key + \'_wf\')',
    '        }',
    '        break',
    '      case \'emissive\':',
    '        if (mat && mat.emissive && savedStates.has(key + \'_emissive\')) {',
    '          mat.emissive.set(savedStates.get(key + \'_emissive\'))',
    '          savedStates.delete(key + \'_emissive\')',
    '        }',
    '        break',
    '    }',
    '  }',
    '',
    '  // ========== click effects ==========',
    '',
    '  function highlightFlash(mesh, colorHex) {',
    '    var mat = resolveMaterial(mesh)',
    '    if (!mat || !mat.color) return',
    '    var original = mat.color.getHex()',
    '    mat.color.set(colorHex)',
    '    setTimeout(function() { if (mat && mat.color) mat.color.set(original) }, 300)',
    '  }',
    '',
    '  function bounceEffect(mesh) {',
    '    var startY = mesh.position.y',
    '    var amplitude = 0.5',
    '    var duration = 600',
    '    var start = performance.now()',
    '    function tick(now) {',
    '      var elapsed = now - start',
    '      if (elapsed > duration) { mesh.position.y = startY; return }',
    '      mesh.position.y = startY + amplitude * Math.sin((elapsed / duration) * Math.PI * 2)',
    '      requestAnimationFrame(tick)',
    '    }',
    '    requestAnimationFrame(tick)',
    '  }',
    '',
    '  function tweenTo(mesh, target, duration) {',
    '    var startPos = mesh.position.clone()',
    '    var endPos = new THREE.Vector3(target[0], target[1], target[2])',
    '    var startTime = performance.now()',
    '    function update() {',
    '      var elapsed = performance.now() - startTime',
    '      var t = Math.min(elapsed / duration, 1.0)',
    '      var ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t',
    '      mesh.position.lerpVectors(startPos, endPos, ease)',
    '      if (t < 1.0) requestAnimationFrame(update)',
    '    }',
    '    requestAnimationFrame(update)',
    '  }',
    '',
    '  // ========== auto-rotate ==========',
    '',
    '  function addAutoRotate(obj) {',
    '    autoRotateItems.push(obj)',
    '  }',
    '',
    '  function startAutoRotateLoop() {',
    '    if (autoRotateFrameId || autoRotateItems.length === 0) return',
    '    autoRotateClock = new THREE.Clock()',
    '    function loop() {',
    '      var delta = autoRotateClock.getDelta()',
    '      autoRotateItems.forEach(function(obj) {',
    '        var cfg = obj.interactions && obj.interactions.autoRotate',
    '        if (!cfg || !cfg.enabled) return',
    '        var mesh = registeredMeshes.get(obj.id)',
    '        if (!mesh) return',
    '        var speed = cfg.speed || 1',
    '        var axis = cfg.axis || \'y\'',
    '        mesh.rotation[axis] += delta * speed',
    '      })',
    '      autoRotateFrameId = requestAnimationFrame(loop)',
    '    }',
    '    loop()',
    '  }',
    '',
    '  function stopAutoRotateLoop() {',
    '    if (autoRotateFrameId) { cancelAnimationFrame(autoRotateFrameId); autoRotateFrameId = null }',
    '    autoRotateClock = null',
    '  }',
    '',
    '  return {',
    '    registerMesh,',
    '    onInteract,',
    '    addAutoRotate,',
    '    startAutoRotateLoop,',
    '    stopAutoRotateLoop,',
    '  }',
    '}',
    ''
  ].join('\n');
}

function genInteractableMesh() {
  return [
    '<template>',
    '  <TresMesh ref="meshEl"',
    '    :position="position" :rotation="rotation" :scale="scale"',
    '    @click.stop="onClick"',
    '    @pointer-enter="onEnter"',
    '    @pointer-leave="onLeave"',
    '  >',
    '    <slot />',
    '  </TresMesh>',
    '</template>',
    '',
    '<script setup>',
    'import { ref, onMounted } from \'vue\'',
    '',
    'var props = defineProps({',
    '  position: { type: Array, default: function() { return [0,0,0] } },',
    '  rotation: { type: Array, default: function() { return [0,0,0] } },',
    '  scale: { type: Array, default: function() { return [1,1,1] } },',
    '  interactions: { type: Object, default: function() { return {} } },',
    '})',
    '',
    'var emit = defineEmits([\'interact\', \'register\'])',
    'var meshEl = ref(null)',
    '',
    '// On mount, register mesh under its objId',
    'onMounted(function() {',
    '  var id = props.interactions.objId',
    '  if (id && meshEl.value) {',
    '    emit(\'register\', id, meshEl.value)',
    '  }',
    '})',
    '',
    'function onClick() {',
    '  var cfg = props.interactions.onClick',
    '  if (cfg && cfg.enabled) {',
    '    cfg.objId = props.interactions.objId',
    '    emit(\'interact\', \'click\', cfg)',
    '  }',
    '}',
    '',
    'function onEnter() {',
    '  var cfg = props.interactions.onHover',
    '  if (cfg && cfg.enabled) {',
    '    cfg.objId = props.interactions.objId',
    '    emit(\'interact\', \'hoverEnter\', cfg)',
    '  }',
    '}',
    '',
    'function onLeave() {',
    '  var cfg = props.interactions.onHover',
    '  if (cfg && cfg.enabled) {',
    '    cfg.objId = props.interactions.objId',
    '    emit(\'interact\', \'hoverLeave\', cfg)',
    '  }',
    '}',
    '</script>',
    ''
  ].join('\n');
}

function genTextSpriteRenderer() {
  return [
    '<template>',
    '  <TresSprite v-if="obj" :position="[obj.position[0], obj.position[1], obj.position[2]]" :scale="[obj.scale[0], obj.scale[1], 1]">',
    '    <TresSpriteMaterial :map="texture" :transparent="true" :depth-test="false" />',
    '  </TresSprite>',
    '</template>',
    '',
    '<script setup>',
    'import { ref, computed, onMounted, watch } from \'vue\'',
    'import * as THREE from \'three\'',
    'import { useSceneStore } from \'../../stores/sceneStore.js\'',
    '',
    'var props = defineProps({ objId: String })',
    'var sceneStore = useSceneStore()',
    'var texture = ref(null)',
    '',
    '// reactively track the store object — binding may mutate .text every frame',
    'var obj = computed(function() {',
    '  return sceneStore.objects.find(function(o) { return o.id === props.objId }) || null',
    '})',
    '',
    'function buildTexture() {',
    '  var o = obj.value',
    '  if (!o) return',
    '  var c = document.createElement(\'canvas\')',
    '  var fs = o.fontSize || 48',
    '  c.width = fs * 6',
    '  c.height = fs * 2',
    '  var ctx = c.getContext(\'2d\')',
    '  if (o.bgColor && o.bgColor !== \'transparent\') {',
    '    ctx.fillStyle = o.bgColor',
    '    ctx.fillRect(0, 0, c.width, c.height)',
    '  }',
    '  var weight = o.bold ? \'bold \' : \'\'',
    '  ctx.font = weight + fs + \'px sans-serif\'',
    '  ctx.fillStyle = o.textColor || \'#fff\'',
    '  ctx.textAlign = \'center\'',
    '  ctx.textBaseline = \'middle\'',
    '  ctx.fillText(o.text || \'?\', c.width / 2, c.height / 2)',
    '  var tex = new THREE.CanvasTexture(c)',
    '  tex.minFilter = THREE.LinearFilter',
    '  tex.magFilter = THREE.LinearFilter',
    '  texture.value = tex',
    '}',
    '',
    'onMounted(function() {',
    '  if (obj.value) buildTexture()',
    '})',
    'watch(function() { return obj.value; }, function(val) {',
    '  if (val) buildTexture()',
    '}, { deep: true })',
    '</script>',
    ''
  ].join('\n');
}

function genAnimatedModel() {
  return [
    '<template>',
    '  <TresGroup ref="groupRef" />',
    '</template>',
    '',
    '<script setup>',
    'import { shallowRef, watch, unref, onUnmounted } from \'vue\'',
    'import { useGLTF, useAnimations } from \'@tresjs/cientos\'',
    '',
    'var props = defineProps({ obj: { type: Object, required: true } })',
    '',
    'var groupRef = shallowRef(null)',
    'var sceneRef = shallowRef(null)',
    'var animsRef = shallowRef([])',
    'var { actions } = useAnimations(animsRef, sceneRef)',
    '',
    'async function load() {',
    '  try {',
    '    var result = await useGLTF(props.obj.url, { draco: true })',
    '    var scene = unref(result.scene) || unref(result.scenes)?.[0] || unref(result.state)?.scene || result',
    '    var anims = unref(result.animations) || unref(result.state)?.animations || []',
    '',
    '    if (scene) {',
    '      sceneRef.value = scene',
    '      if (groupRef.value) groupRef.value.add(scene)',
    '      else {',
    '        var stop = watch(groupRef, function(g) { if (g) { g.add(scene); stop() } })',
    '      }',
    '    }',
    '    if (anims.length) animsRef.value = anims',
    '  } catch (e) { console.error(\'Model load error:\', e) }',
    '}',
    '',
    'load()',
    '',
    'watch(function() { return props.obj.activeAnimation }, function(name) {',
    '  if (!actions) return',
    '  Object.values(actions).forEach(function(a) { if (a && a.stop) a.stop() })',
    '  if (name && actions[name]) actions[name].play()',
    '})',
    '',
    'onUnmounted(function() {',
    '  if (groupRef.value && sceneRef.value) groupRef.value.remove(sceneRef.value)',
    '})',
    '</script>',
    ''
  ].join('\n');
}

// ================================================================
//  MODE 3: npm-package
// ================================================================

export function generateNpmPackage(objects, projectName) {
  var name = sanitizeName(projectName, 'tresjs-scene');
  var files = {};
  var scaffold = generateProjectScaffold(objects, name);
  Object.assign(files, scaffold);

  files['README.md'] = [
    '# ' + name,
    '',
    'Generated 3D scene — Vue 3 + TresJS.',
    '',
    '## Quick start',
    '```bash',
    'npm install',
    'npm run dev',
    '```',
    '',
    '## Use as a library',
    '```js',
    'import { SceneApp } from \'' + name + '\'',
    '```',
    ''
  ].join('\n');

  files['src/index.js'] = [
    'export { default as SceneApp } from \'./App.vue\'',
    'export { useSceneStore } from \'./stores/sceneStore.js\'',
    'export { useNavigation } from \'./composables/useNavigation.js\'',
    'export { useDataBinding } from \'./composables/useDataBinding.js\'',
    'export { default as SceneCanvas } from \'./components/scene/SceneCanvas.vue\'',
    ''
  ].join('\n');

  var pkg = JSON.parse(files['package.json']);
  pkg.name = name;
  pkg.private = false;
  pkg.license = 'MIT';
  pkg.main = 'src/index.js';
  pkg.exports = { '.': './src/index.js' };
  pkg.files = ['src', 'index.html', 'vite.config.js'];
  files['package.json'] = JSON.stringify(pkg, null, 2);

  return files;
}

// ================================================================
//  MODE 4: web-component — standalone HTML
// ================================================================

export function generateWebComponent(objects, projectName) {
  var sceneName = projectName || 'TresJS Scene';
  var hasLathe = objects.some(function(o) { return o.type === 'Lathe'; });

  var cleanObjs = objects.map(function(o) {
    var c = { type: o.type, position: o.position, rotation: o.rotation, scale: o.scale, color: o.color, visible: o.visible !== false };
    if (o.type === 'TextSprite') { c.text = o.text; c.fontSize = o.fontSize; c.textColor = o.textColor; c.bgColor = o.bgColor; c.bold = o.bold; }
    if (o.type === 'Model') { c.url = o.url; c.activeAnimation = o.activeAnimation; }
    return c;
  });

  var templateLines = [];
  objects.forEach(function(o) {
    var clr = (o.color || '#3b82f6');
    var p = o.position.join(',');
    var r = o.rotation.join(',');
    var s = o.scale.join(',');
    switch (o.type) {
      case 'Box':
        templateLines.push('        <TresMesh :position="[' + p + ']" :rotation="[' + r + ']" :scale="[' + s + ']">');
        templateLines.push('          <TresBoxGeometry :args="[1,1,1]" />');
        templateLines.push('          <TresMeshStandardMaterial color="' + clr + '" />');
        templateLines.push('        </TresMesh>');
        break;
      case 'Sphere':
        templateLines.push('        <TresMesh :position="[' + p + ']" :rotation="[' + r + ']" :scale="[' + s + ']">');
        templateLines.push('          <TresSphereGeometry :args="[0.5,32,32]" />');
        templateLines.push('          <TresMeshStandardMaterial color="' + clr + '" />');
        templateLines.push('        </TresMesh>');
        break;
      case 'Cylinder':
        templateLines.push('        <TresMesh :position="[' + p + ']" :rotation="[' + r + ']" :scale="[' + s + ']">');
        templateLines.push('          <TresCylinderGeometry :args="[0.5,0.5,1,32]" />');
        templateLines.push('          <TresMeshStandardMaterial color="' + clr + '" />');
        templateLines.push('        </TresMesh>');
        break;
      case 'Cone':
        templateLines.push('        <TresMesh :position="[' + p + ']" :rotation="[' + r + ']" :scale="[' + s + ']">');
        templateLines.push('          <TresConeGeometry :args="[0.5,1,32]" />');
        templateLines.push('          <TresMeshStandardMaterial color="' + clr + '" />');
        templateLines.push('        </TresMesh>');
        break;
      case 'Plane':
        templateLines.push('        <TresMesh :position="[' + p + ']" :rotation="[' + r + ']" :scale="[' + s + ']">');
        templateLines.push('          <TresPlaneGeometry :args="[5,5]" />');
        templateLines.push('          <TresMeshStandardMaterial color="' + clr + '" :side="2" />');
        templateLines.push('        </TresMesh>');
        break;
      case 'Torus':
        templateLines.push('        <TresMesh :position="[' + p + ']" :rotation="[' + r + ']" :scale="[' + s + ']">');
        templateLines.push('          <TresTorusGeometry :args="[0.5,0.2,16,32]" />');
        templateLines.push('          <TresMeshStandardMaterial color="' + clr + '" />');
        templateLines.push('        </TresMesh>');
        break;
      case 'Ring':
        templateLines.push('        <TresMesh :position="[' + p + ']" :rotation="[' + r + ']" :scale="[' + s + ']">');
        templateLines.push('          <TresRingGeometry :args="[0.3,0.6,32]" />');
        templateLines.push('          <TresMeshStandardMaterial color="' + clr + '" :side="2" />');
        templateLines.push('        </TresMesh>');
        break;
      case 'Icosahedron':
        templateLines.push('        <TresMesh :position="[' + p + ']" :rotation="[' + r + ']" :scale="[' + s + ']">');
        templateLines.push('          <TresIcosahedronGeometry :args="[0.7,0]" />');
        templateLines.push('          <TresMeshStandardMaterial color="' + clr + '" :flat-shading="true" />');
        templateLines.push('        </TresMesh>');
        break;
      case 'Octahedron':
        templateLines.push('        <TresMesh :position="[' + p + ']" :rotation="[' + r + ']" :scale="[' + s + ']">');
        templateLines.push('          <TresOctahedronGeometry :args="[0.7,0]" />');
        templateLines.push('          <TresMeshStandardMaterial color="' + clr + '" :flat-shading="true" />');
        templateLines.push('        </TresMesh>');
        break;
      case 'Tetrahedron':
        templateLines.push('        <TresMesh :position="[' + p + ']" :rotation="[' + r + ']" :scale="[' + s + ']">');
        templateLines.push('          <TresTetrahedronGeometry :args="[0.7,0]" />');
        templateLines.push('          <TresMeshStandardMaterial color="' + clr + '" :flat-shading="true" />');
        templateLines.push('        </TresMesh>');
        break;
      case 'Dodecahedron':
        templateLines.push('        <TresMesh :position="[' + p + ']" :rotation="[' + r + ']" :scale="[' + s + ']">');
        templateLines.push('          <TresDodecahedronGeometry :args="[0.7,0]" />');
        templateLines.push('          <TresMeshStandardMaterial color="' + clr + '" :flat-shading="true" />');
        templateLines.push('        </TresMesh>');
        break;
      case 'Lathe':
        templateLines.push('        <TresMesh :position="[' + p + ']" :rotation="[' + r + ']" :scale="[' + s + ']">');
        templateLines.push('          <TresLatheGeometry :args="latheArgs" />');
        templateLines.push('          <TresMeshStandardMaterial color="' + clr + '" />');
        templateLines.push('        </TresMesh>');
        break;
      case 'DirectionalLight':
        templateLines.push('        <TresGroup :position="[' + p + ']" :rotation="[' + r + ']">');
        templateLines.push('          <TresDirectionalLight :intensity="2" color="' + clr + '" />');
        templateLines.push('        </TresGroup>');
        break;
      case 'PointLight':
        templateLines.push('        <TresGroup :position="[' + p + ']">');
        templateLines.push('          <TresPointLight :intensity="10" color="' + clr + '" />');
        templateLines.push('        </TresGroup>');
        break;
      case 'SpotLight':
        templateLines.push('        <TresGroup :position="[' + p + ']" :rotation="[' + r + ']">');
        templateLines.push('          <TresSpotLight :intensity="10" color="' + clr + '" :angle="0.5" :penumbra="0.3" />');
        templateLines.push('        </TresGroup>');
        break;
      case 'HemisphereLight':
        templateLines.push('        <TresGroup :position="[' + p + ']">');
        templateLines.push('          <TresHemisphereLight :intensity="2" color="' + clr + '" ground-color="#444444" />');
        templateLines.push('        </TresGroup>');
        break;
    }
  });

  var templateContent = templateLines.join('\n');

  return [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <title>' + sceneName + '</title>',
    '  <style>',
    '    * { margin: 0; padding: 0; box-sizing: border-box; }',
    '    html, body, #app { width: 100%; height: 100%; overflow: hidden; }',
    '  </style>',
    '</head>',
    '<body>',
    '  <div id="app"></div>',
    '',
    '  <script type="importmap">',
    '  {',
    '    "imports": {',
    '      "vue": "https://cdn.jsdelivr.net/npm/vue@3.5.38/dist/vue.esm-browser.js",',
    '      "three": "https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js",',
    '      "@tresjs/core": "https://cdn.jsdelivr.net/npm/@tresjs/core@5.7.0/dist/tres.js",',
    '      "@tresjs/cientos": "https://cdn.jsdelivr.net/npm/@tresjs/cientos@5.7.0/dist/trescientos.js"',
    '    }',
    '  }',
    '  </script>',
    '',
    '  <script type="module">',
    '  import { createApp } from "vue"',
    '  import Tres, { TresCanvas } from "@tresjs/core"',
    '  import { OrbitControls } from "@tresjs/cientos"',
    '  import * as THREE from "three"',
    '',
    '  var app = createApp({',
    '    template: `',
    '      <div style="width:100%;height:100%">',
    '        <TresCanvas clear-color="#18181a" window-size>',
    '          <TresPerspectiveCamera :position="[5,5,5]" :look-at="[0,0,0]" />',
    '          <OrbitControls make-default />',
    '          <TresAmbientLight :intensity="0.8" />',
    '          <TresGridHelper :args="[20,20,\'#3f3f46\',\'#27272a\']" />',
    templateContent,
    '        </TresCanvas>',
    '      </div>',
    '    `',
    '  })',
    '',
    '  app.component("OrbitControls", OrbitControls)',
    '',
    '  app.config.compilerOptions.isCustomElement = function(tag) {',
    '    return /^Tres[A-Z]/.test(tag) || tag.startsWith("tres-")',
    '  }',
    '',
    '  app.use(Tres)',
    '',
    '  app.mount("#app")',
    '  </script>',
    '</body>',
    '</html>',
    ''
  ].join('\n');
}

// ================================================================
//  entry: dispatch by mode
// ================================================================

/**
 * @param {Array} objects   scene objects
 * @param {string} mode     'project-scaffold' | 'vue-sfc' | 'npm-package' | 'web-component'
 * @param {string} name     optional project name
 * @returns {string|Object}  string for vue-sfc / web-component; { [path]: content } for project-scaffold / npm-package
 */
export function generateCode(objects, mode, name) {
  switch (mode) {
    case 'vue-sfc':
      return generateVueTemplate(objects);
    case 'project-scaffold':
      return generateProjectScaffold(objects, name);
    case 'npm-package':
      return generateNpmPackage(objects, name);
    case 'web-component':
      return generateWebComponent(objects, name);
    default:
      return generateVueTemplate(objects);
  }
}

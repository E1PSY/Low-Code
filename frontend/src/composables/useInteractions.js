import { onScopeDispose, watch } from 'vue';
import { Box3, Vector3 } from 'three';
import { useSceneStore } from '../stores/sceneStore.js';
import { resolveObject3D } from '../utils/threeHelpers.js';

export function useInteractions(interactionApi, scheduler) {
  const sceneStore = useSceneStore()
  let stopRotation, stopTweens
  let tweens = []
  const timers = new Set()
  function addTween(tween) {
    tweens.push(tween)
    if (!stopTweens) stopTweens = scheduler.subscribe(delta => {
      tweens = tweens.filter(t => { if (!t.update(delta, t)) return true; t.onComplete?.(); return false })
      if (!tweens.length) { stopTweens?.(); stopTweens = null }
    })
  }
  let stopWatching
  function startAutoRotateLoop() {
    if (stopWatching) return
    stopWatching = watch(() => sceneStore.runtimeObjects.filter(obj => obj.interactions?.autoRotate?.enabled), items => {
      stopRotation?.(); stopRotation = null
      if (items.length) stopRotation = scheduler.subscribe(delta => {
        items.forEach(obj => {
          const mesh = getMesh(obj), config = obj.interactions.autoRotate
          if (mesh) mesh.rotation[config.axis || 'y'] += delta * (config.speed ?? 1)
        })
      })
    }, { immediate: true })
  }
  function stopAutoRotateLoop() {
    stopWatching?.(); stopWatching = null; stopRotation?.(); stopRotation = null
    stopTweens?.(); stopTweens = null; tweens = []
    for (const timer of timers) clearTimeout(timer)
    timers.clear()
  }

  function getMesh(obj) { return resolveObject3D(sceneStore.objectRefs.get(obj.id)); }

  function getAllMeshes(obj) {
    var root = resolveObject3D(sceneStore.objectRefs.get(obj.id));
    if (!root) return [];
    if (root.isGroup && root.children && root.children.length > 0) { var meshes = []; root.traverse(function(n) { if (n.isMesh || n.isSprite) meshes.push(n); }); return meshes; }
    if (root.isMesh || root.isSprite) return [root];
    return [];
  }

  function handleObjectClick(obj) {
    var config = obj.interactions && obj.interactions.onClick;
    if (!config || !config.enabled || config.action === 'none') return;
    var mesh = getMesh(obj);
    if (!mesh) return;
    var meshes = getAllMeshes(obj);
    if (!meshes.length) meshes = [mesh];
    switch (config.action) {
      case 'highlight': meshes.forEach(m => highlightFlash(m, config.highlightColor || '#ffff00')); break;
      case 'changeColor':
        meshes.forEach(m => { var mat = resolveMaterial(m); if (config.targetColor && mat?.color) mat.color.set(config.targetColor); });
        if (config.targetColor) {
          obj.color = config.targetColor;
          if (obj.type === 'CompositeGroup') obj.meta.childrenResolved.forEach(child => { child.color = config.targetColor; });
        }
        break;
      case 'bounce': bounceEffect(mesh); break;
      case 'toggleVisible': mesh.visible = !mesh.visible; obj.visible = mesh.visible; break;
      case 'wireframe': meshes.forEach(m => { var mat = resolveMaterial(m); if (mat && mat.wireframe !== undefined) mat.wireframe = !mat.wireframe; }); break;
      case 'moveTo': var pos = config.moveToPosition || [0, 1, 0]; tweenPosition(mesh, obj, pos[0], pos[1], pos[2], config.tweenDuration || 1000); break;
      case 'animate': if (config.animationName && obj.activeAnimation !== undefined) obj.activeAnimation = config.animationName; break;
      case 'focusCamera': focusCameraOn(mesh); break;
    }
  }

  function handleObjectHoverEnter(obj) {
    var config = obj.interactions && obj.interactions.onHover;
    if (!config || !config.enabled || config.action === 'none') return;
    var meshes = ['scaleUp', 'rotate'].includes(config.action) ? [getMesh(obj)].filter(Boolean) : getAllMeshes(obj);
    if (meshes.length === 0) return;
    meshes.forEach(function(mesh) {
      var mat = resolveMaterial(mesh);
      switch (config.action) {
        case 'highlight': if (mat && mat.color) { mesh._savedColor = mat.color.getHex(); mat.color.set(config.highlightColor || '#00ff88'); } break;
        case 'scaleUp': { var mul = config.scaleMultiplier || 1.15; mesh._savedScale = mesh.scale.clone(); mesh.scale.multiplyScalar(mul); } break;
        case 'rotate': { mesh._savedRotation = mesh.rotation.clone(); mesh.rotation.y += Math.PI * 0.25; } break;
        case 'wireframe': if (mat && mat.wireframe === false) { mesh._wasWireframe = false; mat.wireframe = true; } break;
        case 'emissive': if (mat && mat.emissive) { mesh._savedEmissive = mat.emissive.getHex(); mat.emissive.set(config.highlightColor || '#555555'); } break;
      }
    });
  }

  function handleObjectHoverLeave(obj) {
    var config = obj.interactions && obj.interactions.onHover;
    if (!config || !config.enabled || config.action === 'none') return;
    var meshes = ['scaleUp', 'rotate'].includes(config.action) ? [getMesh(obj)].filter(Boolean) : getAllMeshes(obj);
    if (meshes.length === 0) return;
    meshes.forEach(function(mesh) {
      var mat = resolveMaterial(mesh);
      switch (config.action) {
        case 'highlight': if (mat && mat.color && mesh._savedColor !== undefined) { mat.color.set(mesh._savedColor); delete mesh._savedColor; } break;
        case 'scaleUp': if (mesh._savedScale) { mesh.scale.copy(mesh._savedScale); delete mesh._savedScale; } break;
        case 'rotate': if (mesh._savedRotation) { mesh.rotation.copy(mesh._savedRotation); delete mesh._savedRotation; } break;
        case 'wireframe': if (mat && mesh._wasWireframe === false) { mat.wireframe = false; delete mesh._wasWireframe; } break;
        case 'emissive': if (mat && mat.emissive && mesh._savedEmissive !== undefined) { mat.emissive.set(mesh._savedEmissive); delete mesh._savedEmissive; } break;
      }
    });
  }

  function resolveMaterial(mesh) { if (!mesh) return null; return Array.isArray(mesh.material) ? mesh.material[0] : mesh.material; }

  function highlightFlash(mesh, colorHex) {
    var mat = resolveMaterial(mesh);
    if (!mat || !mat.color) return;
    var original = mat.color.getHex();
    mat.color.set(colorHex);
    const timer = setTimeout(function() { timers.delete(timer); if (mat && mat.color) mat.color.set(original); }, 300); timers.add(timer);
  }

  function bounceEffect(mesh) {
    const startY = mesh.position.y
    let elapsed = 0
    addTween({ update(delta) { elapsed += delta; mesh.position.y = elapsed >= 0.6 ? startY : startY + 0.5 * Math.sin(elapsed / 0.6 * Math.PI * 2); return elapsed >= 0.6 } })
  }

  function tweenPosition(mesh, obj, tx, ty, tz, duration) {
    var startPos = mesh.position.clone();
    var targetPos = { x: tx !== undefined ? tx : obj.position[0], y: ty !== undefined ? ty : obj.position[1], z: tz !== undefined ? tz : obj.position[2] };
    var elapsed = 0;
    addTween({
      update: function(delta, self) {
        elapsed += delta * 1000;
        var t = Math.min(elapsed / duration, 1.0);
        var ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        mesh.position.set(startPos.x + (targetPos.x - startPos.x) * ease, startPos.y + (targetPos.y - startPos.y) * ease, startPos.z + (targetPos.z - startPos.z) * ease);
        return t >= 1.0;
      },
      onComplete: function() {
        obj.position = [Number(mesh.position.x.toFixed(3)), Number(mesh.position.y.toFixed(3)), Number(mesh.position.z.toFixed(3))];
      }
    });
  }

  function focusCameraOn(mesh) {
    if (!interactionApi || !interactionApi.value || !interactionApi.value.camera) return;
    {
      try {
        var api = interactionApi.value;
        var camera = api.camera.value || api.camera;
        if (!camera) return;
        var box = new Box3().setFromObject(mesh);
        var center = new Vector3(); box.getCenter(center);
        var size = box.getSize(new Vector3());
        var maxDim = Math.max(size.x, size.y, size.z);
        var dist = maxDim * 3;
        var targetCamPos = center.clone().add(new Vector3(dist * 0.6, dist * 0.4, dist));
        var targetLookAt = center.clone();
        var startPos = camera.position.clone();
        var elapsed = 0;
        var dur = 1200;
        addTween({
          update: function(delta) {
            elapsed += delta * 1000;
            var t = Math.min(elapsed / dur, 1.0);
            var ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            camera.position.lerpVectors(startPos, targetCamPos, ease);
            const controls = api.controls?.value || api.controls
            controls?.target?.copy(targetLookAt)
            camera.lookAt(targetLookAt);
            return t >= 1.0;
          }
        });
      } catch (e) { console.error('focus error', e); }
    }
  }

  onScopeDispose(stopAutoRotateLoop);

  return {
    startAutoRotateLoop: startAutoRotateLoop,
    stopAutoRotateLoop: stopAutoRotateLoop,
    handleObjectClick: handleObjectClick,
    handleObjectHoverEnter: handleObjectHoverEnter,
    handleObjectHoverLeave: handleObjectHoverLeave,
  };
}

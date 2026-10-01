import { useEditorStore } from '../stores/editorStore.js';
import { useSceneStore } from '../stores/sceneStore.js';

var dragPayload = null;

export function useDragDrop() {
  var editorStore = useEditorStore();
  var sceneStore = useSceneStore();

  function onDragStart(event, component) {
    sceneStore.syncTransform();
    editorStore.setDragging(true);
    dragPayload = component;
    event.dataTransfer.setData('text/plain', JSON.stringify({ type: component.type, name: component.name }));
    event.dataTransfer.effectAllowed = 'copy';
  }

  function onDragEnd() {
    editorStore.setDragging(false);
    editorStore.setDragOver(false);
    dragPayload = null;
  }

  function onDrop(event) {
    event.preventDefault();
    editorStore.setDragging(false);
    editorStore.setDragOver(false);
    try {
      var rawData = event.dataTransfer.getData('text/plain');
      if (!rawData) { return; }
      var comp = dragPayload || JSON.parse(rawData);
      var meta = null;
      if (comp.meta) {
        meta = { params: JSON.parse(JSON.stringify(comp.meta.params)), children: comp.meta.children };
      }
      sceneStore.addObject(comp.type, comp.name, { meta: meta });
      dragPayload = null;
    } catch (err) {
      console.error('drop error', err);
      dragPayload = null;
    }
  }

  return { onDragStart: onDragStart, onDragEnd: onDragEnd, onDrop: onDrop };
}

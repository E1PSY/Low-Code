export function createHistory(initial, limit = 100, byteLimit = 16 * 1024 * 1024) {
  let entries = [initial], cursor = 0
  return {
    commit(value) {
      if (value === entries[cursor]) return false
      entries.splice(cursor + 1); entries.push(value); cursor++
      while (entries.length > 1 && (entries.length > limit + 1 || entries.reduce((n, s) => n + s.length * 2, 0) > byteLimit)) { entries.shift(); cursor-- }
      return true
    },
    undo() { if (cursor > 0) return entries[--cursor] },
    redo() { if (cursor < entries.length - 1) return entries[++cursor] },
    get canUndo() { return cursor > 0 }, get canRedo() { return cursor < entries.length - 1 },
  }
}

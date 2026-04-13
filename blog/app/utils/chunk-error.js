const trackedChunkErrors = new WeakSet()

const isObjectLike = value => {
  return Boolean(value) && ['object', 'function'].includes(typeof value)
}

const collectErrorChain = error => {
  const errors = []
  const queue = [error]
  const visited = new Set()

  while (queue.length > 0) {
    const current = queue.shift()

    if (!current || visited.has(current)) {
      continue
    }

    if (!isObjectLike(current)) {
      continue
    }

    visited.add(current)
    errors.push(current)

    if (current.cause) {
      queue.push(current.cause)
    }
  }

  return errors
}

export const trackChunkAssetError = error => {
  for (const current of collectErrorChain(error)) {
    trackedChunkErrors.add(current)
  }
}

export const isChunkAssetError = error => {
  return collectErrorChain(error).some(current =>
    trackedChunkErrors.has(current)
  )
}

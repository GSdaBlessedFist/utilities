// 2026-01-17 23:59
/**
 * Usage:
 * node jsonSkeleton.js <input-json-path> <output-js-path>
 */

const fs = require('fs')
const path = require('path')

const inputPath = process.argv[2] || '../db.json'
const outputPath = process.argv[3] || './emptyStates.js'

const absInputPath = path.resolve(inputPath)
const absOutputPath = path.resolve(outputPath)

const raw = fs.readFileSync(absInputPath, 'utf-8')
const data = JSON.parse(raw)

/**
 * Recursively generate skeleton
 */
function emptyify(value, indent = 2) {
  const space = ' '.repeat(indent)

  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const skeletonObj = emptyify(value[0], indent + 2)
      return `[\n${space}${skeletonObj}\n${' '.repeat(indent - 2)}]`
    }
    return '[]'
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([key, val], i, arr) => {
        const emptyVal = emptyify(val, indent + 2)
        const comma = i < arr.length - 1 ? ',' : ''
        return `${space}${key}: ${emptyVal}${comma}`
      })
      .join('\n')
    return `{\n${entries}\n${' '.repeat(indent - 2)}}`
  }

  if (typeof value === 'number') return '0'
  if (typeof value === 'string') return "''"
  if (typeof value === 'boolean') return 'false'
  return 'null'
}

// Generate skeletons for all top-level keys
let output = `// AUTO-GENERATED skeletons for ${path.basename(inputPath)}\n\n`

for (const key in data) {
  const exportName = 'EMPTY_' + key.replace(/[^\w]/g, '_').toUpperCase()
  const skeleton = emptyify(data[key])
  output += `export const ${exportName} = ${skeleton};\n\n`
}

fs.writeFileSync(absOutputPath, output, 'utf-8')
console.log(`✅ Skeletons generated: ${absOutputPath}`)

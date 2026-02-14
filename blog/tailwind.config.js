import defaultTheme from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'

// Wikimoe brand colors — used as the primary palette
const wikimoe = {
  50: '#fef1f3',
  100: '#fce8eb',
  200: '#f9d2db',
  300: '#f4aebe',
  400: '#ef8fa7',
  500: '#e9819d',
  600: '#d85f85',
  700: '#d4356a',
  800: '#bf2b64',
  900: '#a72a5e',
  950: '#75153a'
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r} ${g} ${b}`
}

export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wikimoe,
        primary: wikimoe
      }
    },
    fontFamily: {
      sans: [],
      serif: [],
      mono: []
    }
  },
  plugins: [
    plugin(function ({ addBase, theme }) {
      const colors = theme('colors')
      const variables = {}

      const targets = ['primary', 'gray']

      targets.forEach(colorName => {
        const colorScale = colors[colorName]
        if (colorScale && typeof colorScale === 'object') {
          for (const [key, value] of Object.entries(colorScale)) {
            if (typeof value === 'string' && value.startsWith('#')) {
              variables[`--color-${colorName}-${key}`] = hexToRgb(value)
            }
          }
          // 添加 --color-primary-DEFAULT: var(--color-primary-500);
          variables[`--color-${colorName}-DEFAULT`] =
            `var(--color-${colorName}-500)`
        }
      })

      addBase({
        ':root': variables,
        '.dark': {
          '--color-primary-DEFAULT': 'var(--color-primary-400)'
        }
      })

      addBase({
        '.text-primary': {
          '--tw-text-opacity': '1',
          color: 'rgb(var(--color-primary-DEFAULT) / var(--tw-text-opacity, 1))'
        },
        '.bg-primary': {
          '--tw-bg-opacity': '1',
          backgroundColor:
            'rgb(var(--color-primary-DEFAULT) / var(--tw-bg-opacity, 1))'
        }
      })
    })
  ]
}

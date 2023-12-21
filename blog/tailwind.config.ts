import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        wikimoe: {
          50: '#fef2f4',
          100: '#fce7ea',
          200: '#f9d2db',
          300: '#f4adbd',
          400: '#ef90a7',
          500: '#e15278',
          600: '#cd3162',
          700: '#ac2452',
          800: '#90214b',
          900: '#7c1f45',
          950: '#450c22',
        },
      },
    },
  },
}

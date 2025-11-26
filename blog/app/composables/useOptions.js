import { getOptionsApi } from '~/api/option'

export function useOptions() {
  const options = useState('options', () => null)

  async function getOptions() {
    await getOptionsApi().then(res => {
      options.value = res.data.value.data
    })
  }

  return { options, getOptions }
}

import { proxyLanguageSeoRequest } from '../../utils/languageSeo'

export default defineEventHandler(event => {
  return proxyLanguageSeoRequest(event)
})

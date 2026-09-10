const PUBLIC_CACHE_PREFIX = '/cache:lecard/public'

export async function invalidatePublicContentCache() {
  await useStorage().clear(PUBLIC_CACHE_PREFIX)
}

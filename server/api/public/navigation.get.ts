export default defineEventHandler(async () => {
  const navigation = await getPublicNavigation()
  const space = navigation[0] ?? { id: 0, name: 'Lecard Ajuda', slug: 'ajuda', description: null, sections: [] }
  return { space, sections: space.sections, navigation }
})

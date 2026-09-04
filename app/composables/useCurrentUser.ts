export interface CurrentUser { id: number; name: string; email: string; role: 'ADMIN' | 'EDITOR' }

export async function useCurrentUser() {
  const user = useState<CurrentUser | null>('current-user', () => null)
  if (!user.value) {
    const result = await useFetch<{ user: CurrentUser | null }>('/api/auth/me')
    user.value = result.data.value?.user ?? null
  }
  return { user }
}

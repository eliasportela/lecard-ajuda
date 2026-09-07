export interface CurrentUser { id: number; name: string; email: string; role: 'ADMIN' | 'EDITOR' }

export async function useCurrentUser() {
  const user = useState<CurrentUser | null>('current-user', () => null)
  const initialized = useState('current-user-initialized', () => false)

  if (!initialized.value) {
    const requestFetch = useRequestFetch()
    const result = await requestFetch<{ user: CurrentUser | null }>('/api/auth/me')
    user.value = result.user
    initialized.value = true
  }

  return { user, initialized }
}

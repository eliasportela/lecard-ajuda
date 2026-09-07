export interface AppToast { id: number; message: string; type: 'success' | 'error' }

export function useAppToast() {
  const toast = useState<AppToast | null>('app-toast', () => null)
  function showToast(message: string, type: AppToast['type'] = 'success') {
    toast.value = { id: Date.now(), message, type }
  }
  function closeToast() { toast.value = null }
  return { toast, showToast, closeToast }
}

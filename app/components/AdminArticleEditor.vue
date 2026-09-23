<template>
  <form ref="formElement" class="article-editor-layout" @submit.prevent>
    <aside class="article-editor-sidebar">
      <div class="article-editor-actions">
        <button class="article-editor-back" type="button" aria-label="Voltar para Artigos" @click="goBack"><ArrowLeft /></button>
        <a class="btn btn--secondary" :class="{ 'is-disabled': !canPreview }" :href="canPreview ? previewUrl : undefined" target="_blank" rel="noopener noreferrer" :aria-disabled="!canPreview" @click="preventDisabledPreview"><Eye /> Visualizar</a>
        <button class="btn article-editor-save" :class="{ 'is-saving': isSaving }" type="button" :disabled="isSaving" @click="submit"><LoaderCircle v-if="isSaving" class="article-editor-save__spinner" /><Save v-else /> {{ isSaving ? 'Salvando...' : 'Salvar' }}</button>
      </div>
      <div class="article-editor-tabs"><button :class="{ 'is-active': activeTab === 'document' }" type="button" @click="activeTab = 'document'"><FileText /> Documento</button><button :class="{ 'is-active': activeTab === 'blocks' }" type="button" @click="activeTab = 'blocks'"><Blocks /> Blocos</button></div>
      <div v-if="activeTab === 'document'" class="article-editor-settings">
        <div class="article-editor-setting-head"><FileText /><span><strong>Propriedades</strong><small>Configurações do artigo</small></span></div>
        <label class="editor-field">Slug<div class="editor-control"><Link2 /><input v-model="model.slug" required pattern="[a-z0-9-]+" placeholder="slug-do-artigo"></div></label>
        <label class="editor-field">Status<div class="editor-control"><span class="editor-status-dot" :class="`is-${model.status.toLowerCase()}`"></span><select v-model="model.status"><option value="DRAFT">Rascunho</option><option value="PUBLISHED">Publicado</option><option v-if="allowArchived" value="ARCHIVED">Arquivado</option></select></div></label>
        <label class="editor-field">Categoria<div class="editor-control"><Folder /><select ref="categoryElement" v-model.number="model.sectionId" required @change="validateCategory"><option disabled :value="0">Selecione uma categoria</option><option v-for="category in categories" :key="category.id" :value="category.id">{{ category.title }}</option></select></div></label>
        <label v-if="canChangeAuthor" class="editor-field">Autor<div class="editor-control"><UserRound /><select v-model.number="model.authorId" required><option v-for="author in authors" :key="author.id" :value="author.id" :disabled="!author.active && author.id !== model.authorId">{{ author.name }}{{ author.active ? '' : ' (inativo)' }}</option></select></div></label>
      </div>
      <div v-else class="article-editor-settings article-blocks-panel">
        <div class="article-editor-setting-head"><Blocks /><span><strong>Blocos de conteúdo</strong><small>Insira no ponto atual do artigo</small></span></div>
        <div class="article-blocks-grid">
          <button type="button" @click="insertBlock('\nNovo parágrafo\n')"><Pilcrow /><span><strong>Texto</strong><small>Parágrafo simples</small></span></button>
          <details class="article-block-group">
            <summary><Heading2 /><span><strong>Título</strong><small>Escolha o nível</small></span><ChevronDown /></summary>
            <div class="article-block-group__options"><button type="button" @click="insertBlock('\n# Título principal\n')">Título 1 <small>H1</small></button><button type="button" @click="insertBlock('\n## Nova seção\n')">Título 2 <small>H2</small></button><button type="button" @click="insertBlock('\n### Nova subseção\n')">Título 3 <small>H3</small></button></div>
          </details>
          <details class="article-block-group">
            <summary><List /><span><strong>Lista</strong><small>Escolha o formato</small></span><ChevronDown /></summary>
            <div class="article-block-group__options"><button type="button" @click="insertBlock('\n- Primeiro item\n- Segundo item\n')">Marcadores</button><button type="button" @click="insertBlock('\n1. Primeiro item\n2. Segundo item\n')">Numerada</button><button type="button" @click="insertBlock('\n- [ ] Nova tarefa\n- [ ] Outra tarefa\n')">Tarefas</button></div>
          </details>
          <button type="button" @click="insertBlock('\n> Escreva uma citação\n')"><Quote /><span><strong>Citação</strong><small>Trecho destacado</small></span></button>
          <details class="article-block-group">
            <summary><ImageIcon /><span><strong>Mídia</strong><small>Imagem ou YouTube</small></span><ChevronDown /></summary>
            <div class="article-block-group__options">
              <button type="button" @click="openMediaModal('image')"><ImageIcon /> Imagem</button>
              <button type="button" @click="openMediaModal('video')"><Video /> Vídeo do YouTube</button>
            </div>
          </details>
          <button type="button" @click="insertBlock('\n---\n')"><Minus /><span><strong>Divisor</strong><small>Linha horizontal</small></span></button>
          <button type="button" @click="insertBlock('\n```\nInsira o código aqui\n```\n')"><Code2 /><span><strong>Código</strong><small>Bloco de código</small></span></button>
        </div>
      </div>
    </aside>
    <main class="article-editor-canvas">
      <div class="article-editor-document">
        <textarea ref="titleElement" v-model="model.title" class="article-editor-title" required maxlength="200" rows="1" placeholder="Título do artigo" @input="handleTitleInput" @keydown.enter.prevent></textarea>
        <textarea ref="summaryElement" v-model="model.summary" class="article-editor-subtitle" maxlength="1000" rows="1" placeholder="Adicione um resumo do artigo" @input="resizeSummary"></textarea>
        <MarkdownEditor ref="markdownEditor" v-model="model.markdown" :article-id="articleId" @attachment-uploaded="$emit('attachment-uploaded', $event)" @request-image="openMediaModal('image')" @request-youtube="openMediaModal('video')" />
      </div>
    </main>
  </form>
  <AppConfirmDialog
    :open="leaveConfirmationOpen"
    variant="warning"
    title="Alterações não salvas"
    description="Existem alterações que ainda não foram salvas. Deseja sair mesmo assim?"
    confirm-label="Sair sem salvar"
    @cancel="leaveConfirmationOpen = false"
    @confirm="confirmLeave"
  />
  <AppConfirmDialog
    :open="Boolean(mediaDeleteTarget)"
    title="Excluir imagem"
    :description="mediaDeleteTarget ? `A imagem “${mediaDeleteTarget.originalName}” será removida permanentemente da biblioteca e do armazenamento. Esta ação não pode ser desfeita.` : ''"
    :loading="Boolean(mediaDeletingId)"
    :error="mediaDeleteError"
    confirm-label="Excluir imagem"
    @cancel="cancelDeleteMedia"
    @confirm="confirmDeleteMedia"
  />
  <Teleport to="body">
    <Transition name="confirm-dialog">
      <div v-if="mediaModal" class="confirm-dialog" role="presentation" @click.self="closeMediaModal">
        <section class="confirm-dialog__panel article-media-dialog" :class="{ 'article-media-dialog--library': mediaModal === 'image' && mediaView === 'library' }" role="dialog" aria-modal="true">
          <button class="article-media-dialog__close" type="button" aria-label="Fechar" @click="closeMediaModal"><X /></button>
          <div class="confirm-dialog__icon"><ImageIcon v-if="mediaModal === 'image'" /><Video v-else /></div>
          <h2>{{ mediaModal === 'image' ? (mediaView === 'library' ? 'Biblioteca de imagens' : 'Inserir imagem') : 'Inserir vídeo do YouTube' }}</h2>
          <p>{{ mediaModal === 'image' ? (mediaView === 'library' ? 'Escolha uma imagem já enviada para inserir no artigo.' : 'Envie um arquivo, escolha na biblioteca ou cole um endereço.') : 'Cole o link do vídeo que deseja adicionar ao artigo.' }}</p>
          <div v-if="mediaModal === 'image' && mediaView === 'insert'" class="article-media-dialog__body">
            <button class="article-media-upload" type="button" :disabled="mediaLoading" @click="imageInput?.click()"><Upload /> {{ mediaLoading ? 'Enviando...' : 'Upload de imagem' }}</button>
            <input ref="imageInput" class="article-block-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="insertImage">
            <button class="article-media-library-button" type="button" @click="openMediaLibrary"><Images /> Selecionar na biblioteca <ChevronRight /></button>
            <span class="article-media-divider">ou</span>
            <label>Endereço da imagem<input ref="imageUrlInput" v-model="imageUrl" type="url" placeholder="https://exemplo.com/imagem.jpg" @keydown.enter.prevent="insertImageUrl"></label>
          </div>
          <div v-else-if="mediaModal === 'image'" class="article-media-library">
            <button class="article-media-library__back" type="button" aria-label="Voltar para inserir imagem" @click="mediaView = 'insert'"><ArrowLeft /></button>
            <div class="article-media-library__head"><strong>Todas as imagens</strong><small>{{ mediaItems.length }} {{ mediaItems.length === 1 ? 'imagem' : 'imagens' }}</small></div>
            <div v-if="mediaLibraryLoading" class="article-media-library__empty">Carregando imagens...</div>
            <div v-else-if="!mediaItems.length" class="article-media-library__empty">Nenhuma imagem enviada ainda.</div>
            <div v-else class="article-media-library__grid">
              <article v-for="item in mediaItems" :key="item.id" class="article-media-card">
                <button class="article-media-card__preview" type="button" :aria-label="`Ampliar ${item.originalName}`" @click="mediaPreview = item"><img :src="item.publicUrl" :alt="item.originalName" loading="lazy"><ZoomIn /></button>
                <div class="article-media-card__info"><strong :title="item.originalName">{{ item.originalName }}</strong><small>{{ formatBytes(item.size) }} · {{ formatMediaDate(item.createdAt) }}</small></div>
                <div class="article-media-card__actions">
                  <button type="button" @click="useMedia(item)">Usar</button>
                  <button class="is-danger" type="button" :disabled="mediaDeletingId === item.id" :title="item.usedBy.length ? `Em uso em ${item.usedBy.length} artigo(s)` : 'Excluir imagem'" @click="deleteMedia(item)"><Trash2 /></button>
                </div>
              </article>
            </div>
          </div>
          <div v-else class="article-media-dialog__body"><label>Link do YouTube<input ref="youtubeInput" v-model="youtubeUrl" type="url" placeholder="https://youtube.com/watch?v=..." @keydown.enter.prevent="insertYoutube"></label></div>
          <small v-if="mediaError" class="article-block-error">{{ mediaError }}</small>
          <div v-if="mediaModal !== 'image' || mediaView === 'insert'" class="confirm-dialog__actions"><button class="btn btn--secondary" type="button" @click="closeMediaModal">Cancelar</button><button class="btn" type="button" :disabled="mediaLoading" @click="mediaModal === 'image' ? insertImageUrl() : insertYoutube()">Inserir</button></div>
        </section>
      </div>
    </Transition>
  </Teleport>
  <Teleport to="body">
    <div v-if="mediaPreview" class="article-media-preview" role="presentation" @click.self="mediaPreview = null">
      <section role="dialog" aria-modal="true" :aria-label="`Visualização de ${mediaPreview.originalName}`">
        <button type="button" aria-label="Fechar visualização" @click="mediaPreview = null"><X /></button>
        <img :src="mediaPreview.publicUrl" :alt="mediaPreview.originalName">
        <strong>{{ mediaPreview.originalName }}</strong>
      </section>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { ArrowLeft, Blocks, ChevronDown, ChevronRight, Code2, Eye, FileText, Folder, Heading2, Image as ImageIcon, Images, Link2, List, LoaderCircle, Minus, Pilcrow, Quote, Save, Trash2, Upload, UserRound, Video, X, ZoomIn } from '@lucide/vue'
export type ArticleEditorModel = { title: string; slug: string; summary: string | null; sectionId: number; authorId: number; markdown: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }
type MediaItem = { id: number; originalName: string; publicUrl: string; mimeType: string; size: number; createdAt: string; usedBy: Array<{ id: number; title: string }> }
const model = defineModel<ArticleEditorModel>({ required: true })
const props = defineProps<{ categories: Array<{ id: number; title: string }>; authors: Array<{ id: number; name: string; active: boolean }>; canChangeAuthor?: boolean; saving?: boolean; articleId?: number; allowArchived?: boolean; previewUrl?: string; saveVersion?: number }>()
const emit = defineEmits<{ save: [status: ArticleEditorModel['status']]; 'attachment-uploaded': [id: number]; 'title-input': [] }>()
const formElement = ref<HTMLFormElement>()
const markdownEditor = ref<{ insertBlock: (content: string) => void; insertImage: (file: File) => Promise<void>; insertYoutube: (url: string) => boolean }>()
const titleElement = ref<HTMLTextAreaElement>()
const summaryElement = ref<HTMLTextAreaElement>()
const categoryElement = ref<HTMLSelectElement>()
const imageInput = ref<HTMLInputElement>()
const imageUrlInput = ref<HTMLInputElement>()
const youtubeInput = ref<HTMLInputElement>()
const imageUrl = ref('')
const youtubeUrl = ref('')
const mediaError = ref('')
const mediaModal = ref<'image' | 'video' | null>(null)
const mediaView = ref<'insert' | 'library'>('insert')
const mediaLoading = ref(false)
const mediaLibraryLoading = ref(false)
const mediaDeletingId = ref<number>()
const mediaDeleteTarget = ref<MediaItem | null>(null)
const mediaDeleteError = ref('')
const mediaItems = ref<MediaItem[]>([])
const mediaPreview = ref<MediaItem | null>(null)
const isSaving = ref(false)
let savingStartedAt = 0
let savingTimer: ReturnType<typeof setTimeout> | undefined
const leaveConfirmationOpen = ref(false)
const activeTab = ref<'document' | 'blocks'>('document')
const savedSnapshot = ref('')
const currentSnapshot = computed(() => JSON.stringify(model.value))
const hasUnsavedChanges = computed(() => currentSnapshot.value !== savedSnapshot.value)
const canPreview = computed(() => Boolean(props.articleId && props.previewUrl && model.value.status === 'PUBLISHED'))
function resizeTitle() {
  if (!titleElement.value) return
  titleElement.value.style.height = 'auto'
  titleElement.value.style.height = `${titleElement.value.scrollHeight}px`
}
function handleTitleInput() {
  resizeTitle()
  emit('title-input')
}
function resizeSummary() {
  if (!summaryElement.value) return
  summaryElement.value.style.height = 'auto'
  summaryElement.value.style.height = `${summaryElement.value.scrollHeight}px`
}
function validateCategory() {
  categoryElement.value?.setCustomValidity(model.value.sectionId > 0 ? '' : 'Selecione uma categoria.')
}
onMounted(() => {
  savedSnapshot.value = currentSnapshot.value
  resizeTitle()
  resizeSummary()
})
watch(() => model.value.title, () => nextTick(resizeTitle))
watch(() => model.value.summary, () => nextTick(resizeSummary))
watch(() => props.saveVersion, () => { savedSnapshot.value = currentSnapshot.value })
watch(() => props.saving, saving => {
  if (saving) {
    if (savingTimer) clearTimeout(savingTimer)
    savingStartedAt = Date.now()
    isSaving.value = true
    return
  }
  const remaining = Math.max(0, 1500 - (Date.now() - savingStartedAt))
  savingTimer = setTimeout(() => { isSaving.value = false }, remaining)
})
function goBack() {
  if (hasUnsavedChanges.value) {
    leaveConfirmationOpen.value = true
    return
  }
  navigateTo('/admin/artigos')
}
function confirmLeave() {
  leaveConfirmationOpen.value = false
  navigateTo('/admin/artigos')
}
function preventDisabledPreview(event: MouseEvent) { if (!canPreview.value) event.preventDefault() }
function insertBlock(content: string) { markdownEditor.value?.insertBlock(content) }
async function openMediaModal(type: 'image' | 'video') {
  mediaError.value = ''
  mediaModal.value = type
  mediaView.value = 'insert'
  await nextTick()
  if (type === 'image') imageUrlInput.value?.focus()
  else youtubeInput.value?.focus()
}
function closeMediaModal() { if (!mediaLoading.value) { mediaModal.value = null; mediaView.value = 'insert'; mediaPreview.value = null; mediaError.value = ''; imageUrl.value = ''; youtubeUrl.value = '' } }
function handleMediaModalKeydown(event: KeyboardEvent) { if (event.key === 'Escape' && mediaModal.value) closeMediaModal() }
async function insertImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !markdownEditor.value) return
  mediaError.value = ''
  mediaLoading.value = true
  try { await markdownEditor.value.insertImage(file); mediaLoading.value = false; closeMediaModal() } catch { mediaError.value = 'Não foi possível enviar a imagem.' }
  finally { mediaLoading.value = false }
  input.value = ''
}
async function loadMediaLibrary() {
  mediaLibraryLoading.value = true
  try { mediaItems.value = await $fetch<MediaItem[]>('/api/uploads') }
  catch { mediaError.value = 'Não foi possível carregar a biblioteca de imagens.' }
  finally { mediaLibraryLoading.value = false }
}
async function openMediaLibrary() {
  mediaError.value = ''
  mediaView.value = 'library'
  await loadMediaLibrary()
}
function useMedia(item: MediaItem) {
  insertBlock(`\n![${item.originalName}](${item.publicUrl})\n`)
  closeMediaModal()
}
function deleteMedia(item: MediaItem) {
  mediaError.value = ''
  if (model.value.markdown.includes(item.publicUrl)) {
    mediaError.value = 'Esta imagem está no conteúdo atual. Remova-a do artigo antes de excluir.'
    return
  }
  if (item.usedBy.length) {
    mediaError.value = `Esta imagem está em uso em ${item.usedBy.map(article => `“${article.title}”`).join(', ')}.`
    return
  }
  mediaDeleteError.value = ''
  mediaDeleteTarget.value = item
}
function cancelDeleteMedia() {
  if (mediaDeletingId.value) return
  mediaDeleteTarget.value = null
  mediaDeleteError.value = ''
}
async function confirmDeleteMedia() {
  const item = mediaDeleteTarget.value
  if (!item) return
  mediaDeletingId.value = item.id
  try {
    await $fetch(`/api/uploads/${item.id}`, { method: 'DELETE' })
    mediaItems.value = mediaItems.value.filter(media => media.id !== item.id)
    mediaDeleteTarget.value = null
  } catch (error) {
    const fetchError = error as { data?: { message?: string, statusMessage?: string }, message?: string }
    mediaDeleteError.value = fetchError.data?.statusMessage || fetchError.data?.message || fetchError.message || 'Não foi possível excluir a imagem.'
  } finally { mediaDeletingId.value = undefined }
}
function formatBytes(bytes: number) { return bytes < 1_000_000 ? `${Math.max(1, Math.round(bytes / 1000))} KB` : `${(bytes / 1_000_000).toFixed(1)} MB` }
function formatMediaDate(value: string) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value)) }
function insertImageUrl() {
  mediaError.value = ''
  try {
    const url = new URL(imageUrl.value)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    insertBlock(`\n![Descrição da imagem](${url.toString()})\n`)
    closeMediaModal()
  } catch { mediaError.value = 'Informe um endereço de imagem válido.' }
}
function insertYoutube() {
  mediaError.value = ''
  if (!youtubeUrl.value || !markdownEditor.value?.insertYoutube(youtubeUrl.value)) { mediaError.value = 'Informe uma URL válida do YouTube.'; return }
  closeMediaModal()
}
function submit() {
  validateCategory()
  if (!formElement.value?.reportValidity()) return
  emit('save', model.value.status)
}
onMounted(() => window.addEventListener('keydown', handleMediaModalKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleMediaModalKeydown)
  if (savingTimer) clearTimeout(savingTimer)
})
</script>

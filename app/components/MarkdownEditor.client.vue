<template>
  <div class="markdown-editor" :class="{ 'is-uploading': uploading }" :data-editor-state="editorState">
    <div :id="editorRootId" ref="editorRoot"></div>
    <p v-if="uploading" class="markdown-editor__status">Enviando imagem...</p>
    <p v-if="uploadError" class="error markdown-editor__status">{{ uploadError }}</p>
  </div>
</template>

<script setup lang="ts">
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/classic.css'
import { Crepe } from '@milkdown/crepe'
import { commandsCtx } from '@milkdown/kit/core'
import { clearTextInCurrentBlockCommand } from '@milkdown/kit/preset/commonmark'
import { insert, replaceAll } from '@milkdown/kit/utils'
import { Video } from '@lucide/vue'
import { createApp } from 'vue'
import { youtubeDirective, youtubeSchema } from '../editor/youtube'
import { getYouTubeVideoId } from '../../shared/utils/youtube'

const props = defineProps<{
  modelValue: string
  articleId?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'attachment-uploaded': [id: number]
  'request-youtube': []
}>()

const editorRoot = useTemplateRef<HTMLDivElement>('editorRoot')
const editorRootId = useId()
const uploading = ref(false)
const uploadError = ref('')
const editorState = ref('waiting')
let editor: Crepe | undefined
let updatingFromEditor = false

async function uploadImage(file: File) {
  uploadError.value = ''
  uploading.value = true

  try {
    const body = new FormData()
    body.append('file', file, file.name)
    if (props.articleId) body.append('articleId', String(props.articleId))

    const attachment = await $fetch<{ id: number; publicUrl: string }>('/api/uploads', {
      method: 'POST',
      body
    })

    emit('attachment-uploaded', attachment.id)
    return attachment.publicUrl
  } catch (error) {
    const fetchError = error as { data?: { message?: string, statusMessage?: string }, message?: string }
    uploadError.value = fetchError.data?.message || fetchError.data?.statusMessage || fetchError.message || 'Não foi possível enviar a imagem.'
    throw error
  } finally {
    uploading.value = false
  }
}

onMounted(async () => {
  editorState.value = 'mounting'
  await nextTick()
  const root = editorRoot.value ?? document.getElementById(editorRootId)
  if (!root) {
    editorState.value = 'missing-root'
    return
  }

  try {
    const iconHost = document.createElement('span')
    const iconApp = createApp(Video, { size: 24, 'aria-hidden': true })
    iconApp.mount(iconHost)
    const youtubeIcon = iconHost.innerHTML
    iconApp.unmount()
    editor = new Crepe({
      root,
      defaultValue: props.modelValue,
      featureConfigs: {
        [Crepe.Feature.ImageBlock]: {
          onUpload: uploadImage,
          blockUploadButton: 'Enviar imagem',
          inlineUploadButton: 'Enviar imagem',
          blockUploadPlaceholderText: 'ou cole o endereço da imagem',
          inlineUploadPlaceholderText: 'ou cole o endereço da imagem',
          blockCaptionPlaceholderText: 'Legenda da imagem'
        },
      [Crepe.Feature.Placeholder]: {
        text: 'Comece a escrever o artigo...'
      },
      [Crepe.Feature.BlockEdit]: {
        buildMenu: builder => {
          builder.addGroup('media', 'Mídia').addItem('youtube', {
            label: 'Video do YouTube',
            icon: youtubeIcon,
            onRun: ctx => {
              ctx.get(commandsCtx).call(clearTextInCurrentBlockCommand.key)
              emit('request-youtube')
            }
          })
        }
      }
    }
  })

    editor.editor.use(youtubeDirective).use(youtubeSchema)

    editor.on(listener => {
      listener.markdownUpdated((_ctx, markdown) => {
        updatingFromEditor = true
        emit('update:modelValue', markdown)
        nextTick(() => { updatingFromEditor = false })
      })
    })

    await editor.create()
    editorState.value = 'ready'
  } catch (error) {
    editorState.value = 'error'
    uploadError.value = error instanceof Error ? error.message : 'Não foi possível carregar o editor.'
  }
})

watch(() => props.modelValue, value => {
  if (!editor || updatingFromEditor || value === editor.getMarkdown()) return
  editor.editor.action(replaceAll(value))
})

function insertBlock(content: string) {
  if (!editor) return
  editor.editor.action(insert(content))
}

async function insertImage(file: File) {
  if (!editor) return
  const url = await uploadImage(file)
  editor.editor.action(insert(`\n![Descrição da imagem](${url})\n`))
}

function insertYoutube(url: string) {
  if (!editor) return false
  const id = getYouTubeVideoId(url)
  if (!id) return false
  editor.editor.action(insert(`\n::youtube{#${id}}\n`))
  return true
}

defineExpose({ insertBlock, insertImage, insertYoutube })

onBeforeUnmount(() => editor?.destroy())
</script>

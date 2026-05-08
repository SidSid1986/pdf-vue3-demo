<template>
  <section class="pdf-demo">
    <header class="pdf-toolbar">
      <button type="button" :disabled="pageNumber <= 1" @click="previousPage">
        上一页
      </button>

      <input v-model.number="pageInput" class="page-input" type="number" min="1" :max="pagesCount || 1"
        @change="goToPage(pageInput)" @keydown.enter.prevent="goToPage(pageInput)" />

      <span>/ {{ pagesCount || '-' }}</span>

      <button type="button" :disabled="!pagesCount || pageNumber >= pagesCount" @click="nextPage">
        下一页
      </button>

      <span class="separator"></span>

      <button type="button" @click="zoomOut">缩小</button>

      <select v-model="scaleValue" @change="setScale(scaleValue)">
        <option value="auto">自动</option>
        <option value="page-width">页宽</option>
        <option value="page-fit">整页</option>
        <option value="0.75">75%</option>
        <option value="1">100%</option>
        <option value="1.25">125%</option>
        <option value="1.5">150%</option>
        <option value="2">200%</option>
      </select>

      <button type="button" @click="zoomIn">放大</button>

      <span class="separator"></span>

      <input v-model="findQuery" class="find-input" type="search" placeholder="搜索" @keydown.enter.prevent="findNext" />
      <button type="button" @click="findPrevious">上一个</button>
      <button type="button" @click="findNext">下一个</button>

      <span class="separator"></span>

      <button type="button" :class="{ active: editorMode === AnnotationEditorType.HIGHLIGHT }"
        @click="toggleEditor(AnnotationEditorType.HIGHLIGHT)">
        高亮
      </button>

      <button type="button" :class="{ active: editorMode === AnnotationEditorType.FREETEXT }"
        @click="toggleEditor(AnnotationEditorType.FREETEXT)">
        文字
      </button>

      <button type="button" :class="{ active: editorMode === AnnotationEditorType.INK }"
        @click="toggleEditor(AnnotationEditorType.INK)">
        画笔
      </button>

      <button type="button" @click="setNoEditor">退出编辑</button>

      <div v-if="activeParamsPanel" class="params-popover">
        <template v-if="activeParamsPanel === AnnotationEditorType.HIGHLIGHT">
          <div class="params-title">高亮色</div>
          <div class="color-row">
            <button v-for="color in highlightColors" :key="color" type="button" class="color-dot"
              :class="{ selected: highlightColor.toUpperCase() === color }" :style="{ backgroundColor: color }"
              @click="setHighlightColorValue(color)"></button>
          </div>

          <label class="popover-control">
            粗细
            <input v-model.number="highlightThickness" type="range" min="8" max="24" step="1"
              @input="setHighlightThickness" />
          </label>

          <label class="popover-control switch-row">
            显示全部
            <input v-model="highlightShowAll" type="checkbox" @change="setHighlightShowAll" />
          </label>
        </template>

        <template v-if="activeParamsPanel === AnnotationEditorType.FREETEXT">
          <label class="popover-control">
            颜色
            <input v-model="freeTextColor" type="color" @input="setFreeTextColor" />
          </label>

          <label class="popover-control">
            字号
            <input v-model.number="freeTextSize" type="range" min="5" max="100" step="1" @input="setFreeTextSize" />
          </label>
        </template>

        <template v-if="activeParamsPanel === AnnotationEditorType.INK">
          <label class="popover-control">
            颜色
            <input v-model="inkColor" type="color" @input="setInkColor" />
          </label>

          <label class="popover-control">
            粗细
            <input v-model.number="inkThickness" type="range" min="1" max="20" step="1" @input="setInkThickness" />
          </label>

          <label class="popover-control">
            不透明度
            <input v-model.number="inkOpacity" type="range" min="0.05" max="1" step="0.05" @input="setInkOpacity" />
          </label>
        </template>
      </div>



      <span class="separator"></span>

      <button type="button" @click="downloadPdf">下载</button>
    </header>

    <div class="viewer-body">
      <div ref="viewerContainerRef" class="viewer-container" tabindex="0">
        <div ref="viewerRef" class="pdfViewer"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import {
  EventBus,
  PDFFindController,
  PDFLinkService,
  PDFViewer,
} from 'pdfjs-dist/web/pdf_viewer.mjs'
import 'pdfjs-dist/web/pdf_viewer.css'

const props = defineProps({
  src: {
    type: String,
    default: '/test.pdf',
  },
})
const nullL10n = {
  getLanguage() {
    return 'zh-CN'
  },
  getDirection() {
    return 'ltr'
  },
  async get(id, args = null, fallback = id) {
    return fallback || id
  },
  async translate() { },
  async translateOnce() { },
  pause() { },
  resume() { },
  destroy() { },
}


const {
  AnnotationEditorType,
  AnnotationEditorParamsType,
  AnnotationMode,
} = pdfjsLib

const viewerContainerRef = ref(null)
const viewerRef = ref(null)

const pageNumber = ref(1)
const pageInput = ref(1)
const pagesCount = ref(0)
const scaleValue = ref('page-width')
const findQuery = ref('')
const editorMode = ref(AnnotationEditorType.NONE)
const activeParamsPanel = ref(null)

const highlightColors = ['#FFFF00', '#00FF00', '#00B7FF', '#FF66CC', '#FF3333']
const highlightColor = ref('#FFFF00')
const highlightThickness = ref(12)
const highlightShowAll = ref(true)

const freeTextColor = ref('#000000')
const freeTextSize = ref(10)

const inkColor = ref('#000000')
const inkThickness = ref(3)
const inkOpacity = ref(1)



let loadingTask = null
let pdfDocument = null
let eventBus = null
let linkService = null
let findController = null
let pdfViewer = null

function bindEvent(name, listener) {
  const bind = eventBus?._on?.bind(eventBus) || eventBus?.on?.bind(eventBus)
  bind?.(name, listener)
}

function setupPdfJs() {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href

  eventBus = new EventBus()
  linkService = new PDFLinkService({ eventBus })
  findController = new PDFFindController({ eventBus, linkService })

  pdfViewer = new PDFViewer({
    container: viewerContainerRef.value,
    viewer: viewerRef.value,
    eventBus,
    linkService,
    findController,
    l10n: nullL10n,
    annotationMode: AnnotationMode.ENABLE_FORMS,
    annotationEditorMode: AnnotationEditorType.NONE,
    annotationEditorHighlightColors:
      'yellow=#ffff00,green=#00ff00,blue=#00b7ff,pink=#ff66cc,red=#ff3333',
    enableHighlightFloatingButton: true,
    textLayerMode: 1,
  })


  linkService.setViewer(pdfViewer)

  bindEvent('pagesinit', () => {
    pdfViewer.currentScaleValue = scaleValue.value
  })

  bindEvent('pagechanging', ({ pageNumber: nextPageNumber }) => {
    pageNumber.value = nextPageNumber
    pageInput.value = nextPageNumber
  })

  bindEvent('pagesloaded', ({ pagesCount: count }) => {
    pagesCount.value = count
  })

  bindEvent('scalechanging', ({ presetValue, scale }) => {
    scaleValue.value = presetValue || String(scale)
  })

  bindEvent('switchannotationeditormode', event => {
    pdfViewer.annotationEditorMode = event
    editorMode.value = event.mode
  })

  bindEvent('switchannotationeditorparams', event => {
    pdfViewer.annotationEditorParams = event
  })
}

async function openPdf(src) {
  await closePdf()

  loadingTask = pdfjsLib.getDocument(src)
  pdfDocument = await loadingTask.promise

  pdfViewer.setDocument(pdfDocument)
  linkService.setDocument(pdfDocument)

  pagesCount.value = pdfDocument.numPages
  pageNumber.value = 1
  pageInput.value = 1
}

async function closePdf() {
  if (pdfDocument) {
    pdfViewer?.setDocument(null)
    linkService?.setDocument(null)
    pdfDocument = null
  }

  if (loadingTask) {
    loadingTask.destroy()
    loadingTask = null
  }
}

function previousPage() {
  pdfViewer?.previousPage()
}

function nextPage() {
  pdfViewer?.nextPage()
}

function goToPage(value) {
  const target = Math.min(Math.max(Number(value) || 1, 1), pagesCount.value || 1)
  pageInput.value = target
  pdfViewer.currentPageNumber = target
}

function zoomIn() {
  pdfViewer?.increaseScale()
}

function zoomOut() {
  pdfViewer?.decreaseScale()
}

function setScale(value) {
  if (pdfViewer) {
    pdfViewer.currentScaleValue = value
  }
}

function dispatchFind(findPreviousValue) {
  eventBus?.dispatch('find', {
    source: pdfViewer,
    type: '',
    query: findQuery.value,
    caseSensitive: false,
    entireWord: false,
    highlightAll: true,
    findPrevious: findPreviousValue,
    matchDiacritics: false,
  })
}

function findNext() {
  dispatchFind(false)
}

function findPrevious() {
  dispatchFind(true)
}

function toggleEditor(mode) {
  const nextMode = editorMode.value === mode ? AnnotationEditorType.NONE : mode

  eventBus.dispatch('switchannotationeditormode', {
    source: pdfViewer,
    mode: nextMode,
  })

  activeParamsPanel.value = nextMode === AnnotationEditorType.NONE ? null : nextMode

  if (nextMode === AnnotationEditorType.HIGHLIGHT) {
    setHighlightThickness()
    setEditorParam(AnnotationEditorParamsType.HIGHLIGHT_THICKNESS, 12)
  }

  if (nextMode === AnnotationEditorType.FREETEXT) {
    setFreeTextColor()
    setFreeTextSize()

  }

  if (nextMode === AnnotationEditorType.INK) {
    setInkColor()
    setInkThickness()
    setInkOpacity()
  }
}


function setEditorParam(type, value) {
  eventBus?.dispatch('switchannotationeditorparams', {
    source: pdfViewer,
    type,
    value,
  })
}

 

 
function setInkColor() {
  setEditorParam(AnnotationEditorParamsType.INK_COLOR, inkColor.value)
}

function setInkThickness() {
  setEditorParam(AnnotationEditorParamsType.INK_THICKNESS, inkThickness.value)
}

function setInkOpacity() {
  setEditorParam(AnnotationEditorParamsType.INK_OPACITY, inkOpacity.value)
}

function setNoEditor() {
  activeParamsPanel.value = null

  eventBus.dispatch('switchannotationeditormode', {
    source: pdfViewer,
    mode: AnnotationEditorType.NONE,
  })
}

function setHighlightColorValue(color) {
  highlightColor.value = color
  setHighlightColor()
}

function setHighlightColor() {
  setEditorParam(
    AnnotationEditorParamsType.HIGHLIGHT_COLOR,
    highlightColor.value.toUpperCase()
  )
}

function setHighlightThickness() {
  setEditorParam(
    AnnotationEditorParamsType.HIGHLIGHT_THICKNESS,
    highlightThickness.value
  )
}

function setHighlightShowAll() {
  setEditorParam(
    AnnotationEditorParamsType.HIGHLIGHT_SHOW_ALL,
    highlightShowAll.value
  )
}

function setFreeTextColor() {
  setEditorParam(
    AnnotationEditorParamsType.FREETEXT_COLOR,
    freeTextColor.value.toUpperCase()
  )
}

function setFreeTextSize() {
  setEditorParam(
    AnnotationEditorParamsType.FREETEXT_SIZE,
    freeTextSize.value
  )
}



async function downloadPdf() {
  if (!pdfDocument) return

  const data =
    typeof pdfDocument.saveDocument === 'function'
      ? await pdfDocument.saveDocument()
      : await pdfDocument.getData()

  const blob = new Blob([data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'document.pdf'
  a.click()

  URL.revokeObjectURL(url)
}

onMounted(async () => {
  await nextTick()
  setupPdfJs()
  await openPdf(props.src || '/test.pdf')
})

watch(
  () => props.src,
  async src => {
    if (src && eventBus) {
      await openPdf(src)
    }
  }
)

onUnmounted(async () => {
  await closePdf()
  pdfViewer?.cleanup()
})
</script>

<style scoped>
.pdf-demo {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  min-height: 480px;
  overflow: hidden;
  background: #d7d7d7;
  color: #1f2328;
}

.pdf-toolbar {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-bottom: 1px solid #9f9f9f;
  background: #eeeeee;
  overflow-x: auto;
  white-space: nowrap;
}

.pdf-toolbar button,
.pdf-toolbar select,
.pdf-toolbar input {
  height: 30px;
  border: 1px solid #a8a8a8;
  border-radius: 4px;
  background: #fff;
  color: inherit;
  font-size: 13px;
}

.pdf-toolbar button {
  padding: 0 10px;
  cursor: pointer;
}

.pdf-toolbar button:disabled {
  cursor: default;
  opacity: 0.45;
}

.pdf-toolbar button.active {
  border-color: #0b57d0;
  background: #d9e8ff;
  color: #0b57d0;
}

.page-input {
  width: 56px;
  padding: 0 6px;
}

.find-input {
  width: 160px;
  padding: 0 8px;
}

.separator {
  width: 1px;
  height: 24px;
  margin: 0 4px;
  background: #b8b8b8;
}

.viewer-body {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.viewer-container {
  position: absolute;
  inset: 0;
  overflow: auto;
  outline: none;
}

.pdfViewer {
  padding: 12px 0;
}


.param-control {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  font-size: 13px;
}

.param-control input[type='color'] {
  width: 34px;
  padding: 0;
}

.param-control input[type='range'] {
  width: 80px;
}

.pdf-toolbar {
  position: relative;
}

.params-popover {
  position: absolute;
  top: 42px;
  right: 120px;
  z-index: 20;
  width: 220px;
  padding: 12px;
  border: 1px solid #b9b9b9;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 4px 14px rgb(0 0 0 / 18%);
  color: #1f2328;
}

.params-popover::before {
  content: '';
  position: absolute;
  top: -7px;
  right: 36px;
  width: 12px;
  height: 12px;
  border-left: 1px solid #b9b9b9;
  border-top: 1px solid #b9b9b9;
  background: #fff;
  transform: rotate(45deg);
}

.params-title {
  margin-bottom: 8px;
  font-size: 13px;
}

.color-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.color-dot {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid #c8c8c8;
  border-radius: 999px;
  cursor: pointer;
}

.color-dot.selected {
  outline: 2px solid #0b57d0;
  outline-offset: 2px;
}

.popover-control {
  display: grid;
  grid-template-columns: 64px 1fr;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  font-size: 13px;
}

.popover-control input[type='range'] {
  width: 100%;
}

.popover-control input[type='color'] {
  width: 34px;
  height: 28px;
  padding: 0;
}

.switch-row {
  grid-template-columns: 1fr auto;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}
</style>
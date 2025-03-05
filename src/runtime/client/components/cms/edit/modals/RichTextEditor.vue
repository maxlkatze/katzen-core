<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { HardBreak } from '@tiptap/extension-hard-break'
import type { ContentValue } from '../../../../../types/ContentTypes'

const props = defineProps<{
  value: ContentValue
}>()

const emit = defineEmits<{
  (e: 'save', value: string): void
}>()

const editor = ref<Editor | null>(null)

onMounted(() => {
  const initialContent = typeof props.value === 'string' ? props.value : ''

  editor.value = new Editor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write rich text content here...',
      }),
      Link.configure({
        openOnClick: false,
      }),
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            Enter: () => this.editor.commands.setHardBreak(),
          }
        },
      }),
    ],
    content: initialContent,
    autofocus: true,
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

const handleSave = () => {
  if (editor.value) {
    emit('save', editor.value.getHTML())
  }
}

// Editor button functions
const setLink = () => {
  const url = window.prompt('Enter link URL')
  if (url) {
    editor.value?.chain().focus().setLink({ href: url }).run()
  }
}

const removeLink = () => {
  editor.value?.chain().focus().unsetLink().run()
}
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Rich Text Content</label>

      <!-- Editor Toolbar -->
      <div class="border border-gray-300 rounded-t-md p-2 bg-gray-50 flex flex-wrap gap-1">
        <button
          :class="{ 'bg-gray-200': editor?.isActive('bold') }"
          class="p-1 rounded hover:bg-gray-200"
          title="Bold"
          @click="editor?.chain().focus().toggleBold().run()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          </svg>
        </button>

        <button
          :class="{ 'bg-gray-200': editor?.isActive('italic') }"
          class="p-1 rounded hover:bg-gray-200"
          title="Italic"
          @click="editor?.chain().focus().toggleItalic().run()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line
              x1="19"
              y1="4"
              x2="10"
              y2="4"
            />
            <line
              x1="14"
              y1="20"
              x2="5"
              y2="20"
            />
            <line
              x1="15"
              y1="4"
              x2="9"
              y2="20"
            />
          </svg>
        </button>

        <button
          :class="{ 'bg-gray-200': editor?.isActive('strike') }"
          class="p-1 rounded hover:bg-gray-200"
          title="Strike"
          @click="editor?.chain().focus().toggleStrike().run()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M17 9V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v3" />
            <path d="M11 12H7a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-3" />
            <line
              x1="4"
              y1="12"
              x2="20"
              y2="12"
            />
          </svg>
        </button>

        <span class="border-r border-gray-300 mx-1 h-6" />

        <button
          :class="{ 'bg-gray-200': editor?.isActive('heading', { level: 1 }) }"
          class="p-1 rounded hover:bg-gray-200"
          title="Heading 1"
          @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          <span class="font-bold">H1</span>
        </button>

        <button
          :class="{ 'bg-gray-200': editor?.isActive('heading', { level: 2 }) }"
          class="p-1 rounded hover:bg-gray-200"
          title="Heading 2"
          @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          <span class="font-bold">H2</span>
        </button>

        <button
          :class="{ 'bg-gray-200': editor?.isActive('heading', { level: 3 }) }"
          class="p-1 rounded hover:bg-gray-200"
          title="Heading 3"
          @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          <span class="font-bold">H3</span>
        </button>

        <span class="border-r border-gray-300 mx-1 h-6" />

        <button
          :class="{ 'bg-gray-200': editor?.isActive('bulletList') }"
          class="p-1 rounded hover:bg-gray-200"
          title="Bullet List"
          @click="editor?.chain().focus().toggleBulletList().run()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line
              x1="8"
              y1="6"
              x2="21"
              y2="6"
            />
            <line
              x1="8"
              y1="12"
              x2="21"
              y2="12"
            />
            <line
              x1="8"
              y1="18"
              x2="21"
              y2="18"
            />
            <line
              x1="3"
              y1="6"
              x2="3.01"
              y2="6"
            />
            <line
              x1="3"
              y1="12"
              x2="3.01"
              y2="12"
            />
            <line
              x1="3"
              y1="18"
              x2="3.01"
              y2="18"
            />
          </svg>
        </button>

        <button
          :class="{ 'bg-gray-200': editor?.isActive('orderedList') }"
          class="p-1 rounded hover:bg-gray-200"
          title="Ordered List"
          @click="editor?.chain().focus().toggleOrderedList().run()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line
              x1="10"
              y1="6"
              x2="21"
              y2="6"
            />
            <line
              x1="10"
              y1="12"
              x2="21"
              y2="12"
            />
            <line
              x1="10"
              y1="18"
              x2="21"
              y2="18"
            />
            <path d="M4 6h1v4" />
            <path d="M4 10h2" />
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
          </svg>
        </button>

        <span class="border-r border-gray-300 mx-1 h-6" />

        <button
          :class="{ 'bg-gray-200': editor?.isActive('link') }"
          class="p-1 rounded hover:bg-gray-200"
          title="Add Link"
          @click="setLink"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>

        <button
          v-if="editor?.isActive('link')"
          class="p-1 rounded hover:bg-gray-200"
          title="Remove Link"
          @click="removeLink"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18.36 6.64A9 9 0 0 1 20.77 15" />
            <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68" />
            <line
              x1="2"
              y1="2"
              x2="22"
              y2="22"
            />
          </svg>
        </button>
      </div>

      <!-- Editor Content -->
      <div class="border border-gray-300 rounded-b-md p-4 min-h-[200px] bg-white prose">
        <editor-content
          :editor="editor"
          class="prose max-w-none"
        />
      </div>
    </div>

    <div class="flex justify-end">
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        @click="handleSave"
      >
        Save Changes
      </button>
    </div>
  </div>
</template>

<style>
.ProseMirror:focus {
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
</style>

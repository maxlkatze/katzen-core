import { defineStore } from 'pinia'

export interface KatzenUIOptions {
  key: string
  default?: string
}

export enum ComponentType {
  Text = 'text',
  RichText = 'richText',
  Image = 'image',
}

export interface KatzenUIComponent {
  type: ComponentType
  options: KatzenUIOptions
  content: unknown
}

export const useUiStore = defineStore('uiStore', {
  state: () => ({
    totalUiComponents: [] as KatzenUIComponent[],
    currentUiComponents: [] as KatzenUIComponent[],
  }),
  getters: {
    getComponents: (state) => {
      return (key: string): KatzenUIComponent | undefined => state.totalUiComponents.find(c => c.options.key === key)
    },
    getUiContent: (state) => {
      return (): Record<string, unknown> => {
        const content: Record<string, unknown> = {}
        state.totalUiComponents.forEach((c) => {
          content[c.options.key] = c.content
        })
        return content
      }
    },
  },
  actions: {
    clearCurrentUiComponents() {
      this.currentUiComponents = []
    },
    addToContextStack(component: KatzenUIComponent) {
      if (!this.totalUiComponents.find(c => c.options.key === component.options.key)) {
        this.totalUiComponents.push(component)
      }
      if (this.currentUiComponents.find(c => c.options.key === component.options.key)) {
        this.currentUiComponents.push(component)
      }
    },
    updateUiContent(key: string, content: unknown) {
      const component = this.totalUiComponents.find(c => c.options.key === key)
      if (component) {
        component.content = content
      }
    },
  },
})

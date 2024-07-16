import { defineStore } from 'pinia'

export interface KatzenUIOptions {
  key: string
}

export enum ComponentType {
  Text = 'text',
  RichText = 'richText',
  Image = 'image',
}

export interface KatzenUIComponent {
  type: ComponentType
  options: KatzenUIOptions
  content: string
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
    updateUiContent(key: string, content: string) {
      const component = this.totalUiComponents.find(c => c.options.key === key)
      if (component) {
        component.content = content
      }
    },
  },
})

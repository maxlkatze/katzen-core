import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((_nuxtApp) => {
  _nuxtApp.vueApp.directive<HTMLElement, string>('hypertext', {
    mounted: (el: HTMLElement, binding) => {
      el.innerHTML = binding.value
    },
    created: (el: HTMLElement, binding) => {
      el.innerHTML = binding.value
    },
    updated: (el: HTMLElement, binding) => {
      el.innerHTML = binding.value
    },
    getSSRProps(binding) {
      return {
        innerHTML: binding.value,
      }
    },
  })
})

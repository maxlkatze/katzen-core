<script setup lang="ts">
import type { LoginResponse } from '../types/server/ServerResponses'
import { definePageMeta, navigateTo, ref, useCookie } from '#imports'

const username = ref('')
const password = ref('')

definePageMeta({
  layout: 'cms-layout',
})

const failedLogin = ref(false)
const failureMessage = ref('')

const onSubmit = async () => {
  const body = {
    username: username.value,
    password: password.value,
  }

  const data = await $fetch<LoginResponse>('/api/katze/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (data.success && data.token) {
    const tokenCookie = useCookie('token')
    tokenCookie.value = data.token
    await navigateTo('/cms')
  }
  else {
    failedLogin.value = true
    failureMessage.value = data.message || 'Something went wrong'
  }
}
</script>

<template>
  <div class="h-svh w-full flex flex-col justify-center items-center bg-amber-50">
    <img
      src="../assets/logo.svg"
      class="h-60"
      alt=""
    >
    <div class="flex flex-col gap-5">
      <input
        id="username"
        v-model="username"
        type="text"
        name="username"
        placeholder="Nutzername"
        class="px-5 py-3 rounded-2xl border-black border-2"
        @keyup.enter="onSubmit"
      >
      <input
        id="password"
        v-model="password"
        type="password"
        name="password"
        placeholder="Passwort"
        class="px-5 py-3 rounded-2xl border-black border-2"
        @keyup.enter="onSubmit"
      >

      <button
        class="bg-black text-white px-5 py-3 rounded-2xl"
        :class="{ 'bg-red-500': failedLogin }"
        @click="onSubmit"
      >
        Login
      </button>
      <span
        v-if="failedLogin"
        class="text-red-500 text-center"
      >{{ failureMessage }}</span>
    </div>
  </div>
</template>

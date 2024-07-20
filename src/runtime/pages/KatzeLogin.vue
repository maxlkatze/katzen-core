<script setup lang="ts">
import { definePageMeta, navigateTo, ref, useCookie } from '#imports'

const username = ref('')
const password = ref('')

definePageMeta({
  layout: 'cmsLayout',
})

const failedLogin = ref(false)

const onSubmit = async () => {
  const body = {
    username: username.value,
    password: password.value,
  }

  interface LoginResponse {
    success: boolean
    body?: {
      token: string
    }
  }

  const data = await $fetch('/login-cms', {
    method: 'POST',
    body: JSON.stringify(body),
  }) as LoginResponse
  if (data.success && data.body) {
    const token = data.body.token
    const tokenCookie = useCookie('token')
    tokenCookie.value = token
    await navigateTo('/cms')
  }
  else {
    failedLogin.value = true
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
      >Wrong credentials!</span>
    </div>
  </div>
</template>

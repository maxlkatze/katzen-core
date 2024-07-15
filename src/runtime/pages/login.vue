<script setup lang="ts">
const username = ref('')
const password = ref('')

const failedLogin = ref(false)


const onSubmit = async() => {
  const body = {
    username: username.value,
    password: password.value
  };

  const data = await $fetch('/login-cms', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  if (data.success) {
    const token = data.body.token;
    const tokenCookie = useCookie('token')
    tokenCookie.value = token;
    console.log('Login successful');
    //redirect to cms
    await navigateTo('/preview');

  } else {
    failedLogin.value = true;
    console.log('Login failed');
  }
}
</script>

<template>
  <div class="h-svh w-full flex flex-col justify-center items-center bg-amber-50">
    <img src="./logo.svg" class="h-60"  alt=""/>
    <div class="flex flex-col gap-5" >
      <input type="text"
             name="username"
             id="username"
              v-model="username"
              @keyup.enter="onSubmit"
             placeholder="Nutzername"
             class="px-5 py-3 rounded-2xl border-black border-2">
      <input type="password"
             name="password"
             id="password"
              v-model="password"
             @keyup.enter="onSubmit"
             placeholder="Passwort"
             class="px-5 py-3 rounded-2xl border-black border-2">

      <button class="bg-black text-white px-5 py-3 rounded-2xl"
              :class="{'bg-red-500': failedLogin}"
              @click="onSubmit">Login</button>
      <span v-if="failedLogin" class="text-red-500 text-center">Wrong credentials!</span>
    </div>
  </div>
</template>

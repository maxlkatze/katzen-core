<script setup lang="ts">
const { isMobile, isTablet, isDesktop } = useDeviceType()
</script>

<template>
  <div>
    <h1>Device</h1>
    <p>Mobile: {{ isMobile }}</p>
    <p>Tablet: {{ isTablet }}</p>
    <p>Desktop: {{ isDesktop }}</p>
  </div>
</template>

<style scoped>

</style>

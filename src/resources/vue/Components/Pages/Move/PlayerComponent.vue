<script setup lang="ts">
defineProps<{
  number: string|number,
  shouldBeAnimated: boolean,
  animationLength: number,
  colourClass: string,
  xPercent: number|string,
  yPercent: number|string,
}>();
</script>

<template>
  <div
    class="rounded-3xl w-[2rem] h-[2rem] flex flex-row items-center justify-center border-gray-700 border-2"
    :class="colourClass"
    draggable="true"
    :style="{
      left: `calc(${xPercent}% - 1rem)`,
      bottom: `calc(${yPercent}% - 1rem)`,
      ...shouldBeAnimated ? {
        'transition-property': 'all',
        'transition-duration': `${animationLength}ms`,
        'transition-timing-function': 'linear',
      } : []
    }"
    v-text="number"
  />
</template>

<style scoped>

</style>

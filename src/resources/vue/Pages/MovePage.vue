<script setup lang="ts">

import { computed, ref, watch } from 'vue'
import ContainerComponent from '@/resources/vue/Components/ContainerComponent.vue'
import ButtonComponent from '@/resources/vue/Components/ButtonComponent.vue'

const keyFrameLength = ref<number>(1000);
const currentTime = ref<number>(0);

const players = ref<Record<string, number>>({
  leftWing: 1,
  rightWing: 1,
  leftLink: 2,
  rightLink: 2,
  leftMid: 3,
  rightMid: 3,
});

type Keyframe = {
  time: number;
  players: Record<string, [number, number]>;
}

const keyframes = ref<Keyframe[]>([{
  players: {
    leftWing: [25, 40],
    leftLink: [35, 40],
    leftMid: [45, 40],
    rightMid: [55, 40],
    rightLink: [65, 40],
    rightWing: [75, 40],
  },
  time: 0,
}])

const selectedPlayer = ref<string>(Object.keys(players.value)[0]);
const playing = ref<boolean>(false);
const keyFrameSelection = ref<number>(0)

const selectedKeyFrame = computed<Keyframe>(() => keyframes.value[keyFrameSelection.value]);

function addKeyframe(): void {
  const lastKeyFrame = Object.keys(keyframes.value);
  keyframes.value.push(JSON.parse(JSON.stringify(keyframes.value[lastKeyFrame.length - 1])));
}

const getPlayerX = (index: string) => selectedKeyFrame.value.players[index][0]
const getPlayerY = (index: string) => selectedKeyFrame.value.players[index][1]

addKeyframe();

function startDrag(evt: DragEvent, itemId: string) {
  if (itemId !== selectedPlayer.value) {
    evt.preventDefault();
    return;
  }
  if (!evt.dataTransfer) {
    return;
  }
  evt.dataTransfer.effectAllowed = 'move';
  evt.dataTransfer.dropEffect = 'move';
}

function onDrop(evt: DragEvent) {
  if (evt.target === null) {
    return;
  }
  const target = evt.target as HTMLDivElement;
  const targetWidth = target.clientWidth;
  const targetHeight = target.clientHeight;
  const newX = evt.offsetX / targetWidth * 100;
  const newY = 100 - (evt.offsetY / targetHeight * 100);
  console.table({newX, newY})
  selectedKeyFrame.value.players[selectedPlayer.value] = [
    Math.ceil(newX),
    Math.ceil(newY),
  ];
}

watch(
  keyFrameSelection,
  function (newValue) {
  currentTime.value = Number(newValue) * keyFrameLength.value;
});

let interval: number | null = null;
let lastFrame: boolean = false;
function togglePlayback(): void {
  if (interval === null) {
    keyFrameSelection.value = 0;
    playing.value = true;
    interval = setInterval(function () {
      if (keyFrameSelection.value >= keyframes.value.length - 1 && !lastFrame) {
        lastFrame = true;
      } else if (lastFrame) {
        keyFrameSelection.value = 0;
        lastFrame = false;
      } else {
        keyFrameSelection.value++
      }
    }, keyFrameLength.value)
  } else {
    clearInterval(interval);
    playing.value = false;
    interval = null;
    keyFrameSelection.value = 0;
  }
}

</script>

<template>
  <ContainerComponent class="space-y-4">
    <h1 class="text-3xl">Move</h1>

    <div
      class="w-full relative aspect-3/2 bg-green-400"
      @dragover="e => e.preventDefault()"
      @drop.prevent="e => onDrop(e)"
    >
      <div
        v-for="(number, index) in players"
        :key="index"
        class="absolute cursor-pointer rounded-3xl w-[2rem] h-[2rem] flex flex-row items-center justify-center border-gray-700 border-sm"
        :class="{
          'bg-red-400': selectedPlayer === index && !playing,
          'bg-red-500': playing || selectedPlayer !== index,
        }"
        :style="{
          left: `calc(${getPlayerX(index)}% - 1rem)`,
          bottom: `calc(${getPlayerY(index)}% - 1rem)`,
          ...(playing && keyFrameSelection > 0) ? {
            'transition-property': 'all',
            'transition-duration': `${keyFrameLength}ms`,
            'transition-timing-function': 'linear',
          } : []
        }"
        draggable="true"
        @click="selectedPlayer = index"
        @dragstart="e => startDrag(e, index)"
        v-text="number"
      />
    </div>
    <section class="flex flex-row gap-x-4 *:flex *:flex-col">

      <div class="max-w-32 [&>label]:flex [&>label]:flex-col">
        <span v-text="selectedPlayer" />
        <label for="y">
          <span>
            y: <input
              id="yNumber"
              v-model="keyframes[keyFrameSelection]['players'][selectedPlayer][1]"
              type="number"
              name="yNumber"
              min="0"
              max="100"
              step="1" />
          </span>
          <input
            id="y"
            v-model="keyframes[keyFrameSelection]['players'][selectedPlayer][1]"
            style="writing-mode: vertical-rl"
            class="rotate-180"
            type="range"
            name="y"
            step="1" />
        </label>
        <label for="x">
          <span>
            x: <input
              id="xNumber"
              v-model="keyframes[keyFrameSelection]['players'][selectedPlayer][0]"
              type="number"
              name="xNumber"
              min="0"
              max="100"
              step="1" />
          </span>
          <input
            id="x"
            v-model="keyframes[keyFrameSelection]['players'][selectedPlayer][0]"
            type="range"
            name="x"
            step="1"/>
        </label>
      </div>
      <section class="space-y-2">
        <h3 class="text-xl">Keyframe Select</h3>
        <label
          v-for="key in keyframes.keys()"
          :key="key"
          :for="key.toString()"
          class="flex flex-row gap-4"
        >
          <span v-text="key" />
          <input
            :id="key.toString()"
            v-model="keyFrameSelection"
            :value="key"
            type="radio"
          />
          <span
            class="cursor-pointer font-extrabold text-red-700"
            @click="keyframes.splice(key, 1)"
          >X</span>
        </label>
        <ButtonComponent @click="addKeyframe">Add Keyframe</ButtonComponent>
      </section>
      <section>
        <ButtonComponent @click="togglePlayback">{{ playing ? 'Pause' : 'Play' }}</ButtonComponent>
      </section>
    </section>
  </ContainerComponent>
</template>

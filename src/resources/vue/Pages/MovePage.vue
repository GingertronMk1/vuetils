<script setup lang="ts">

import { computed, ref } from 'vue'
import ContainerComponent from '@/resources/vue/Components/ContainerComponent.vue'

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

</script>

<template>
  <ContainerComponent>
    <h1 class="text-3xl">Move</h1>

    <div class="w-full relative aspect-3/2">
      <div
        v-for="(number, index) in players"
        :key="index"
        class="absolute cursor-pointer rounded-3xl w-[2rem] h-[2rem] flex flex-row items-center justify-center"
        :class="{
          'bg-blue-500': selectedPlayer === index && !playing,
          'bg-green-500': selectedPlayer !== index,
          'transition-all': playing
        }"
        :style="{
          left: `calc(${getPlayerX(index)}% - 1rem)`,
          bottom: `calc(${getPlayerY(index)}% - 1rem)`,
        }"
        @click="selectedPlayer = index"
        v-text="number"/>
    </div>
    <section class="flex flex-row gap-x-4">

      <div class="flex flex-col max-w-32 [&>label]:flex [&>label]:flex-col ">

        <span v-text="selectedPlayer" />
        <label for="x">
          <span>
            x: <input
              id="xNumber"
              v-model="keyframes[keyFrameSelection]['players'][selectedPlayer][0]"
              type="number"
              name="xNumber"
              min="0"
              max="100"
              step="0.1" />
          </span>
          <input
            id="x"
            v-model="keyframes[keyFrameSelection]['players'][selectedPlayer][0]"
            type="range"
            name="x"
            step="0.1"/>
        </label>
        <label for="y">
          <span>
            y: <input
              id="yNumber"
              v-model="keyframes[keyFrameSelection]['players'][selectedPlayer][1]"
              type="number"
              name="yNumber"
              min="0"
              max="100"
              step="0.1" />
          </span>
          <input
            id="y"
            v-model="keyframes[keyFrameSelection]['players'][selectedPlayer][1]"
            type="range"
            name="y"
            step="0.1" />
        </label>
      </div>
      <section>

        <fieldset class="flex flex-col">
          <label
            v-for="key in keyframes.keys()"
            :key="key"
            :for="key.toString()">
            {{ key }}
            <input
              :id="key.toString()"
              v-model="keyFrameSelection"
              :value="key"
              type="radio"
            />
          </label>
        </fieldset>
        <button @click="addKeyframe">Add Keyframe</button>
      </section>
    </section>
  </ContainerComponent>
</template>

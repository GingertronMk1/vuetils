<script setup lang="ts">

import { computed, ref, watch } from 'vue'
import ContainerComponent from '@/resources/vue/Components/ContainerComponent.vue'
import ButtonComponent from '@/resources/vue/Components/ButtonComponent.vue'

const keyFrameLength = ref<number>(1000);
const currentTime = ref<number>(0);

type PlayerList = Record<string, number>;

type ObjectList = Record<string, object>;

type Positions = 'attack' | 'defense' | 'objects';

type PositionList<TPlayer, TObject> = {
  attack: TPlayer;
  defense: TPlayer;
  objects: TObject;
}

const players = ref<PositionList<PlayerList, ObjectList>>({
  attack: {
    leftWing: 1,
    rightWing: 1,
    leftLink: 2,
    rightLink: 2,
    leftMid: 3,
    rightMid: 3,
  },
  defense: {
    leftWing: 1,
    rightWing: 1,
    leftLink: 2,
    rightLink: 2,
    leftMid: 3,
    rightMid: 3,
  },
  objects: {}
});

type PlayerLocation = [number, number];
type PlayerLocationList = Record<string, PlayerLocation>;

type Keyframe = {
  time: number;
  players: PositionList<PlayerLocationList, PlayerLocationList>;
}

const keyframes = ref<Keyframe[]>([{
  players: {
    attack: {
      leftWing: [25, 40],
      leftLink: [35, 40],
      leftMid: [45, 40],
      rightMid: [55, 40],
      rightLink: [65, 40],
      rightWing: [75, 40],
    },
    defense: {
      leftWing: [25, 60],
      leftLink: [35, 60],
      leftMid: [45, 60],
      rightMid: [55, 60],
      rightLink: [65, 60],
      rightWing: [75, 60],
    },
    objects: {}
  },
  time: 0,
}])

const selectedPlayer = ref<[Positions, string]>(['attack', Object.keys(players.value['attack'])[0]]);
const playing = ref<boolean>(false);
const keyFrameSelection = ref<number>(0)

const selectedKeyFrame = computed<Keyframe>(() => keyframes.value[keyFrameSelection.value]);

function addKeyframe(): void {
  const lastKeyFrame = Object.keys(keyframes.value);
  keyframes.value.push(JSON.parse(JSON.stringify(keyframes.value[lastKeyFrame.length - 1])));
}

const getPlayerX = (positionGroup: Positions, index: string): number =>
  selectedKeyFrame.value.players[positionGroup][index][0]
const getPlayerY = (positionGroup: Positions, index: string): number =>
  selectedKeyFrame.value.players[positionGroup][index][1]

addKeyframe();

function startDrag(evt: DragEvent, itemPosition: Positions, itemId: string) {
  const [selectedPosition, selectedId] = selectedPlayer.value;
  if (itemPosition !== selectedPosition || itemId !== selectedId) {
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
  const [selectedPosition, selectedPlayerId] = selectedPlayer.value;
  selectedKeyFrame.value.players[selectedPosition][selectedPlayerId] = [
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
        v-for="(number, index) in players.attack"
        :key="index"
        class="absolute cursor-pointer rounded-3xl w-[2rem] h-[2rem] flex flex-row items-center justify-center border-gray-700 border-2 bg-red-500"
        :class="{
          'bg-red-400': selectedPlayer[0] === 'attack' && selectedPlayer[1] === index && !playing,
        }"
        :style="{
          left: `calc(${getPlayerX('attack', index)}% - 1rem)`,
          bottom: `calc(${getPlayerY('attack', index)}% - 1rem)`,
          ...(playing && keyFrameSelection > 0) ? {
            'transition-property': 'all',
            'transition-duration': `${keyFrameLength}ms`,
            'transition-timing-function': 'linear',
          } : []
        }"
        draggable="true"
        @click="selectedPlayer = ['attack', index]"
        @dragstart="e => startDrag(e, 'attack', index)"
        v-text="number"
      />
    </div>
    <section class="flex flex-row gap-x-4 *:flex *:flex-col">

      <div class="max-w-32 [&>label]:flex [&>label]:flex-col">
        <span v-text="selectedPlayer.join(', ')" />
        <label for="y">
          <span>
            y: <input
              id="yNumber"
              v-model="keyframes[keyFrameSelection]['players'][selectedPlayer[0]][selectedPlayer[1]][1]"
              type="number"
              name="yNumber"
              min="0"
              max="100"
              step="1" />
          </span>
          <input
            id="y"
            v-model="keyframes[keyFrameSelection]['players'][selectedPlayer[0]][selectedPlayer[1]][1]"
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
              v-model="keyframes[keyFrameSelection]['players'][selectedPlayer[0]][selectedPlayer[1]][0]"
              type="number"
              name="xNumber"
              min="0"
              max="100"
              step="1" />
          </span>
          <input
            id="x"
            v-model="keyframes[keyFrameSelection]['players'][selectedPlayer[0]][selectedPlayer[1]][0]"
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

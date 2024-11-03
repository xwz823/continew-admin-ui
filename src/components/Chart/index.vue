<template>
  <VCharts v-if="renderChart" :option="option" :autoresize="autoResize" :style="{ width, height }" ref="chart" />
</template>

<script lang="ts" setup>
import { registerMap } from 'echarts/core';
import { nextTick, ref } from 'vue'
import VCharts from 'vue-echarts'
import worldMap from './world.json'
import chinaMap from './china.json'
defineProps({
  option: {
    type: Object,
    default() {
      return {}
    },
  },
  autoResize: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '100%',
  },
})
registerMap('world', worldMap)
registerMap('china', chinaMap)
const renderChart = ref(false)
const chart = ref(null)
defineExpose({
  chart
})
// wait container expand
nextTick(() => {
  renderChart.value = true
})
</script>

<style scoped lang="less"></style>

<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card class="general-card" title="访问趋势">
      <template #extra>
        <a-radio-group v-model:model-value="dateRange" type="button" size="small" @change="onChange as any">
          <a-radio value="world">世界</a-radio>
          <a-radio value="china">中国</a-radio>
        </a-radio-group>
      </template>
      <div class="content">
        <div class="mapChart">
          <Chart :option="chartOption" style="height: 600px" ref="chartRef" />
        </div>
        <div class="dataShow">
          <div class="dataItem" v-for="item in data" :key="item.name">
            <div class="title">
              <span>{{ item.name }}</span>
              <span>{{ item.value }}</span>
            </div>
            <a-progress color="#246EFF" size="medium" :percent="(item.value - 0) / 100" :show-text="false" />
          </div>
        </div>
      </div>

    </a-card>
  </a-spin>
</template>

<script lang="ts" setup>
import { type EChartsOption, graphic } from 'echarts'
import { type DashboardAccessTrendResp, getDashboardAccessTrend as getData } from '@/apis'
import { useChart } from '@/hooks'

const chartRef = ref(null)
const xAxis = ref<string[]>([])
const pvChartData = ref<number[]>([])
const ipChartData = ref<number[]>([])
const data = [
  { name: "河北省", value: 9 },
  { name: "山西省", value: 9 },
  { name: "辽宁省", value: 9 },
  { name: "吉林省", value: 9 },
  { name: "黑龙江省", value: 9 },
  { name: "江苏省", value: 9 },
  { name: "浙江省", value: 2000 },
  { name: "安徽省", value: 9 },
  { name: "福建省", value: 9 },
  { name: "江西省", value: 9 },
  { name: "山东省", value: 9 },
  { name: "河南省", value: 9 },
  { name: "湖北省", value: 9 },
  { name: "湖南省", value: 9 },
  { name: "广东省", value: 9 },
  { name: "海南省", value: 9 },
  { name: "四川省", value: 9 },
  { name: "贵州省", value: 9 },
  { name: "云南省", value: 9 },
  { name: "陕西省", value: 9 },
  { name: "甘肃省", value: 9 },

];
const { chartOption } = useChart((isDark: EChartsOption) => {
  return {
    visualMap: {
      left: 'left',
      min: 1,
      max: 20000,
      inRange: {
        color: [
          '#81E2FF',
          '#246EFE',
        ]
      },
      calculable: false
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>访问量：{c}'
    },

    series: [
      {
        type: 'map',
        map: 'china',
        label: {
          show: false
        },
        itemStyle: {
          color: '#F7F8FA'
        },
        data: data
      }

    ]
  };
})

const loading = ref(false)
const dateRange = ref('china')
// 查询图表数据
const getChartData = async (days: number) => {
  try {
    loading.value = true
    xAxis.value = []
    pvChartData.value = []
    ipChartData.value = []
    const { data: chartData } = await getData(days)
    chartData.forEach((item: DashboardAccessTrendResp) => {
      xAxis.value.push(item.date)
      pvChartData.value.push(item.pvCount)
      ipChartData.value.push(item.ipCount)
    })
  } finally {
    loading.value = false
  }
}

// 切换
const onChange = (type: string) => {
  chartRef.value?.chart.setOption({
    series: [{
      map: type,
      label: {
        show: false
      },
      itemStyle: {
        color: '#F7F8FA'
      },
      data: data
    }]
  })
}

onMounted(() => {
  getChartData(30)
})
</script>
<style lang="scss" scoped>
.content {
  display: flex;

  .mapChart {
    flex: 3;
  }

  .dataShow {
    height: 100%;
    max-height: 500px;
    flex: 1;
    padding: 16px 24px;
    border-radius: 5px;
    overflow: auto;
    background-color: #333333;

    .dataItem {
      padding-top: 10px;

      .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .dataItem:first-child {
      padding-top: 0;
    }

    &::-webkit-scrollbar {
      display: none;
      /* 隐藏滚动条 */
    }
  }
}
</style>
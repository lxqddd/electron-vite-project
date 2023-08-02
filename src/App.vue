<script setup lang="ts">
import { NButton, NRadioGroup, NSpace, NRadio, NInput } from 'naive-ui'
import { onMounted, ref } from 'vue'
const projectName = ref('')
const projectType = ref<'vue' | 'react'>('vue')
const projectDir = ref('')
const logs = ref<string[]>([])
const handleSelectProjectDir = async () => {
  projectDir.value = await window.electronApi.selectProjectDir()
  console.log('select folder', projectDir.value)
}

const handleCreateProject = async () => {
  await window.electronApi.createProject(projectName.value, projectType.value)
}

const handleInstallDependency = async () => {
  await window.electronApi.installProjectDependency()
  console.log('install dependency')
}

const handleRunProject = async () => {
  await window.electronApi.runProject()
  console.log('run project')
}

const handleOpenInBrowner = async () => {
  console.log('open inBrowner')
}

const handleExitedRunning = async () => {
  await window.electronApi.exitedProject()
}

onMounted(() => {
  window.electronApi.projectLogs((_e: any, data: string) => {
    logs.value.push(data)
  })
})

</script>

<template>
  <div class="app">
    <div class="action">
      <div>
        <NButton type="info" @click="handleSelectProjectDir">选择项目位置</NButton>
      </div>
      <div class="mt8">项目目录：{{ projectDir }}</div>
      <div class="mt8">
        项目名称：<NInput v-model:value="projectName" placeholder="请输入项目名称" style="width: 260px;" />
      </div>
      <div class="mt8">
        项目类型：
        <NRadioGroup v-model:value="projectType">
          <NSpace>
            <NRadio value="vue">vue</NRadio>
            <NRadio value="react">react</NRadio>
          </NSpace>
        </NRadioGroup>
      </div>
      <div class="mt8">
        <NButton type="info" @click="handleCreateProject">创建项目</NButton>
      </div>
      <div class="mt8">
        <NButton type="info" @click="handleInstallDependency">安装依赖</NButton>
      </div>
      <div class="mt8">
        <NButton type="info" @click="handleRunProject">运行项目</NButton>
      </div>
      <div class="mt8">
        <NButton type="info" @click="handleOpenInBrowner">在浏览器中打开</NButton>
      </div>
      <div class="mt8">
        <NButton type="info" @click="handleExitedRunning">结束运行</NButton>
      </div>
    </div>
    <div class="logs">
      <ul>
        <li v-for="(log, index) in logs" :key="index">
          {{ log }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mt8 {
  margin-top: 8px;
}

.app {
  display: flex;
  height: 100%;
  .action {
    flex: 1;
  }
  .logs {
    height: 100%;
    flex: 1;
    border-left: 1px solid#000;
    overflow-y: auto;
  }
}
</style>

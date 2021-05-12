<template>
  <a-result status="404" sub-title="您请求的页面不存在" title="404">
    <template #extra>
      <a-button type="primary" @click="() => $router.go(-1)">返回上一页</a-button>
    </template>
  </a-result>
</template>

<script>
export default {}
</script>

<style scoped>

</style>
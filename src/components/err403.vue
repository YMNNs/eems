<template>
  <a-result status="403" sub-title="您没有权限访问此页面" title="403">
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
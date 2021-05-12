<template>
  <!--    页头-->
  <a-page-header sub-title="管理接报，当发生紧急事件时工作人员立即创建接报，输入接报的基本信息，并提交领导审批，审批通过后开始执行。" title="接报维护"
                 @back="() => $router.go(-1)">
    <template #tags>
      <a-tag color="blue">工作人员</a-tag>
    </template>
  </a-page-header>
  <br>
  <!--  删掉下面那行并且开始写东西-->
  <a-skeleton active/>
</template>

<script>
export default {
  name: "case_staff"
}
</script>

<style scoped>

</style>
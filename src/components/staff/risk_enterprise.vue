<template>
  <!--    页头-->
  <a-page-header sub-title="维护风险企业的基本信息。" title="风险企业维护"
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
  name: "risk_enterprise"
}
</script>

<style scoped>

</style>
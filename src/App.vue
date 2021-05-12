<template>
  <!--  语言设置-->
  <a-config-provider :locale="zhCN">
    <router-view/>
  </a-config-provider>
</template>

<script>
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import {defineComponent} from 'vue';

export default defineComponent({
  setup() {
    return {
      zhCN,
    };
  },
});
</script>

<style scoped>

</style>
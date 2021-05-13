<template>
  <a-result :title="title">
    <template #icon>
      <template v-if="!ready">
        <DislikeTwoTone/>
      </template>
      <template v-else>
        <LeftCircleTwoTone/>
      </template>
    </template>
    <template #extra>
      <a-button v-if="!ready" type="primary" @click="showInstruction">我是狗</a-button>
      <p v-if="ready">从左侧列表中选择一项功能以开始。</p>
    </template>
  </a-result>
</template>
<script>
import {DislikeTwoTone, LeftCircleTwoTone} from '@ant-design/icons-vue';
import {defineComponent, reactive, toRefs} from 'vue';

export default defineComponent({
  components: {
    DislikeTwoTone,
    LeftCircleTwoTone
  },
  setup() {
    const state = reactive({
      ready: false,
      title: 'Vue.js, 狗都不用',
    });

    const showInstruction = () => {
      state.ready = true
      state.title = '很好'
    };

    return {
      showInstruction,
      ...toRefs(state)
    }
  },
});
</script>
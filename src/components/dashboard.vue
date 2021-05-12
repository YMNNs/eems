<template>
  <a-result :title="title">
    <template #icon>
      <template v-if="!ready">
        <AlertTwoTone/>
      </template>
      <template v-else>
        <LeftCircleTwoTone/>
      </template>
    </template>
    <template #extra>
      <a-button v-if="!ready" type="primary" @click="showInstruction">我准备好了</a-button>
      <p v-if="ready">从左侧列表中选择一项功能以开始。</p>
    </template>
  </a-result>
</template>
<script>
import {AlertTwoTone, LeftCircleTwoTone} from '@ant-design/icons-vue';
import {defineComponent, reactive, toRefs} from 'vue';

export default defineComponent({
  components: {
    AlertTwoTone,
    LeftCircleTwoTone
  },
  setup() {
    const state = reactive({
      ready: false,
      title: localStorage.getItem('username') + '，准备好被资本割韭菜了吗？',
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
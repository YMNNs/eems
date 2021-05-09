<template>
  <div>
    <a-row>
      <!--尝试删掉a-row-->
      <a-col id="col" :xs="2" :sm="4" :md="6" :lg="8" :xl="10"/>
      <a-col id="col" :xs="20" :sm="16" :md="12" :lg="8" :xl="4">
        <div class="login-form">
          <a-input size="large" placeholder="用户名" v-model:value="form.username">
            <template #prefix>
              <user-outlined type="user"/>
            </template>
          </a-input>
          <br>
          <br>
          <a-input-password size="large" placeholder="密码" @keyup.enter.prevent="handleSubmit" block
                            v-model:value="form.password">
            <template #prefix>
              <lock-outlined type="password"/>
            </template>
          </a-input-password>
          <br>
          <br>
          <a-button size="large" type="primary" @click="handleSubmit" block :loading="loading">登录</a-button>
        </div>
      </a-col>
      <a-col id="col" :xs="2" :sm="4" :md="6" :lg="8" :xl="10"/>
    </a-row>
  </div>
</template>

<script>
import {LockOutlined, UserOutlined} from '@ant-design/icons-vue';
import {message} from 'ant-design-vue';
import {defineComponent, reactive, toRefs} from 'vue';

import {useStore} from 'vuex'

export default defineComponent({
  components: {
    UserOutlined,
    LockOutlined
  },

  setup() {

    const state = reactive({
      loading: false,
      form: {
        username: "",
        password: ""
      }
    })

    const store = useStore()

    const handleSubmit = async () => {
      state.loading = true
      const {username, password} = state.form
      if (username.trim() === '' || password.trim() === '') {
        // 人机交互：按钮保持加载状态至少0.5s
        setTimeout(function () {
          state.loading = false
        }, 500)
        return message.warning('要登录，请填写所有字段。')
      }
      const res = await store.dispatch('LoginResult',state.form)
      console.log(res)
      console.log(store.state)
      setTimeout(function () {
        state.loading = false
      }, 500)
    }

    return {
      ...toRefs(state),
      handleSubmit,
    };
  },
});

</script>

<style scoped>
.login-form {
  margin-top: 75%;
}
</style>
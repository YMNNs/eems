<template>
  <div>
    <a-row>
      <!--尝试删掉a-row-->
      <a-col id="col" :lg="8" :md="6" :sm="4" :xl="10" :xs="2"/>
      <a-col id="col" :lg="8" :md="12" :sm="16" :xl="4" :xs="20">
        <div class="login-form">
          <a-input v-model:value="form.username" autofocus placeholder="用户名" size="large">
            <template #prefix>
              <user-outlined type="user"/>
            </template>
          </a-input>
          <br>
          <br>
          <a-input-password v-model:value="form.password" block placeholder="密码" size="large"
                            @keyup.enter.prevent="handleSubmit">
            <template #prefix>
              <lock-outlined type="password"/>
            </template>
          </a-input-password>
          <br>
          <br>
          <a-button :loading="loading" :type="buttonType" block size="large" @click="handleSubmit">
            <ArrowRightOutlined/>
          </a-button>
        </div>
      </a-col>
      <a-col id="col" :lg="8" :md="6" :sm="4" :xl="10" :xs="2"/>
    </a-row>
  </div>
</template>

<script>
import {LockOutlined, UserOutlined, ArrowRightOutlined} from '@ant-design/icons-vue';
import {message} from 'ant-design-vue';
import {defineComponent, reactive, toRefs} from 'vue';

import {useStore} from 'vuex'

export default defineComponent({
  components: {
    UserOutlined,
    LockOutlined,
    ArrowRightOutlined
  },

  setup() {
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    const state = reactive({
      loading: false,
      buttonType: 'primary',
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
      const res = await store.dispatch('LoginResult', state.form)
      console.log(res)
      setTimeout(function () {
        state.loading = false
      }, 500)
      if (!res.userId) {
        return message.error('您输入的用户名或密码不正确。')
      }
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
<template>
  <div>
    <!--    页头-->
    <a-page-header sub-title="通过此页面向系统中添加，查询，修改用户信息以及删除用户。" title="注册" @back="() => $router.go(-1)">
      <template #tags>
        <a-tag color="orange">管理员</a-tag>
      </template>
      <template v-slot:extra>
        <a-button key="3">Operation</a-button>
        <a-button key="2">Operation</a-button>
        <a-button key="1" type="primary">Primary</a-button>
      </template>
      <br>
      <a-row type="flex">
        <a-statistic :style="{margin:' 0 32px'}" title="总用户数" value="10"/>
        <a-statistic :style="{margin:' 0 32px'}" title="启用用户数" value="6"/>
        <a-statistic :style="{margin:' 0 32px'}" title="禁用用户数" value="4"/>
      </a-row>
    </a-page-header>
    <!--   表格-->
    <a-table :columns="columns" :data-source="data">

      <!--      自定义渲染-->
      <!--      <template #tags="{ text: tags }">-->
      <!--      <span>-->
      <!--        <a-tag-->
      <!--            v-for="tag in tags"-->
      <!--            :key="tag"-->
      <!--            :color="tag === 'loser' ? 'volcano' : tag.length > 5 ? 'geekblue' : 'green'"-->
      <!--        >-->
      <!--          {{ tag.toUpperCase() }}-->
      <!--        </a-tag>-->
      <!--      </span>-->
      <!--      </template>-->
      <template #tag="{text:tag}">
        <span>
          <a-tag :key="tag" :color="()=>{
            if (tag === '管理员'){
              return 'orange'
            }
          }">{{ tag }}</a-tag>
        </span>
      </template>
      <template #action="{ record }">
      <span>
        <a>Invite 一 {{ record.name }}</a>
        <a-divider type="vertical"/>
        <a>Delete</a>
        <a-divider type="vertical"/>
        <a class="ant-dropdown-link">
          More actions
          <down-outlined/>
        </a>
      </span>
      </template>
    </a-table>
  </div>
</template>

<script>
import {DownOutlined} from '@ant-design/icons-vue';
import {defineComponent} from 'vue';

const columns = [
  {
    dataIndex: 'id',
    key: 'id',
    title: 'ID',
  },
  {
    title: '账号',
    dataIndex: 'userId',
    key: 'userId',
  },
  {
    title: '密码',
    dataIndex: 'password',
    key: 'password',
    slots: {
      customRender: 'password',
    },
  }, {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '性别',
    dataIndex: 'gender',
    key: 'gender',
  }, {
    title: '出生日期',
    dataIndex: 'dob',
    key: 'dob',
  }, {
    title: '会员类型',
    dataIndex: 'role',
    key: 'role',
    slots: {
      customRender: 'tag',
    },
  },
];
const data = [
  {
    id: 1,
    userId: 'admin',
    name: 'name',
    password: '123',
    gender: '男',
    dob: '2021/05/10',
    type: '管理员'
  },
];
export default defineComponent({
  setup() {
    return {
      data,
      columns,
    };
  },

  components: {
    DownOutlined,
  },
});
</script>

<style scoped>
.demo-page-header :deep(tr:last-child td) {
  padding-bottom: 0;
}
</style>
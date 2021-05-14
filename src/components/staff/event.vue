<template>
  <!--    页头-->
  <a-page-header sub-title="维护事件，将可能发生的事件添加到系统。" title="事件维护"
                 @back="() => $router.go(-1)">
    <template #tags>
      <a-tag color="blue">工作人员</a-tag>
    </template>
  </a-page-header>
  <br/>

  <a-row type="flex" justify="space-around">
    <a-col :span="4">
      <a-card title="事件">
        <template #extra>
          <a-button type="link" v-if="!checkable" shape="circle" @click="checkable=true">
            <template #icon>
              <EditOutlined/>
            </template>
          </a-button>
          <a-button type="link" v-if="checkable" shape="circle" @click="showDrawer=true">
            <template #icon>
              <PlusOutlined/>
            </template>
          </a-button>
          <a-button type="link" style="color: red" v-if="checkable" shape="circle" @click="deleteEvent">
            <template #icon>
              <DeleteOutlined/>
            </template>
          </a-button>
          <a-button type="link" v-if="checkable" shape="circle" @click="checkable=false">
            <template #icon>
              <CheckOutlined/>
            </template>
          </a-button>
        </template>
        <a-tree :tree-data="treeData" :checkable="checkable" show-icon default-expand-all
                v-model:checkedKeys="checkedKeys"
                v-model:selectedKeys="selectedKeys">
          <template #database>
            <DatabaseOutlined/>
          </template>
          <template #container>
            <ContainerOutlined/>
          </template>
        </a-tree>
      </a-card>
    </a-col>
    <a-col :span="2"/>
    <a-col :span="16">
      <a-card v-if="showDetail">
        <a-descriptions title="详细信息" bordered :column="2">
          <template #extra>
            <a-button type="link" v-if="!checkable" shape="circle">
              <template #icon>
                <EditOutlined/>
              </template>
            </a-button>
          </template>
          <a-descriptions-item label="事件名称">{{selectData.name}}</a-descriptions-item>
          <a-descriptions-item label="事件类型">{{selectData.type}}</a-descriptions-item>
          <a-descriptions-item label="事件编号">{{selectData.code}}</a-descriptions-item>
          <a-descriptions-item label="事件等级">{{selectData.level}}</a-descriptions-item>
          <a-descriptions-item label="备注">{{selectData.desc}}</a-descriptions-item>
        </a-descriptions>
      </a-card>
    </a-col>
    <a-col :span="2"/>
  </a-row>

</template>

<script>
import {message} from 'ant-design-vue';
import {
  DatabaseOutlined,
  ContainerOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';
import {defineComponent, reactive, ref, watch} from 'vue';


export default defineComponent({
  components: {
    DatabaseOutlined,
    ContainerOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    PlusOutlined
  },
  setup() {
    const treeData = reactive([
      {
        title: '自然灾害',
        key: '自然灾害',
        slots: {
          icon: 'database',
        },
        selectable: false,
        children: [
          {title: '洪涝灾害', key: '洪涝灾害', slots: {icon: 'container'}},
          {title: '台风', key: '台风', slots: {icon: 'container'}},
          {title: '地震', key: '地震', slots: {icon: 'container'}},
        ],
      },
      {
        title: '事故灾难',
        key: '事故灾难',
        slots: {
          icon: 'database',
        },
        selectable: false,
        children: [
          {title: '核电站泄漏', key: '核电站泄漏', slots: {icon: 'container'}},
        ],
      },
      {
        title: '公共卫生事件',
        key: '公共卫生事件',
        slots: {
          icon: 'database',
        },
        selectable: false,
        children: [
          {title: '新冠疫情', key: '新冠疫情', slots: {icon: 'container'}},
        ],
      },
    ]);

    const infoData = reactive([
      {
        name: '洪涝灾害',
        type: '自然灾害',
        code: '00001',
        level: '二级',
        desc: '洪涝灾害包括洪水灾害和雨涝灾害两类.',
      },
      {
        name: '台风',
        type: '自然灾害',
        code: '00002',
        level: '三级',
        desc: '',
      },
      {
        name: '地震',
        type: '自然灾害',
        code: '00003',
        level: '一级',
        desc: '',
      },
      {
        name: '核电站泄漏',
        type: '事故灾难',
        code: '00004',
        level: '一级',
        desc: '',
      },
      {
        name: '新冠疫情',
        type: '公共卫生事件',
        code: '00005',
        level: '一级',
        desc: '',
      },
    ]);
    const selectedKeys = ref([]);
    const selectData = ref({});
    const checkable = ref(false);
    const checkedKeys = ref([]);
    const showDrawer = ref(false);
    const showDetail = ref(false);
    watch(selectedKeys, () => {
      showDetail.value = (selectedKeys.value.length !== 0)
      if (selectedKeys.value.length)
        selectData.value = (() => {
          let result = {}
          infoData.forEach((item) => {
            if (item.name === selectedKeys.value[0]){
              console.log(item)
              result = item
            }
          })
          return result
        })()
      console.log(selectData.value)
    })
    watch(checkedKeys, (newVal, oldVal) => {
      console.log(newVal, oldVal)
      checkedKeys.value.forEach((str) => {
        if (str !== '')
          console.log(str);
      })
    })
    const deleteEvent = () => {
      if (checkedKeys.value.length === 0)
        message.error('没有选择任何事件！');
      else {
        checkedKeys.value.forEach((str) => {
          treeData.forEach((item, index, arr) => {
            if (item.key === str)
              arr.splice(index, 1);
            else
              item.children.forEach((item, index, arr) => {
                if (item.key === str)
                  arr.splice(index, 1);
              })
          })
        });
        message.success('删除成功！')
        checkedKeys.value = []
      }

    }
    return {
      selectedKeys,
      treeData,
      checkable,
      checkedKeys,
      deleteEvent,
      showDrawer,
      showDetail,
      selectData
    };
  },
});
</script>



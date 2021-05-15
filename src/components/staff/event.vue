<template>
  <!--    页头-->
  <a-page-header sub-title="维护事件，将可能发生的事件添加到系统。" title="事件维护"
                 @back="() => $router.go(-1)">
    <template #tags>
      <a-tag color="blue">工作人员</a-tag>
    </template>
  </a-page-header>
  <br/>

  <a-row type="flex" justify="space-around" align="middle">
    <a-col :span="4">
      <a-card title="事件">
        <template #extra>
          <a-button type="link" v-if="!checkable" shape="circle" @click="checkable=true">
            <template #icon>
              <EditOutlined/>
            </template>
          </a-button>
          <a-button type="link" v-if="checkable" shape="circle" @click="showDrawer">
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
          <!--          需求无修改-->
          <!--          <template #extra>-->
          <!--            <a-button type="link" v-if="!checkable" shape="circle">-->
          <!--              <template #icon>-->
          <!--                <EditOutlined/>-->
          <!--              </template>-->
          <!--            </a-button>-->
          <!--          </template>-->
          <a-descriptions-item label="事件名称">{{ selectData.name }}</a-descriptions-item>
          <a-descriptions-item label="事件类型">{{ selectData.type }}</a-descriptions-item>
          <a-descriptions-item label="事件编号">{{ selectData.code }}</a-descriptions-item>
          <a-descriptions-item label="事件等级">{{ selectData.level }}</a-descriptions-item>
          <a-descriptions-item label="备注">{{ selectData.desc }}</a-descriptions-item>
        </a-descriptions>
      </a-card>
      <a-empty v-if="!showDetail" :image="simpleImage"/>
    </a-col>
    <a-col :span="2"/>
  </a-row>
  <a-drawer title="新建事件" :width="720" :visible="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
    <a-form :model="form" ref="formRef" :rules="rules" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="事件类型" name="type">
            <a-select placeholder="选择或新建类型" v-model:value="form.type" v-if="selectType">
              <template #dropdownRender="{ menuNode: menu }">
                <v-nodes :vnodes="menu"/>
                <a-divider style="margin: 4px 0"/>
                <div style="padding: 4px 8px; cursor: pointer" @click="() => {form.type = ''; selectType = false}"
                     @mousedown="e => e.preventDefault()">
                  <plus-outlined/>
                  新事件类型
                </div>
              </template>
              <a-select-option v-for="itemData in treeData" :key="itemData.key" :value="itemData.key">{{ itemData.key }}
              </a-select-option>
            </a-select>
            <a-input-search @search="() => {form.type = ''; selectType = true}" v-model:value="form.type"
                            v-if="!selectType" placeholder="请输入事件名称">
              <template #enterButton>
                <a-button>
                  <template #icon>
                    <RollbackOutlined/>
                  </template>
                </a-button>
              </template>
            </a-input-search>

          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="事件名称" name="name">
            <a-input v-model:value="form.name" placeholder="请输入事件名称"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="事件等级" name="level">
            <a-select placeholder="请选择事件等级" v-model:value="form.level">
              <a-select-option value="一级">一级</a-select-option>
              <a-select-option value="二级">二级</a-select-option>
              <a-select-option value="三级">三级</a-select-option>
              <a-select-option value="四级">四级</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="备注" name="desc">
            <a-textarea
                v-model:value="form.desc"
                :rows="4"
                placeholder="请输入描述"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div
        :style="{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: '100%',
        borderTop: '1px solid #e9e9e9',
        padding: '10px 16px',
        background: '#fff',
        textAlign: 'right',
        zIndex: 1,
      }"
    >
      <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
      <a-button type="primary" @click="onSubmit">添加事件</a-button>
    </div>
  </a-drawer>

</template>

<script>
import {message, Empty} from 'ant-design-vue';
import {
  DatabaseOutlined,
  ContainerOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  PlusOutlined,
  RollbackOutlined
} from '@ant-design/icons-vue';
import {defineComponent, reactive, ref, watch} from 'vue';

export default defineComponent({
  components: {
    DatabaseOutlined,
    ContainerOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    PlusOutlined,
    RollbackOutlined,
    VNodes: (_, {attrs}) => {
      return attrs.vnodes;
    },
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
        code: 1,
        level: '二级',
        desc: '洪涝灾害包括洪水灾害和雨涝灾害两类.',
      },
      {
        name: '台风',
        type: '自然灾害',
        code: 2,
        level: '三级',
        desc: '',
      },
      {
        name: '地震',
        type: '自然灾害',
        code: 3,
        level: '一级',
        desc: '',
      },
      {
        name: '核电站泄漏',
        type: '事故灾难',
        code: 4,
        level: '一级',
        desc: '',
      },
      {
        name: '新冠疫情',
        type: '公共卫生事件',
        code: 5,
        level: '一级',
        desc: '',
      },
    ]);
    const form = reactive({
      name: '',
      type: '',
      level: '',
      desc: '',
    });
    const rules = {
      name: [
        {
          required: true,
          message: '请输入事件名称',
        },
      ],
      type: [
        {
          required: true,
          message: '请选择事件类型',
        },
      ],
      level: [
        {
          required: true,
          message: '请选择事件等级',
        },
      ],
      desc: [
        {
          required: false,
        },
      ],
    };
    const visible = ref(false);

    const showDrawer = () => {
      visible.value = true;
    };

    const onClose = () => {
      selectType.value = true;
      formRef.value.resetFields();
      visible.value = false;
    };

    const formRef = ref();

    const index = ref(5);
    const onSubmit = () => {
      formRef.value.validate().then(() => {
        let typeExist = eval(treeData.map((item) => {
          return (item.key === form.type)
        }).join("+"));
        let childrenExist = eval(treeData.map((item) => {
          return eval(item.children.map((children) => {
            return (children.key === form.name)
          }).join("+"))
        }).join("+"))

        if (!childrenExist) {
          infoData.forEach((item, index, arr) => {
            if (item.name === form.name)
              arr.splice(index, 1);
          })
          if (typeExist)
            treeData.forEach((item) => {
              if (item.key === form.type)
                item.children.push({title: form.name, key: form.name, slots: {icon: 'container'}})
            })
          else
            treeData.push({
              title: form.type,
              key: form.type,
              slots: {
                icon: 'database',
              },
              selectable: false,
              children: [
                {title: form.name, key: form.name, slots: {icon: 'container'}},
              ],
            })
          console.log(form)
          infoData.push({
            name: form.name,
            type: form.type,
            code: index.value++,
            level: form.level,
            desc: form.desc,
          })
          onClose();
          message.success('添加成功！');
        } else
          message.warn('事件已存在');


      })
    }
    const selectedKeys = ref([]);
    const selectData = ref({});
    const checkable = ref(false);
    const checkedKeys = ref([]);
    // const showDrawer = ref(false);
    const showDetail = ref(false);
    watch(selectedKeys, () => {
      showDetail.value = (selectedKeys.value.length !== 0)
      if (selectedKeys.value.length)
        selectData.value = (() => {
          let result = {}
          infoData.forEach((item) => {
            if (item.name === selectedKeys.value[0]) {
              result = item
            }
          })
          return result
        })()
    })
    // watch(checkedKeys, (newVal, oldVal) => {
    //   console.log(newVal, oldVal)
    //   checkedKeys.value.forEach((str) => {
    //     if (str !== '')
    //       console.log(str);
    //   })
    // })
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
                if (item.key === str) {
                  arr.splice(index, 1);
                  if (item.key === selectedKeys.value[0])
                    selectedKeys.value = [];
                }
              })
          })
        });
        message.success('删除成功！');
        checkedKeys.value = [];
      }

    };
    const selectType = ref(true);
    return {
      selectedKeys,
      treeData,
      checkable,
      checkedKeys,
      deleteEvent,
      showDetail,
      selectData,
      form,
      rules,
      visible,
      showDrawer,
      onClose,
      onSubmit,
      formRef,
      selectType,
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
    };
  },
});
</script>



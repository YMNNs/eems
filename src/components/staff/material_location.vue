<template>
  <!--    页头-->
  <a-page-header sub-title="维护物资的位置信息。" title="物资位置维护"
                 @back="() => $router.go(-1)">
    <template #tags>
      <a-tag color="blue">工作人员</a-tag>
    </template>
  </a-page-header>
  <br/>
  <a-row type="flex" justify="space-around" align="middle">
<!--    <a-col :span="2"/>-->
    <a-col :span="24">

      <a-button @click="handleAdd" style="margin-bottom: 8px" type="primary">
        <template #icon>
          <PlusOutlined/>
        </template>
        新增
      </a-button>
      <a-table :columns="columns" :data-source="dataSource">
        <template #filterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
          <div style="padding: 8px">
            <a-input
                ref="searchInput"
                :placeholder="`搜索 ${column.dataIndex}`"
                :value="selectedKeys[0]"
                style="width: 188px; margin-bottom: 8px; display: block"
                @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
            />
            <a-button
                type="primary"
                size="small"
                style="width: 90px; margin-right: 8px"
                @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              <template #icon>
                <SearchOutlined/>
              </template>
              搜索
            </a-button>
            <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
              重置
            </a-button>
          </div>
        </template>
        <template #filterIcon="filtered">
          <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }"/>
        </template>
        <template #goods="{ record }">
          <div>
            <a-select
                mode="multiple"
                v-if="editableData[record.key]"
                v-model:value="editableData[record.key]['goods']"
                style="width: 350px"
            >
              <a-select-option v-for="item in goods" :key='item' :value='item'>{{ item }}
              </a-select-option>
            </a-select>
            <template v-else>
              <a-tag color="default" v-for="item in record.goods" :key="item">{{ item }}</a-tag>
            </template>
          </div>
        </template>
        <template #location="{ record }">
          <div>
            <a-select
                mode="multiple"
                v-if="editableData[record.key]"
                v-model:value="editableData[record.key]['location']"
                style="width: 350px"
            >
              <a-select-option v-for="item in location" :key='item' :value='item'>{{ item }}
              </a-select-option>
            </a-select>
            <template v-else>
              <a-tag color="default" v-for="item in record.location" :key="item">{{ item }}</a-tag>
            </template>
          </div>
        </template>
        <template #name="{record}">
          <div>
            <a-input
                v-if="editableData[record.key]"
                v-model:value="editableData[record.key]['name']"
                style="margin: -5px 0"
            />
            <template v-else>
              {{ record.name }}
            </template>
          </div>
        </template>
        <template #operation="{ record }">
          <div class="editable-row-operations">
              <span v-if="editableData[record.key]">
                  <a @click="save(record.key)">保存</a>
                <a-popconfirm title="将不会保存您-的更改" @confirm="cancel(record.key)">
                  <a>取消</a>
                </a-popconfirm>
              </span>
            <span v-else>
                <a @click="edit(record.key)">编辑</a>
                <a-popconfirm v-if="dataSource.length" title="确定删除吗？" @confirm="onDelete(record.key)">
                  <a>删除</a>
                </a-popconfirm>
              </span>
          </div>
        </template>
      </a-table>

    </a-col>
<!--    <a-col :span="2"/>-->
  </a-row>
  <a-drawer
      title="新建物资位置"
      :width="480"
      :visible="visible"
      :body-style="{ paddingBottom: '80px' }"
      @close="onClose"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="物资名称" name="name">
            <a-input v-model:value="form.name" placeholder="请输入物资名称"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="物资内容" name="goods">
            <a-select placeholder="请选择物资内容" mode="multiple" v-model:value="form.goods">
              <a-select-option v-for="item in goods" :key='item' :value='item'>{{ item }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="物资存放地点" name="location">
            <a-select placeholder="请选择物资存放地点" mode="multiple" v-model:value="form.location">
              <a-select-option v-for="item in location" :key='item' :value='item'>{{ item }}
              </a-select-option>
            </a-select>
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
      <a-button type="primary" @click="onSubmit">提交</a-button>
    </div>
  </a-drawer>
</template>

<script>
import {message} from 'ant-design-vue';
import {cloneDeep} from 'lodash-es';
import {defineComponent, reactive, ref} from 'vue';
import {SearchOutlined, PlusOutlined} from '@ant-design/icons-vue';

export default defineComponent({
  components: {
    SearchOutlined,
    PlusOutlined
  },
  setup() {
    const columns = [
      {
        title: '编号',
        dataIndex: 'key',
        width: '10%',
        slots: {
          customRender: 'key',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.key.toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
          if (visible) {
            setTimeout(() => {
              console.log(searchInput.value);
              searchInput.value.focus();
            }, 0);
          }
        },
      },
      {
        title: '物资名称',
        dataIndex: 'name',
        width: '15%',
        slots: {
          customRender: 'name',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.name.toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
          if (visible) {
            setTimeout(() => {
              console.log(searchInput.value);
              searchInput.value.focus();
            }, 0);
          }
        },
      },
      {
        title: '物资内容',
        dataIndex: 'goods',
        width: '30%',
        slots: {
          customRender: 'goods',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.goods.join('').toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
          if (visible) {
            setTimeout(() => {
              console.log(searchInput.value);
              searchInput.value.focus();
            }, 0);
          }
        },
      },
      {
        title: '物资存放地点',
        dataIndex: 'location',
        width: '30%',
        slots: {
          customRender: 'location',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.location.join('').toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
          if (visible) {
            setTimeout(() => {
              console.log(searchInput.value);
              searchInput.value.focus();
            }, 0);
          }
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '15%',
        slots: {
          customRender: 'operation',
        },
      },
    ];

    const data = [
      {
        key: '0',
        name: '求生三件套',
        goods: ['矿泉水', '衣物', '干粮'],
        location: ['浑南仓库', '沈北仓库'],
      }, {
        key: '1',
        name: '电动车',
        goods: ['小电动车'],
        location: ['浑南仓库'],
      }
    ];

    let index = 2;

    const goods = ['矿泉水', '衣物', '干粮', '小电动车'];

    const location = ['浑南仓库', '沈北仓库'];


    const dataSource = ref(data);
    const editableData = reactive({});

    const edit = key => {
      editableData[key] = cloneDeep(dataSource.value.filter(item => key === item.key)[0]);
    };


    const save = key => {
      Object.assign(dataSource.value.filter(item => key === item.key)[0], editableData[key]);
      delete editableData[key];
    };

    const cancel = key => {
      delete editableData[key];
    };

    const onDelete = (key) => {
      dataSource.value = dataSource.value.filter(item => item.key !== key);
      message.success('已删除 1 个条目')
    };
    const handleAdd = () => {
      showDrawer();
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      state.searchText = selectedKeys[0];
      state.searchedColumn = dataIndex;
    };

    const handleReset = clearFilters => {
      clearFilters();
      state.searchText = '';
    };

    const state = reactive({
      searchText: '',
      searchedColumn: '',
    });

    const searchInput = ref();

    const form = reactive({
      name: '',
      goods: [],
      location: [],
    });

    const rules = {
      name: [{required: true, message: '请输入物资名称'}],
      goods: [{required: true, message: '请选择物资内容'}],
      location: [{required: true, message: '请选择物资存放地点'}],
    };

    const visible = ref(false);

    const showDrawer = () => {
      visible.value = true;
    };

    const onClose = () => {
      formRef.value.resetFields();
      visible.value = false;
    };

    const onSubmit = () => {
      formRef.value.validate().then(() => {
        const newData = {
          key: index.toString(),
          name: form.name,
          goods: form.goods,
          location: form.location,
        };
        dataSource.value.push(newData);
        message.success('已添加 1 个条目');
        onClose();
      })
    };

    const formRef = ref();

    return {
      dataSource,
      goods,
      location,
      columns,
      editingKey: '',
      editableData,
      edit,
      save,
      cancel,
      handleAdd,
      // count,
      onDelete,
      handleSearch,
      handleReset,
      searchText: '',
      searchInput,
      searchedColumn: '',
      form,
      rules,
      visible,
      showDrawer,
      onClose,
      onSubmit,
      formRef
    };
  },
});
</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>
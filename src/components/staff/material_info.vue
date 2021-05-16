<template>
  <!--    页头-->
  <a-page-header sub-title="维护物资基本信息。" title="物资维护"
                 @back="() => $router.go(-1)">
    <template #tags>
      <a-tag color="blue">工作人员</a-tag>
    </template>
  </a-page-header>
  <br/>
  <a-row type="flex" justify="space-around" align="middle">
    <a-col :span="2"/>
    <a-col :span="20">

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
        <template v-for="col in ['name', 'quantity']" #[col]="{ record }" :key="col">
          <div>
            <a-input
                v-if="editableData[record.key]"
                v-model:value="editableData[record.key][col]"
                style="margin: -5px 0"
            />
            <template v-else>
              {{ record[col] }}
            </template>
          </div>
        </template>
        <template #staff="{ record }">
          <div>
            <a-select
                v-if="editableData[record.key]"
                v-model:value="editableData[record.key]['staff']['name']"
                style="width: 150px"
            >
              <a-select-option v-for="item in staff" :key='item.name' :value='item.name'>{{ item.name }}
              </a-select-option>
            </a-select>
            <template v-else>
              {{ record.staff.name }}
            </template>
          </div>
        </template>
        <template #key="{ record }">
          <div>
            {{ record.key }}
          </div>
        </template>
        <template #tel="{ record }">
          <div>
            <template v-if="editableData[record.key]">
              {{ getStaff(editableData[record.key]['staff']['name'])['tel'] }}
            </template>
            <template v-else>
              {{ record.staff.tel }}
            </template>
          </div>
        </template>
        <template #date="{record}">
          <div>
            <a-date-picker v-if="editableData[record.key]" v-model:value="editableData[record.key]['date']"
                           :format="dateFormat"
                           :valueFormat="dateFormat"/>
            <template v-else>
              {{ record.date }}
            </template>
          </div>
        </template>
        <template #operation="{ record }">
          <div class="editable-row-operations">
              <span v-if="editableData[record.key]">
                  <a @click="save(record.key)">保存</a>
                <a-popconfirm title="确定取消吗？" @confirm="cancel(record.key)">
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
    <a-col :span="2"/>
  </a-row>
  <a-drawer
      title="新建基本信息"
      :width="360"
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
          <a-form-item label="物资数量" name="quantity">
            <a-input v-model:value="form.quantity" placeholder="请输入物资数量"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="清点人" name="staff">
            <a-select placeholder="请选择清点人" v-model:value="form.staff">
              <a-select-option v-for='item in staff' :key="item.name" :value="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="清点日期" name="date">
            <a-date-picker v-model:value="form.date"
                           :format="dateFormat"
                           :valueFormat="dateFormat"/>
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
        width: '15%',
        slots: {
          customRender: 'key',
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
        title: '名称',
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
        title: '数量',
        dataIndex: 'quantity',
        width: '15%',
        slots: {
          customRender: 'quantity',
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
        title: '清点人',
        dataIndex: 'staff',
        width: '15%',
        slots: {
          customRender: 'staff',
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
        title: '清点人电话',
        dataIndex: 'staff',
        width: '15%',
        slots: {
          customRender: 'tel',
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
        title: '物资清点时间',
        dataIndex: 'date',
        width: '15%',
        slots: {
          customRender: 'date',
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
        title: 'operation',
        dataIndex: 'operation',
        width: '10%',
        slots: {
          customRender: 'operation',
        },
      },
    ];

    const data = [{
      key: '0',
      name: '疫苗',
      quantity: '5万剂',
      staff: {
        name: '小明',
        tel: '18840001000',
      },
      date: '2020/05/10'
    }, {
      key: '1',
      name: '核防护服',
      quantity: '10000件',
      staff: {
        name: '工作人员',
        tel: '18840001001',
      },
      date: '2020/05/10'
    },
    ];

    const getStaff = key => {
      return staff.filter(item => key === item.name)[0]
    }

    const staff = [{
      name: '小明',
      tel: '18840001000',
    }, {
      name: '工作人员',
      tel: '18840001001',
    }];


    const dataSource = ref(data);
    const editableData = reactive({});

    const edit = key => {
      editableData[key] = cloneDeep(dataSource.value.filter(item => key === item.key)[0]);
    };


    const save = key => {
      editableData[key]['staff']['tel'] = getStaff(editableData[key]['staff']['name'])['tel'];
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
    // const count = computed(() => dataSource.value.length + 1);

    let index = 2;

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
      quantity: '',
      staff: '',
      date: '',
    });

    const rules = {
      name: [{required: true, message: 'please enter url'}],
      quantity: [{required: true, message: 'Please select an owner'}],
      staff: [{required: true, message: 'Please choose the type'}],
      date: [{required: true, message: 'Please choose the approver'}],
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
          quantity: form.quantity,
          staff: {
            name: form.staff,
            tel: getStaff(form.staff)['tel']
          },
          date: form.date,
        };
        index++;
        dataSource.value.push(newData);
        message.success('已添加 1 个条目');
        onClose();
      })
    };

    const formRef = ref();
    const dateFormat = 'YYYY/MM/DD';

    return {
      dataSource,
      staff,
      getStaff,
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
      formRef,
      dateFormat
    };
  },
});
</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>
<template>
  <!--    页头-->
  <a-page-header sub-title="维护风险企业的基本信息。" title="风险企业维护"
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
      <a-table :columns="columns" :data-source="dataSource" bordered>
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
        <template v-for="col in ['name', 'address', 'juridicalPerson', 'tel', 'latitude', 'longitude', 'type']"
                  #[col]="{ text, record }" :key="col">
          <div>
            <a-input
                v-if="editableData[record.key]"
                v-model:value="editableData[record.key][col]"
                style="margin: -5px 0"
            />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>
        <template #operation="{ record }">
          <div class="editable-row-operations">
              <span v-if="editableData[record.key]">
                <a-popconfirm title="确定保存吗？" @confirm="save(record.key)">
                  <a>保存</a>
                </a-popconfirm>
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
    <!--    <a-col :span="2"/>-->
  </a-row>
  <a-drawer
      title="新增风险企业"
      :width="720"
      :visible="visible"
      :body-style="{ paddingBottom: '80px' }"
      @close="onClose"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="企业名称" name="name">
            <a-input v-model:value="form.name" placeholder="请输入企业名称"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="企业地址" name="address">
            <a-input v-model:value="form.address" placeholder="请输入企业名称"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="企业法人" name="juridicalPerson">
            <a-input v-model:value="form.juridicalPerson" placeholder="请输入企业法人"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="法人电话" name="tel">
            <a-input v-model:value="form.tel" placeholder="请输入法人电话"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="企业纬度" name="latitude">
            <a-input v-model:value="form.latitude" placeholder="请输入企业纬度"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="企业经度" name="longitude">
            <a-input v-model:value="form.longitude" placeholder="请输入企业经度"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="企业类型" name="type">
            <a-input v-model:value="form.type" placeholder="请输入企业类型"/>
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
      <a-button style="margin-right: 8px" @click="onClose">Cancel</a-button>
      <a-button type="primary" @click="onSubmit">Submit</a-button>
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
        title: '企业名称',
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
        title: '企业地址',
        dataIndex: 'address',
        width: '20%',
        slots: {
          customRender: 'address',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.address.toString().toLowerCase().includes(value.toLowerCase()),
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
        title: '企业法人',
        dataIndex: 'juridicalPerson',
        width: '10%',
        slots: {
          customRender: 'juridicalPerson',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.juridicalPerson.toString().toLowerCase().includes(value.toLowerCase()),
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
        title: '法人电话',
        dataIndex: 'tel',
        width: '15%',
        slots: {
          customRender: 'tel',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.tel.toString().toLowerCase().includes(value.toLowerCase()),
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
        title: '企业类型',
        dataIndex: 'type',
        width: '10%',
        slots: {
          customRender: 'type',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.type.toString().toLowerCase().includes(value.toLowerCase()),
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
        title: '企业纬度',
        dataIndex: 'latitude',
        width: '10%',
        slots: {
          customRender: 'latitude',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.latitude.toString().toLowerCase().includes(value.toLowerCase()),
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
        title: '企业经度',
        dataIndex: 'longitude',
        width: '10%',
        slots: {
          customRender: 'longitude',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.longitude.toString().toLowerCase().includes(value.toLowerCase()),
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

    let index = 2;

    const data = [
      {
        key: '0',
        name: '某新能源汽车公司',
        address: '火星',
        juridicalPerson: 'M',
        tel: '1234567',
        latitude: '37.25N',
        longitude: '122.8W',
        type: '汽车公司'
      },
      {
        key: '1',
        name: '某互联网公司',
        address: '火星',
        juridicalPerson: '未知',
        tel: '1234567',
        latitude: '1N',
        longitude: '1E',
        type: '互联网公司'
      }
    ];


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
      address: '',
      juridicalPerson: '',
      tel: '',
      latitude: '',
      longitude: '',
      type: ''
    });

    const rules = {
      name: [{required: true, message: '请输入企业名称'}],
      address: [{required: true, message: '请输入企业地址'}],
      juridicalPerson: [{required: true, message: '请输入企业法人'}],
      tel: [{required: true, message: '请输入法人电话'}],
      latitude: [{required: false, message: '请输入企业纬度'}],
      type: [{required: true, message: '请输入企业类型'}],
      longitude: [{required: false, message: '请输入企业精度'}],

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
          address: form.address,
          juridicalPerson: form.juridicalPerson,
          tel: form.tel,
          latitude: form.latitude,
          longitude: form.longitude,
          type: form.type
        };
        index++;
        dataSource.value.push(newData);
        message.success('已添加 1 个条目');
        onClose();
      })
    };

    const formRef = ref();

    return {
      dataSource,
      columns,
      editingKey: '',
      editableData,
      edit,
      save,
      cancel,
      handleAdd,
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
<template>
  <div>
    <!--    页头-->
    <a-page-header sub-title="通过此页面向系统中添加，查询，修改用户信息以及删除用户。" title="注册" @back="() => $router.go(-1)">
      <template #tags>
        <a-tag color="orange">管理员</a-tag>
      </template>
      <br>
      <a-row type="flex">
        <a-statistic :style="{margin:' 0 32px'}" :value="dataSource.length" title="总用户数"/>
        <a-statistic :style="{margin:' 0 32px'}" :value="enabledUserCount()" title="正常"/>
        <a-statistic :style="{margin:' 0 32px'}" :value="dataSource.length - enabledUserCount()" title="停用"/>
      </a-row>
    </a-page-header>
    <br>
    <!--    添加按钮-->
    <a-button id="add_user" size="large" type="primary" @click="showDrawer">
      <template #icon>
        <PlusOutlined/>
      </template>
      添加用户
    </a-button>
    <!--    用于添加用户的抽屉表单-->
    <a-drawer
        :body-style="{ paddingBottom: '80px' }"
        :visible="visible"
        :width="720"
        title="创建新用户"
        @close="onClose"
    >
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="用户名" name="userId">
              <a-input v-model:value="form.userId" placeholder="请输入用户名"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="密码" name="password">
              <a-input-password v-model:value="form.password" placeholder="请输入密码"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="姓名" name="name">
              <a-input v-model:value="form.name" placeholder="请输入姓名"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="性别" name="gender">
              <a-select v-model:value="form.gender" placeholder="请选择性别">
                <a-select-option value="男">男</a-select-option>
                <a-select-option value="女">女</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="会员类型" name="role">
              <a-select v-model:value="form.role" placeholder="请选择会员类型">
                <a-select-option value="工作人员">工作人员</a-select-option>
                <a-select-option value="专家">专家</a-select-option>
                <a-select-option value="指挥人员">指挥人员</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="出生日期" name="dob">
              <a-date-picker
                  v-model:value="form.dob"
                  :format="dateFormat"
                  :get-popup-container="trigger => trigger.parentNode"
                  :valueFormat="dateFormat"
                  style="width: 100%"
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
        <a-button type="primary" @click="handleAdd">确定</a-button>
      </div>
    </a-drawer>
    <!--   表格-->
    <a-table :columns="columns" :data-source="dataSource">
      <!--      搜索-->

      <template #filterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
        <div style="padding: 8px">
          <a-input
              ref="searchInput"
              :placeholder="`搜索 ${column.title}`"
              :value="selectedKeys[0]"
              style="width: 188px; margin-bottom: 8px; display: block"
              @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
              @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
          />
          <a-button
              size="small"
              style="width: 90px; margin-right: 8px"
              type="primary"
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
      <!--      可编辑的账号-->
      <template #userId="{record}">
        <div>
          <a-input v-if="editableData[record.key]" v-model:value="editableData[record.key]['userId']"
                   style="margin: -5px 0; max-width: inherit"
          ></a-input>
          <template v-else>
            {{ record.userId }}
          </template>
        </div>
      </template>
      <!--      可编辑的密码-->
      <template #password="{record}">
        <div>
          <a-input-password v-if="editableData[record.key]" v-model:value="editableData[record.key]['password']"
                            style="margin: -5px 0; max-width: inherit"
          ></a-input-password>
          <template v-else>
            ********
          </template>
        </div>
      </template>
      <!--      可编辑的姓名-->
      <template #name="{record}">
        <div>
          <a-input v-if="editableData[record.key]" v-model:value="editableData[record.key]['name']"
                   style="margin: -5px 0; max-width: inherit"
          ></a-input>
          <template v-else>
            {{ record.name }}
          </template>
        </div>
      </template>
      <!--      可编辑的性别-->
      <template #gender="{record}">
        <div>
          <a-select v-if="editableData[record.key]" v-model:value="editableData[record.key]['gender']"
                    style="margin: -5px 0; max-width: inherit"
          >
            <a-select-option value="男">男</a-select-option>
            <a-select-option value="女">女</a-select-option>
          </a-select>
          <template v-else>
            {{ record.gender }}
          </template>
        </div>
      </template>
      <!--      可编辑的出生日期-->
      <template #dob="{record}">
        <div>
          <a-date-picker v-if="editableData[record.key]" v-model:value="editableData[record.key]['dob']"
                         :format="dateFormat"
                         :valueFormat="dateFormat"/>
          <template v-else>
            {{ record.dob }}
          </template>
        </div>
      </template>


      <!--      可编辑的会员类型-->
      <template #tag_role="{record}">
        <div>
          <a-select v-if="editableData[record.key]" v-model:value="editableData[record.key]['role']"
                    style="margin: -5px 0; max-width: inherit"
          >
            <a-select-option value="工作人员">工作人员</a-select-option>
            <a-select-option value="专家">专家</a-select-option>
            <a-select-option value="指挥人员">指挥人员</a-select-option>
            <a-select-option value="管理员">管理员</a-select-option>
          </a-select>
          <template v-else>
            <span>
          <a-tag v-if="record.role==='工作人员'" :key="record.role" color="blue">{{ record.role }}</a-tag>
          <a-tag v-if="record.role==='专家'" :key="record.role" color="green">{{ record.role }}</a-tag>
          <a-tag v-if="record.role==='指挥人员'" :key="record.role" color="cyan">{{ record.role }}</a-tag>
          <a-tag v-if="record.role==='管理员'" :key="record.role" color="orange">{{ record.role }}</a-tag>
        </span>
          </template>
        </div>
      </template>

      <!--      可编辑的状态-->
      <template #tag_status="{record}">
        <div>
          <a-select v-if="editableData[record.key]" v-model:value="editableData[record.key]['status']"
                    style="margin: -5px 0; max-width: inherit"
          >
            <a-select-option value="正常">正常</a-select-option>
            <a-select-option value="停用">停用</a-select-option>
          </a-select>
          <template v-else>
            <span>
          <a-tag v-if="record.status==='正常'" :key="record.status" color="green">{{ record.status }}</a-tag>
          <a-tag v-if="record.status==='停用'" :key="record.status" color="red">{{ record.status }}</a-tag>
        </span>
          </template>
        </div>
      </template>


      <template #action="{record}">
        <div class="editable-row-operations">
        <span v-if="editableData[record.key]">
          <a @click="save(record.key)">保存</a>
          <a-popconfirm cancel-text="取消" ok-text="继续" title="取消将不会保存您的更改" @confirm="cancel(record.key)">
            <a>取消</a>
          </a-popconfirm>
        </span>
          <span v-else>
          <a @click="edit(record.key)">编辑</a>
            <a-popconfirm
                v-if="dataSource.length"
                cancel-text="取消"
                ok-text="继续"
                title="此操作不可撤销" @confirm="onDelete(record.key)"
            >
        <a>删除</a>
      </a-popconfirm>
        </span>
        </div>
      </template>
    </a-table>
  </div>
</template>

<script>
import {SearchOutlined, DownOutlined, PlusOutlined} from '@ant-design/icons-vue';
import {defineComponent, reactive, ref, computed, toRaw} from 'vue';
import {message} from 'ant-design-vue';
import {cloneDeep} from 'lodash-es';

let data = [
  {
    key: 0,
    userId: 'admin',
    name: '管理员1',
    password: '123',
    gender: '男',
    dob: '2021/05/10',
    role: '管理员',
    status: '停用'
  },
  {
    key: 1,
    userId: 'staff',
    name: '工作人员1',
    password: '1234',
    gender: '男',
    dob: '2021/05/10',
    role: '工作人员',
    status: '停用'
  },
  {
    key: 2,
    userId: 'commander',
    name: '指挥人员1',
    password: '123',
    gender: '男',
    dob: '2021/05/10',
    role: '指挥人员',
    status: '正常'
  },
  {
    key: 3,
    userId: 'specialist',
    name: '专家1',
    password: '123',
    gender: '男',
    dob: '2021/05/10',
    role: '专家',
    status: '正常'
  },
];
export default defineComponent({
  setup() {

    const formRef = ref();

    const resetForm = () => {
      formRef.value.resetFields();
    };

    const form = reactive({
      userId: '',
      name: '',
      gender: '',
      password: '',
      role: '',
      dob: '',
    });

    const rules = {
      userId: [
        {
          required: true,
          message: '请输入用户名',
        },
      ],
      name: [
        {
          required: true,
          message: '请输入姓名',
        },
      ],
      password: [
        {
          required: true,
          message: '请输入密码',
        },
      ],
      gender: [
        {
          required: true,
          message: '请选择性别',
        },
      ],
      role: [
        {
          required: true,
          message: '请选择会员类型',
        },
      ],
      dob: [
        {
          required: true,
          message: '请选择出生日期',
        },
      ],
    };

    const showDrawer = () => {
      console.log('打开抽屉')
      visible.value = true;
    };

    const onClose = () => {
      console.log('关上抽屉')
      visible.value = false;
    };

    const visible = ref(false);

    const dateFormat = 'YYYY/MM/DD';

    const state = reactive({
      searchText: '',
      searchedColumn: '',
    });

    const dataSource = ref(data);

    const editableData = reactive({});

    const count = computed(() => dataSource.value.length + 1);

    const handleAdd = () => {

      formRef.value
          .validate()
          .then(() => {
            console.log('values', form, toRaw(form));
            const newData = {
              key: `${count.value}`,
              name: `${form.name}`,
              userId: `${form.userId}`,
              password: `${form.password}`,
              gender: `${form.gender}`,
              dob: `${form.dob}`,
              role: `${form.role}`,
              status: '正常'
            };
            dataSource.value.push(newData);
            onClose();
            resetForm()
            message.success('已添加 1 个用户。')
          })
          .catch(error => {
            console.log('error', error);
          });


    };


    /**
     * 进入编辑
     * @param key
     */
    const edit = key => {
      editableData[key] = cloneDeep(dataSource.value.filter(item => key === item.key)[0]);
    };

    /**
     * 保存编辑
     * @param key
     */
    const save = key => {
      Object.assign(dataSource.value.filter(item => key === item.key)[0], editableData[key]);
      delete editableData[key];
      this.enabledUserCount();
      message.success('编辑已保存。')
    };


    /**
     * 取消编辑
     * @param key
     */
    const cancel = key => {
      delete editableData[key];
    };

    /**
     * 删除一行
     * @param key
     */
    const onDelete = key => {
      dataSource.value = dataSource.value.filter(item => item.key !== key);
      message.success('已删除 1 个用户。')
    };


    const onChange = (pagination, filters, sorter) => {
      console.log('params', pagination, filters, sorter);
    };


    const columns = [
      {
        dataIndex: 'key',
        key: 'key',
        title: 'ID',
      },
      {
        title: '账号',
        dataIndex: 'userId',
        key: 'userId',
        slots: {
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
          customRender: 'userId',
        },
        onFilter: (value, record) =>
            record.userId.toString().toLowerCase().includes(value.toLowerCase()),
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
        slots: {
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
          customRender: 'name',
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
        title: '性别',
        dataIndex: 'gender',
        key: 'gender',
        slots: {
          customRender: 'gender',
        }
      }, {
        title: '出生日期',
        dataIndex: 'dob',
        key: 'dob',
        slots: {
          customRender: 'dob',
        }
      }, {
        title: '会员类型',
        dataIndex: 'role',
        key: 'role',
        slots: {
          customRender: 'tag_role',
        },
        filters: [
          {
            text: '管理员',
            value: '管理员',
          },
          {
            text: '工作人员',
            value: '工作人员',
          },
          {
            text: '指挥人员',
            value: '指挥人员',
          },
          {
            text: '专家',
            value: '专家',
          },

        ],
        filterMultiple: true,
        onFilter: (value, record) => record.role.indexOf(value) === 0,
      }, {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        slots: {
          customRender: 'tag_status',
        },
        filters: [
          {
            text: '正常',
            value: '正常',
          },
          {
            text: '停用',
            value: '停用',
          }
        ],
        filterMultiple: false,
        onFilter: (value, record) => record.status.indexOf(value) === 0,
      },
      {
        title: '操作',
        key: 'action',
        slots: {customRender: 'action'},
      },
    ];

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      state.searchText = selectedKeys[0];
      state.searchedColumn = dataIndex;
    };

    const handleReset = clearFilters => {
      clearFilters();
      state.searchText = '';
    };


    const searchInput = ref();

    return {
      dataSource,
      columns,
      handleSearch,
      handleReset,
      searchText: '',
      searchInput,
      searchedColumn: '',
      onChange,
      editingKey: '',
      editableData,
      edit,
      save,
      cancel,
      onDelete,
      dateFormat,
      handleAdd,
      count,
      form,
      rules,
      visible,
      showDrawer,
      onClose,
      resetForm,
      formRef,
    };
  },

  methods: {
    enabledUserCount: function () {
      let counter = 0
      for (let datum of data) {
        if (datum.status === '正常') {
          counter++
        }
      }
      console.log(counter)
      return counter
    },

  },

  components: {
    // eslint-disable-next-line vue/no-unused-components
    DownOutlined,
    SearchOutlined,
    PlusOutlined
  },
});
</script>

<style scoped>
/*.demo-page-header :deep(tr:last-child td) {*/
/*  padding-bottom: 0;*/
/*}*/
.editable-row-operations a {
  margin-right: 8px;
}

#add_user {
  margin-bottom: 16px;
}
</style>
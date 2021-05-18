<template>
  <!--    页头-->
  <a-page-header sub-title="维护城市基本信息。" title="城市信息维护"
                 @back="() => $router.go(-1)">
    <template #tags>
      <a-tag color="blue">工作人员</a-tag>
    </template>
  </a-page-header>
  <br/>
  <a-row type="flex" justify="space-around" align="middle">
    <a-col :span="2"/>
    <a-col :span="20">
      <a-button @click="handleAddProcess" style="margin-bottom: 8px" type="primary">
        <template #icon>
          <PlusOutlined/>
        </template>
        新增流程
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
        <template #name="{ record }">
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
        <template #eventType="{ record }">
          <div>
            <a-select
                v-if="editableData[record.key]"
                v-model:value="editableData[record.key]['eventType']"
                style="width: 150px"
                @change="() => {editableData[record.key]['eventName'] = '';}"
            >
              <a-select-option v-for="item in event" :key='item.type' :value='item.type'>
                {{ item.type }}
              </a-select-option>
            </a-select>
            <template v-else>
              {{ record.eventType }}
            </template>
          </div>
        </template>
        <template #eventName="{ record }">
          <div>
            <a-select
                v-if="editableData[record.key]"
                v-model:value="editableData[record.key]['eventName']"
                style="width: 150px"
            >
              <a-select-option v-for="item in getEvent(editableData[record.key]['eventType'])['event']" :key='item.name'
                               :value='item.name'>
                {{ item.name }}
              </a-select-option>
            </a-select>
            <template v-else>
              {{ record.eventName }}
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
        <template #expandedRowRender="{ record }">
          <a-table bordered :columns="innerColumns" :data-source="record.processes" :pagination="false">
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
            <template #name="{ record }">
              <div>
                <a-input
                    v-if="editableData[record.dataKey]"
                    v-model:value="editableData[record.dataKey]['processes'][parseInt(record.key)]['name']"
                    style="margin: -5px 0"
                />
                <template v-else>
                  {{ record.name }}
                </template>
              </div>
            </template>
            <template #operation="{ record }">
              <div class="editable-row-operations">
                <a-popconfirm v-if="dataSource.length" title="确定删除吗？"
                              @confirm="onDeleteProcess(record.dataKey, record.key,)">
                  <a>删除</a>
                </a-popconfirm>
              </div>
            </template>
          </a-table>
          <br/>
          <a-button block @click="handleAddStep(record.key)" style="margin-bottom: 16px; color: gray" size="large">
            <template #icon>
              <PlusOutlined/>
            </template>
            新增事件
          </a-button>
        </template>
      </a-table>
    </a-col>
    <a-col :span="2"/>
  </a-row>
  <a-drawer
      title="新建流程"
      :width="480"
      :visible="visibleP"
      :body-style="{ paddingBottom: '80px' }"
      @close="onCloseP"
  >
    <a-form ref="formRefP" :model="formP" :rules="rulesP" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="流程名称" name="name">
            <a-input v-model:value="formP.name" placeholder="请输入流程名称"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="事件类型" name="eventType">
            <a-select placeholder="请选择事件类型" v-model:value="formP.eventType" @change="formP.eventName = ''">
              <a-select-option v-for="item in event" :key='item.type' :value='item.type'>{{ item.type }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="事件" name="eventName">
            <a-select placeholder="请选择事件" v-model:value="formP.eventName">
              <a-select-option
                  v-for="item in (formP.eventType === '')?[{name: ''}]:event.filter(eventItem => eventItem.type === formP.eventType)[0]['event']"
                  :key='item.name' :value='item.name'>{{ item.name }}
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
      <a-button style="margin-right: 8px" @click="onCloseP">取消</a-button>
      <a-button type="primary" @click="onSubmitP">提交</a-button>
    </div>
  </a-drawer>
  <a-drawer
      title="新建步骤"
      :width="480"
      :visible="visibleS"
      :body-style="{ paddingBottom: '80px' }"
      @close="onCloseS"
  >
    <a-form ref="formRefS" :model="formS" :rules="rulesS" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="步骤名称" name="name">
            <a-input v-model:value="formS.name" placeholder="请输入步骤名称"/>
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
      <a-button style="margin-right: 8px" @click="onCloseS">取消</a-button>
      <a-button type="primary" @click="onSubmitS">提交</a-button>
    </div>
  </a-drawer>
</template>


<script>
import {defineComponent, reactive, ref} from 'vue';
import {message} from 'ant-design-vue';
import {cloneDeep} from 'lodash-es';
import {PlusOutlined, SearchOutlined} from '@ant-design/icons-vue';

export default defineComponent({
  components: {
    PlusOutlined,
    SearchOutlined
  },
  setup() {
    const handleAddProcess = () => {
      showDrawerP();
    };
    const handleAddStep = (key) => {
      selectKey.value = key;
      showDrawerS();
    };
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
        title: '流程名称',
        dataIndex: 'name',
        width: '25%',
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
        title: '事件类型',
        dataIndex: 'eventType',
        width: '20%',
        slots: {
          customRender: 'eventType',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.eventType.toString().toLowerCase().includes(value.toLowerCase()),
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
        title: '事件名称',
        dataIndex: 'eventName',
        width: '20%',
        slots: {
          customRender: 'eventName',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.eventName.toString().toLowerCase().includes(value.toLowerCase()),
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

    const innerColumns = [
      {
        title: '序号',
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
        title: '步骤名称',
        dataIndex: 'name',
        width: '30%',
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
        title: '操作',
        dataIndex: 'operation',
        width: '15%',
        slots: {
          customRender: 'operation',
        },
      }
    ];

    const event = [
      {
        type: '自然灾害',
        event: [
          {
            name: '洪涝灾害',
          },
          {
            name: '台风',
          },
        ]
      },
      {
        type: '公共卫生事件',
        event: [
          {
            name: '新冠疫情',
          },
        ]
      },
    ]

    const getEvent = (eventType) => {
      return event.filter(item => item.type === eventType)[0]
    }

    const data = [
      {
        key: '0',
        name: '台风应急',
        province: '自然灾害',
        aidNum: '台风',
        processes: [
          {
            dataKey: '0',
            key: '0',
            name: '发布预警',
          },
          {
            dataKey: '0',
            key: '1',
            name: '组织疏散和转移',
          }
        ]
      },
      {
        key: '1',
        name: '台风应急',
        eventType: '自然灾害',
        eventName: '台风',
        processes: [
          {
            dataKey: '1',
            key: '0',
            name: '发布预警',
          },
          {
            dataKey: '1',
            key: '1',
            name: '组织疏散和转移',
          }
        ]
      }
    ]
    const dataSource = ref(data);

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

    const onDeleteProcess = (dataKey, key) => {
      dataSource.value[parseInt(dataKey)].processes = dataSource.value[parseInt(dataKey)].processes.filter(item => item.key !== key);
      message.success('已删除 1 个条目')
    };

    const formP = reactive({
      name: '',
      eventType: '',
      eventName: '',
    });

    const rulesP = {
      name: [{required: true, message: '请输入流程名称'}],
      eventType: [{required: true, message: '请选择事件类型'}],
      eventName: [{required: true, message: '请选择事件'}],
    };

    const visibleP = ref(false);

    const showDrawerP = () => {
      visibleP.value = true;
    };

    const onCloseP = () => {
      formRefP.value.resetFields();
      visibleP.value = false;
    };

    let indexP = 2

    const onSubmitP = () => {
      formRefP.value.validate().then(() => {
        const newData = {
          key: indexP.toString(),
          name: formP.name,
          eventType: formP.eventType,
          eventName: formP.eventName,
          processes: [],
        };
        dataSource.value.push(newData);
        indexS.push(0);
        message.success('已添加 1 个条目');
        onCloseP();
        indexP++;
      })
    };

    const formRefP = ref();

    const formS = reactive({
      name: '',
    });

    const rulesS = {
      name: [{required: true, message: '请输入步骤名称'}],
    };

    const visibleS = ref(false);

    const showDrawerS = () => {
      visibleS.value = true;
    };

    const onCloseS = () => {
      formRefS.value.resetFields();
      visibleS.value = false;
      selectKey.value = '';
    };

    let indexS = [2, 2]

    const onSubmitS = () => {
      formRefS.value.validate().then(() => {
        const newData = {
          dataKey: selectKey.value,
          key: indexS[parseInt(selectKey.value)].toString(),
          name: formS.name,
        };
        dataSource.value.filter(item => item.key === selectKey.value)[0]['processes'].push(newData);
        message.success('已添加 1 个条目');
        onCloseS();
        indexS[parseInt(selectKey.value)]++;
      })
    };

    const formRefS = ref();

    const selectKey = ref();

    return {
      handleAddProcess,
      handleAddStep,
      columns,
      handleSearch,
      handleReset,
      dataSource,
      searchText: '',
      searchedColumn: '',
      editableData,
      edit,
      save,
      cancel,
      onDelete,
      innerColumns,
      event,
      getEvent,
      onDeleteProcess,
      formP,
      rulesP,
      visibleP,
      showDrawerP,
      onCloseP,
      onSubmitP,
      formRefP,
      formS,
      rulesS,
      visibleS,
      showDrawerS,
      onCloseS,
      onSubmitS,
      formRefS
    };
  },
});
</script>

<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>
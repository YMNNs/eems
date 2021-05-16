<template>
  <!--    页头-->
  <a-page-header sub-title="维护事件处理流程的全部信息。" title="流程维护"
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
        <template #expandedRowRender="{record}">
          <a-button @click="handleAddProcess" style="margin-bottom: 16px" size="small" type="primary">
            <template #icon>
              <PlusOutlined/>
            </template>
            新增
          </a-button>
          <a-table :columns="innerColumns" :data-source="record.processes" :pagination="false">
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
          </a-table>
        </template>
      </a-table>
    </a-col>
    <a-col :span="2"/>
  </a-row>
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
        eventType: '自然灾害',
        eventName: '台风',
        processes: [
          {
            key: '1',
            name: '发布预警',
          },
          {
            key: '2',
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

    return {
      handleAddProcess,
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
      getEvent
    };
  },
});
</script>

<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>
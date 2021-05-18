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
<!--    <a-col :span="2"/>-->
    <a-col :span="24">
      <a-button @click="handleAddProcess" style="margin-bottom: 8px" type="primary">
        <template #icon>
          <PlusOutlined/>
        </template>
        新增城市
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
        <template #province="{ record }">
          <div>
            <a-select
                v-if="editableData[record.key]"
                v-model:value="editableData[record.key]['province']"
                style="width: 150px"
                @change="() => {editableData[record.key]['name'] = '';}"
            >
              <a-select-option v-for="item in province" :key='item.name' :value='item.name'>
                {{ item.name }}
              </a-select-option>
            </a-select>
            <template v-else>
              {{ record.province }}
            </template>
          </div>
        </template>
        <template #name="{ record }">
          <div>
            <a-select
                v-if="editableData[record.key]"
                v-model:value="editableData[record.key]['name']"
                style="width: 150px"
            >
              <a-select-option v-for="item in getProvince(editableData[record.key]['province'])['city']"
                               :key='item.name'
                               :value='item.name'>
                {{ item.name }}
              </a-select-option>
            </a-select>
            <template v-else>
              {{ record.name }}
            </template>
          </div>
        </template>
        <template #rescue="{ record }">
          <div>
            <a-input
                v-if="editableData[record.key]"
                v-model:value="editableData[record.key]['rescue']"
                style="margin: -5px 0"
            />
            <template v-else>
              {{ record.rescue }}
            </template>
          </div>
        </template>
        <template #car="{ record }">
          <div>
            <a-input
                v-if="editableData[record.key]"
                v-model:value="editableData[record.key]['car']"
                style="margin: -5px 0"
            />
            <template v-else>
              {{ record.car }}
            </template>
          </div>
        </template>
        <template #code="{ record }">
          <div>
            <a-input
                v-if="editableData[record.key]"
                v-model:value="editableData[record.key]['code']"
                style="margin: -5px 0"
            />
            <template v-else>
              {{ record.code }}
            </template>
          </div>
        </template>
        <template #operation="{ record }">
          <div class="editable-row-operations">
              <span v-if="editableData[record.key]">
                  <a @click="save(record.key)">保存</a>
                <a-popconfirm title="将不会保存您的更改" @confirm="cancel(record.key)">
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
          <a-table bordered :columns="innerColumns" :data-source="record.traffic" :pagination="false">
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
            <template #origin="{ record }">
              <div>
                <a-select
                    v-if="editableData[record.dataKey]"
                    v-model:value="editableData[record.dataKey]['traffic'][parseInt(record.key)]['origin']"
                    style="width: 150px"
                >
                  <a-select-option
                      v-for="item in getCity(editableData[record.dataKey]['province'], editableData[record.dataKey]['name'])['location']"
                      :key='item.name'
                      :value='item.name'>
                    {{ item.name }}
                  </a-select-option>
                </a-select>
                <template v-else>
                  {{ record.origin }}
                </template>
              </div>
            </template>
            <template #dest="{ record }">
              <div>
                <a-select
                    v-if="editableData[record.dataKey]"
                    v-model:value="editableData[record.dataKey]['traffic'][parseInt(record.key)]['dest']"
                    style="width: 150px"
                >
                  <a-select-option
                      v-for="item in getCity(editableData[record.dataKey]['province'], editableData[record.dataKey]['name'])['location']"
                      :key='item.name'
                      :value='item.name'>
                    {{ item.name }}
                  </a-select-option>
                </a-select>
                <template v-else>
                  {{ record.dest }}
                </template>
              </div>
            </template>
            <template #length="{ record }">
              <div>
                <a-input
                    v-if="editableData[record.dataKey]"
                    v-model:value="editableData[record.dataKey]['traffic'][parseInt(record.key)]['length']"
                    style="margin: -5px 0"
                />
                <template v-else>
                  {{ record.length }}
                </template>
              </div>
            </template>
            <template #desc="{ record }">
              <div>
                <a-input
                    v-if="editableData[record.dataKey]"
                    v-model:value="editableData[record.dataKey]['traffic'][parseInt(record.key)]['desc']"
                    style="margin: -5px 0"
                />
                <template v-else>
                  {{ record.desc }}
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
            新增路线
          </a-button>
        </template>
      </a-table>
    </a-col>
<!--    <a-col :span="2"/>-->
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
          <a-form-item label="省份" name="province">
            <a-select placeholder="请选择省份" v-model:value="formP.province" @change="formP.name = ''">
              <a-select-option v-for="item in province" :key='item.name' :value='item.name'>{{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="城市" name="name">
            <a-select placeholder="请选择城市" v-model:value="formP.name">
              <a-select-option v-for="item in (formP.province === '')?[{name: ''}]:getProvince(formP.province)['city']"
                               :key='item.name' :value='item.name'>
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="救援人数" name="rescue">
            <a-input v-model:value="formP.rescue" placeholder="请输入救援人数"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="车辆数" name="car">
            <a-input v-model:value="formP.car" placeholder="请输入车辆数"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="邮政编码" name="code">
            <a-input v-model:value="formP.code" placeholder="请输入邮政编码"/>
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
      title="新建路线"
      :width="480"
      :visible="visibleS"
      :body-style="{ paddingBottom: '80px' }"
      @close="onCloseS"
  >
    <a-form ref="formRefS" :model="formS" :rules="rulesS" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="起点" name="origin">
            <a-select placeholder="请选择起点" v-model:value="formS.origin">
              <a-select-option
                  v-for="item in (selectKey === '')?[{name: ''}]:getCity(dataSource[selectKey].province, dataSource[selectKey].name)['location']"
                  :key='item.name' :value='item.name'>{{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="终点" name="dest">
            <a-select placeholder="请选择起点" v-model:value="formS.dest">
              <a-select-option
                  v-for="item in (selectKey === '')?[{name: ''}]:getCity(dataSource[selectKey].province, dataSource[selectKey].name)['location']"
                  :key='item.name' :value='item.name'>{{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="路径长度" name="length">
            <a-input v-model:value="formS.length" placeholder="请输入路径长度"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="描述" name="desc">
            <a-textarea
                v-model:value="formS.desc"
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
        title: '城市',
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
        title: '省份',
        dataIndex: 'province',
        width: '15%',
        slots: {
          customRender: 'province',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.province.toString().toLowerCase().includes(value.toLowerCase()),
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
        title: '救援人数',
        dataIndex: 'rescue',
        width: '15%',
        slots: {
          customRender: 'rescue',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.rescue.toString().toLowerCase().includes(value.toLowerCase()),
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
        title: '车辆数',
        dataIndex: 'car',
        width: '15%',
        slots: {
          customRender: 'car',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.car.toString().toLowerCase().includes(value.toLowerCase()),
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
        title: '邮政编码',
        dataIndex: 'code',
        width: '15%',
        slots: {
          customRender: 'code',
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
        title: '起点',
        dataIndex: 'origin',
        width: '15%',
        slots: {
          customRender: 'origin',
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
        title: '终点',
        dataIndex: 'dest',
        width: '15%',
        slots: {
          customRender: 'dest',
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
        title: '路线长度',
        dataIndex: 'length',
        width: '15%',
        slots: {
          customRender: 'length',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.length.toString().toLowerCase().includes(value.toLowerCase()),
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
        title: '描述',
        dataIndex: 'desc',
        width: '30%',
        slots: {
          customRender: 'desc',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
        },
        onFilter: (value, record) =>
            record.desc.toString().toLowerCase().includes(value.toLowerCase()),
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

    const province = [
      {
        name: '辽宁省',
        city: [
          {
            name: '沈阳市',
            location: [
              {
                name: '浑南仓库',
              },
              {
                name: '沈北仓库',
              },
              {
                name: '和平仓库',
              },
              {
                name: '沈河仓库',
              }
            ],
          },
          {
            name: '大连市',
            location: [
              {
                name: '中山仓库',
              },
              {
                name: '西岗仓库',
              },
              {
                name: '沙河口仓库',
              },
              {
                name: '高新仓库',
              }
            ],
          },
          {
            name: '鞍山市',
            location: [
              {
                name: '铁东仓库',
              },
              {
                name: '铁西仓库',
              },
              {
                name: '立山仓库',
              },
              {
                name: '千山仓库',
              }
            ],
          },
        ]
      },
      {
        name: '吉林省',
        city: [
          {
            name: '长春市',
            location: [
              {
                name: '二道仓库',
              },
              {
                name: '南关仓库',
              },
              {
                name: '宽城仓库',
              },
              {
                name: '绿园仓库',
              }
            ],
          },
          {
            name: '吉林市',
            location: [
              {
                name: '船营仓库',
              },
              {
                name: '昌邑仓库',
              },
              {
                name: '龙潭仓库',
              },
              {
                name: '丰满仓库',
              }
            ],
          },
        ]
      },
    ]

    const getProvince = (provinceName) => {
      return province.filter(item => item.name === provinceName)[0]
    }

    const getCity = (provinceName, name) => {
      return getProvince(provinceName).city.filter(item => item.name === name)[0]
    }

    const data = [
      {
        key: '0',
        name: '沈阳市',
        province: '辽宁省',
        rescue: '50',
        car: '200',
        code: '110000',
        traffic: [
          {
            dataKey: '0',
            key: '0',
            origin: '浑南仓库',
            dest: '沈北仓库',
            length: '5km',
            desc: '呵呵',
          },
          {
            dataKey: '0',
            key: '1',
            origin: '和平仓库',
            dest: '沈河仓库',
            length: '10km',
            desc: '哈哈',
          },
        ]
      },
      {
        key: '1',
        name: '大连市',
        province: '辽宁省',
        rescue: '40',
        car: '400',
        code: '116000',
        traffic: [
          {
            dataKey: '1',
            key: '0',
            origin: '中山仓库',
            dest: '高新仓库',
            length: '5km',
            desc: '呵呵',
          },
          {
            dataKey: '1',
            key: '1',
            origin: '高新仓库',
            dest: '中山仓库',
            length: '10km',
            desc: '哈哈',
          },
        ]
      },
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
      province: '',
      rescue: '',
      car: '',
      code: '',
    });

    const rulesP = {
      name: [{required: true, message: '请选择城市'}],
      province: [{required: true, message: '请选择省份'}],
      rescue: [{required: true, message: '请输入救援人数'}],
      car: [{required: true, message: '请输入车辆数'}],
      code: [{required: true, message: '请输入邮政编码'}],
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
          province: formP.province,
          name: formP.name,
          rescue: formP.rescue,
          car: formP.car,
          code: formP.code,
          traffic: [],
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
      origin: '',
      dest: '',
      length: '',
      desc: '',
    });

    const rulesS = {
      origin: [{required: true, message: '请选择起点'}],
      dest: [{required: true, message: '请选择终点'}, {
        validator: async (rule, value) => {
          if (value === formS.origin)
            return Promise.reject("终点与起点重复");
          else
            return Promise.resolve();
        },
        trigger: 'change',
      }],
      length: [{required: true, message: '请输入路径长度'}],
      desc: [{required: false}],
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
          origin: formS.origin,
          dest: formS.dest,
          length: formS.length,
          desc: formS.desc,
        };
        dataSource.value.filter(item => item.key === selectKey.value)[0]['traffic'].push(newData);
        message.success('已添加 1 个条目');
        onCloseS();
        indexS[parseInt(selectKey.value)]++;
      })
    };

    const formRefS = ref();

    const selectKey = ref('');

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
      province,
      getProvince,
      getCity,
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
      formRefS,
      selectKey
    };
  },
});
</script>

<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>
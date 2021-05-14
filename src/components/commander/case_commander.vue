<template>
  <div>
    <!--    页头-->
    <a-page-header sub-title="管理接报，当发生紧急事件时工作人员创建接报，并提交领导审批，指挥人员对接报的步骤审批。" title="接报维护"
                   @back="() => $router.go(-1)">
      <template #tags>
        <a-tag color="cyan">指挥人员</a-tag>
      </template>
      <br>
      <a-row type="flex">
        <a-statistic :style="{margin:' 0 32px'}" :value="state.total" title="流程数"/>
        <a-statistic :style="{margin:' 0 32px'}" :value="state.pendingReview" title="需要审批"/>
        <a-statistic :style="{margin:' 0 32px'}" :value="state.reviewed" title="已审批"/>
      </a-row>
    </a-page-header>
    <br>
    <!--用于查看详情的抽屉-->
    <a-drawer
        :body-style="{ paddingBottom: '80px' }"
        :visible="visible"
        :width="720"
        title="详情"
        @close="onClose"
    >
      <a-descriptions :column="2" bordered size="small" title="接报信息">
        <a-descriptions-item label="ID">{{ caseInfo.key }}</a-descriptions-item>
        <a-descriptions-item label="事件名称">{{ caseInfo.name }}</a-descriptions-item>
        <a-descriptions-item :span="2" label="风险企业">{{ caseInfo.riskEnterpriseId }}</a-descriptions-item>
        <a-descriptions-item label="流程编号">{{ caseInfo.processId }}</a-descriptions-item>
        <a-descriptions-item label="报警人">{{ caseInfo.reporterName }}</a-descriptions-item>
        <a-descriptions-item label="报警人联系电话">{{ caseInfo.reporterTel }}</a-descriptions-item>
        <a-descriptions-item label="接报时间">{{ caseInfo.reportTime }}</a-descriptions-item>
        <a-descriptions-item label="流程创建者">{{ caseInfo.processCreatorName }}</a-descriptions-item>
        <a-descriptions-item label="流程创建时间">{{ caseInfo.processCreationTime }}</a-descriptions-item>
        <a-descriptions-item label="最后更新者">{{ caseInfo.lastModifierName }}</a-descriptions-item>
        <a-descriptions-item label="最后更新时间">{{ caseInfo.lastUpdateTime }}</a-descriptions-item>
        <a-descriptions-item v-if="caseInfo.commanderComment" :span="2" label="指挥人员意见">{{
            caseInfo.commanderComment
          }}
        </a-descriptions-item>
        <a-descriptions-item v-if="caseInfo.status" label="状态">
        <span>
          <a-tag v-if="caseInfo.status==='已结束'" :key="caseInfo.status" color="default">{{ caseInfo.status }}</a-tag>
          <a-tag v-if="caseInfo.status==='已完成'" :key="caseInfo.status" color="default">{{ caseInfo.status }}</a-tag>
          <a-tag v-if="caseInfo.status==='正在处理'" :key="caseInfo.status" color="processing"><template #icon><sync-outlined
              :spin="true"/></template>{{ caseInfo.status }}</a-tag>
          <a-tag v-if="caseInfo.status==='通过'" :key="caseInfo.status" color="success"><template #icon><check-circle-outlined/></template>{{
              caseInfo.status
            }}</a-tag>
          <a-tag v-if="caseInfo.status==='驳回'" :key="caseInfo.status" color="error"><template #icon><close-circle-outlined/></template>{{
              caseInfo.status
            }}</a-tag>
          <a-tag v-if="caseInfo.status==='等待审批'" :key="caseInfo.status" color="warning"><template #icon><clock-circle-outlined/></template>{{
              caseInfo.status
            }}</a-tag>
          <a-tag v-if="caseInfo.status==='等待专家介入'" :key="caseInfo.status" color="processing"><template #icon><clock-circle-outlined/></template>{{
              caseInfo.status
            }}</a-tag>
        </span>
        </a-descriptions-item>
      </a-descriptions>
      <br>
      <!--      步骤条-->
      <div id="steps-wrapper" v-if="caseInfo.status === '等待审批'">
        <a-steps :current="current" progress-dot>
          <a-step v-for="step in caseInfo.steps" :key="step.key" :description="step.description" :title="step.name"/>
        </a-steps>
        <!--步骤-->
        <div v-if="current <= caseInfo.steps.length - 1" class="steps-content">
          <a-form v-if="caseInfo.status==='等待审批'" ref="formRef" :model="form" :rules="rules" layout="vertical">
            <a-form-item label="指挥人员意见" name="comment">
              <a-textarea
                  v-model:value="form.comment"
                  :auto-size="{ minRows: 2, maxRows: 5 }"
                  placeholder="请输入指挥人员意见..."
                  style="width:100%"
              />
            </a-form-item>
            <a-form-item label="审批结果" name="status">
              <a-select v-model:value="form.status" placeholder="请选择审批结果" style="width: 100%">
                <a-select-option value="通过">通过</a-select-option>
                <a-select-option value="驳回">驳回</a-select-option>
                <a-select-option value="等待专家介入">专家介入</a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </div>

        <!--        步骤按钮-->
        <div class="steps-action" v-if="!specialistRequired">
          <a-button v-if="current < caseInfo.steps.length - 1" type="primary" @click="next">下一步</a-button>
          <a-button
              v-if="current === caseInfo.steps.length - 1"
              type="primary"
              @click="handleAdd"
          >
            完成
          </a-button>
          <a-button v-if="current > 0" style="margin-left: 8px" @click="prev">上一步</a-button>
        </div>
      </div>
<!--      结果-->
      <div v-if="caseInfo.status==='等待专家介入'">
          <a-result title="已请求专家介入" status="info">
          </a-result>
      </div>
      <div v-if="caseInfo.status==='驳回'">
          <a-result title="已驳回流程" status="warning">
          </a-result>
      </div>
      <div v-if="caseInfo.status==='通过'">
          <a-result title="已通过流程" status="success">
          </a-result>
      </div>
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
<!--        <a-button v-if="caseInfo.status==='等待审批'" style="margin-right: 8px" @click="onClose">取消</a-button>-->
        <a-button style="margin-right: 8px" @click="onClose">关闭</a-button>
<!--        <a-button v-if="caseInfo.status==='等待审批'" type="primary" @click="handleAdd">确定</a-button>-->
      </div>
    </a-drawer>
    <!--  表格-->
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
      <!--      以标签形式显示的状态-->
      <template #status="{record}">
        <span>
          <a-tag v-if="record.status==='已结束'" :key="record.status" color="default">{{ record.status }}</a-tag>
          <a-tag v-if="record.status==='已完成'" :key="record.status" color="default">{{ record.status }}</a-tag>
          <a-tag v-if="record.status==='正在处理'" :key="record.status" color="processing"><template #icon><sync-outlined
              :spin="true"/></template>{{ record.status }}</a-tag>
          <a-tag v-if="record.status==='通过'" :key="record.status" color="success"><template #icon><check-circle-outlined/></template>{{
              record.status
            }}</a-tag>
          <a-tag v-if="record.status==='驳回'" :key="record.status" color="error"><template #icon><close-circle-outlined/></template>{{
              record.status
            }}</a-tag>
          <a-tag v-if="record.status==='等待审批'" :key="record.status" color="warning"><template #icon><clock-circle-outlined/></template>{{
              record.status
            }}</a-tag>
          <a-tag v-if="record.status==='等待专家介入'" :key="record.status" color="processing"><template #icon><clock-circle-outlined/></template>{{
              record.status
            }}</a-tag>
        </span>
      </template>
      <!--      操作-->
      <template #action="{record}">
        <div class="row-operations">
          <a v-if="record.status === '等待审批'" @click="showDrawer(record.key)">审批</a>
          <a v-else @click="showDrawer(record.key)">详情</a>
          <a v-if="record.status === '通过'" href="/emergency">紧急事件处理</a>
        </div>
      </template>
    </a-table>
  </div>


</template>

<script>
// eslint-disable-next-line no-unused-vars
import {defineComponent, reactive, ref} from 'vue';
import "@/util"
import {
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined, SearchOutlined
} from '@ant-design/icons-vue';

let data = [
  {
    key: 0, //id
    name: '地震', //事件名称
    riskEnterpriseId: '东北大学',//风险企业
    processId: 1234,//流程编号
    reporterName: '接报人',//报警人
    reporterTel: '15029084943',//报警人联系电话
    reportTime: '2019/05/13', //接报时间
    processCreatorName: '流程创建者1', //流程创建者姓名
    processCreationTime: '2019/05/14', //流程创建时间
    lastModifierName: '工作人员', //最后更新者姓名
    lastUpdateTime: '2019/05/15',//最后更新时间
    status: '正在处理', //流程状态
    steps: [
      {
        key: 0,
        name: '步骤一',
        description: '步骤1描述',
        commanderComment: '', //指挥人员意见
        status: '等待审批'
      },
      {
        key: 1,
        name: '步骤二',
        description: '步骤2描述',
        commanderComment: '', //指挥人员意见
        status: '等待审批'
      },
      {
        key: 2,
        name: '步骤三',
        description: '步骤3描述',
        commanderComment: '', //指挥人员意见
        status: '等待审批'
      },
    ]
  },
  {
    key: 1, //id
    name: '火灾', //事件名称
    riskEnterpriseId: '东北大学',//风险企业
    processId: 1234,//流程编号
    reporterName: '接报人',//报警人
    reporterTel: '15029084943',//报警人联系电话
    reportTime: '2019/05/13', //接报时间
    processCreatorName: '流程创建者1', //流程创建者姓名
    processCreationTime: '2019/05/14', //流程创建时间
    lastModifierName: '工作人员', //最后更新者姓名
    lastUpdateTime: '2019/05/15',//最后更新时间
    status: '等待审批', //流程状态
    steps: [
      {
        key: 0,
        name: '步骤一',
        description: '步骤1描述',
        commanderComment: '', //指挥人员意见
        status: '等待审批'
      },
      {
        key: 1,
        name: '步骤二',
        description: '步骤2描述',
        commanderComment: '', //指挥人员意见
        status: '等待审批'
      },
      {
        key: 2,
        name: '步骤三',
        description: '步骤3描述',
        commanderComment: '', //指挥人员意见
        status: '等待审批'
      },
    ]
  },
  {
    key: 2, //id
    name: '触电', //事件名称
    riskEnterpriseId: '东北大学',//风险企业
    processId: 1234,//流程编号
    reporterName: '接报人',//报警人
    reporterTel: '15029084943',//报警人联系电话
    reportTime: '2019/05/13', //接报时间
    processCreatorName: '流程创建者1', //流程创建者姓名
    processCreationTime: '2019/05/14', //流程创建时间
    lastModifierName: '工作人员', //最后更新者姓名
    lastUpdateTime: '2019/05/15',//最后更新时间
    status: '驳回', //流程状态
    steps: [
      {
        key: 0,
        name: '步骤一',
        description: '步骤1描述',
        commanderComment: '', //指挥人员意见
        status: '等待审批'
      },
      {
        key: 1,
        name: '步骤二',
        description: '步骤2描述',
        commanderComment: '', //指挥人员意见
        status: '等待审批'
      },
      {
        key: 2,
        name: '步骤三',
        description: '步骤3描述',
        commanderComment: '', //指挥人员意见
        status: '等待审批'
      },
    ]
  },
]

export default defineComponent({
      components: {
        CheckCircleOutlined,
        SyncOutlined,
        CloseCircleOutlined,
        ClockCircleOutlined,
        SearchOutlined
      },

      setup() {

        const specialistRequired = ref(false);
        const rejected = ref(false);
        const valid = ref(false);


        const current = ref(0);

        const next = () => {
          // caseInfo.steps[current.value].commanderComment = form.comment;
          // caseInfo.steps[current.value].status = form.status;
          handleAdd();

          // } else {
          //   if (valid.value) {
          //     current.value++;
          //   }
          // }
        };

        const prev = () => {
          current.value--;
        };

        const formRef = ref();

        const resetForm = () => {
          formRef.value.resetFields();
        };

        const form = reactive({
          status: '',
          comment: ''
        })


        const rules = {
          status: [
            {
              required: true,
              message: '请选择审批结果'
            }
          ],
          comment: [
            {
              required: true,
              message: '请输入意见'
            }
          ],
        }

        const caseInfo = reactive({
          key: 0, //id
          name: '', //事件名称
          riskEnterpriseId: '',//风险企业
          processId: 0,//流程编号
          reporterName: '',//报警人
          reporterTel: '',//报警人联系电话
          reportTime: '', //接报时间
          processCreatorName: '', //流程创建者姓名
          processCreationTime: '', //流程创建时间
          lastModifierName: '', //最后更新者姓名
          lastUpdateTime: '',//最后更新时间
          steps: [], //步骤
          status: '' //流程状态
        })

        const showDrawer = (key) => {
          console.log('打开抽屉')
          current.value = 0;
          for (let datum of data) {
            if (datum.key === key) {
              caseInfo.key = datum.key;
              caseInfo.name = datum.name;
              caseInfo.riskEnterpriseId = datum.riskEnterpriseId;
              caseInfo.processId = datum.processId;
              caseInfo.reporterName = datum.reporterName;
              caseInfo.reporterTel = datum.reporterTel;
              caseInfo.reportTime = datum.reportTime;
              caseInfo.processCreatorName = datum.processCreatorName;
              caseInfo.processCreationTime = datum.processCreationTime;
              caseInfo.lastModifierName = datum.lastModifierName;
              caseInfo.lastUpdateTime = datum.lastUpdateTime;
              caseInfo.status = datum.status;
              caseInfo.steps = JSON.parse(JSON.stringify(datum.steps));
              break
            }
          }
          visible.value = true;
          specialistRequired.value = false;
          rejected.value = false;
        };

        const onClose = () => {
          console.log('关上抽屉')
          visible.value = false;
        };

        const visible = ref(false);

        const dataSource = ref(data)

        const dateFormat = 'YYYY/MM/DD';

        const state = reactive({
          total: dataSource.value.length,
          pendingReview: dataSource.value.filter(item => item.status === '等待审批').length,
          reviewed: dataSource.value.filter(item => item.status === '通过' || item.status === '驳回' || item.status === '等待专家介入').length,
          searchText: '',
          searchedColumn: '',
        });

        const handleAdd = () => {
          valid.value = false;
          formRef.value
              .validate()
              .then(() => {
                valid.value = true;
                console.log('提交数据')
                for (let datum of dataSource.value) {
                  if (datum.key === caseInfo.key) {
                    // datum.commanderComment = form.comment;
                    // datum.status = form.status;
                    caseInfo.steps[current.value].commanderComment = form.comment;
                    caseInfo.steps[current.value].status = form.status;
                    datum.steps[current.value].commanderComment = form.comment;
                    datum.steps[current.value].status = form.status;
                    if (caseInfo.steps[current.value].status === '等待专家介入') {
                      caseInfo.status = '等待专家介入';
                    } else if (caseInfo.steps[current.value].status === '驳回') {
                      caseInfo.status = '驳回';
                    }
                    if (datum.steps[current.value].status === '等待专家介入') {
                      datum.status = '等待专家介入'
                    }
                    if (datum.steps[current.value].status === '驳回') {
                      datum.status = '驳回'
                    }

                    datum.lastModifierName = localStorage.getItem('username')
                    datum.lastUpdateTime = new Date().Format('yyyy/MM/dd')
                    if (form.status ==='通过'){
                      current.value ++;
                    }
                    if (current.value>= caseInfo.steps.length){
                      datum.status = '通过';
                      caseInfo.status = '通过';
                    }
                    break
                  }
                }
                resetForm()
              })
              .catch(error => {
                console.log('error', error);
              });
        }

        const columns = [
          {
            dataIndex: 'key',
            key: 'key',
            title: 'ID',
          },
          {
            dataIndex: 'name',
            key: 'name',
            title: '事件名称',
            slots: {
              filterDropdown: 'filterDropdown',
              filterIcon: 'filterIcon',
            },
            onFilter: (value, record) =>
                record.name.toString().toLowerCase().includes(value.toLowerCase()),
            onFilterDropdownVisibleChange: visible => {
              if (visible) {
                setTimeout(() => {
                  searchInput.value.focus();
                });
              }
            },
          },
          {
            dataIndex: 'reportTime',
            key: 'reportTime',
            title: '接报时间',
          },
          {
            dataIndex: 'reporterName',
            key: 'reporterName',
            title: '接报人',
          },
          {
            dataIndex: 'lastModifierName',
            key: 'lastModifierName',
            title: '最后更新者',
          },
          {
            dataIndex: 'lastUpdateTime',
            key: 'lastUpdateTime',
            title: '最后更新时间',
          },
          {
            dataIndex: 'status',
            key: 'status',
            title: '状态',
            slots: {
              customRender: 'status',
            },
            filters: [
              {
                text: '已结束',
                value: '已结束',
              },
              {
                text: '已完成',
                value: '已完成',
              },
              {
                text: '正在处理',
                value: '正在处理',
              },
              {
                text: '等待审批',
                value: '等待审批',
              },
              {
                text: '通过',
                value: '通过',
              },
              {
                text: '驳回',
                value: '驳回',
              },

            ],
            filterMultiple: true,
            onFilter: (value, record) => record.status.indexOf(value) === 0,
          },
          {
            title: '操作',
            key: 'action',
            slots: {customRender: 'action'},
          },
        ]

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
          state,
          columns,
          dateFormat,
          dataSource,
          visible,
          showDrawer,
          onClose,
          caseInfo,
          form,
          formRef,
          rules,
          resetForm,
          handleAdd,
          handleSearch,
          handleReset,
          searchInput,
          current,
          prev,
          next,
          specialistRequired,
          rejected,
        };
      },
    },
)
</script>

<style scoped>
.row-operations a {
  margin-right: 8px;
}

#steps-wrapper {
  margin-top: 60px;
}

.steps-content {
  margin: 48px 48px 48px 32px;
  /*border: 1px dashed #e9e9e9;*/
  /*border-radius: 6px;*/
  /*background-color: #fafafa;*/
  /*min-height: 200px;*/
  /*text-align: center;*/
  /*padding-top: 80px;*/
}
</style>
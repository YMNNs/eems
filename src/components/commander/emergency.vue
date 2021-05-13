<template>
  <!--    页头-->
  <a-page-header sub-title="系统根据城市信息和道路情况，自动求出距离风险企业最近的物资点， 工作人员查看范围内可调度人员以及物资，分配调度内容，处理紧急事件。" title="紧急事件处理"
                 @back="() => $router.go(-1)">
    <template #tags>
      <a-tag color="cyan">指挥人员</a-tag>
    </template>
  </a-page-header>
  <br>
  <a-descriptions :column="2" bordered size="small">
    <a-descriptions-item label="事件名称">{{ caseInfo.name }}</a-descriptions-item>
    <a-descriptions-item label="风险企业">{{ caseInfo.riskEnterpriseId }}</a-descriptions-item>
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
  <!--  步骤条-->
  <div id="steps-wrapper">
    <a-steps :current="current" progress-dot>
      <a-step v-for="item in steps" :key="item.title" :description="item.description" :title="item.title"/>
    </a-steps>
    <!--    人员-->
    <div v-if="current === 0" class="steps-content">
      <a-transfer
          :data-source="mockDataPersonnel"
          :render="item => item.title"
          :selected-keys="selectedKeysPersonnel"
          :target-keys="targetKeysPersonnel"
          :titles="['可用人员', '已选人员']"
          list-style="width: 47%" style="width: 100%"
          @change="handleChangePersonnel"
          @scroll="handleScroll"
          @selectChange="handleSelectChangePersonnel"
      />
    </div>
    <!--    物资-->
    <div v-if="current === 1" class="steps-content">
      <a-transfer
          :data-source="mockDataMaterial"
          :render="item => item.title"
          :selected-keys="selectedKeysMaterial"
          :target-keys="targetKeysMaterial"
          :titles="['可用物资', '已选物资']"
          list-style="width: 47%" style="width: 100%"
          @change="handleChangeMaterial"
          @scroll="handleScroll"
          @selectChange="handleSelectChangeMaterial"
      />
    </div>
    <div v-if="current === 2" class="steps-content">
      <a-alert
          description="前往风险企业的路线在未来1小时内没有拥堵。"
          message="路线畅通"
          show-icon
          type="success"
      />
      <br><br>
      <a-row :gutter="16">
        <a-col :span="6">
          <a-statistic :value="14" style="margin-right: 50px" title="路程">
            <template #suffix>
              <span>公里</span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic :value="16" class="demo-class" title="红绿灯">
            <template #suffix>
              <span>个</span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic :value="20" class="demo-class" title="预计用时">
            <template #suffix>
              <span>分钟</span>
            </template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic :precision="2" :value="0" class="demo-class" title="预计费用">
            <template #suffix>
              <span>元</span>
            </template>
          </a-statistic>
        </a-col>
      </a-row>
    </div>
    <div v-if="current === 3" class="steps-content">
      <a-descriptions v-if="!resultVisible" :column="2" bordered>
        <a-descriptions-item label="已选人员">
          <p v-for="key in targetKeysPersonnel" v-bind:key="key">{{ key }}</p>
        </a-descriptions-item>
        <a-descriptions-item label="已选物资">
          <p v-for="key in targetKeysMaterial" v-bind:key="key">{{ key }}</p>
        </a-descriptions-item>
        <a-descriptions-item label="路线长度">
          <p>16km</p>
        </a-descriptions-item>
        <a-descriptions-item label="预计用时">
          <p>20分钟</p>
        </a-descriptions-item>
      </a-descriptions>
      <a-result
          v-if="resultVisible"
          status="success"
          sub-title="工作人员将在收到消息后立即出发。"
          title="紧急事件处理完成"
      >
        <template #extra>
          <a-button key="console" type="primary" @click="$router.push('/case_commander')">返回接报维护</a-button>
        </template>
      </a-result>
    </div>
    <div v-if="!resultVisible" class="steps-action">
      <a-button v-if="current < steps.length - 1" type="primary" @click="next">下一步</a-button>
      <a-button
          v-if="current === steps.length - 1"
          type="primary"
          @click="resultVisible = true;"
      >
        出发
      </a-button>
      <a-button v-if="current > 0" style="margin-left: 8px" @click="prev">上一步</a-button>
    </div>
  </div>
</template>

<script>
import {defineComponent, reactive, toRefs, ref} from "vue";

const mockDataPersonnel = [];
const mockDataMaterial = [];
for (let i = 0; i < 20; i++) {
  mockDataPersonnel.push({
    key: `人员${i + 1}`,
    title: `人员${i + 1}`,
    description: `description of content${i + 1}`,
  });
  mockDataMaterial.push({
    key: `物资${i + 1}`,
    title: `物资${i + 1}`,
    description: `description of content${i + 1}`,
  });
}

const oriTargetKeysPersonnel = [];
const oriTargetKeysMaterial = [];
import {
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons-vue';

export default defineComponent({

  data() {
    const targetKeysPersonnel = ref(oriTargetKeysPersonnel);
    const targetKeysMaterial = ref(oriTargetKeysMaterial);
    const selectedKeysPersonnel = ref([]);
    const selectedKeysMaterial = ref([]);
    const handleChangePersonnel = (nextTargetKeys, direction, moveKeys) => {
      targetKeysPersonnel.value = nextTargetKeys;
      console.log('targetKeys: ', nextTargetKeys);
      console.log('direction: ', direction);
      console.log('moveKeys: ', moveKeys);
    };
    const handleChangeMaterial = (nextTargetKeys, direction, moveKeys) => {
      targetKeysMaterial.value = nextTargetKeys;
      console.log('targetKeys: ', nextTargetKeys);
      console.log('direction: ', direction);
      console.log('moveKeys: ', moveKeys);
    };

    const handleSelectChangePersonnel = (sourceSelectedKeys, targetSelectedKeys) => {
      selectedKeysPersonnel.value = [...sourceSelectedKeys, ...targetSelectedKeys];
      console.log('sourceSelectedKeys: ', sourceSelectedKeys);
      console.log('targetSelectedKeys: ', targetSelectedKeys);
    };

    const handleSelectChangeMaterial = (sourceSelectedKeys, targetSelectedKeys) => {
      selectedKeysMaterial.value = [...sourceSelectedKeys, ...targetSelectedKeys];
      console.log('sourceSelectedKeys: ', sourceSelectedKeys);
      console.log('targetSelectedKeys: ', targetSelectedKeys);
    };

    const handleScroll = (direction, e) => {
      console.log('direction:', direction);
      console.log('target:', e.target);
    };

    return {
      mockDataPersonnel,
      mockDataMaterial,
      targetKeysPersonnel,
      targetKeysMaterial,
      selectedKeysPersonnel,
      selectedKeysMaterial,
      handleChangePersonnel,
      handleChangeMaterial,
      handleSelectChangePersonnel,
      handleSelectChangeMaterial,
      handleScroll,
    };
  },

  components: {
    CheckCircleOutlined,
    SyncOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
  },
  setup() {

    const state = reactive({});

    const resultVisible = ref(false);
    const current = ref(0);

    const next = () => {
      current.value++;
    };

    const prev = () => {
      current.value--;
    };

    const steps = [
      {
        title: '人员',
        description: '派遣人员前往现场',
      },
      {
        title: '物资',
        description: '领取可用物资',
      },
      {
        title: '路线',
        description: '查看路线信息',
      },
      {
        title: '完成',
        description: '检查并确认分配详情',
      },
    ];


    let caseInfo = {
      name: '火灾', //事件名称
      riskEnterpriseId: '东北大学',//风险企业
      processId: 1234,//流程编号
      reporterName: '刘益先',//报警人
      reporterTel: '15029084943',//报警人联系电话
      reportTime: '2019/05/13', //接报时间
      processCreatorName: '流程创建者1', //流程创建者姓名
      processCreationTime: '2019/05/14', //流程创建时间
      lastModifierName: '王家翼', //最后更新者姓名
      lastUpdateTime: '2019/05/15',//最后更新时间
      commanderComment: '建议拆掉', //指挥人员意见
      status: '通过' //流程状态
    };

    return {
      resultVisible,
      current,
      steps,
      next,
      prev,
      caseInfo,
      ...toRefs(state)
    };
  },


})
</script>

<style scoped>
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


.steps-action {
  margin-top: 24px;
}
</style>
<template>
  <CCSection name="Excel示例" :expand="config.expand_test_excel" @change="onChangExpand">
    <table>
      <tr class="head1" title="数据的键值">
        <td>id</td>
        <td>name</td>
      </tr>
      <tr class="head2" title="数据的注释信息，不会导出到最终数据">
        <td>序列号</td>
        <td>名字</td>
      </tr>
      <tr class="head3" title="数据的导出类型，c为客户端，s为服务端">
        <td>cs</td>
        <td>cs</td>
      </tr>
      <tr class="head4" title="数据的解析规则">
        <td>Number</td>
        <td>String</td>
      </tr>
      <tr title="导出的有效数据">
        <td>1</td>
        <td>a</td>
      </tr>
      <tr title="导出的有效数据">
        <td>2</td>
        <td>b</td>
      </tr>
      <tr title="导出的有效数据">
        <td>3</td>
        <td>c</td>
      </tr>
    </table>
  </CCSection>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import ccui from "@xuyanfeng/cc-ui";
import { storeToRefs } from "pinia";
const { CCInput, CCButton, CCProp, CCTable, CCSection, CCCheckBox } = ccui.components;
import { appStore } from "./store";
export default defineComponent({
  name: "TestExcel",
  components: { CCButton, CCInput, CCProp, CCTable, CCSection, CCCheckBox },
  setup() {
    const { config } = storeToRefs(appStore());
    return {
      config,
      onChangExpand(b: boolean) {
        appStore().config.expand_test_excel = !!b;
        appStore().save();
      },
    };
  },
});
</script>

<style lang="less" scoped>
table {
  border: 1px solid #ccc;
  .head1 {
    background-color: #ff5252;
  }
  .head2 {
    background-color: #868686;
    color: rgb(185, 185, 185);
  }
  .head3 {
    background-color: #ff8c2e;
  }
  .head4 {
    background-color: #5aff6d;
  }
  tr {
    background-color: white;
  }
}
</style>

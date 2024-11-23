<template>
  <CCSection class="root" name="语法示例" :expand="config.expand_desc" @change="onChange">
    <table class="table">
      <tr class="head">
        <td>说明</td>
        <td>规则</td>
        <td>Excel数据</td>
        <td>Json数据</td>
      </tr>
      <tr class="item" v-for="(item, index) in grammar">
        <td>{{ item.desc }}</td>
        <td class="op" @click="copyToClipboard(item.rule)">{{ item.rule }}</td>
        <td class="op" @click="copyToClipboard(item.text)">{{ item.text }}</td>
        <td>{{ item.json }}</td>
      </tr>
    </table>
  </CCSection>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import ccui from "@xuyanfeng/cc-ui";
import { storeToRefs } from "pinia";
const { CCInput, CCButton, CCProp, CCTable, CCSection, CCCheckBox } = ccui.components;
import { TableData } from "@xuyanfeng/cc-ui/types/cc-table/const";
import { appStore } from "./store";
import { RuleCase, runTest, testCases, testRules } from "./rule";

export default defineComponent({
  name: "desc",
  components: { CCButton, CCInput, CCProp, CCTable, CCSection, CCCheckBox },
  setup() {
    const { config } = storeToRefs(appStore());
    runTest();
    const grammar = ref<RuleCase[]>(testCases);
    testRules();

    return {
      grammar,
      config,
      onChange(b: boolean) {
        appStore().config.expand_desc = !!b;
        appStore().save();
      },
      copyToClipboard(text: string) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        ccui.footbar.showTips("复制到剪切板成功", { duration: 2000 });
      },
    };
  },
});
</script>
<style lang="less" scoped>
.root {
  .table {
    .head {
      background-color: #d9d9d9;
    }
    .item {
      background-color: #fff;
      .op {
        cursor: pointer;
      }
    }
    td {
      white-space: pre-wrap;
    }
  }
}
</style>

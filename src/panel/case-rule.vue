<template>
  <CCSection class="root" name="示例语法" :expand="config.expand_desc" @change="onChange">
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
import ccui from "@xuyanfeng/cc-ui";
import { TableData } from "@xuyanfeng/cc-ui/types/cc-table/const";
import { storeToRefs } from "pinia";
import { defineComponent, ref } from "vue";
import { RuleCase, runTest, testCases, testRules } from "./rule";
import { appStore } from "./store";
const { CCInput, CCButton, CCProp, CCTable, CCSection, CCCheckBox } = ccui.components;

export default defineComponent({
  name: "case-rule",
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
    color: black;
    .head {
      background-color: #d9d9d9;
    }
    .item {
      background-color: #fff;
      .op {
        cursor: pointer;
        &:hover {
          background-color: #e9e9e9;
        }
      }
    }
    td {
      white-space: pre-wrap;
    }
  }
}
</style>

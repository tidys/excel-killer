<template>
  <CCSection class="test-rule" name="语法测试" :expand="config.expand_test_rule" @change="onChange">
    <div class="test">
      <CCProp name="rule" tooltip="转换规则">
        <CCInput :value="rule" @change="onChagneRule"></CCInput>
      </CCProp>
      <CCProp name="text" tooltip="转换文本">
        <CCInput :value="text" @change="onChangeText"></CCInput>
      </CCProp>
      <CCProp name="json" tooltip="转换结果">
        <CCInput :value="json" :readonly="true"></CCInput>
      </CCProp>
      <div class="op">
        <div style="flex: 1"></div>
        <CCButton @confirm="onBtnClickTransform">转换</CCButton>
      </div>
    </div>
  </CCSection>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import ccui from "@xuyanfeng/cc-ui";
import { storeToRefs } from "pinia";
const { CCInput, CCButton, CCProp, CCTable, CCSection, CCCheckBox } = ccui.components;
import { appStore } from "./store";
import { Rule } from "./rule";

export default defineComponent({
  name: "test-rule",
  components: { CCButton, CCInput, CCProp, CCTable, CCSection, CCCheckBox },
  setup() {
    const rule = ref("Array[String]");
    const text = ref("1|2|3");
    const json = ref("");
    const { config } = storeToRefs(appStore());
    return {
      rule,
      text,
      json,
      config,
      onChagneRule(v: string) {
        rule.value = v;
      },
      onChangeText(v: string) {
        text.value = v;
      },
      onChange(b: boolean) {
        appStore().config.expand_test_rule = !!b;
        appStore().save();
      },
      onBtnClickTransform() {
        if (!rule.value || !text.value) {
          console.log("请输入数据");
          return;
        }
        const r = new Rule();
        const ret = r.transform(rule.value, text.value, 0);
        json.value = JSON.stringify(ret);
      },
    };
  },
});
</script>
<style lang="less" scoped>
.test-rule {
  color: black;
  .test {
    display: flex;
    flex-direction: column;
    .op {
      display: flex;
      flex-direction: row;
    }
  }
}
</style>

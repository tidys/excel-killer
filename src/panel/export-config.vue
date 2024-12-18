<template>
  <CCSection name="配置-导出" :expand="config.expand_export" @change="onChangeExpand">
    <CCProp v-show="!isWeb" name="清空输出目录" align="left" tooltip="删除输出目录的导出文件<br>如果你只想导出部分数据，可以不清理，从而达到覆盖更新的效果">
      <CCCheckBox v-model:value="config.cleanGenResult"></CCCheckBox>
    </CCProp>
    <CCProp name="客户端*[c字段]" align="left">
      <CCCheckBox v-model:value="config.exportClient" @change="onSave"> </CCCheckBox>
    </CCProp>
    <CCProp name="服务端*[s字段]" align="left">
      <CCCheckBox v-model:value="config.exportServer" @change="onSave"> </CCCheckBox>
    </CCProp>
  </CCSection>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { storeToRefs } from "pinia";
import { config } from "process";
import { defineComponent, nextTick, onMounted, provide, ref } from "vue";
import PluginConfig from "../../cc-plugin.config";
import { appStore } from "./store";
import CCP from "cc-plugin/src/ccp/entry-render";
const { CCInput, CCButton, CCProp, CCSection, CCCheckBox } = ccui.components;
export default defineComponent({
  name: "index",
  components: { CCButton, CCInput, CCProp, CCSection, CCCheckBox },
  setup() {
    const { config } = storeToRefs(appStore());
    const isWeb = ref(CCP.Adaptation.Env.isWeb);
    return {
      isWeb,
      config,
      onChangeExpand(expand: boolean) {
        appStore().config.expand_export = !!expand;
        appStore().save();
      },
      onSave() {
        appStore().save();
      },
    };
  },
});
</script>

<style scoped lang="less"></style>

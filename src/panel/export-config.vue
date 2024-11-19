<template>
  <CCSection name="配置-导出" :expand="config.expand_export" @change="onChangeExpand">
    <CCProp name="客户端*[c字段]" align="left">
      <CCCheckBox v-model:value="config.exportClient" @change="onSave"> </CCCheckBox>
    </CCProp>
    <CCProp name="服务端*[s字段]" align="left">
      <CCCheckBox v-model:value="config.exportServer" @change="onSave"> </CCCheckBox>
    </CCProp>
  </CCSection>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, provide, nextTick } from "vue";
import PluginConfig from "../../cc-plugin.config";
import ccui from "@xuyanfeng/cc-ui";
import { storeToRefs } from "pinia";
import { appStore } from "./store";
import { config } from "process";
const { CCInput, CCButton, CCProp, CCSection, CCCheckBox } = ccui.components;
export default defineComponent({
  name: "index",
  components: { CCButton, CCInput, CCProp, CCSection, CCCheckBox },
  setup() {
    const { config } = storeToRefs(appStore());
    return {
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

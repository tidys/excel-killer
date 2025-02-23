<template>
  <CCSection name="配置-TypeScript" :expand="config.expand_ts" @change="onChangExpand">
    <CCProp name="导出" align="left">
      <CCCheckBox v-model:value="config.exportTs" @change="onSave"> </CCCheckBox>
    </CCProp>
    <CCProp name="导出声明文件(.dts)" align="left">
      <CCCheckBox v-model:value="config.exportDts" @change="onSave"> </CCCheckBox>
    </CCProp>
    <CCProp name="TypeScript存放路径:" v-if="!isWeb">
      <CCInput v-model:value="config.ts_save_path" @click="onBtnClickOpenTsSavePath" :directory="true" disabled @change="onSave"></CCInput>
      <CCButton @confirm="onChooseTsSavePath"><i class="iconfont icon_folder"></i></CCButton>
    </CCProp>
    <CCProp name="合并所有TypeScript" align="left" tooltip="[√]勾选,所有的配置将合并为一个ts文件<br>[×]未勾选,每个sheet对应一个ts文件">
      <CCCheckBox v-model:value="config.ts_merge" @change="onSave"></CCCheckBox>
    </CCProp>
    <CCProp name="TypeScript文件名" v-show="config.ts_merge">
      <CCInput v-model:value="config.ts_file_name" placeholder="请输入javaScript文件名" @change="onSave"></CCInput>
      <CCButton @confirm="onBtnClickOpenJsFile" v-show="config.ts_merge">
        <i class="iconfont icon_folder"></i>
      </CCButton>
    </CCProp>
  </CCSection>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import CCP from "cc-plugin/src/ccp/entry-render";
import { existsSync } from "fs";
import { join } from "path";
import { storeToRefs } from "pinia";
import { defineComponent, nextTick, onMounted, provide, ref, toRaw } from "vue";
import PluginConfig from "../../cc-plugin.config";
import { DirClientName, DirServerName } from "./const";
import { appStore } from "./store";
const { CCInput, CCButton, CCProp, CCSection, CCCheckBox } = ccui.components;
export default defineComponent({
  name: "config-ts",
  components: { CCButton, CCInput, CCProp, CCSection, CCCheckBox },
  setup() {
    const { config } = storeToRefs(appStore());
    const isWeb = ref(CCP.Adaptation.Env.isWeb);
    return {
      config,
      isWeb,
      onChangExpand(expand: boolean) {
        appStore().config.expand_ts = !!expand;
        appStore().save();
      },
      onBtnClickOpenTsSavePath() {
        const tsSavePath = toRaw(appStore().config.ts_save_path);
        CCP.Adaptation.Shell.showItem(tsSavePath);
      },
      onBtnClickOpenJsFile() {
        const tsSavePath = toRaw(appStore().config.ts_save_path);
        CCP.Adaptation.Shell.showItem(tsSavePath);
      },
      async onChooseTsSavePath() {
        const ret = await CCP.Adaptation.Dialog.select({
          title: "选择保存目录",
          type: "directory",
          multi: false,
          fillData: true,
        });
        const dirs = Object.keys(ret);
        if (!dirs.length) {
          return;
        }
        appStore().config.ts_save_path = dirs[0];
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

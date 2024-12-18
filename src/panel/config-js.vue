<template>
  <CCSection name="配置-JavaScript" :expand="config.expand_js" @change="onChangExpand">
    <CCProp name="导出" align="left">
      <CCCheckBox v-model:value="config.exportJs" @change="onSave"> </CCCheckBox>
    </CCProp>
    <CCProp name="Js存放路径:" v-if="!isWeb">
      <CCInput v-model:value="config.js_save_path" @click="onBtnClickOpenJsSavePath" :directory="true" disabled></CCInput>
      <CCButton @confirm="onChooseJsSavePath"><i class="iconfont icon_folder"></i></CCButton>
    </CCProp>
    <CCProp name="合并所有Js" align="left" tooltip="[√]勾选,所有的配置将合并为一个js文件<br>[×]未勾选,每个sheet对应一个js文件">
      <CCCheckBox v-model:value="config.js_merge" @change="onSave"></CCCheckBox>
    </CCProp>
    <CCProp name="javaScript文件名" v-show="config.js_merge">
      <CCInput v-model:value="config.js_file_name" placeholder="请输入javaScript文件名" @change="onSave"></CCInput>
      <CCButton @confirm="onBtnClickOpenJsFile" v-show="config.js_merge">
        <i class="iconfont icon_folder"></i>
      </CCButton>
    </CCProp>
    <CCProp name="代码格式化" align="left" tooltip="[√]勾选,js将格式化后保存文件<br>[×]未勾选,js将保存为单行文件">
      <CCCheckBox v-model:value="config.js_format" @change="onSave"></CCCheckBox>
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
  name: "config-js",
  components: { CCButton, CCInput, CCProp, CCSection, CCCheckBox },
  setup() {
    const { config } = storeToRefs(appStore());
    const isWeb = ref(CCP.Adaptation.Env.isWeb);
    return {
      isWeb,
      config,
      onChangExpand(expand: boolean) {
        appStore().config.expand_js = !!expand;
        appStore().save();
      },
      // 打开生成的js配置文件
      onBtnClickOpenJsFile() {
        const jsSavePath = toRaw(appStore().config.js_save_path);
        const jsFileName = toRaw(appStore().config.js_file_name);
        const client = join(jsSavePath, DirClientName, jsFileName + ".js");
        const server = join(jsSavePath, DirServerName, jsFileName + ".js");
        if (existsSync(client)) {
          CCP.Adaptation.Dialog.open(client);
        }
        if (existsSync(server)) {
          CCP.Adaptation.Dialog.open(server);
        }
      },
      onBtnClickOpenJsSavePath() {
        const jsSavePath = toRaw(appStore().config.js_save_path);
        CCP.Adaptation.Shell.showItem(jsSavePath);
      },
      async onChooseJsSavePath() {
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
        appStore().config.js_save_path = dirs[0];
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

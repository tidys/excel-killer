<template>
  <div class="panel">
    <div class="view-root ccui-scrollbar">
      <TestExcel></TestExcel>
      <CaseRule></CaseRule>
      <TestRule></TestRule>
      <Excel></Excel>
      <ConfigTs></ConfigTs>
      <ConfigJs></ConfigJs>
      <ConfigJson></ConfigJson>
      <ExportConfig></ExportConfig>
      <ConfigSql v-if="isWeb"></ConfigSql>
    </div>

    <div class="bottom">
      <CCButton @confirm="onBtnClickGen">生成</CCButton>
    </div>
    <CCDialog></CCDialog>
    <CCMenu></CCMenu>
    <CCFootBar :version="version"></CCFootBar>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, provide, nextTick } from "vue";
import PluginConfig from "../../cc-plugin.config";
import ccui from "@xuyanfeng/cc-ui";
import ExportConfig from "./export-config.vue";
import ConfigJson from "./config-json.vue";
import ConfigJs from "./config-js.vue";
import Excel from "./excel.vue";
import ConfigTs from "./config-ts.vue";
import ConfigSql from "./config-sql.vue";
import CaseRule from "./case-rule.vue";
import TestRule from "./test-rule.vue";
import TestExcel from "./test-excel.vue";
import { appStore } from "./store";
import { existsSync, mkdirSync } from "fs";
import chokidar from "chokidar";
import CCP from "cc-plugin/src/ccp/entry-main";
import { join } from "path";
import { Msg, DirClientName, DirServerName, emitter } from "./const";
import { Gen } from "./gen";
const { CCInput, CCButton, CCProp, CCSection, CCCheckBox, CCDialog, CCMenu, CCFootBar } = ccui.components;
export default defineComponent({
  name: "index",
  components: { TestRule, TestExcel, CaseRule, ConfigSql, ConfigTs, Excel, CCButton, CCInput, CCProp, CCSection, CCDialog, CCMenu, CCFootBar, CCCheckBox, ExportConfig, ConfigJson, ConfigJs },
  setup() {
    appStore().init();
    onMounted(async () => {
      ccui.footbar.registerCmd({
        icon: "qq",
        cb() {
          // http://wpa.qq.com/pa?p=2:774177933:51
          const url = "http://wpa.qq.com/msgrd?v=3&uin=774177933&site=qq&menu=yes";
          CCP.Adaptation.Shell.openUrl(url);
        },
      });
      ccui.footbar.registerCmd({
        icon: "book",
        cb() {
          const url = "https://tidys.github.io/#/docs/excel-killer/README";
          CCP.Adaptation.Shell.openUrl(url);
        },
      });
      ccui.footbar.registerCmd({
        icon: "github",
        cb() {
          const url = "https://github.com/tidys/excel-killer";
          CCP.Adaptation.Shell.openUrl(url);
        },
      });
      ccui.footbar.registerCmd({
        icon: "cocos",
        cb() {
          CCP.Adaptation.Shell.openUrl("https://store.cocos.com/app/detail/7022");
        },
      });
    });
    const version = ref(PluginConfig.manifest.version);
    const isWeb = ref(CCP.Adaptation.Env.isWeb);
    return {
      isWeb,
      version,
      onBtnClickGen() {
        emitter.emit(Msg.Gen);
      },
    };
  },
});
</script>

<style scoped lang="less">
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  .view-root {
    flex: 1;
    padding: 10px;
    padding-top: 0px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .bottom {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>

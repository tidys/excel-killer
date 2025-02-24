<template>
  <CCSection name="配置-Json" :expand="config.expand_json" class="config-json" @change="onChangExpand">
    <template v-slot:header>
      <div class="header">
        <div class="fill"></div>
      </div>
    </template>
    <CCProp name="导出" tooltip="" align="left">
      <CCCheckBox v-model:value="config.exportJson" @change="onSave"> </CCCheckBox>
    </CCProp>
    <CCProp name="合并所有Json" align="left" tooltip="[√]勾选,所有的配置将合并为一个json文件<br>[×]未勾选,每个sheet对应一个json文件<br>web版本不支持该功能">
      <CCCheckBox v-model:value="config.json_merge" :disabled="isWeb" @change="onSave"></CCCheckBox>
    </CCProp>
    <CCProp name="合并的Json配置文件名" v-show="config.json_merge">
      <CCInput v-model:value="config.json_all_cfg_file_name" placeholder="请输入json配置文件名" @change="onSave"></CCInput>
      <CCButton v-show="!isWeb && config.json_merge" @confirm="onBtnClickJsonAllCfgFile">
        <i class="iconfont icon_folder"></i>
      </CCButton>
    </CCProp>
    <CCProp name="Json格式化" align="left" tooltip=" [√]勾选,json将格式化后保存<br>[×]未勾选,json将保存为单行文件<br>web版本不支持该功能">
      <CCCheckBox v-model:value="config.json_format" :disabled="isWeb" @change="onSave"></CCCheckBox>
    </CCProp>
    <CCProp name="Json存放路径:" v-if="!isWeb">
      <CCInput @click="onBtnClickOpenJsonSavePath" v-model:value="config.json_save_path" :disabled="true" :readonly="true" :directory="true"></CCInput>
      <CCButton @confirm="onChooseJsonSavePath"><i class="iconfont icon_folder"></i></CCButton>
    </CCProp>
    <CCProp v-if="!isWeb && false" name="导入项目路径" tooltip="将生产的json配置导入到项目中">
      <CCInput @click="onOpenProjectJsonCfgPath" :readonly="true" :directory="true" :disabled="true" v-model:value="config.json_import_project_cfg_path"></CCInput>
      <CCButton @confirm="onBtnClickSelectProjectJsonCfgPath"><i class="iconfont icon_folder"></i></CCButton>
    </CCProp>
    <div class="import" v-if="!isWeb && false">
      <CCButton @confirm="onBtnClickImportProjectJsonCfg_Server">导入服务端配置</CCButton>
      <CCButton @confirm="onBtnClickImportProjectJsonCfg_Client">导入客户端配置</CCButton>
    </div>
  </CCSection>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { ButtonGroupItem } from "@xuyanfeng/cc-ui/types/cc-button-group/const";
import CCP from "cc-plugin/src/ccp/entry-render";
import { existsSync } from "fs";
import { join } from "path";
import { storeToRefs } from "pinia";
import { defineComponent, nextTick, onMounted, provide, ref, toRaw } from "vue";
import PluginConfig from "../../cc-plugin.config";
import { DirClientName, DirServerName } from "./const";
import { appStore } from "./store";
import { importJsonCfg } from "./util";
const { CCInput, CCButton, CCButtonGroup, CCProp, CCSection, CCCheckBox } = ccui.components;
export default defineComponent({
  name: "index",
  components: { CCButton, CCInput, CCProp, CCSection, CCCheckBox, CCButtonGroup },
  setup() {
    const { config } = storeToRefs(appStore());
    const isWeb = ref(CCP.Adaptation.Env.isWeb);
    return {
      isWeb,
      config,
      // 打开合并的json
      onBtnClickJsonAllCfgFile() {
        const jsonAllCfgFileName = toRaw(appStore().config.json_all_cfg_file_name);
        const jsonSavePath = toRaw(appStore().config.json_save_path);
        const client = join(jsonSavePath, DirClientName, jsonAllCfgFileName + ".json");
        const server = join(jsonSavePath, DirServerName, jsonAllCfgFileName + ".json");
        if (existsSync(client)) {
          CCP.Adaptation.Dialog.open(client);
        }
        if (existsSync(server)) {
          CCP.Adaptation.Dialog.open(server);
        }
      },
      async onOpenProjectJsonCfgPath() {
        const path = toRaw(appStore().config.json_import_project_cfg_path);
        CCP.Adaptation.Shell.showItem(path);
      },
      async onBtnClickSelectProjectJsonCfgPath() {
        const ret = await CCP.Adaptation.Dialog.select({
          title: "选择项目配置存放目录",
          type: "directory",
        });
        const dirs = Object.keys(ret);
        if (!dirs.length) {
          return;
        }
        const dir = dirs[0];
        appStore().config.json_import_project_cfg_path = dir;
        appStore().save();
      },
      async onChooseJsonSavePath() {
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
        appStore().config.json_save_path = dirs[0];
        appStore().save();
      },
      onBtnClickOpenJsonSavePath() {
        const jsonSavePath = toRaw(appStore().config.json_save_path);
        CCP.Adaptation.Shell.showItem(jsonSavePath);
      },
      async onBtnClickImportProjectJsonCfg_Server() {
        await importJsonCfg(DirServerName);
      },
      async onBtnClickImportProjectJsonCfg_Client() {
        await importJsonCfg(DirClientName);
      },
      onChangExpand(expand: boolean) {
        appStore().config.expand_json = !!expand;
        appStore().save();
      },
      onSave() {
        appStore().save();
      },
    };
  },
});
</script>

<style scoped lang="less">
.config-json {
  .fill {
    flex: 1;
  }
  .header {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
  }
  .import {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>

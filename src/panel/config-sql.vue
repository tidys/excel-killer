<template>
  <CCSection name="SQLite" :expand="config.expand_sql" class="sql" @change="onChangeExpand">
    <CCProp name="sql转json" align="left" tooltip="将sqlite数据库转为json文件">
      <CCButton @confirm="onOpenSqlFile"><i class="iconfont icon_folder"></i></CCButton>
    </CCProp>
  </CCSection>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import CCP from "cc-plugin/src/ccp/entry-main";
import { basename, extname } from "path";
import { storeToRefs } from "pinia";
import { config } from "process";
import { defineComponent, nextTick, onMounted, provide, ref } from "vue";
import PluginConfig from "../../cc-plugin.config";
import { sqlInstance } from "./sql";
import { appStore } from "./store";
const { CCInput, CCButton, CCProp, CCSection, CCCheckBox } = ccui.components;
export default defineComponent({
  name: "index",
  components: { CCButton, CCInput, CCProp, CCSection, CCCheckBox },
  setup() {
    const { config } = storeToRefs(appStore());
    onMounted(async () => {});
    return {
      config,
      onChangeExpand() {
        config.value.expand_sql = !config.value.expand_sql;
        appStore().save();
      },
      async onOpenSqlFile() {
        const ret = await CCP.Adaptation.Dialog.select({
          type: "file",
          filters: [{ name: "SQLite", extensions: ["db"] }],
          multi: false,
          fillData: true,
        });
        const keys = Object.keys(ret);
        if (!keys.length) {
          return;
        }
        const key = keys[0];
        await sqlInstance.init();
        const data = sqlInstance.parseDatabase(ret[key]);
        console.log(data);
        CCP.Adaptation.Download.downloadFile(`${basename(key, extname(key))}.json`, JSON.stringify(data, null, 2), false);
      },
    };
  },
});
</script>

<style lang="less" scoped></style>

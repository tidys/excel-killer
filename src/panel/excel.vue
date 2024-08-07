<template>
  <CCSection name="配置-Excel" :expand="config.expand_excel" class="excel" @change="onChangeExpand">
    <template v-slot:header>
      <div class="header">sheet[{{ excelArray.length }}] excel[{{ excelFileArr.length }}]</div>
    </template>
    <CCProp v-show="true" name="Excel文件夹路径:" align="left" tooltip="插件会循环遍历出目录下所有的excel文件">
      <div class="path">
        <CCInput @click="onOpenExcelRootPath" placeholder="请选择Excel目录" disabled v-model:value="config.excel_root_path" :directory="true"></CCInput>
        <CCButton @confirm="onBtnClickSelectExcelRootPath"><i class="iconfont icon_folder"></i></CCButton>
        <CCButton v-show="config.excel_root_path && config.excel_root_path.length > 0" @confirm="onBtnClickFreshExcel">
          <i class="iconfont icon_refresh"></i>
        </CCButton>
      </div>
    </CCProp>
    <div class="excel-box">
      <div class="excel-title">
        <div class="box">
          <CCCheckBox label="序号" @change="onBtnClickSelectSheet"></CCCheckBox>
        </div>
        <div class="box"><div class="label">Excel文件</div></div>
        <div class="box"><div class="label">工作表名称</div></div>
      </div>
      <div class="excel-content ccui-scrollbar">
        <ExcelItem track-by="$index" v-for="(item, index) in excelArray" :data="item" :index="index"> </ExcelItem>
      </div>
    </div>
  </CCSection>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, provide, nextTick, toRaw, onUnmounted } from "vue";
import PluginConfig from "../../cc-plugin.config";
import ccui from "@xuyanfeng/cc-ui";
import ExcelItem from "./excel-item.vue";
import CCP from "cc-plugin/src/ccp/entry-main";
import { appStore } from "./store";
import { ItemData, emitter, Msg } from "./const";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { basename, extname, join } from "path";
import nodeXlsx from "node-xlsx";

const { CCInput, CCButton, CCProp, CCSection, CCCheckBox } = ccui.components;
import chokidar from "chokidar";
import { storeToRefs } from "pinia";
import { Gen } from "./gen";
export default defineComponent({
  name: "index",
  components: { CCButton, CCInput, CCProp, CCSection, CCCheckBox, ExcelItem },
  setup() {
    /**
     * excel中的详细sheet
     */
    const excelArray = ref<ItemData[]>([]);
    for (let i = 0; i < 0; i++) {
      excelArray.value.push({
        name: `name${i}`,
        fullPath: "",
        sheet: `sheet${i}`,
        isUse: true,
        buffer: null,
      });
    }
    /**
     * 所有的excel文件路径
     */
    const excelFileArr = ref([]);
    const { config } = storeToRefs(appStore());
    async function onGen() {
      (async () => {
        const data = toRaw(excelArray.value).filter((item) => item.isUse);
        const gen = new Gen();
        try {
          const cfg = toRaw(appStore().config);
          gen.ready(cfg);
          gen.check();
          await gen.doWork(data);
          ccui.footbar.showTips("generate success");
        } catch (e: any) {
          console.error(e);
          ccui.footbar.showError(e.message);
        }
      })();
    }
    onMounted(async () => {
      await fresh();
      emitter.on(Msg.Gen, onGen);
    });
    onUnmounted(() => {
      emitter.off(Msg.Gen, onGen);
    });
    async function fresh() {
      const path = toRaw(config.value.excel_root_path);
      try {
        await onAnalyzeExcelDirPath(path);
      } catch (e: any) {
        ccui.footbar.showError(e.message);
      }
    }
    // 查找出目录下的所有excel文件
    async function onAnalyzeExcelDirPath(dir: string) {
      excelFileArr.value.length = 0;
      excelArray.value.length = 0;
      if (!dir || !existsSync(dir)) {
        return;
      }
      const files = await CCP.Adaptation.Util.globArray([`${dir}/**/*.xlsx`, `${dir}/**/*.xls`]);
      const data: Record<string, ArrayBuffer> = {};
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        data[file] = readFileSync(file);
      }
      parseExcelData(data);
    }
    function isTemplateFile(path: string): boolean {
      let head = [".~", "~$"];
      const name = basename(path);
      if (head.find((item) => name.startsWith(item))) {
        return true;
      }
      return false;
    }
    function parseExcelData(data: Record<string, ArrayBuffer>) {
      for (const key in data) {
        if (isTemplateFile(key)) {
          delete data[key];
        }
      }
      excelFileArr.value = Object.keys(data);
      excelArray.value.length = 0;
      const excelSheetArray = [];
      const sheetDuplicationChecker: Record<string, ItemData> = {};
      for (let path in data) {
        const bufferData = data[path];
        const excelData = nodeXlsx.parse(bufferData);
        for (let i = 0; i < excelData.length; i++) {
          const excel = excelData[i];
          const itemData: ItemData = {
            isUse: true,
            fullPath: path,
            name: basename(path),
            sheet: excel.name,
            buffer: excel.data,
          };
          if (excel.data.length === 0) {
            console.log(`[Error] 空Sheet: ${itemData.name} - ${itemData.sheet}`);
            continue;
          }
          const old = sheetDuplicationChecker[itemData.sheet];
          if (old) {
            const err: string[] = [];
            err.push(`sheet[${itemData.sheet}]重名`);
            err.push(`${old.fullPath}`);
            err.push(`${path}`);
            err.push("请仔细检查Excel-Sheet!");
            throw new Error(err.join("\n"));
          } else {
            sheetDuplicationChecker[itemData.sheet] = itemData;
            excelSheetArray.push(itemData);
          }
        }
        excelArray.value = excelSheetArray;
      }
    }

    function _watchDir(event, filePath) {
      return;
    }
    return {
      excelArray,
      excelFileArr,
      config,
      async onBtnClickFreshExcel() {
        await fresh();
      },
      onBtnClickSelectSheet(b: boolean) {
        for (let i = 0; i < excelArray.value.length; i++) {
          excelArray.value[i].isUse = !!b;
        }
      },
      onChangeExpand(expand: boolean) {
        appStore().config.expand_excel = !!expand;
        appStore().save();
      },
      onOpenExcelRootPath() {
        const path = toRaw(appStore().config.excel_root_path);
        CCP.Adaptation.Shell.showItem(path);
      },
      async onBtnClickSelectExcelRootPath() {
        const ret = await CCP.Adaptation.Dialog.select({
          title: "选择Excel的根目录",
          type: "directory",
          multi: false,
          filters: [{ name: "Excel", extensions: ["xlsx", "xls"] }],
          fillData: true,
        });
        const dirs = Object.keys(ret);
        if (!dirs.length) {
          return;
        }
        try {
          if (CCP.Adaptation.Env.isWeb) {
            parseExcelData(ret);
          } else if (CCP.Adaptation.Env.isPlugin) {
            const dir = dirs[0];
            appStore().config.excel_root_path = dir;
            onAnalyzeExcelDirPath(dir);
          }
          appStore().save();
        } catch (e) {
          console.error(e);
          ccui.footbar.showError(e.message);
        }
      },
    };
  },
});
</script>

<style scoped lang="less">
.excel {
  .header {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    flex: 1;
    color: #e5e9f2;
    white-space: nowrap;
    font-size: 13px;
    user-select: none;
  }
  .path {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .excel-box {
    margin-left: 16px;
    border: #686868 1px solid;
    border-radius: 5px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .excel-title {
      color: white;
      display: flex;
      flex-direction: row;
      align-items: center;
      .box {
        overflow: hidden;
        flex: 1;
        font-size: 13px;
        line-height: 14px;
        height: 20px;
        white-space: nowrap;
        user-select: none;
        background-color: #686868;
        display: flex;
        flex-direction: row;
        align-items: center;
        .label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    .excel-content {
      min-height: 100px;
      max-height: 300px;
      overflow-x: hidden;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>

import ccui from "@xuyanfeng/cc-ui";
import CCP from "cc-plugin/src/ccp/entry-main";
import { existsSync } from "fs";
import { join } from "path";
import { toRaw } from "vue";
import { appStore } from "./store";
export async function importJsonCfg(typeDir: string) {
  const importProjectCfgPath = toRaw(appStore().config).json_import_project_cfg_path;
  if (!existsSync(importProjectCfgPath)) {
    ccui.footbar.showError("导入项目路径不存在:" + importProjectCfgPath);
    return;
  }
  const isExportJson = toRaw(appStore().config).exportJson;
  if (!isExportJson) {
    ccui.footbar.showError("[Warning] 您未勾选导出Json配置,可能导入的配置时上个版本的!");
  }

  const importPath = CCP.Adaptation.Util.fspathToUrl(importProjectCfgPath);
  if (!importPath.startsWith("db://assets")) {
    ccui.footbar.showError("不是项目路径,无法导入: " + importProjectCfgPath);
    return;
  }
  const jsonSavePath = toRaw(appStore().config).json_save_path;
  const clientDir = join(jsonSavePath, typeDir);
  if (!existsSync(clientDir)) {
    ccui.footbar.showError("配置目录不存在:" + clientDir);
    return;
  }
  const pattern = join(clientDir, "**/*.json");
  const files = await CCP.Adaptation.Util.glob(pattern);
  const importResult = await CCP.Adaptation.AssetDB.import(files, importPath);
  if (importResult.length) {
    ccui.footbar.showTips("一共导入文件数量: " + files.length, { duration: -1 });
  }
}

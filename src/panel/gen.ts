import CCP from "cc-plugin/src/ccp/entry-render";
import { emptyDirSync, ensureFileSync, existsSync, unlinkSync, writeFileSync } from "fs-extra";
import jszip from "jszip";
import { join } from "path";
import { ConfigData, DirClientName, DirServerName, ItemData } from "./const";
import { checkType, Rule, Type } from "./rule";
import { genDtsString } from "./dts";
import ccui from "@xuyanfeng/cc-ui";
import ccPluginConfig from "../../cc-plugin.config";
import { DialogOptions } from "@xuyanfeng/cc-ui/types/cc-dialog/const";
export class Gen {
  private isMergeJson: boolean = false;
  private isFormatJson: boolean = false;
  private isFormatJsCode: boolean = false;
  private jsonFileName: string = "";
  private jsFileName: string = "";
  private tsFileName: string = "";
  private isExportServer: boolean = false;
  private isExportClient: boolean = false;
  private isExportJson: boolean = false;
  private isExportTs: boolean = false;
  private isExportDts: boolean = false;
  private tsPrefix: string = "";
  private jsSavePath: string = "";
  private tsSavePath: string = "";
  private jsonSavePath: string = "";
  private isExportJs: boolean = false;
  private isMergeJavaScript: boolean = false;
  private isMergeTs: boolean = false;
  private cleanGenResult: boolean = true;
  private _addLog(log: string) {
    throw new Error(log);
  }
  public ready(cfg: ConfigData) {
    this.cleanGenResult = cfg.cleanGenResult;
    this.isMergeJson = cfg.json_merge;
    this.isMergeTs = cfg.ts_merge;
    this.isMergeJavaScript = cfg.js_merge;

    this.jsonFileName = cfg.json_all_cfg_file_name;
    this.jsFileName = cfg.js_file_name;
    this.tsFileName = cfg.ts_file_name;

    this.isExportServer = cfg.exportServer;
    this.isExportClient = cfg.exportClient;

    this.isExportJson = cfg.exportJson;
    this.isExportJs = cfg.exportJs;
    this.isExportDts = cfg.exportDts;
    this.isExportTs = cfg.exportTs;
    this.tsPrefix = cfg.ts_prefix;

    this.jsSavePath = cfg.js_save_path;
    this.jsonSavePath = cfg.json_save_path;
    this.tsSavePath = cfg.ts_save_path;

    this.isFormatJsCode = cfg.js_format;
    this.isFormatJson = cfg.json_format;
  }
  public check() {
    if (CCP.Adaptation.Env.isPlugin) {
      if (this.isExportJs) {
        if (!this.jsSavePath || !existsSync(this.jsSavePath)) {
          throw new Error(`无效的js保存路径: ${this.jsSavePath}`);
        }
      }
      if (this.isExportJson) {
        if (!this.jsonSavePath || !existsSync(this.jsonSavePath)) {
          throw new Error(`无效的json保存路径: ${this.jsonSavePath}`);
        }
      }
      if (this.isExportTs) {
        if (!this.tsSavePath || !existsSync(this.tsSavePath)) {
          throw new Error(`无效的ts保存路径: ${this.tsSavePath}`);
        }
      }
    }

    if (this.isMergeJson) {
      if (!this.jsonFileName || this.jsonFileName.length <= 0) {
        throw new Error("请输入要保存的json文件名!");
      }
    }
    if (this.isMergeJavaScript) {
      if (!this.jsFileName || this.jsFileName.length <= 0) {
        throw new Error("请输入要保存的js文件名!");
      }
    }
    if (this.isExportServer === false && this.isExportClient === false) {
      throw new Error("请选择要导出的目标[客户端/服务端]!");
    }

    if (this.isExportJson === false && this.isExportJs === false && this.isExportTs === false) {
      throw new Error("请选择要导出的类型[Json/TypeScript/JavaScript]!");
    }
  }
  /**
   * 保存客户端的json数据
   */
  private jsonAllClientData = {};
  /**
   * 保存服务端的json数据
   * @example
   * ```json
   * {
   *  "sheet-name": {
   *    "id": { id:"id", property:"property" }
   *  }
   * }
   * ```
   */
  private jsonAllServerData = {};
  private async cleanLatestExportResult() {
    const arr = [this.jsonSavePath, this.tsSavePath, this.jsSavePath];
    const dirArray = [DirClientName, DirServerName];
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (item) {
        for (let j = 0; j < dirArray.length; j++) {
          const dir = dirArray[j];
          const fullPath = join(item, dir);
          if (existsSync(fullPath)) {
            const rule = join(fullPath, "**/*.*").replace(/\\/g, "/");
            const files = await CCP.Adaptation.Util.glob(`${rule}`);
            files.forEach((item) => {
              // 不删除meta文件
              if (!item.endsWith(".meta")) {
                unlinkSync(item);
              }
            });
          }
        }
      }
    }
  }
  async doWork(data: ItemData[]): Promise<void> {
    if (this.cleanGenResult) {
      // 删除老的配置
      await this.cleanLatestExportResult();
    }

    for (let k = 0; k < data.length; k++) {
      const itemSheet = data[k];
      if (!itemSheet.isUse) {
        console.log(`ignore sheet: ${itemSheet.sheet} in ${itemSheet.fullPath}`);
        continue;
      }

      const sheetData = itemSheet.buffer;
      if (!sheetData) {
        throw new Error(`not find any data in sheet: ${itemSheet.sheet}`);
      }

      if (sheetData.length <= 3) {
        throw new Error(`row count less than 3, invalid sheet: ${itemSheet.sheet}`);
      }
      this.parseExcelData(itemSheet);
    }
    let zip: null | jszip = null;
    if (CCP.Adaptation.Env.isWeb) {
      zip = new jszip();
    }
    this.exportJson(zip);
    if (__VALID_CODE__) {
      this.exportJavaScript(zip);
      if (this.isExportDts) {
        this.saveDts(data, zip);
      }
      this.exportTs(zip);
    } else {
      const forbidden = [];
      if (this.isExportJs) {
        forbidden.push("JavaScript");
      }
      if (this.isExportTs) {
        forbidden.push("TypeScript");
      }
      if (this.isExportDts) {
        forbidden.push("TypeScript.DTS");
      }
      if (forbidden.length > 0) {
        const data = new ccui.dialog.DialogUrlData();
        data.label = `web版本不支持导出 ${forbidden.join("/")} ，请前往{cocos store下载插件}，谢谢支持！`;
        data.url = ccPluginConfig.manifest.store;
        data.jump = 5;
        const opts: DialogOptions = { data: data, title: "提示" };
        ccui.dialog.showDialog(opts);
      }
    }
    if (CCP.Adaptation.Env.isWeb && this.hasFileExport) {
      const content = await zip.generateAsync({ type: "blob" });
      const filename = "excel.zip";
      await CCP.Adaptation.Download.downloadBlobFile(filename, content);
    }
    return;
  }
  /**是否有文件导出 */
  private hasFileExport: boolean = false;
  private saveDts(data: ItemData[], zip: null | jszip) {
    const dtsArray: string[] = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      dtsArray.push(item.dts);
    }
    const dts = dtsArray.join("\n");
    const path = join(this.tsSavePath, "excel.d.ts");
    zip && zip.file(path, dts);
    ensureFileSync(path);
    writeFileSync(path, dts);
    this.hasFileExport = true;
  }
  private exportTs(zip: null | jszip) {
    if (!this.isExportTs) {
      return;
    }
    if (this.isMergeTs) {
      if (this.isExportClient) {
        const fullPath = join(this.tsSavePath, DirClientName, `${this.tsFileName}.ts`);
        this.saveTsFile(this.jsonAllClientData, fullPath, zip);
      }
      if (this.isExportServer) {
        const fullPath = join(this.tsSavePath, DirServerName, `${this.tsFileName}.ts`);
        this.saveTsFile(this.jsonAllServerData, fullPath, zip);
      }
    } else {
      if (this.isExportClient) {
        for (const key in this.jsonAllClientData) {
          const fullPath = join(this.tsSavePath, DirClientName, `${key}.ts`);
          const data = this.jsonAllClientData[key];
          this.saveTsFile(data, fullPath, zip);
        }
      }
      if (this.isExportServer) {
        for (const key in this.jsonAllServerData) {
          const data = this.jsonAllServerData[key];
          const fullPath = join(this.tsSavePath, DirServerName, `${key}.ts`);
          this.saveTsFile(data, fullPath, zip);
        }
      }
    }
  }
  private saveTsFile(data: any, path: string, zip: null | jszip) {
    this.hasFileExport = true;
    const str = "export default " + JSON.stringify(data, null, 2) + ";";
    ensureFileSync(path);
    writeFileSync(path, str);
    console.log("[TypeScript]" + path);
    zip && zip.file(path, str);
    return str;
  }
  private exportJson(zip: null | jszip) {
    if (!this.isExportJson) {
      return;
    }
    if (this.isMergeJson) {
      if (this.isExportClient) {
        const fullPath = join(this.jsonSavePath, DirClientName, `${this.jsonFileName}.json`);
        this.saveJsonFile(this.jsonAllClientData, fullPath, zip);
      }
      if (this.isExportServer) {
        const fullPath = join(this.jsonSavePath, DirServerName, `${this.jsonFileName}.json`);
        this.saveJsonFile(this.jsonAllServerData, fullPath, zip);
      }
    } else {
      if (this.isExportClient) {
        for (const key in this.jsonAllClientData) {
          const fullPath = join(this.jsonSavePath, DirClientName, `${key}.json`);
          const data = this.jsonAllClientData[key];
          this.saveJsonFile(data, fullPath, zip);
        }
      }
      if (this.isExportServer) {
        for (const key in this.jsonAllServerData) {
          const data = this.jsonAllServerData[key];
          const fullPath = join(this.jsonSavePath, DirServerName, `${key}.json`);
          this.saveJsonFile(data, fullPath, zip);
        }
      }
    }
  }
  private exportJavaScript(zip: null | jszip) {
    if (!this.isExportJs) {
      return;
    }
    if (this.isMergeJavaScript) {
      if (this.isExportClient) {
        const fullPath = join(this.jsSavePath, DirClientName, `${this.jsFileName}.js`);
        this.saveJavaScriptFile(fullPath, this.jsonAllClientData, zip);
      }
      if (this.isExportServer) {
        const fullPath = join(this.jsSavePath, DirServerName, `${this.jsFileName}.js`);
        this.saveJavaScriptFile(fullPath, this.jsonAllServerData, zip);
      }
    } else {
      if (this.isExportClient) {
        for (const key in this.jsonAllClientData) {
          const data = this.jsonAllClientData[key];
          const fullPath = join(this.jsSavePath, DirClientName, `${key}.js`);
          this.saveJavaScriptFile(fullPath, data, zip);
        }
      }
      if (this.isExportServer) {
        for (const key in this.jsonAllServerData) {
          const data = this.jsonAllServerData[key];
          const fullPath = join(this.jsSavePath, DirServerName, `${key}.js`);
          this.saveJavaScriptFile(fullPath, data, zip);
        }
      }
    }
  }

  private flushExcelData(itemSheet: ItemData, all: any, data: any) {
    const { sheet, name } = itemSheet;
    if (Object.keys(data).length > 0) {
      if (all[sheet] === undefined) {
        all[sheet] = data;
      } else {
        throw new Error(`发现重名sheet: ${name}:${sheet}`);
      }
    }
  }
  private parseExcelData(itemSheet: ItemData) {
    const { client, server } = this.splitData(itemSheet);
    this.flushExcelData(itemSheet, this.jsonAllClientData, client);
    this.flushExcelData(itemSheet, this.jsonAllServerData, server);
  }

  private isServerField(str: string) {
    return str.indexOf("s") !== -1;
  }
  private isClientField(str: string) {
    return str.indexOf("c") !== -1;
  }
  private formatTips = "第1行为Key，第2行为注释，第3行为导出类似c/s/cs，第4行为数据类型，后续为导出的数据";
  private checkTarget(itemSheet: ItemData, target: Array<string | undefined>) {
    for (let i = 0; i < target.length; i++) {
      const key = target[i];
      if (key === undefined || key === null) {
        throw new Error(`${itemSheet.name}/${itemSheet.sheet}数据异常：第3行${i + 1}列数据为空`);
      }
      if (key.indexOf("s") === -1 && key.indexOf("c") === -1) {
        throw new Error(`${itemSheet.name}/${itemSheet.sheet}数据异常：第3行${i + 1}列数据错误，请填写c/s/cs，用来标识该字段是客户端还是服务端。 ${this.formatTips}`);
      }
    }
  }
  /**
   * 第一行是key
   */
  private checkTitle(itemSheet: ItemData, title: Array<string>) {
    for (let i = 0; i < title.length; i++) {
      const item = title[i];
      if (item === undefined) {
        throw new Error(`${itemSheet.name}/${itemSheet.sheet}数据异常：第1行${i + 1}列数据为空`);
      }
      if (item && /[\u4e00-\u9fa5]/.test(item)) {
        throw new Error(`${itemSheet.name}/${itemSheet.sheet}数据异常：第1行${i + 1}列数据为中文，该行为数据的key字段，请使用英文。${this.formatTips}`);
      }
    }
  }
  private isNullLine(line: any[]) {
    for (let i = 0; i < line.length; i++) {
      const item = line[i];
      if (item !== null) {
        return false;
      }
    }
    return true;
  }
  private doDts(sheet: string, title: string[], desc: string[], rule: string[]) {
    const len = Math.min(title.length, desc.length);
    const arr: Array<{ key: string; type: Type; desc: string }> = [];
    for (let i = 0; i < len; i++) {
      const keyItem = title[i];
      const descItem = desc[i];
      const ruleItem = rule[i];
      arr.push({
        key: keyItem,
        type: checkType(ruleItem),
        desc: descItem,
      });
    }
    const ret = genDtsString(this.tsPrefix, sheet, arr);
    return ret;
  }
  /**找到第一个为null的数据就返回，后续的列全部都舍弃掉 */
  private getTitleData(line: string[]): string[] {
    const title: string[] = [];
    for (let i = 0; i < line.length; i++) {
      const item = line[i];
      if (item === null) {
        return title;
      } else {
        title.push(item);
      }
    }
    return title;
  }
  private getLineData(itemSheet: ItemData, row: number, count: number): string[] {
    const line: string[] = itemSheet.buffer[row];
    const ret: string[] = [];
    if (line.length < count) {
      const arr: string[] = [];
      arr.push(`第${row + 1}行数据少于${count}个`);
      arr.push(`excel: ${itemSheet.name}`);
      arr.push(`sheet: ${itemSheet.sheet}`);
      throw new Error(arr.join("\n"));
    }
    for (let i = 0; i < count; i++) {
      const item = line[i];
      if (item === null) {
        const arr: string[] = [];
        arr.push(`第${row + 1}行，${i + 1}列，数据为空`);
        arr.push(`excel: ${itemSheet.name}`);
        arr.push(`sheet: ${itemSheet.sheet}`);
        throw new Error(arr.join("\n"));
      }
      ret.push(item);
    }
    return ret;
  }
  private splitData(itemSheet: ItemData): { server: any; client: any } {
    const excelData: any[][] = itemSheet.buffer;
    const title: Array<string> = this.getTitleData(excelData[0]);
    this.checkTitle(itemSheet, title);
    const desc = this.getLineData(itemSheet, 1, title.length);
    const target = this.getLineData(itemSheet, 2, title.length);
    this.checkTarget(itemSheet, target);
    const ruleText = this.getLineData(itemSheet, 3, title.length);
    itemSheet.dts = this.doDts(itemSheet.sheet, title, desc, ruleText);
    const ret = { server: {}, client: {} };
    for (let line = 4; line < excelData.length; line++) {
      const lineData = excelData[line];
      if (this.isNullLine(lineData)) {
        continue;
      }
      const id = lineData[0];
      if (!lineData.length) {
        // skip empty line
        continue;
      }
      if (lineData.length < title.length) {
        const arr: string[] = [];
        arr.push(`配置数据缺失:`);
        arr.push(`excel: ${itemSheet.name}`);
        arr.push(`sheet: ${itemSheet.sheet}`);
        arr.push(`line:  ${line + 1}`);
        throw new Error(arr.join("\n"));
      }

      const saveLineData = { server: {}, client: {} };
      for (let idx = 0; idx < title.length; idx++) {
        const key = title[idx];
        const rule = ruleText[idx].toString().trim();
        if (key === "Empty" || rule === "Empty") {
          continue;
        }

        let value = lineData[idx];
        // 单元格出现了空
        if (value === null) {
          if (Type.String === rule) {
            // 如果对应的规则是字符串，就设置为空字符串
            value = "";
          } else {
            const arr: string[] = [];
            arr.push(`配置数据缺失:`);
            arr.push(`excel: ${itemSheet.name}`);
            arr.push(`sheet: ${itemSheet.sheet}`);
            arr.push(`line:  ${line + 1}`);
            arr.push(`column:${idx + 1}|${this.columnLetter(idx + 1)}`);
            arr.push(`key:   ${key}`);
            arr.push(`rule:  ${rule}`);
            throw new Error(arr.join("\n"));
          }
        }
        if (value !== null) {
          value = this.cutString(rule, value);
        }
        if (this.isClientField(target[idx])) {
          saveLineData.client[key] = value;
        }
        if (this.isServerField(target[idx])) {
          saveLineData.server[key] = value;
        }
      }
      ret.server[id] = saveLineData.server;
      ret.client[id] = saveLineData.client;
    }
    return ret;
  }
  /**  1 -> A 以此类推*/
  columnLetter(num: number) {
    return String.fromCharCode(num + 64);
  }
  saveJsonFile(data: any, path: string, zip: null | jszip) {
    const str = JSON.stringify(data, null, this.isFormatJson ? 2 : 0);
    ensureFileSync(path);
    writeFileSync(path, str);
    console.log("[Json]:" + path);
    zip && zip.file(path, str);
    this.hasFileExport = true;
    return str;
  }
  saveJavaScriptFile(path: string, data: any, zip: null | jszip) {
    const str = "module.exports =" + JSON.stringify(data, null, this.isFormatJsCode ? 2 : 0) + ";";
    ensureFileSync(path);
    writeFileSync(path, str);
    console.log("[JavaScript]" + path);
    zip && zip.file(path, str);
    this.hasFileExport = true;
    return str;
  }

  /**
   * 切割字符串数据
   * @param {string} rule 规则字符串
   * @param {string} text 数据字符串
   */
  cutString(rule: string, text: string) {
    const r = new Rule();
    const result = r.transform(rule, text, 0);
    return result;
  }
}

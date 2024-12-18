import CCP from "cc-plugin/src/ccp/entry-render";
import { emptyDirSync, ensureFileSync, existsSync, unlinkSync, writeFileSync } from "fs-extra";
import jszip from "jszip";
import { join } from "path";
import { ConfigData, DirClientName, DirServerName, ItemData } from "./const";
import { Rule } from "./rule";
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
  private jsSavePath: string = "";
  private tsSavePath: string = "";
  private jsonSavePath: string = "";
  private isExportJs: boolean = false;
  private isMergeJavaScript: boolean = false;
  private isMergeTs: boolean = false;
  private _addLog(log: string) {
    throw new Error(log);
  }
  public ready(cfg: ConfigData) {
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
    this.isExportTs = cfg.exportTs;

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
      throw new Error("请选择要导出的目标!");
    }

    if (this.isExportJson === false && this.isExportJs === false && this.isExportTs === false) {
      throw new Error("请选择要导出的类型!");
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

  async doWork(data: ItemData[]): Promise<void> {
    // 删除老的配置
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
    console.log(this.jsonAllClientData);
    let zip: null | jszip = null;
    if (CCP.Adaptation.Env.isWeb) {
      zip = new jszip();
    }
    this.exportJson(zip);
    this.exportJavaScript(zip);
    this.exportTs(zip);
    if (CCP.Adaptation.Env.isWeb) {
      const content = await zip.generateAsync({ type: "blob" });
      const filename = "excel.zip";
      await CCP.Adaptation.Download.downloadBlobFile(filename, content);
    }
    return;
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
      if (key === undefined) {
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
  private splitData(itemSheet: ItemData): { server: any; client: any } {
    const excelData: any[][] = itemSheet.buffer;
    const title = excelData[0];
    this.checkTitle(itemSheet, title);
    const desc = excelData[1];
    /**
     * 是客户端还是服务器
     */
    const target = excelData[2];
    this.checkTarget(itemSheet, target);
    const ruleText = excelData[3];
    const ret = { server: {}, client: {} };
    if (excelData.length >= 4) {
      const lineData = excelData[4];
    }
    for (let line = 4; line < excelData.length; line++) {
      const lineData = excelData[line];
      const id = lineData[0];
      if (!lineData.length) {
        // skip empty line
        continue;
      }
      if (lineData.length < title.length) {
        throw new Error(`配置数据缺失:${itemSheet.name}:${itemSheet.sheet}:${line + 1}`);
      }

      const saveLineData = { server: {}, client: {} };
      for (let idx = 0; idx < title.length; idx++) {
        const key = title[idx];
        const rule = ruleText[idx].toString().trim();
        if (key === "Empty" || rule === "Empty") {
          continue;
        }

        let value = lineData[idx];
        if (value === undefined) {
          value = "";
        }
        if (value) {
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
  saveJsonFile(data: any, path: string, zip: null | jszip) {
    const str = JSON.stringify(data, null, this.isFormatJson ? 2 : 0);
    ensureFileSync(path);
    writeFileSync(path, str);
    console.log("[Json]:" + path);
    zip && zip.file(path, str);
    return str;
  }
  saveJavaScriptFile(path: string, data: any, zip: null | jszip) {
    const str = "module.exports =" + JSON.stringify(data, null, this.isFormatJsCode ? 2 : 0) + ";";
    ensureFileSync(path);
    writeFileSync(path, str);
    console.log("[JavaScript]" + path);
    zip && zip.file(path, str);
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

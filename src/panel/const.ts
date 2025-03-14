import { TinyEmitter } from "tiny-emitter";
export const emitter = new TinyEmitter();
export const Msg = {
  Gen: "Gen",
};
export interface ItemData {
  /**
   * excel的路径
   */
  fullPath: string;
  /**
   * excel的文件名
   */
  name: string;
  /**
   * excel里面的某个sheet的名字
   */
  sheet: string;
  /**
   * 是否使用
   */
  isUse: boolean;
  /**
   * excel的数据
   */
  buffer: any[][];
  dts: string;
}
export class ConfigData {
  /**
   * 导出前清空上次生成的数据，如果你想导出部分数据，该选项需要设置为不清理
   */
  cleanGenResult: boolean = false;
  /**
   * 导出服务端字段
   */
  exportServer: boolean = false;
  /**
   * 导出客户端字段
   */
  exportClient: boolean = false;
  /**
   * 导出JSON
   */
  exportJson: boolean = false;
  /**
   * 合并所有json
   */
  json_merge: boolean = false;
  /**
   * 合并的json文件名
   */
  json_all_cfg_file_name: string = "GameJsonCfg";
  /**
   * 格式化json
   */
  json_format: boolean = false;
  /**
   * json的保存路径
   */
  json_save_path: string = "";
  /**
   * creator项目的配置文件路径
   */
  json_import_project_cfg_path: string = "";

  /**
   * ts保存路径
   */
  ts_save_path: string = "";
  ts_merge: boolean = false;
  ts_file_name: string = "GameTsCfg";
  /**
   * ts导出类型前缀
   */
  ts_prefix: string = "";
  /**
   * 导出TypeScript
   */
  exportTs: boolean = false;
  /**
   * 导出DTS声明文件
   */
  exportDts: boolean = false;
  /**
   * 导出JavaScript
   */
  exportJs: boolean = false;

  /**
   * js保存路径
   */
  js_save_path: string = "";
  /**
   * 合并js
   */
  js_merge: boolean = false;

  /**
   * 合并后的js文件名
   */
  js_file_name: string = "GameJsCfg";

  /**
   * 格式化js
   */
  js_format: boolean = false;
  /**
   * 导出Lua
   */
  exportLua: boolean = false;

  /**
   * excel根目录
   */
  excel_root_path: string = "";

  expand_excel: boolean = true;
  expand_json: boolean = true;
  expand_js: boolean = true;
  expand_desc: boolean = true;
  expand_test_rule: boolean = true;
  expand_test_excel: boolean = true;
  expand_ts: boolean = true;
  expand_lua: boolean = true;
  expand_export: boolean = true;
  expand_sql: boolean = true;
}

export const DirClientName = "client";
export const DirServerName = "server";
export const DirJsonName = "json";
export const DirJsName = "js";
export const DirLuaName = "lua";

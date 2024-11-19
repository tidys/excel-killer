// @ts-ignore
import { CocosPluginManifest, CocosPluginOptions, Panel, PluginType } from "cc-plugin/src/declare";

const pkgName = "excel-killer";

const manifest: CocosPluginManifest = {
  name: pkgName,
  version: "0.6.0",
  description: "excel-killer",
  author: "cc-plugin",
  main: "./src/main.ts",
  analysis: {
    tongjiniao: "656939525843935232",
  },
  panels: [
    {
      name: "main",
      type: Panel.Type.DockAble,
      main: "./src/panel/index.ts",
      title: "excel-killer",
      width: 500,
      height: 400,
      minWidth: 50,
      minHeight: 400,
    },
  ],
  menus: [
    {
      path: `i18n.title`,
      message: {
        name: "showPanel",
      },
    },
  ],
  i18n_en: "./src/i18n/en.ts",
  i18n_zh: "./src/i18n/zh.ts",
};
// 这里的options变量名暂时不支持修改，发布时会进行必要的修改
const options: CocosPluginOptions = {
  staticFileDirectory: "./static",
  staticRequestRedirect: true,
  server: {
    enabled: true,
    port: 2022,
  },
  watchBuild: true,
  outputProject: {
    web: "./web",
  },
};
export default { manifest, options };

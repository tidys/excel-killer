import { GA_Github } from "cc-plugin/src/ccp/google-analytics";
import { CocosPluginManifest, CocosPluginOptions, Panel, PluginType } from "cc-plugin/src/declare";

const pkgName = "excel-killer-plus";

const manifest: CocosPluginManifest = {
  name: pkgName,
  version: "0.6.5",
  description: "excel-killer-plus",
  author: "cc-plugin",
  main: "./src/main.ts",
  store: "https://store.cocos.com/app/detail/7022",
  analysis: {
    tongjiniao: "656939525843935232",
    googleAnalytics: {
      measurementID: GA_Github.measurementID,
      apiSecret: GA_Github.apiSecret,
    },
  },
  panels: [
    {
      name: "main",
      type: Panel.Type.DockAble,
      main: "./src/panel/index.ts",
      title: "excel-killer",
      width: 700,
      height: 900,
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

# excel-killer-plus

> 因为插件支持SQL转换的原因，暂时不支持creator 2.4.10以及更低版本。

## 插件说明:
该插件使用[cc-plugin](https://www.npmjs.com/package/cc-plugin)开发，同时支持creator2.x， creator3.x、并且还支持[web在线使用](https://tidys.github.io/excel-killer/main.html)，插件完全
[开源](https://github.com/tidys/excel-killer)，有需要前往[store下载](https://store.cocos.com/app/detail/2016)，插件的用户体验做的非常用心，希望能够成为你游戏开发道路上的必备工具。

插件会展示指定目录下所有excel的sheet，并统计出excel、sheet的数量，可以导出指定的sheet，默认全部导出

![](./doc/scene.png)

支持的转换：


- excel转`json`
- excel转`JavaScript`
- excel转`TypeScript`

## Excel格式说明
Excel支持的格式: `*.xlsx`, `*.xls`

|   id   | fruit  |   cost |  num   |                              all                              |
| :----: | :----: | -----: | :----: | :-----------------------------------------------------------: |
|  编号  |  水果  |   价格 |  数量  |                             总览                              |
|   cs   |   cs   |     cs |   cs   |                              cs                               |
| Number | String | Number | Number | Object{"id":Number,"fruit":String,"cost":Number,"num":Number} |
|   1    |  香蕉  |      1 |   5    |                          1,香蕉,1,5                           |
|   2    |  苹果  |      1 |   6    |                          2,苹果,1,6                           |
|   3    |  草莓  |      1 |   7    |                          3,草莓,1,7                           |


- 第1行: 字段的索引key，不能重复
- 第2行: 字段的中文注释，不会出现在转换后的配置文件中
- 第3行: 字段的导出目标，一个表格，前端后端公用
  - 包含有 c 字符的代表导出到client目标
  - 包含有 s字符代表导出到Server目标
- 第4行：字段的导出规则，支持的字符串类型、数字类型、数组类型、列表类型、对象类型，并且支持简单的类型嵌套，详细用法见插件内`示例语法`。

在插件的`示例Excel`中，也有对以上信息的简单展示，方便在使用中参考。

![](./doc/excel-test.png)
## 示例语法

插件内部提供了部分转换规则示例，可作为参考

![](./doc/grammar.png)

在了解转换规则后，如果想测试自己写的转换规则是否符合预期，可以在语法测试面板进行测试，这是非常有必要，而且很重要的一点是，无论是excel转json还是json转excel，都可以在这个面板进行测试。

![](./doc/rule-test.png)

## EXCEL数据注意事项
- 尽量不要出现空Sheet，当然插件会自动跳过该Sheet
- 尽量不要出现空行、空单元格


## 转换的JavaScript
- 不合并
    ```js
    module.export = {
        1: {fruit: "香蕉", cost: 1, num: 5   },
        2: {fruit: "苹果", cost: 1, num: 6 },
        3: {fruit: "草莓", cost: 1, num: 7 }
    }
    ```
- 合并
    ```javascript
    module.export = {
        fruit: {
            1: {fruit: "香蕉", cost: 1, num: 5   },
            2: {fruit: "苹果", cost: 1, num: 6 },
            3: {fruit: "草莓", cost: 1, num: 7 }
        },
        man: {
            1: {name: "小明", age: 10},
            2: {name: "小红", age: 20},
            3: {name: "小蓝", age: 30},
        }
    }
    ```
## 转换的TypeScript
- 不合并
    ```ts
    export default {
        1: {fruit: "香蕉", cost: 1, num: 5   },
        2: {fruit: "苹果", cost: 1, num: 6 },
        3: {fruit: "草莓", cost: 1, num: 7 }
    }
    ```
- 合并
  ```ts
    default {
        fruit: {
            1: {fruit: "香蕉", cost: 1, num: 5   },
            2: {fruit: "苹果", cost: 1, num: 6 },
            3: {fruit: "草莓", cost: 1, num: 7 }
        },
        man: {
            1: {name: "小明", age: 10},
            2: {name: "小红", age: 20},
            3: {name: "小蓝", age: 30},
        }
    }
  ```

## 转换的json
- 不合并
 
    ```json
    {
        "1": {"fruit": "香蕉", "cost": 1, "num": 5, "all": { "id": 1, "fruit": "香蕉", "cost": 1, "num": 5 }},
        "2": {"fruit": "苹果", "cost": 1, "num": 6, "all": { "id": 2, "fruit": "苹果", "cost": 1, "num": 6 }},
        "3": {"fruit": "草莓", "cost": 1, "num": 7, "all": { "id": 2, "fruit": "苹果", "cost": 1, "num": 7 }}
    }
    ```
- 合并
    ```json
    {
        "fruit": {
            "1": {"fruit": "香蕉", "cost": 1, "num": 5},
            "2": {"fruit": "苹果", "cost": 1, "num": 6},
            "3": {"fruit": "草莓", "cost": 1, "num": 7}
        },
        "man": {
            "1": {"name": "小明", "age": 10},
            "2": {"name": "小红", "age": 20},
            "3": {"name": "小蓝", "age": 30}
        }
    }
    ```
 
## 格式化
勾选该选项，生成的配置文件将会格式化之后输出，例如json:
- 格式化
    ```json
    {
        "test":100
    }
    ```
- 未格式化
    ```json
    {"test":100}
    ```

从上边观察可以看出:

- 格式化的文件文件体积比较小，但是不容易查阅，适合项目发布的时候使用

- 未格式化后的文件更容易查阅，但是文件体积比较大，适合开发的时候使用

> 因为creator在构建时会二次进行处理，所以推荐使用格式化的文件
> 
## 合并
- 不使用合并功能，每个excel的sheet会生成一个对应的json配置，因此需要保证sheet不能出现重名
- 使用合并功能，所有的excel将合并为一个配置文件，因此需要指定合并后的配置文件名

## 联系作者 
- 邮箱 xu_yanfeng@126.com
- 微信号 xu__yanfeng

    ![](https://download.cocos.com/CocosStore/markdown/0aa4773f76bb4f998bf0b1078752f128/0aa4773f76bb4f998bf0b1078752f128.jpg)
 

## 购买须知 
本产品为付费虚拟商品，一经购买成功概不退款，请支付前谨慎确认购买内容。
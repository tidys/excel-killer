export class RuleCase {
  /**
   * 规则
   */
  rule: string;
  /**
   * excel填写数据
   */
  text: string;
  /**
   * 说明
   */
  desc: string;
  /**
   * 转换后的json数据
   */
  json: string;
  constructor(rule: string, text: string, desc: string = "") {
    this.rule = rule;
    this.text = text;
    this.desc = desc;
    this.json = "";
  }
}
export enum Type {
  None = "None",
  String = "String",
  Number = "Number",
  Array = "Array",
  List = "List",
  Object = "Object",
}
export const testCases: RuleCase[] = [];
testCases.push(new RuleCase("Array[String]", "1|2|3", "字符串数组，元素类型相同，个数不确定"));
testCases.push(new RuleCase("Array[Number]", "1|2|3", "数字数组，以|分割数据"));
testCases.push(new RuleCase("Array[Array[Number]]", "10;20|100;200", `数组二级嵌套，分割符按照|;,的顺序依次进行分割`));
testCases.push(new RuleCase("Array[Array[Array[Number]]]", "10,11;20,21|100,101;200,201", "数组三级嵌套，目前支持的最深层级"));
testCases.push(new RuleCase("List[Number, String]", `1|苹果|abc`, "列表的元素类型允许不同，但是个数是确定的，多余的数据(abc)会被舍弃掉"));
testCases.push(new RuleCase("List[Number, String, Array[Number]]", `1|苹果|2;3`, "列表嵌套数组，注意分隔符的使用，分割符按照|;,的顺序依次进行分割"));
testCases.push(new RuleCase("Array[List[Number, String]]", `1;a|2;b`, "数组嵌套列表，注意分隔符的使用，分割符按照|;,的顺序依次进行分割"));
testCases.push(new RuleCase("Array[List[Number, String, Array[Number]]]", `1;a;10,11|2;b;20,21`, "数组列表嵌套，注意分隔符的使用，分割符按照|;,的顺序依次进行分割"));
testCases.push(new RuleCase(`Object{"fruit":String, "num": Number}`, `苹果,1`, "对象是以 , 分割出key对应的值"));
testCases.push(new RuleCase(`Object{"fruit":String, "num": Number, "price":Number}`, `苹果,1,100`));
testCases.push(new RuleCase(`Object{"names":Array[String]}`, "a|b|c", "Object嵌套Array"));
testCases.push(new RuleCase(`Object{"id":Number,"names":Array[String]}`, "1, a|b|c", "Object嵌套Array"));
testCases.push(new RuleCase(`Array[Object{"fruit":String}]`, "苹果|香蕉", "Array嵌套Object"));
testCases.push(new RuleCase(`Array[Object{"fruit":String, "num": Number}]`, "苹果,1|香蕉,2", "Array嵌套Object"));
testCases.push(new RuleCase(`Array[Object{"fruit":String, "num": Number}]`, "苹果|香蕉", "Array嵌套Object，缺失的num默认值为0"));
testCases.push(new RuleCase(`Array[Object{"id":Number,"names":Array[String]}]`, `1, a;b | 2, c;d`, "Array Object 深度嵌套"));

export function runTest() {
  testCases.forEach((item) => {
    const r = new Rule();
    const ret = r.transform(item.rule, item.text, 0);
    item.json = JSON.stringify(ret);
  });
}
export function testRules() {
  return;
  const r = new Rule();
  let ruleCase: RuleCase = testCases[testCases.length - 1];
  console.log(`rule: ${ruleCase.rule}, text: ${ruleCase.text}`);
  debugger;
  const ret = r.transform(ruleCase.rule, ruleCase.text, 0);
  console.log(JSON.stringify(ret, null, 2));
}

export function checkType(rule: string): Type {
  rule = rule.trim().toLowerCase();
  if (/^number$/g.test(rule)) {
    return Type.Number;
  } else if (/^string$/g.test(rule)) {
    return Type.String;
  } else if (/^list\[.*\]$/g.test(rule)) {
    return Type.List;
  } else if (/^array\[.*\]$/g.test(rule)) {
    return Type.Array;
  } else if (/^object\{.*\}$/g.test(rule)) {
    return Type.Object;
  }
  return Type.None;
}
class Data {
  key: string = "";
  type: Type = Type.String;
  rule: string = "";
  constructor(key: string, type: string) {
    this.key = key;
    this.rule = type;
    this.type = checkType(type);
  }
  toValue(value: string) {
    if (this.type == Type.String) {
      return value.toString() || "";
    } else {
      return Number(value) || 0;
    }
  }
  defaultValue() {
    switch (this.type) {
      case Type.String:
        return "";
      case Type.Number:
        return 0;
      case Type.Array:
        return [];
      case Type.Object:
        return {};
      default:
        return "";
    }
  }
}

export class Rule {
  constructor() {}
  /**
   * array的分隔符
   */
  private arraySplitFlags: string[] = ["|", ";", ","];
  public transform(rule: string, text: string, arraySplitFlagIndex: number): any {
    rule = rule.trim();
    text = text.toString().trim().replace(/\n|\r/g, "");
    const type = checkType(rule);
    switch (type) {
      case Type.String: {
        return text.toString();
      }
      case Type.Number: {
        return Number(text);
      }
      case Type.List: {
        const key = /^List\[(.*)\]$/g.exec(rule);
        if (key == null) {
          throw new Error(`无效的规则:${rule}`);
        }
        if (key.length !== 2) {
          throw new Error("正则有问题");
        }
        const targetRule = key[1];
        if (!targetRule.length) {
          throw new Error("未发现列表里面的任何类型");
        }
        const splitFlag = this.arraySplitFlags[arraySplitFlagIndex];
        if (!splitFlag) {
          throw new Error(`List嵌套超过${this.arraySplitFlags.length}层，暂不支持`);
        }
        const array = text.split(splitFlag);
        const result = [];
        const rules = targetRule.split(",");
        for (let i = 0; i < rules.length; i++) {
          const itemRule = rules[i];
          const ret = this.transform(itemRule, array[i], arraySplitFlagIndex + 1);
          result.push(ret);
        }
        return result;
      }
      case Type.Array: {
        // 捕获key
        const key = /^Array\[(.*)\]$/g.exec(rule);
        if (key == null) {
          throw new Error(`无效的规则:${rule}`);
        }
        if (key.length !== 2) {
          throw new Error("正则有问题");
        }
        const targetRule = key[1];
        if (!targetRule.length) {
          throw new Error("未发现数组里面的任何类型");
        }
        const splitFlag = this.arraySplitFlags[arraySplitFlagIndex];
        if (!splitFlag) {
          throw new Error(`Array嵌套超过${this.arraySplitFlags.length}层，暂不支持`);
        }
        const array = text.split(splitFlag);
        const result = [];
        for (let i = 0; i < array.length; i++) {
          const item = array[i];
          const ret = this.transform(targetRule, item, arraySplitFlagIndex + 1);
          result.push(ret);
        }
        return result;
      }
      case Type.Object: {
        // 把里面的key提取出来
        const key = /^Object\{(.*)\}$/g.exec(rule);
        if (key == null) {
          throw new Error(`无效的规则:${rule}`);
        }
        if (key.length !== 2) {
          throw new Error("正则有问题");
        }
        const targetRule = key[1];
        if (!targetRule.length) {
          throw new Error(`对象里面未声明任何字段: ${rule}`);
        }
        // 把key挑出来
        const keys: Data[] = [];
        const keyReg = /("([^"]+)"):([^,]+)/g;
        let test = null;
        while ((test = keyReg.exec(targetRule))) {
          if (test.length === 4) {
            const data = new Data(test[2], test[3]);
            if (data.type === Type.None) {
              throw new Error(`无效的类型声明：${test[3]} in ${targetRule}`);
            }
            keys.push(data);
          } else {
            throw new Error(`正则无法匹配目标字符串: ${targetRule}`);
          }
        }
        const ret = {};
        const arr = text.split(",");
        for (let iKey = 0; iKey < keys.length; iKey++) {
          const key = keys[iKey];
          ret[key.key] = key.defaultValue();
          if (iKey < arr.length) {
            ret[key.key] = this.transform(key.rule, arr[iKey], arraySplitFlagIndex);
          }
        }
        return ret;
      }
      default: {
        return text;
      }
    }
  }
}

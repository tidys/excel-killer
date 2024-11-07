<template>
  <div class="item" :class="calcClass()">
    <div class="box">
      <CCCheckBox v-model:value="data.isUse" @:change="onBtnClickUse" :label="(index + 1).toString()"> </CCCheckBox>
    </div>
    <div class="box">
      <div class="label">{{ data.name }}</div>
    </div>
    <div class="box">
      <div class="label">{{ data.sheet }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, ref } from "vue";
import { ItemData } from "./const";
import ccui from "@xuyanfeng/cc-ui";
const { CCCheckBox } = ccui.components;
export default defineComponent({
  name: "excel-item",
  components: { CCCheckBox },
  props: {
    index: {
      type: Number,
      default: 0,
    },
    data: {
      type: Object as PropType<ItemData>,
      default: () => {
        return {
          name: "",
          sheet: "",
          isUse: false,
        };
      },
    },
  },
  setup(props, ctx) {
    return {
      onBtnClickUse(b: boolean) {},
      calcClass() {
        if (props.index % 2 == 0) {
          return "one";
        } else {
          return "two";
        }
      },
    };
  },
});
</script>

<style scoped lang="less">
.one {
  background-color: rgb(78, 78, 78);
}
.two {
  background-color: rgb(70, 70, 70);
}
.item {
  color: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 20px;
  &:hover {
    background-color: #818181;
  }
  .box {
    display: flex;
    flex: 1;
    overflow: hidden;
    justify-content: flex-start;
    align-items: center;
    white-space: nowrap;
    user-select: none;
    font-size: 13px;
    line-height: 14px;
    height: 20px;
    padding: 0;
    .label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>

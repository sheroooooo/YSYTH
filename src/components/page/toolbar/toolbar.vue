<template>
  <div>
    <div class="toolbar">
      <template v-for="(item, index) in data">
        <Button v-if="item.name!=='auditlog' && item.name !== 'fillIn'"
                @click="handleBtnCilck(item.name)"
                :key="index"
                :class="item.className ? item.className : className"
                :style="item.style ? item.style : style"
                :type="item.type ? item.type : type"
                :ghost="item.ghost ? item.ghost : ghost"
                :size="item.size ? item.size : size"
                :htmlType="item.htmlType ? item.htmlType : htmlType"
                :disabled="item.disabled ? item.disabled : disabled"
                :loading="item.loading ? item.loading : loading"
                :icon="item.icon ? item.icon : icon"
                :customIcon="item.customIcon? item.customIcon : customIcon"
                :to="item.to ? item.to : to"
                :replace="item.replace ? item.replace : replace"
                :target="item.target ? item.target : target">
          {{item.text}}
        </Button>

        <Button v-else-if="item.name ==='auditlog' && workflowType"
                @click="handleBtnCilck(item.name)"
                :key="index"
                :class="item.className ? item.className : className"
                :style="item.style ? item.style : style"
                :type="item.type ? item.type : type"
                :ghost="item.ghost ? item.ghost : ghost"
                :size="item.size ? item.size : size"
                :htmlType="item.htmlType ? item.htmlType : htmlType"
                :disabled="item.disabled ? item.disabled : disabled"
                :loading="item.loading ? item.loading : loading"
                :icon="item.icon ? item.icon : icon"
                :customIcon="item.customIcon? item.customIcon : customIcon"
                :to="item.to ? item.to : to"
                :replace="item.replace ? item.replace : replace"
                :target="item.target ? item.target : target">
          {{item.text}}
        </Button>
        <Dropdown v-else-if='item.name === "fillIn"'
                  @on-click='handleBtnCilck'
                  :key="index">
          <Button :class="item.className ? item.className : className"
                  :style="item.style ? item.style : style"
                  :type="item.type ? item.type : type"
                  :ghost="item.ghost ? item.ghost : ghost"
                  :size="item.size ? item.size : size"
                  :htmlType="item.htmlType ? item.htmlType : htmlType"
                  :disabled="item.disabled ? item.disabled : disabled"
                  :loading="item.loading ? item.loading : loading"
                  :icon="item.icon ? item.icon : icon"
                  :customIcon="item.customIcon? item.customIcon : customIcon"
                  :to="item.to ? item.to : to"
                  :replace="item.replace ? item.replace : replace"
                  :target="item.target ? item.target : target"> 填报 </Button>
          <DropdownMenu slot="list">
            <DropdownItem name='projectLib'
                          :disabled='item.onlyAddNewItem'>项目库项目申报</DropdownItem>
            <DropdownItem name='addNewItem'
                          :disabled='item.onlyProjectLib'>新增项目申报</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Poptip trigger="click"
                word-wrap
                width="300"
                placement="bottom"
                :key="index"
                class="button-poptip"
                v-else>
          <Button :class="item.className ? item.className : className"
                  :style="item.style ? item.style : style"
                  :type="item.type ? item.type : type"
                  :ghost="item.ghost ? item.ghost : ghost"
                  :size="item.size ? item.size : size"
                  :htmlType="item.htmlType ? item.htmlType : htmlType"
                  :disabled="item.disabled ? item.disabled : disabled"
                  :loading="item.loading ? item.loading : loading"
                  :icon="item.icon ? item.icon : icon"
                  :customIcon="item.customIcon? item.customIcon : customIcon"
                  :to="item.to ? item.to : to"
                  :replace="item.replace ? item.replace : replace"
                  :target="item.target ? item.target : target">
            {{item.text}}
          </Button>
          <div class="api"
               slot="content">
            <card-auditlog :data="prams"
                           :show="true"></card-auditlog>
          </div>
        </Poptip>
      </template>
    </div>
  </div>
</template>
<script>
// @mouseenter.native="handleBtnCilck(item.name)"
import CardAuditlog from '_c/card-auditlog'
export default {
  name: 'Toolbar',
  components: {
    CardAuditlog
  },
  data () {
    return {
      /* 按钮默认样式 */
      className: '',
      type: 'text',
      ghost: false,
      size: 'large',
      long: false,
      htmlType: 'button',
      disabled: false,
      loading: false,
      icon: '',
      customIcon: '',
      to: '',
      replace: false,
      target: '_self',
      style: ''
    }
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    prams: {
      type: Object,
      default: () => { }
    },
    workflowType: { // 使用工作流类型，false：U8自己工作流  true:平台工作流
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleBtnCilck (name) {
      this.$emit('on-toolbar-click', name)
    }
  }
}
</script>

<style lang="less">
  @import 'toobar.less';
</style>

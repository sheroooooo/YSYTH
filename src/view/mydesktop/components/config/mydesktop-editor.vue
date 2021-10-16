<template>
  <div>
    <span class="desktop-form-label">工作台名称：</span>
    <Input v-model="name"
           :maxlength="15"></Input>
    <template v-if="roles.length>0">
      <div style="padding:8px 0px 4px;">
        <span class="desktop-form-label">选择角色：</span>
        <Checkbox v-model="onlyRight"
                  style="float:right;">只显示已分配角色</Checkbox>
      </div>
      <div style="height:250px;border:1px #d1d1d1 solid;overflow:auto;">
        <CheckboxGroup v-model="desktopRoles">
          <template v-for="(role,idx) in roles">
            <section v-if="!onlyRight || desktopRoles.indexOf(`${role.ID}`)>=0 "
                     :key="`${_uid}_${idx}`"
                     style="padding:2px 16px;">
              <Checkbox :label="`${role.ID}`">
                <span>{{role.NAME}}</span>
              </Checkbox>
            </section>
          </template>
        </CheckboxGroup>
      </div>
    </template>
    <div style="margin-top:16px;text-align:right;">
      <span style="float:left;color:red;">{{error}}</span>
      <Button style="margin-right:16px;"
              @click="handleCancelClick">取消</Button>
      <Button type="primary"
              @click="handleOkClick">确定</Button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MydesktopEditor',
  props: {
    desktopName: {
      type: Array,
      default: () => []
    },
    roles: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      name: '',
      onlyRight: false,
      desktopRoles: [],
      error: ''
    }
  },
  methods: {
    show ({ desktopName, desktopRoles }) {
      this.name = desktopName
      this.desktopRoles = desktopRoles
    },
    handleOkClick () {
      this.error = ''
      if (this.name.trim() === '') {
        this.error = '工作台名称不能为空！'
        return false
      }
      if (this.desktopRoles.length === 0 && this.roles.length > 0) {
        this.error = '请为工作台分配角色！'
        return false
      }
      this.$emit('ok', this.name, this.desktopRoles)
    },
    handleCancelClick () {
      this.$emit('close')
    }
  }
}
</script>

<style lang="less">
.desktop-form-label{
position: relative;
padding-left:8px;
  &::before{
    content: '*';
    position: absolute;
    left:0px;
    color:red;
  }
}
</style>

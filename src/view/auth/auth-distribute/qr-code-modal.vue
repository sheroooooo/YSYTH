<template>
  <div class="qr-code-modal">
    <div id="imgid"
         style="margin: 16px"></div>
    <!-- <img class="flex-item qr-code-img" :src="require('@/assets/images/login/u0.png')" /> -->
    <div class="flex-item">本二维码在{{ expiredTime }}后失效</div>
    <!-- <div class="flex-item">
      <Form ref="formCustom" :model="formCustom" :rules="ruleCustom" :label-width="180">
        <FormItem label="二维码发送到邮箱" prop="email">
            <Input type="text"
                    v-model="formCustom.email"
                    style="padding-right: 64px;"></Input>
        </FormItem>
      </Form>
    </div> -->
    <div class="flex-item">
      <Button type="primary"
              style="margin-right: 16px"
              @click="handleSaveClick">另存为</Button>
      <Button @click="handleCancelClick">取消</Button>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2' // 引入qrcode
export default {
  name: 'QrCodeModal',
  props: {
    data: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    const validateEmail = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请正确填写邮箱'))
      } else {
        if (value !== '') { 
          var reg=/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
          if(!reg.test(value)){
            callback(new Error('请输入有效的邮箱'))
          }
        }
        callback()
      }
    }
    return {
      formCustom: {
        email: ''
      },
      ruleCustom: {
        email: [{ validator: validateEmail, trigger: 'blur' }]
      }
    }
  },
  computed: {
    expiredTime () {
      let time = this.data.expiredTime
      let year = time.substr(0, 4)
      let month = time.substr(4, 2)
      let day = time.substr(6, 2)
      let hh = time.substr(8, 2)
      let mm = time.substr(10, 2)
      return `${year}年${month}月${day}日 ${hh}时${mm}分`
    }
  },
  methods: {
    handleSaveClick () {
      let div = document.querySelector('#imgid')
      let img = div.querySelector('img')
      let a = document.createElement('a')
      a.download = '发票查验小程序授权码'
      a.href = img.src
      let event = new MouseEvent('click')
      a.dispatchEvent(event)

      // this.$refs.formCustom.validate((valid) => {
      //   if (valid) {

      //   }
      // })
    },
    handleCancelClick () {
      this.$emit('close')
    }
  },
  mounted () {
    this.$nextTick(() => {
      new QRCode('imgid', {
        width: 300,
        height: 300,
        text: this.data.invitationCode
      })
    })
  }
}
</script>

<style lang="less">
.qr-code-modal {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  text-align: center;
  .flex-item {
    flex-basis: 100%;
    margin-bottom: 8px;
  }
  .qr-code-img {
    width: 300px;
    height: 300px;
  }
}
</style>

import {
  login,
  logout, refreshToken,
  getContext
} from '@/api/user'
import { setToken, getToken } from '@/libs/util'
import cm from '@/libs/toolutil'
export default {
  state: {
    userName: cm.getLocal('userName') || '',
    userId: '',
    avatorImgPath: '',
    token: getToken(),
    bmmc: '', // 部门名称
    czyCode: '', // 操作员code
    bmdm: '',
    DWLXDM: '',
    isDev: false, // dev启动时，不调登录接口
    roleId: cm.getLocal('roleId') || ''
  },
  mutations: {
    setAvator (state, avatorPath) {
      state.avatorImgPath = avatorPath
    },
    setUserId (state, id) {
      cm.setLocal('userId', id)
      state.userId = id
    },
    setRoleId (state, roleId) {
      cm.setLocal('roleId', roleId)
      state.roleId = roleId
    },
    setUserName (state, name) {
      cm.setLocal('userName', name)
      state.userName = name
    },
    setUserCode (state, code) {
      cm.setLocal('userCode', code)
    },
    setUser (state, { id, code, name }) {
      if (id) {
        setUserId(state, id)
      }
      if (code) {
        setUserCode(state, code)
      }
      if (name) {
        setUserName(state, name)
      }
    },
    setToken (state, token) {
      state.token = token
      setToken(token)
    },
    // data: cyzCode; bmdm; bmmc
    setContext (state, data) {
      Object.assign(state, data)
    }
  },
  getters: {

  },
  actions: {
    // 登录
    handleLogin ({ commit }, { userName, password, userId, loginDate }) {
      setToken('')
      userName = userName.trim()
      return new Promise((resolve, reject) => {
        login({
          userName,
          password,
          userId,
          loginDate
        }).then(res => {
          if (res) {
            const data = res.data
            commit('setToken', data.token)
            commit('setUserName', data.userName)
            commit('setUserCode', data.czycode)
            commit('setRoleId', data.roleId)

            resolve(res)
          }
        }).catch(err => {
          reject(err)
        })
      })
    },
    handleGetContext ({ commit }) {
      return new Promise((resolve, reject) => {
        getContext().then(res => {
          if (res && res.status === 200) {
            const data = res.data
            commit('setContext', data)
            const { gsdm, gsmc, ZTBH, ZTMC } = data
            cm.setLocal('gsdm', gsdm || '')
            cm.setLocal('gsmc', gsmc || '')
            cm.setLocal('zth', ZTBH || '')
            cm.setLocal('ztmc', ZTMC || '')
            commit('setGSInfo', { gsdm, gsmc })
            commit('setZTInfo', { zth: ZTBH, ztmc: ZTMC })
            resolve(res)
          }
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut ({ state, commit }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('setToken', '')
          resolve()
        }).catch(err => {
          // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
          commit('setToken', '')
          resolve()
          reject(err)
        })
      })
    },
    // 更新 token
    handleRefreshToken ({ commit }, { token }) {
      return new Promise((resolve, reject) => {
        refreshToken(token).then((res) => {
          commit('setToken', res.data)
          resolve()
        }).catch(err => {
          commit('setToken', '')
          resolve()
          reject(err)
        })
      })
    }
  }
}

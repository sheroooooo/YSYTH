export let mainMenuList = [
  {
    MODCAPTION: "01.授权管理",
    XH: 12,
    groupId: "3",
    isFolder: "0",
    menuCode: "A0",
    modCode: "csmp04",
    modName: "授权管理",
    modType: ",BS,",
    pMenuCode: "3",
    status: "",
    title: "授权管理"
  },
  {
    MODCAPTION: "02.基础管理",
    XH: 12,
    groupId: "3",
    isFolder: "0",
    menuCode: "A1",
    modCode: "csmp01",
    modName: "基础管理",
    modType: ",BS,",
    pMenuCode: "3",
    status: "",
    title: "基础管理"
  },
  {
    MODCAPTION: "03.内容管理",
    XH: 12,
    groupId: "3",
    isFolder: "0",
    menuCode: "A2",
    modCode: "csmp03",
    modName: "内容管理",
    modType: ",BS,",
    pMenuCode: "3",
    status: "",
    title: "内容管理"
  },
  {
    MODCAPTION: "04.统计查询",
    XH: 12,
    groupId: "3",
    isFolder: "0",
    menuCode: "A3",
    modCode: "csmp05",
    modName: "统计查询",
    modType: ",BS,",
    pMenuCode: "3",
    status: "",
    title: "统计查询"
  },
  {
    MODCAPTION: "05.用户管理",
    XH: 12,
    groupId: "3",
    isFolder: "0",
    menuCode: "A4",
    modCode: "csmp02",
    modName: "用户管理",
    modType: ",BS,",
    pMenuCode: "3",
    status: "",
    title: "用户管理"
  }
]

import auth from './mockRoute/auth'
import base from './mockRoute/base'
import content from './mockRoute/content'
import statistic from './mockRoute/statistic'
import users from './mockRoute/users'

export let detailMenuList = {
  csmp04: auth,
  csmp01: base,
  csmp03: content,
  csmp05: statistic,
  csmp02: users
}

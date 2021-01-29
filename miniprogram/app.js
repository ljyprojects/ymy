//app.js
App({
  onLaunch: async function () {
    this.globalData = {}
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'ymy-0gte723nbda27d29',
        traceUser: true,
      })
      let wxCloud = new wx.cloud.Cloud({
        resourceAppid: 'wx033dea2d6fc81e68',
        resourceEnv: 'llhui-11qo1'
      })

      await wxCloud.init()
      wx.getSetting({
        withSubscriptions: true,
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            wx.cloud.callFunction({
              name: 'login'
            }).then(res => {
              let appid = res.result.appid
              wxCloud.callFunction({
                name: 'userInfo',
                data: {
                  method: 'get',
                  type: 'own',
                  unionid: res.result.unionid,
                  appid
                }
              }).then(res => {
                console.log('全局获取==》', res)
                res.result.data[0].appid = appid
                this.globalData.userInfo = res.result.data[0]
              })
            })
          } else {
            console.log('没有登陆过')
          }
        }
      })

      this.globalData.wxCloud = wxCloud
    }


  }
})
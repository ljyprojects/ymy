// pages/mine/index.js
let wxCloud = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    choose_index: 4,
  },
  tabChange(e) {
    if (e.detail.index == this.data.choose_index) {
      console.log('是当前页面')
      return
    }
    console.log(e.detail.key)
    let url = ''
    switch (e.detail.key) {
      case 'home': {
        url = '/pages/warehouse/mine/index'
        break
      }
      case 'msg': {
        url = '/pages/messageCenter/index'
        break
      }
      case 'new': {
        url = '/pages/speech/speechAdd/index?collectionName=chest'
        break
      }
      case 'addressbook': {
        url = '/pages/addressbook/index'
        break
      }
      case 'mine': {
        url = '/pages/mine/index'
        break
      }
    }
    console.log(url)
    if (e.detail.key == 'new') {
      if (!this.data.userInfo) {
        this.setData({
          diaShow: true
        })
        return
      }
      wx.navigateTo({
        url: url,
      })
    } else {
      wx.reLaunch({
        url: url,
      })
    }
  },
  login() {
    this.setData({
      diaShow: true
    })
  },
  getUserInfo(e) {
    wx.showLoading({
      title: '正在登录',
    })
    let userInfo = e.detail.userInfo
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      console.log(res.result)
      userInfo.appid = res.result.appid
      userInfo.openid = res.result.openid
      userInfo.unionid = res.result.unionid
      console.log(userInfo)
      wxCloud.callFunction({
        name: 'userInfo',
        data: {
          method: 'add',
          userInfo: userInfo,
          unionid: res.result.unionid,
          appid: res.result.appid
        }
      }).then(res => {
        console.log(res)
        this.setData({
          userInfo: res.result.userInfo
        })
        getApp().globalData.userInfo = res.result.userInfo
        wx.hideLoading({
          success: (res) => {
            this.checkMarkAdmin(this.data.userInfo.unionid, this.data.userInfo.appid, (res) => {
              console.log('素材库管理权限==>', res)
              this.setData({
                isAdministrator: res.length ? true : false
              })
            })
            wx.showToast({
              title: '登录成功',
            })
          },
        })
      })

    })
  },
  checkMarkAdmin(unionid, appid, cb) {
    wxCloud.callFunction({
      name: 'database_manage',
      data: {
        method: 'get',
        collectionName: 'market_admin',
        where: {
          unionid,
          appid
        }
      }
    }).then(res => {
      typeof cb == 'function' && cb(res.result.data)
    })

  },

  toPage(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wxCloud = getApp().globalData.wxCloud
    wx.hideHomeButton()
    wx.hideShareMenu()
    if (getApp().globalData.userInfo) {
      this.setData({
        userInfo: getApp().globalData.userInfo
      })
      this.checkMarkAdmin(this.data.userInfo.unionid, this.data.userInfo.appid, (res) => {
        console.log('素材库管理权限==>', res)
        this.setData({
          isAdministrator: res.length ? true : false
        })
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
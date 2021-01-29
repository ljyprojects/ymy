// pages/messageCenter/index.js
let wxCloud = null
const {
  parseTime
} = require('../../lib/tool')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    choose_index: 1,
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
  toChatRoom(e) {
    console.log(e.currentTarget.dataset)
    wx.navigateTo({
      url: `/pages/chatRoom/index?receiptUnionid=${e.currentTarget.dataset.unionid}&nickName=${e.currentTarget.dataset.name}&appid=${e.currentTarget.dataset.appid}`,
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
      userInfo.unionid = res.result.unionid
      userInfo.openid = res.result.openid
      userInfo.Fans = []
      userInfo.subscription = []
      userInfo.createPoster = []
      userInfo.forumID = `forumID_${res.result.unionid}`
      userInfo.motto = ''
      userInfo.views = 0
      userInfo.viewsOfMembers = []
      wxCloud.callFunction({
        name: 'userInfo',
        data: {
          method: 'add',
          userInfo: userInfo
        }
      }).then(res => {
        console.log(res)
        this.setData({
          userInfo: res.result.userInfo,
          isAdmin: true
        })
        getApp().globalData.userInfo = res.result.userInfo
        wx.hideLoading({
          success: (res) => {
            wx.showToast({
              title: '登录成功',
            })
          },
        })
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wxCloud = getApp().globalData.wxCloud
    wx.hideShareMenu({
      success: (res) => {},
    })
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    if (getApp().globalData.userInfo) {
      this.setData({
        userInfo: getApp().globalData.userInfo
      })
      wx.cloud.callFunction({
        name: 'login'
      }).then(res => {
        wxCloud.callFunction({
          name: 'chat_room_manage',
          data: {
            method: 'get',
            type: 'getMsgList',
            unionid: res.result.unionid,
            appid: res.result.appid
          }
        }).then(res => {
          console.log('结果==》', res)
          res.result.forEach(elem => {
            elem.time = parseTime(elem.sendTimeTS)
          })
          this.setData({
            list: res.result
          })

        })
      })
    }
    wx.hideLoading()
    wx.hideHomeButton()

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
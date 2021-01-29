// pages/market/createReadPage.js
let wxCloud = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    readPage: {
      type: 'read',
      tab: ''
    }
  },
  chooseTag(e) {
    console.log(e.currentTarget.dataset.tag)
    let readPage = this.data.readPage
    readPage.tab = e.currentTarget.dataset.tag
    this.setData({
      readPage
    })
  },
  setTitle(e) {
    console.log(e.detail.value)
    let readPage = this.data.readPage
    readPage.title = e.detail.value.trim()
    this.setData({
      readPage
    })
  },
  setContent(e) {
    console.log(e.detail.value)
    if (!e.detail.value.trim()) {
      return
    }
    let readPage = this.data.readPage
    readPage.content = e.detail.value
    this.setData({
      readPage
    })
  },
  btnClick(e) {
    let readPage = this.data.readPage
    if (e.currentTarget.dataset.type == 'confirm') {
      if (!readPage.title || !readPage.title.trim()) {
        wx.showToast({
          title: '请输入标题',
          icon: 'none'
        })
        return
      }
      if (!readPage.content || !readPage.content.trim()) {
        wx.showToast({
          title: '请输入内容',
          icon: 'none'
        })
        return
      }
      if (!readPage.tab) {
        wx.showToast({
          title: '请选择分类',
          icon: 'none'
        })
        return
      }
      wx.showLoading({
        title: '正在提交',
      })
      readPage.time = Date.now()
      readPage.syncYet = []
      readPage.appid = this.data.userInfo.appid
      wxCloud.callFunction({
        name: 'database_manage',
        data: {
          method: 'add',
          collectionName: 'market',
          wallData: readPage
        }
      }).then(res => {
        console.log('添加成功==>', res)
        wx.hideLoading({
          success: (res) => {
            wx.reLaunch({
              url: '/pages/market/square/index?selectIndex=3',
            })
          },
        })
      })
    } else {
      console.log('cancel')
      readPage.title = ''
      readPage.content = ''
      this.setData({
        readPage
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wxCloud = getApp().globalData.wxCloud
    let {
      userInfo
    } = getApp().globalData
    if (userInfo) {
      this.setData({
        userInfo
      })
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      wxCloud.callFunction({
        name: 'database_manage',
        data: {
          method: 'get',
          collectionName: 'classify',
          where: {
            type: 'read',
            appid:res.result.appid
          }
        }
      }).then(res => {
        console.log('分类列表==>', res)
        this.setData({
          classifyList: res.result.data[0].content
        })
        wx.hideLoading()
      })
    })

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
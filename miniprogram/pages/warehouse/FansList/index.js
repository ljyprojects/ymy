// pages/warehouse/FansList.js
let wxCloud = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    MembersList: []
  },
  formatDate(time) {
    return `${new Date(time).getFullYear()}-${new Date(time).getMonth()+1}-${new Date(time).getDate()}`
  },
  toSpace(e) {
    wx.navigateTo({
      url: `/pages/warehouse/personalPage/index?unionid=${e.currentTarget.dataset.unionid}&appid=${e.currentTarget.dataset.appid}`,
    })
  },

  initList(unionid, appid) {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    switch (this.data.openType) {
      case 'views': {
        wxCloud.callFunction({
          name: 'views_manage',
          data: {
            method: 'getViewsList',
            bloggerUnionid: unionid,
            appid: appid
          }
        }).then(res => {
          console.log('结果==>', res)
          res.result.list.forEach(elem => {
            elem.time = this.formatDate(elem.time)
          })
          this.setData({
            MembersList: res.result.list
          })
          wx.hideLoading()
        })
        return
      }
      default: {
        let data = this.data.openType == 'Fans' ? {
          method: 'get',
          type: 'getFansList',
          bloggerUnionid: unionid,
          appid
        } : {
          method: 'get',
          type: 'getbloggerList',
          fansUnionid: unionid,
          appid
        }
        console.log(data)
        wxCloud.callFunction({
          name: 'Fans_manage',
          data
        }).then(res => {
          console.log('粉丝列表==>', res)
          res.result.list.forEach(elem => {
            elem.time = this.formatDate(elem.time)
          })
          this.setData({
            MembersList: res.result.list
          })
          wx.hideLoading()
        })
        return

      }
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wxCloud = getApp().globalData.wxCloud
    this.setData({
      openType: options.type,
      insetOpenid: options.openid
    })
    this.initList(options.unionid, options.appid)
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
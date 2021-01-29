// pages/drafts/index.js
const tool = require('../../lib/tool')
let wxCloud = null
const InnerAudioContext = wx.createInnerAudioContext()

InnerAudioContext.onError(() => {
  wx.showToast({
    title: '播放失败',
  })
})
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  AsynClick(e) {

    let list = this.data.draftsList
    console.log(list[e.detail])
    let currentID = list[e.detail]._id
    wx.showModal({
      content: '即将公开该内容',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '正在处理',
            mask: true
          })
          let wallData = list[e.detail]
          wallData.time = Date.now()
          wallData.zans = []
          wallData.comments = []
          wallData.traffic = []
          wxCloud.callFunction({
            name: 'database_manage',
            data: {
              method: 'add',
              collectionName: 'chest',
              wallData
            }
          }).then(res => {
            console.log('公开成功==>', res)
            wxCloud.callFunction({
              name: 'database_manage',
              data: {
                method: 'remove',
                collectionName: 'drafts',
                where: {
                  _id: currentID
                }
              }
            }).then(res => {
              console.log('删除草稿箱成功==>', res)

              this.initDraftsList(this.data.unionid, this.data.appid)
              wx.hideLoading()

            })
          })
        }
      }
    })
  },
  pannelClick(e) {
    console.log(e.detail)
    let url = ''
    switch (e.detail.type) {
      case 'speech': {
        url = `/pages/speech/speechDetial/index?collectionName=drafts&id=${e.detail.id}`
        break
      }
    }
    console.log(url)
    wx.navigateTo({
      url,
    })
  },

  deleteItem(e) {
    wx.showModal({
      content: '删除后无法恢复',
      success: res => {
        if (res.confirm) {
          console.log(e.detail)
          wxCloud.callFunction({
            name: 'database_manage',
            data: {
              method: 'remove',
              collectionName: 'drafts',
              where: {
                _id: e.detail.id
              }
            }
          }).then(res => {
            console.log('删除成功==>', res)
            this.initDraftsList(this.data.unionid, this.data.appid)
          })
        }
      }
    })
  },


  initDraftsList(unionid, appid) {
    this.setData({
      isLoading: true
    })
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    wxCloud.callFunction({
      name: 'drafts_manage',
      data: {
        method: 'get',
        type: 'getList',
        unionid,
        appid
      }
    }).then(res => {
      console.log('获取草稿箱成功==>', res)
      let data = res.result.list
      data.forEach(element => {
        element.time = tool.parseTime(element.time)
        if (element.type == 'file') {
          element.name = element.fileName.split('.')[1]
        }
      });
      this.setData({
        draftsList:data,
        isLoading: false
      })
      wx.hideLoading()
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wxCloud = getApp().globalData.wxCloud
    this.setData({
      unionid: options.unionid,
      appid: options.appid
    })
    this.initDraftsList(options.unionid, options.appid)
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
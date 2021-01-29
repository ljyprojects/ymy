// pages/mine/setting/index.js
let wxCloud = null
const {
  changeImageUrl
} = require('../../../lib/tool')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wallData: {},
    showCutImage: false
  },
  chooseAvatarUrl() {
    wx.navigateTo({
      url: '/pages/mine/cutImage/index?type=avatar',
    })
  },
  chooseBannerUrl() {
    wx.navigateTo({
      url: '/pages/mine/cutImage/index?type=banner',
    })
  },
  inputMsg(e) {
    console.log(e.currentTarget.dataset.type)
    console.log(e.detail.value)
    let wallData = this.data.wallData
    wallData[e.currentTarget.dataset.type] = e.detail.value
    this.setData({
      wallData
    })

  },
  uploadFile(filePath, cb) {
    const cloudPath = `userInfo_setting/${Date.now()}${filePath.match(/\.[^.]+?$/)[0]}`
    wxCloud.uploadFile({
      filePath,
      cloudPath,
      success: res => {
        typeof cb == 'function' && cb(changeImageUrl(res.fileID))
      }
    })
  },
  updateUserInfo(wallData) {
    wxCloud.callFunction({
      name: 'database_manage',
      data: {
        method: 'update',
        collectionName: 'sq_member',
        where: {
          _id: this.data.userInfo._id
        },
        wallData
      }
    }).then(res => {
      console.log('提交修改成功==>', res)
      wxCloud.callFunction({
        name: 'database_manage',
        data: {
          method: 'get',
          collectionName: 'sq_member',
          where: {
            openid: this.data.userInfo.openid
          }
        }
      }).then(res => {
        getApp().globalData.userInfo = res.result.data[0]
        wx.reLaunch({
          url: '/pages/mine/index',
        })
      })
    })
  },
  submit() {
    let wallData = this.data.wallData
    if (!wallData.nickName.trim()) {
      wx.showToast({
        title: '请填写昵称',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '正在保存',
    })
    if (this.data.tempAvatarUrl) {
      this.uploadFile(this.data.tempAvatarUrl, (res) => {
        wallData.avatarUrl = res
        if (this.data.tempBannerUrl) {
          this.uploadFile(this.data.tempBannerUrl, (res) => {
            wallData.bannerUrl = res
            this.updateUserInfo(wallData)
          })
        } else {
          this.updateUserInfo(wallData)
        }
      })
      return
    }
    if (this.data.tempBannerUrl) {
      this.uploadFile(this.data.tempBannerUrl, (res) => {
        wallData.bannerUrl = res
        this.updateUserInfo(wallData)
      })
    } else {
      this.updateUserInfo(wallData)
    }

  },
  async initUserInfo(unionid, appid) {

    let user = await wxCloud.callFunction({
      name: 'database_manage',
      data: {
        method: 'get',
        collectionName: 'sq_member',
        where: {
          unionid,
          appid
        }
      }
    })
    console.log(user.result.data)
    let {
      nickName,
      avatarUrl,
      bannerUrl,
      motto = '',
      anchor_name = ''
    } = user.result.data[0]
    let wallData = {
      bannerUrl,
      nickName,
      avatarUrl,
      motto,
      anchor_name,
    }
    this.setData({
      userInfo: user.result.data[0],
      wallData
    })
    wx.hideLoading()

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wxCloud = getApp().globalData.wxCloud
    this.initUserInfo(options.unionid, options.appid)



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
    if (getApp().globalData.tempAvatarUrl) {
      this.setData({
        tempAvatarUrl: getApp().globalData.tempAvatarUrl
      })
    }
    if (getApp().globalData.tempBannerUrl) {
      this.setData({
        tempBannerUrl: getApp().globalData.tempBannerUrl
      })
    }
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
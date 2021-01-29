// pages/market/classify.js
let wxCloud=null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectIndex: null,
    classifyValue: '',
    showForm: false,
    classify: []
  },
  setClassifyValue(e) {
    this.setData({
      classifyValue: e.detail.value
    })
  },
  btnClick(e) {
    if (e.currentTarget.dataset.type == 'cancel') {
      this.setData({
        showForm: false,
        classifyValue: '',
        selectIndex: null
      })
    } else {
      if (!this.data.classifyValue) {
        wx.showToast({
          title: '无效的分类名称',
          icon: 'none'
        })
      }
      wx.showLoading({
        title: '正在提交',
      })
      console.log('准备提交', this.data.selectIndex)
      let type = this.data.classify[this.data.selectIndex].type
      console.log(type)
      wxCloud.callFunction({
        name: 'classify_manage',
        data: {
          method: 'addClassifyItem',
          where: {
            type: type,
            appid: this.data.appid
          },
          classifyItem: this.data.classifyValue
        }
      }).then(res => {
        console.log('添加分类成功')
        this.setData({
          showForm: false,
          classifyValue: '',
          selectIndex: null
        })
        this.getClassify()
      })
    }

  },
  addClassify(e) {
    console.log(e.currentTarget.dataset)
    this.setData({
      showForm: true,
      selectIndex: e.currentTarget.dataset.typeindex
    })
  },
  delClassify(e) {
    wx.showModal({
      title: '删除分类',
      content: '即将删除该分类',
      cancelColor: '#00b26a',
      confirmColor: '#ff0011',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '正在删除',
          })
          let wallData = this.data.classify[e.currentTarget.dataset.typeindex].content
          wallData.splice(e.currentTarget.dataset.contentindex, 1)
          let type = this.data.classify[e.currentTarget.dataset.typeindex].type
          console.log(type)
          console.log(wallData)
          wxCloud.callFunction({
            name: 'database_manage',
            data: {
              method: 'update',
              collectionName: 'classify',
              where: {
                type: type
              },
              wallData: {
                content: wallData
              }
            }
          }).then(res => {
            console.log('删除成功')
            this.getClassify()
          })
        }
      }

    })

  },
  getClassify() {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      this.setData({
        appid: res.result.appid
      })
      wxCloud.callFunction({
        name: 'database_manage',
        data: {
          method: 'get',
          collectionName: 'classify',
          where: {
            appid: res.result.appid
          }
        }
      }).then(res => {
        console.log(res)
        this.setData({
          classify: res.result.data
        })
        wx.hideLoading({
          success: (res) => {},
        })
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wxCloud = getApp().globalData.wxCloud
    wx.showLoading({
      title: '正在加载',
    })
    this.getClassify()
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
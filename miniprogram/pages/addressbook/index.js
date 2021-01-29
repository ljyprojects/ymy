// pages/addressbook/index.js
import pinyin from "wl-pinyin"
let wxCloud = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    choose_index: 3,
    config: {
      search: true, // 是否开启搜索
      searchHeight: 45, // 搜索条高度
      hidden: true,
      letter: 'A' //
    },
  },
  tochatRoom(e) {
    wx.navigateTo({
      url: `/pages/chatRoom/index?receiptUnionid=${e.currentTarget.dataset.unionid}&nickName=亦白&appid=${e.currentTarget.dataset.appid}`,
    })
  },
  formatDate(time) {
    return `${new Date(time).getFullYear()}-${new Date(time).getMonth()+1}-${new Date(time).getDate()}`
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
  getUserInfo(e) {
    wx.showLoading({
      title: '正在登录',
    })
    let userInfo = e.detail.userInfo
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      userInfo.openid = res.result.openid
      userInfo.unionid = res.result.unionid
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
  resetRight(data) {
    let storeCity = new Array(26);
    const words = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
      "U", "V", "W", "X", "Y", "Z", "*"
    ]
    words.forEach((item, index) => {
      storeCity[index] = {
        title: item,
        list: []
      }
    })
    data.forEach((item) => {
      console.log(item)
      let firstName = item.pinyin.substring(0, 1);
      console.log('firstName', firstName)

      let index = words.indexOf(firstName);
      console.log(index)

      storeCity[index].list.push({
        ...item,
      })
    })
    console.log('data==>', storeCity)
    this.setData({
      members: storeCity,
      rightArr: words
    }, () => {
      if (data.length != 0) {
        this.queryMultipleNodes();

      }
      wx.hideLoading()
    })
  },
  queryMultipleNodes() {
    const query = wx.createSelectorQuery().in(this);
    query.selectAll('.fixed-title-hock').boundingClientRect((res) => {
      res.forEach(function (rect) {
        rect.top // 26个字母节点的上边界坐标
      })
    }).exec()
  },
  // 外end 
  handlerTouchEnd() {
    this.setData({
      'config.hidden': true
    })
  },
  // 里start
  jumpMtstart(e) {
    console.log(e.currentTarget.dataset)
    let letter = e.currentTarget.dataset.letter;
    this.setData({
      'config.hidden': false,
      'config.letter': letter
    });
  },
  toSpace(e) {
    console.log(e)
    wx.navigateTo({
      url: `/pages/warehouse/personalPage/index?unionid=${e.currentTarget.dataset.unionid}&appid=${e.currentTarget.dataset.appid}`,

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
    if (getApp().globalData.userInfo) {
      this.setData({
        userInfo: getApp().globalData.userInfo
      })
    }
    wx.showLoading({
      title: '正在加载',
      // mask: true
    })
    wx.hideHomeButton()
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      console.log(res)
      wxCloud.callFunction({
        name: 'views_manage',
        data: {
          method: 'getViewsList',
          bloggerUnionid: res.result.unionid,
          appid: res.result.appid
        }
      }).then(res => {
        console.log('结果==>', res)
        res.result.list.forEach(elem => {
          elem.pinyin = pinyin.getFirstLetter(elem.userInfo.nickName)
          elem.time = this.formatDate(elem.time)
        })
        this.resetRight(res.result.list)
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    return
    let storeCity = new Array(26);
    const words = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    words.forEach((item, index) => {
      storeCity[index] = {
        key: item,
        list: []
      }
    })
    console.log('storeCity==>', storeCity)
    cities.forEach((item) => {
      let firstName = item.pinyin.substring(0, 1);
      let index = words.indexOf(firstName);
      storeCity[index].list.push({
        name: item.name,
        key: firstName
      });
    })
    this.data.cities = storeCity;
    this.setData({
      cities: this.data.cities
    })
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
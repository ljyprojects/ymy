// pages/warehouse/mine/index.js
const tool = require("../../../lib/tool.js")
const videocontent1 = wx.createVideoContext('systemVideo1')
let wxCloud = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: false,
    showMsg: false,
    isAdmin: false,
    canScroll: true,
    current_scroll: 'tab1',
    showTab: false,
    ScrollTab: [{
      name: '全部',
      type: 'all'
    }, {
      name: '头条',
      type: 'article'
    }, {
      name: '小讲',
      type: 'speech'
    }, {
      name: '视频',
      type: 'video'
    }, {
      name: '文章',
      type: 'essay'
    }, {
      name: '课程',
      type: 'course'
    }],
    choose_index: 0,
  },
  pannelClick(e) {
    let url = ''
    switch (e.detail.type) {
      case 'speech': {
        url = `/pages/speech/speechDetial/index?collectionName=chest&id=${e.detail.id}`
        break
      }
    }
    console.log(url)
    wx.navigateTo({
      url,
    })
  },
  tabChange(e) {
    if (e.detail.index == this.data.choose_index) {
      console.log('是当前页面')
      return
    }

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
  toViewsList() {
    if (!this.data.userInfo) {
      this.setData({
        diaShow: true
      })
      return
    }
    console.log('访问列表')
    wx.navigateTo({
      url: `/pages/warehouse/FansList/index?unionid=${this.data.userInfo.unionid}&appid=${this.data.userInfo.appid}&type=views`,
    })
  },
  toFansList() {
    if (!this.data.userInfo) {
      this.setData({
        diaShow: true
      })
      return
    }
    wx.navigateTo({
      url: `/pages/warehouse/FansList/index?unionid=${this.data.userInfo.unionid}&appid=${this.data.userInfo.appid}&type=Fans`,
    })
  },
  ChangeScroll({
    detail
  }) {
    console.log(detail)
    this.setData({
      current_scroll: detail.key
    });
    let index = Number(detail.key.substring(detail.key.length - 1))
    let type = this.data.ScrollTab[index].type;
    this.setData({
      wallData: []
    })
    if (this.data.userInfo) {
      if (type == 'all') {
        this.getDynamic()
      } else {
        this.getType(type)
      }
    }

  },
  getDynamic() {
    wxCloud.callFunction({
      name: 'chest',
      data: {
        fun: 'getNull',
        openid: this.data.userInfo.openid
      },
      success: res => {
        let data = res.result.data
        console.log(data)
        data.forEach(element => {
          element.time = tool.parseTime(element.time)
          if (element.type == 'file') {
            element.name = element.fileName.split('.')[1]
          }
        });
        this.setData({
          wallData: data.reverse()
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getType(type) {
    let _this = this
    wxCloud.callFunction({
      name: "chest",
      data: {
        fun: 'getType',
        unionid: _this.data.userInfo.unionid,
        appid: _this.data.userInfo.appid,
        type: type,
      },
      success: res => {
        console.log(res)
        let data = res.result.list
        console.log(data)
        data.forEach(element => {
          element.time = tool.parseTime(element.time)
          if (element.type == 'file') {
            element.name = element.fileName.split('.')[1]
          }
        });
        this.setData({
          wallData: data.reverse(),
          showSystemVideo: data.length ? false : true
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  getproductionNum(unionid, appid) {
    wxCloud.callFunction({
      name: 'chest',
      data: {
        fun: 'count',
        where: {
          type: 'speech',
          unionid,
          appid
        }
      }
    }).then(res => {
      console.log('内容总量==>', res)
      this.setData({
        productionNum: res.result.total
      })
    })
  },
  computeDataOfUserInfo(userInfo) {
    if (!userInfo.Fans || !userInfo.Fans.length) {
      userInfo.FansNum = 0
    } else if (userInfo.Fans.length < 10000) {
      userInfo.FansNum = userInfo.Fans.length
    } else if (userInfo.Fans.length >= 10000) {
      userInfo.FansNum = `${(userInfo.Fans.length / 10000).toFixed(2)}万`
    }
    if (!userInfo.viewsOfMembers || !userInfo.viewsOfMembers.length) {
      userInfo.viewsOfMembersNum = 0
    } else if (userInfo.viewsOfMembers.length < 10000) {
      userInfo.viewsOfMembersNum = userInfo.viewsOfMembers.length
    } else if (userInfo.viewsOfMembers.length >= 10000) {
      userInfo.viewsOfMembersNum = `${(userInfo.viewsOfMembers.length / 10000).toFixed(2)}万`
    }
    if (userInfo.views) {
      userInfo.views = userInfo.views < 10000 ? userInfo.views : `${(userInfo.views/10000).toFixed(1)}万`
    } else {
      userInfo.views = 0
    }
    return userInfo
  },
  initPageUserInfo(cb) {
    this.setData({
      isLoading: true
    })
    wx.getSetting({
      withSubscriptions: true,
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.cloud.callFunction({
            name: 'login'
          }).then(res => {
            let appid = res.result.appid
            console.log('appid==>', res)
            wxCloud.callFunction({
              name: 'userInfo',
              data: {
                method: 'get',
                type: 'own',
                unionid: res.result.unionid,
                appid: res.result.appid
              }
            }).then(res => {
              console.log('获取用户信息==>', res)
              let userInfo = this.computeDataOfUserInfo(res.result.data[0])
              userInfo.appid = appid
              this.setData({
                userInfo
              })
              this.getproductionNum(this.data.userInfo.unionid, this.data.userInfo.appid)
              typeof cb == 'function' && cb()
            })
          })
        } else {
          console.log('无用户信息权限')
          wx.cloud.callFunction({
            name: 'login'
          }).then(res => {
            let appid = res.result.appid
            let openid = res.result.openid
            wxCloud.callFunction({
              name: 'database_manage',
              data: {
                method: 'get',
                collectionName: 'userInfo',
                where: {
                  unionid: res.result.unionid,
                }
              }
            }).then(res => {
              console.log('查询总表用户数据==>', res)
              if (res.result.data.length) {
                let userInfo = res.result.data[0]
                userInfo.openid = openid
                userInfo.appid = appid
                this.addUserInfo(userInfo, userInfo => {
                  console.log('新表加入的用户信息==>', userInfo)

                  this.setData({
                    userInfo: this.computeDataOfUserInfo(userInfo)
                  })
                  this.getproductionNum(this.data.userInfo.unionid, this.data.userInfo.appid)
                  getApp().globalData.userInfo = userInfo
                  typeof cb == 'function' && cb()
                })
              }
            })
          })
          this.setData({
            isLoading: false
          })
          wx.hideLoading({
            success: (res) => {},
          })
        }
      }
    })


  },
  updata(e) {
    wx.showActionSheet({
      itemList: ['自主创作', '去逛逛'],
      success: res => {
        console.log('选择结构==>', res)
        if (res.tapIndex == 0) {
          console.log('原创==')
          let url = ''
          switch (this.data.current_scroll) {
            case 'tab1': {
              url = '/pages/speech/speechAdd/index?collectionName=chest'
              break
            }
          }
          wx.navigateTo({
            url: url,
          })
        } else {
          wx.navigateTo({
            url: '/pages/market/square/index',
          })
        }
      }
    })
    return

  },
  deleteItem(e) {
    console.log(e.detail)
    wx.showModal({
      title: '删除',
      content: '删除后无法找回',
      confirmColor: "#ff0000",
      cancelColor: "#00b26a",
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '正在删除',
          })
          let fileList = [...e.detail.images, e.detail.voice]
          wxCloud.callFunction({
            name: 'chest',
            data: {
              fun: 'remove',
              _id: e.detail.id
            }
          }).then(res => {
            wx.hideLoading({
              success: (res) => {
                wx.showToast({
                  title: '删除成功',
                })
              },
            })

            wxCloud.deleteFile({
              fileList,
              success: res => {
                console.log('删除文件成功')
              }
            })
            this.setData({
              productionNum: this.data.productionNum - 1
            })
            this.getType('speech')
          })
        }
      }
    })

  },
  addUserInfo(userInfo, cb) {
    console.log(userInfo)
    wxCloud.callFunction({
      name: 'userInfo',
      data: {
        method: 'add',
        unionid: userInfo.unionid,
        appid: userInfo.appid,
        userInfo: userInfo
      }
    }).then(res => {
      console.log(res)
      this.setData({
        userInfo: res.result.userInfo,
        isAdmin: true
      })

      typeof cb == 'function' && cb(res.result.userInfo)


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
      userInfo.appid = res.result.appid
      userInfo.unionid = res.result.unionid
      userInfo.openid = res.result.openid
      console.log(userInfo)
      this.addUserInfo(userInfo, (userInfo) => {
        getApp().globalData.userInfo = userInfo
        console.log('用户信息添加成功了')
        wx.redirectTo({
          url: '/pages/warehouse/mine/index',
          success: res => {
            wx.hideLoading({
              success: (res) => {
                wx.showToast({
                  title: '登录成功',
                })
              },
            })
          }
        })
      })


    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '正在加载',
      mask: true
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
  onShow: async function () {
    if (getApp().globalData.wxCloud) {
      console.log('getApp().globalData.wxCloud', getApp().globalData.wxCloud)
      wxCloud = getApp().globalData.wxCloud
    } else {
      wxCloud = new wx.cloud.Cloud({
        resourceAppid: 'wx033dea2d6fc81e68',
        resourceEnv: 'llhui-11qo1'
      })

      await wxCloud.init()

    }
    console.log('wxCloud', wxCloud)
    this.initPageUserInfo(cb => {
      this.getType('speech')
      this.setData({
        isAdmin: true,
        isLoading: false
      })
      wx.hideLoading()
      wxCloud.callFunction({
        name: 'database_manage',
        data: {
          method: 'get',
          collectionName: 'system_video',
          where: {
            appid:this.data.userInfo.appid
          },
          limit: 2
        }
      }).then(res => {
        this.setData({
          systemVideo: res.result.data
        })
      })
    })
  },
  onPageScroll(e) {
    if (!this.data.canScroll) {
      return
    }
    this.setData({
      hideSubmitBtn: true,
      canScroll: false
    })
    let scrollTop = e.scrollTop
    let timer = setTimeout(() => {
      if (scrollTop === e.scrollTop) {
        this.setData({
          hideSubmitBtn: false,
          canScroll: true
        })
        clearTimeout(timer)
      }
    }, 1000)
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    videocontent1.stop()

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    videocontent1.stop()
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
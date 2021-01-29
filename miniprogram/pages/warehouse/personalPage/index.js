// pages/warehouse/personalPage/index.js
const tool = require("../../../lib/tool.js")
let wxCloud = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showMsg: true,
    FansBtnDisable: false,
    subscriptionMsg: '关注',
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
  },
  toChatRoom() {
    if (!getApp().globalData.userInfo) {
      this.setData({
        diaShow: true
      })
      return
    }
    wx.navigateTo({
      url: `/pages/chatRoom/index?receiptUnionid=${this.data.userInfo.unionid}&nickName=${this.data.userInfo.nickName}&appid=${this.data.userInfo.appid}`,
    })
  },

  pannelClick(e) {
    console.log(e.detail)
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
        wx.hideLoading({
          success: (res) => {},
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  initPageUserInfo(where, cb) {
    this.setData({
      isLoading: true
    })
    wxCloud.callFunction({
      name: 'userInfo',
      data: {
        method: 'get',
        where
      }
    }).then(res => {
      console.log(res)
      this.setData({
        userInfo: this.computeDataOfUserInfo(res.result.data[0])
      })
      this.getproductionNum(where.unionid, where.appid)
      typeof cb == 'function' && cb()
    }).catch(err => {
      console.log('失败==》', err)
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
  updata(e) {
    wx.showActionSheet({
      itemList: ['原创', '去逛逛'],
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
          let fileList = [...e.detail.images, e.detail.voice]
          wx.showLoading({
            title: '正在删除',
          })
          wxCloud.callFunction({
            name: 'chest',
            data: {
              fun: 'remove',
              _id: e.detail
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
  setFans() {
    if (this.data.FansBtnDisable) {
      wx.showToast({
        title: '点击过于频繁，请稍后再试',
        icon: 'none'
      })
      return
    }
    switch (this.data.subscriptionMsg) {
      case '关注': {
        this.setData({
          FansBtnDisable: true,
          subscriptionMsg: '取消关注'
        })

        wxCloud.callFunction({
          name: 'Fans_manage',
          data: {
            method: 'add',
            bloggerUnionid: this.data.userInfo.unionid,
            fansUnionid: this.data.myUnionid,
            appid: this.data.userInfo.appid
          }
        }).then(res => {
          console.log('添加粉丝库', res)
          let FansCount = res.result.FansCount
          let userInfo = this.data.userInfo
          if (FansCount < 10000) {
            userInfo.FansNum = FansCount
          } else if (FansCount >= 10000) {
            userInfo.FansNum = `${(FansCount / 10000).toFixed(2)}万`
          }
          this.setData({
            userInfo,
            FansBtnDisable: false
          })
        })

        return
      }
      case '取消关注': {
        this.setData({
          FansBtnDisable: true,
          subscriptionMsg: '关注'
        })

        wxCloud.callFunction({
          name: 'Fans_manage',
          data: {
            method: 'remove',
            type: 'unsubscribe',
            bloggerUnionid: this.data.userInfo.unionid,
            fansUnionid: this.data.myUnionid,
            appid: this.data.userInfo.appid
          }
        }).then(res => {
          console.log('删除订阅关系', res)
          let FansCount = res.result.FansCount
          let userInfo = this.data.userInfo
          if (FansCount < 10000) {
            userInfo.FansNum = FansCount
          } else if (FansCount >= 10000) {
            userInfo.FansNum = `${(FansCount / 10000).toFixed(2)}万`
          }
          this.setData({
            userInfo,
            FansBtnDisable: false
          })
        })

      }
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wxCloud = getApp().globalData.wxCloud
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    this.initPageUserInfo({
      unionid: options.unionid,
      appid: options.appid
    }, () => {
      console.log('初始化')
      wxCloud.callFunction({
        name: 'database_manage',
        data: {
          method: 'get',
          collectionName: 'system_video',
          limit: 2
        }
      }).then(res => {
        this.setData({
          systemVideo: res.result.data
        })
      })
      wx.cloud.callFunction({
        name: 'login'
      }).then(res => {
        console.log('获取访问者unionid', res.result.unionid)

        this.setData({
          showMsg: !(this.data.userInfo.unionid == res.result.unionid),
          myUnionid: res.result.unionid,
          isLoading: false
        })

        if (this.data.myUnionid == this.data.userInfo.unionid) {
          this.setData({
            isAdmin: true
          })
        }
        wxCloud.callFunction({
          name: 'database_manage',
          data: {
            method: 'get',
            collectionName: 'Fans_Manage',
            where: {
              bloggerUnionid: this.data.userInfo.unionid,
              fansUnionid: res.result.unionid,
              appid: res.result.appid
            }
          }
        }).then(res => {
          this.setData({
            subscriptionMsg: res.result.data.length ? '取消关注' : '关注',
          })
        })
      })
      this.getType('speech')
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
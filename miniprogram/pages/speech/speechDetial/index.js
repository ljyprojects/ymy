// pages/speech/speechDetial/index.js
let tool = require("../../../lib/tool")
const musicMan = wx.getBackgroundAudioManager()
let wxCloud = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTrafficPannel: true,
    showCommentPannel: true,
    showBottomBar: true,
    isProgressBar: true,
    showFansBtn: true
  },
  toRead() {
    musicMan.stop()
    this.setData({
      isPlay: false
    })
    wx.navigateTo({
      url: `/pages/market/ReaddingPage/index?id=${this.data.wallData.pageID}`,
    })
  },
  addViewsOfMember() {
    console.log('添加访问人')
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      if (res.result.unionid == this.data.wallData.unionid) {
        console.log('本人访问')
        return
      }
      wxCloud.callFunction({
        name: 'views_manage',
        data: {
          method: 'add',
          wallData: {
            bloggerUnionid: this.data.wallData.unionid,
            viewUnionid: res.result.unionid,
            appid: this.data.wallData.appid,
            time: Date.now()
          }
        }
      }).then(res => {
        console.log('添加访问人结果==>', res)
      }).catch(err => {
        console.log('添加访问人失败', err)
      })
    })

  },
  addViews() {
    wxCloud.callFunction({
      name: 'userInfo',
      data: {
        method: 'update',
        type: 'addViews',
        unionid: this.data.wallData.unionid,
        appid: this.data.wallData.appid
      }
    }).then(res => {
      console.log('增加总浏览量', res)
    })
  },
  addTraffic(id) {
    wxCloud.callFunction({
      name: 'database_manage',
      data: {
        method: 'traffic',
        collectionName: this.data.collectionName,
        where: {
          _id: id
        },
      }
    }).then(res => {
      console.log('增加内容浏览量成功==>', res)
    })
  },
  sliderChange(e) { // 修改播放时长
    musicMan.seek(e.detail.value)
    this.setData({
      progressBar: e.detail.value
    })
  },
  catchComment(e) {
    console.log(e.currentTarget.dataset)
    this.setData({
      placeholderPL: "回复: " + e.currentTarget.dataset.name,
      toOpenid: e.currentTarget.dataset.openid,
      index: e.currentTarget.dataset.index,
      commentValue: "",
      showMore: true,
    })
  },
  setFans() {
    if (!this.data.userInfo) {
      this.setData({
        dialogShow: true
      })
      return
    }
    wx.showLoading({
      title: '正在处理',
      mask: true
    })
    wxCloud.callFunction({
      name: 'Fans_manage',
      data: {
        method: 'add',
        bloggerUnionid: this.data.wallData.unionid,
        fansUnionid: this.data.userInfo.unionid,
        appid: this.data.wallData.appid
      }
    }).then(res => {
      console.log('添加粉丝库', res)
      this.setData({
        showFansBtn: false
      })
      wx.hideLoading()
    })
  },
  createPoster() {
    if (!this.data.userInfo) {
      this.setData({
        dialogShow: true
      })
      return
    }
    wx.navigateTo({
      url: `/pages/speech/createPoster/index?id=${this.data.wallData._id}&title=${this.data.wallData.content}&currentOptions=${JSON.stringify(this.data.currentOptions)}`,
    })
  },
  toAuth() {
    wx.navigateTo({
      url: `/pages/warehouse/personalPage/index?unionid=${this.data.wallData.unionid}&appid=${this.data.wallData.appid}`,
    })
  },
  audioPlay() { //播放按钮点击事件
    this.setData({
      isPlay: !this.data.isPlay
    })
    if (this.data.isPlay) {
      console.log("播放")
      this.playMusic()
      this.getMusicData()
    } else {
      console.log("暂停")
      musicMan.pause()
    }
  },
  getMusicData() { // 计算正在播放的秒数
    musicMan.onTimeUpdate((a) => {
      if (this.data.isProgressBar) {
        this.setData({
          progressBar: musicMan.currentTime
        })
      }
    })
    musicMan.onEnded(() => {
      console.log("播放完啦")
      this.setData({
        isPlay: !this.data.isPlay,
      })
    })
  },
  playMusic() {
    musicMan.src = this.data.wallData.voiceHttp
    musicMan.title = this.data.wallData.content
    musicMan.singer = this.data.wallData.userInfo.nickName.name
    musicMan.play()
    this.setData({
      isPlay: true
    })
    this.getMusicData()
  },
  dianzan() { // 点赞

    if (!this.data.userInfo) {
      this.setData({
        dialogShow: true
      })
      return
    }
    let person = {
      name: this.data.userInfo.nickName,
      openid: this.data.userInfo.openid,
      time: new Date().getTime(),
      isLook: false,
      avatarurl: this.data.userInfo.avatarUrl,
      openGid: this.data.openGid,
    }
    let isZan = this.data.wallData.zans
    if (isZan.length > 0) {
      for (let i = 0; i < isZan.length; i++) {
        if (this.data.userInfo.openid == isZan[i].openid) { // 赞过
          isZan.splice(i, 1)
          console.log('赞过')
          this.upDataDianzan(isZan, 'cencleZan')
          break
        } else if (i == isZan.length - 1) {
          isZan.push(person)
          console.log('没赞过1')

          this.upDataDianzan(person, 'zan')
          break
        }
      }
    } else {
      console.log('没赞过')
      isZan.push(person)
      this.upDataDianzan(person, 'zan')
      wxCloud.callFunction({
        name: 'sendMsg',
        data: {
          openid: this.data.wallData.openid,
          templateId: 'vaD7Rx_OTzyJht_JlNEBobeYAmTqnjVNE5Ve8B9BF20',
          pagepath: '/pages/warehouse/mine/index',
          first: `有用户给您发布的内容点赞`,
          value1: `${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`,
          value2: '邻邻荟',
        }
      }).then(res => {
        console.log('成功=》', res)
      }).catch(err => {
        console.log('失败', err)
      })
    }
  },
  upDataDianzan(data, name) { // 点赞云函数
    let collectionName = this.data.collectionName
    wxCloud.callFunction({
      name: "zan_pinglun",
      data: {
        fun: name,
        collectionName,
        id: this.data.wallData._id,
        data: data
      },
      success: res => {
        console.log(res)
        this.initData(this.data.wallData._id)

      },
      fail: err => {
        console.log(err)
      }
    })
  },
  initData(id, bool) {
    switch (this.data.collectionName) {
      case 'drafts': {
        wxCloud.callFunction({
          name: 'drafts_manage',
          data: {
            method: 'get',
            type: 'getDetail',
            id
          }
        }).then(res => {
          console.log('获取草稿箱', res)
          let data = res.result.list[0]
          data.time = tool.parseTime(data.time)
          this.setData({
            wallData: data,
            isAdmin: true,
            showFansBtn: false,
            showBottomBar: false,
            showCommentPannel: false,
            showTrafficPannel: false
          })

          if (bool) {
            this.playMusic()
            wx.hideLoading()
          }
        })
        return
      }
      case 'chest': {
        console.log('自媒体')

        wxCloud.callFunction({
          name: 'chest',
          data: {
            fun: "getOne",
            id
          }
        }).then(res => {
          console.log('获取信息--->', res)
          let data = res.result.list[0]
          data.time = tool.parseTime(data.time)
          data.zanText = data.zans.map(a => {
            return a.name
          }).join(", ")
          for (let i in data.comments) data.comments[i].timeData = tool.parseTime(data.comments[i].time)
          this.setData({
            placeholderPL: "留言",
            wallData: data,
            commentValue: "",
            toOpenid: ""
          })
          wx.cloud.callFunction({
            name: 'login'
          }).then(res => {
            if (res.result.unionid == this.data.wallData.unionid) {
              this.setData({
                showFansBtn: false,
                isAdmin: true
              })
              if (bool) {
                this.playMusic()
                wx.hideLoading()
                this.addViewsOfMember()
                this.addViews()
              }
              wx.hideLoading({
                success: (res) => {},
              })
            } else {
              wxCloud.callFunction({
                name: 'database_manage',
                data: {
                  method: 'get',
                  collectionName: 'Fans_Manage',
                  where: {
                    bloggerUnionid: this.data.wallData.unionid,
                    fansUnionid: res.result.unionid,
                    appid: res.result.appid
                  }
                }
              }).then(res => {
                console.log('查询是否关注过', res)
                if (res.result.data.length) {
                  this.setData({
                    showFansBtn: false
                  })
                }
                if (bool) {
                  this.playMusic()
                  wx.hideLoading()
                  this.addViewsOfMember()
                  this.addViews()
                }
                wx.hideLoading({
                  success: (res) => {},
                })
              })
            }

          })


        }).catch(err => {
          console.log('失败', err)
        })
        return
      }
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
      console.log(userInfo)

      wxCloud.callFunction({
        name: 'userInfo',
        data: {
          method: 'add',
          unionid: userInfo.unionid,
          appid: res.result.appid,
          userInfo: userInfo
        }
      }).then(res => {
        console.log(res)
        this.setData({
          userInfo: res.result.userInfo,
        })
        getApp().globalData.userInfo = res.result.userInfo
        console.log('用户信息添加成功了')
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
  showComment(e) { // 显隐输入框
    if (e.currentTarget.dataset.name == 'hidden') {
      this.setData({
        placeholderPL: "说点什么吧！",
        commentValue: "",
        showMore: true,
        toOpenid: ""
      })
    } else {
      this.setData({
        placeholderPL: "说点什么吧！",
        commentValue: "",
        showMore: false,
        toOpenid: ""
      })
    }
  },
  getcomment(e) {
    this.setData({
      commentValue: e.detail.value
    })
  },
  submitComment(e) {
    let _this = this
    if (e.currentTarget.dataset.name == "hidden") {
      this.setData({
        commentValue: "",
        toOpenid: ""
      })
      return
    }
    if (e.currentTarget.dataset.name == "upData") {
      if (!this.data.userInfo) {
        this.setData({
          dialogShow: true
        })
        return
      }
      var _id = this.data.wallData._id
      console.log(_id)
      this.setData({
        id: _id
      })
      let toName = ""
      if (this.data.placeholderPL.includes("回复")) {
        toName = this.data.placeholderPL.replace("回复:", "")
        console.log(toName)
      }
      if (this.data.commentValue.trim() == "") {
        wx.showToast({
          title: '评论内容不能为空',
          icon: "none"
        })
        return
      }
      this.setData({
        showMore: false
      })
      wx.showLoading({
        title: '正在提交',
        mask: true
      })
      wxCloud.callFunction({
        name: "msgCheck",
        data: {
          type: 'text',
          content: this.data.commentValue
        },
        success: res => {
          console.log(res.result.errCode)
          if (res.result.errCode == 0) {
            let collectionName = this.data.collectionName

            wxCloud.callFunction({
              name: 'zan_pinglun',
              data: {
                fun: 'comments',
                collectionName,
                id: this.data.wallData._id,
                data: {
                  username: this.data.userInfo.nickName,
                  avatarUrl: this.data.userInfo.avatarUrl,
                  openid: this.data.userInfo.openid,
                  openGid: this.data.openGid,
                  comment: this.data.commentValue,
                  toName: toName,
                  toOpenid: this.data.toOpenid,
                  isLook: false,
                  time: new Date().getTime(),
                  type: 'speech',
                }
              }
            }).then(res => {
              console.log(res)
              this.setData({
                commentValue: "",
                placeholderPL: "回复",
                toOpenid: ""
              })
              this.initData(this.data.wallData._id)
              console.log('即将发送信息')
              wx.hideLoading()
              wxCloud.callFunction({
                name: 'sendMsg',
                data: {
                  openid: _this.data.wallData.openid,
                  templateId: 'vaD7Rx_OTzyJht_JlNEBobeYAmTqnjVNE5Ve8B9BF20',
                  pagepath: '/pages/warehouse/mine/index',
                  first: `有用户给您发布的内容评论`,
                  value1: `${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`,
                  value2: '邻邻荟',
                }
              }).then(res => {
                console.log('成功=》', res)
              })
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '评论内容不合法',
            })
            this.setData({
              commentValue: ''
            })
            wx.hideLoading({
              success: (res) => {},
            })
          }
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '评论内容不合法',
          })
          this.setData({
            commentValue: '',
          })
        }
      })
    }
  },
  adminDelete() {
    wx.showModal({
      content: '确定删除该内容？',
      success: res => {
        if (res.confirm) {
          let fileList = [...this.data.wallData.images, this.data.wallData.voice]
          wx.showLoading({
            title: '正在删除',
            mask: true
          })
          wxCloud.callFunction({
            name: 'database_manage',
            data: {
              method: 'remove',
              collectionName: this.data.collectionName,
              where: {
                _id: this.data.wallData._id
              }
            }
          }).then(res => {
            console.log('删除成功', res)
            wxCloud.deleteFile({
              fileList,
              success: res => {
                console.log('删除文件成功', res)
              }
            })
            let url = ''
            switch (this.data.collectionName) {
              case 'chest': {
                url = '/pages/warehouse/mine/index'
                break
              }
              case 'drafts': {
                url = `/pages/drafts/index?openid=${this.data.wallData.openid}`
                break
              }
            }
            wx.reLaunch({
              url,
            })

          })
        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    if (getApp().globalData.wxCloud) {
      wxCloud = getApp().globalData.wxCloud
    } else {
      wxCloud = new wx.cloud.Cloud({
        resourceAppid: 'wx033dea2d6fc81e68',
        resourceEnv: 'llhui-11qo1'
      })
      await wxCloud.init()
    }
    wx.showLoading({
      title: '正在加载',
      // mask: true
    })
    this.setData({
      currentOptions: options
    })
    if (options.collectionName) {
      this.setData({
        collectionName: options.collectionName
      })
      this.addTraffic(options.id)
    }
    if (getApp().globalData.userInfo) {
      this.setData({
        userInfo: getApp().globalData.userInfo
      })
    }
    this.initData(options.id, true)
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
    console.log('onshow')
    if (!this.data.isPlay&&this.data.wallData) {
      this.setData({
        isPlay: true
      })
      musicMan.src=this.data.wallData.voiceHttp
      musicMan.title=this.data.wallData.content
      musicMan.play()
      this.getMusicData()
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // musicMan.stop()
    // this.setData({
    //   isPlay: false
    // })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    musicMan.stop()
    this.setData({
      isPlay: false
    })
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
    let path = `/pages/speech/speechDetial/index?collectionName=${this.data.collectionName}&id=${this.data.wallData._id}`
    return {
      path,
      title: this.data.wallData.content
    }
  }
})
// pages/market/index.js
const tool = require("../../../lib/tool")
let wxCloud = null
Page({
  /**
   * 页面的初始数据
   */
  data: {
    canScroll: true,
    hideSubmitBtn: false,
    half: false,
    item: null,
    totalAdmin: false,
    Admin: false,
    ScrollTab: [], //分类列表
    current_scroll: 'tab0', //分类选项卡
    dialogShow: false,
    total: 0,
    wallData: [],
    groupList: [],
    selectIndex: 3,
    index: null,
    footMenu: [{
      icon: 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/navigationIcon/toutiao1.png',
      iconSelect: 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/navigationIcon/toutiao.png',
      name: '头条'
    }, {
      icon: 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/navigationIcon/uploadFile.png',
      iconSelect: 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/navigationIcon/uploadFile1.png',
      name: '网盘'
    }, {
      icon: 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/navigationIcon/video2.png',
      iconSelect: 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/navigationIcon/video1.png',
      name: '视频'
    }, {
      icon: 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/navigationIcon/speech.png',
      iconSelect: 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/navigationIcon/speech1.png',
      name: '小讲'
    }, {
      icon: 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/navigationIcon/essay.png',
      iconSelect: 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/navigationIcon/essay_select.png',
      name: '文章'
    }],
    CustomMenu: [{
      name: '我的自媒体',
      checked: false
    }]
  },
  setCustomMenu(e) {
    console.log(e.currentTarget.dataset.index)
    let CustomMenu = this.data.CustomMenu
    CustomMenu[e.currentTarget.dataset.index].checked = !CustomMenu[e.currentTarget.dataset.index].checked
    this.setData({
      CustomMenu
    })
  },
  readdingPage(e) {
    wx.navigateTo({
      url: `/pages/market/ReaddingPage/index?id=${this.data.wallData[e.currentTarget.dataset.index]._id}`,
    })
  },
  checkbox: function (e) {
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    let data = this.data.groupList;
    let newList = 'groupList[' + index + '].checked'
    if (data[index].checked == false) {
      this.setData({
        [newList]: true
      })
    } else if (data[index].checked == true) {
      this.setData({
        [newList]: false
      })
    }
  },
  send: function () { // 是否要发送
    let _this = this
    let groupList = _this.data.groupList
    let Gid = []
    for (let i = 0; i < groupList.length; i++) {
      if (groupList[i].checked) {
        Gid.push(groupList[i].openGid)
      }
    }
    let chooseStatus = false
    let chooseData = {}
    this.data.CustomMenu.forEach(elem => {
      if (elem.checked) {
        chooseStatus = true
        switch (elem.name) {
          case '我的自媒体': {
            chooseData.openid = this.data.userInfo.openid
            break
          }
          case '我的公众号': {
            chooseData.forumID = `forumID_${this.data.userInfo.openid}`
          }
        }
      }
    });
    if (!chooseStatus && !Gid.length) {
      console.log('选择为空')
      return
    }
    console.log(chooseStatus)
    wx.showModal({
      title: '提示',
      content: '是否要同步当前内容？',
      confirmColor: '#07c160',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.showLoading({
            title: '正在同步',
          })
          console.log(_this.data.wallData[_this.data.index])
          let data = _this.data.wallData[_this.data.index];
          console.log(chooseData)
          let p1 = new Promise((resolve, reject) => {
            if (chooseData.openid) {
              console.log(chooseData.openid)
              data.userInfo = _this.data.userInfo
              data.openid = chooseData.openid
              data.comments = []
              data.traffic = []
              data.zans = []
              data.time = Date.now()
              delete data._id
              wxCloud.callFunction({
                name: 'database_manage',
                data: {
                  method: 'add',
                  collectionName: 'chest',
                  wallData: data
                }
              }).then(res => {
                console.log('成功==>', res)
                resolve(res)
              }).catch(err => {
                reject(err)
              })
            } else {
              resolve({
                status: 'ok'
              })
            }
          })
          let p2 = new Promise((resolve, reject) => {
            if (chooseData.forumID) {
              console.log(chooseData.forumID)
              data.forumID = chooseData.forumID
              data.comments = []
              data.traffic = []
              data.zans = []
              data.openid = _this.data.userInfo.openid
              data.userInfo = _this.data.userInfo
              data.time = Date.now()
              wxCloud.callFunction({
                name: 'database_manage',
                data: {
                  method: 'add',
                  collectionName: 'forumData',
                  wallData: data
                }
              }).then(res => {
                console.log('成功==>', res)
                resolve(res)
              }).catch(err => {
                reject(err)
              })
            } else {
              resolve({
                status: 'ok'
              })
            }
          })
          let p3 = new Promise((resolve, reject) => {
            if (Gid.length) {
              wxCloud.callFunction({
                name: 'circle',
                data: {
                  fun: 'addData',
                  marketID: data._id,
                  images: data.images ? data.images : [],
                  article: data.article ? data.article : {},
                  file: data.file ? data.file : '',
                  fileName: data.fileName ? data.fileName : '',
                  openGid: Gid,
                  type: data.type,
                  openid: _this.data.userInfo.openid,
                  content: data.content ? data.content : '',
                  tab: data.tab ? data.tab : '',
                  voice: data.voice ? data.voice : '',
                  voiceLong: data.voiceLong ? data.voiceLong : '',
                  fileType: data.fileType ? data.fileType : '',
                  video: data.video ? data.video : null,
                  chest: 'chest',
                },
                success: res => {
                  console.log(res)
                  resolve(res)
                },
                fail: err => {
                  console.log(err)
                  reject(err)
                }
              })
            } else {
              resolve({
                status: 'ok'
              })
            }
          })

          Promise.all([p1, p2, p3]).then(res => {
            for (let i = 0; i < groupList.length; i++) {
              groupList[i].checked = false
            }
            _this.setData({
              groupList: groupList
            })
            wx.hideLoading({
              success: (res) => {},
            })
            wx.showToast({
              title: '同步成功',
            })
          })
        } else if (res.cancel) {
          console.log('用户点击取消')

        }
      }
    })
    this.half()
  },
  synchronous: function (e) { // 同步
    console.log(e.currentTarget.dataset)
    this.setData({
      item: e.currentTarget.dataset.item,
      index: e.currentTarget.dataset.index,
    })
    this.half()
  },
  half: function () {
    if (this.data.half) {
      this.setData({
        half: false
      })
    } else if (this.data.half == false) {
      this.setData({
        half: true
      })
    }
  },

  download: function (e) {
    if (e.currentTarget.dataset.name == "jpg" || e.currentTarget.dataset.name == "png" || e.currentTarget.dataset.name == "mp4") {
      wx.showLoading({
        title: '正在打开文件',
      })
      wx.previewMedia({
        sources: [{
          url: e.currentTarget.dataset.file,
          type: e.currentTarget.dataset.name == "mp4" ? "video" : 'image'
        }],
        success: res => {
          wx.hideLoading({
            success: (res) => {},
          })
          console.log(res)
        },
        fail: err => {
          wx.hideLoading({
            success: (res) => {
              console.log('预览失败', err)
            },
          })
        }
      })
    } else {
      wx.showLoading({
        title: '正在打开文件',
      })
      wxCloud.getTempFileURL({
        fileList: [{
          fileID: e.currentTarget.dataset.file
        }],
        success: res => {
          console.log(res.fileList[0])
          wx.downloadFile({
            url: res.fileList[0].tempFileURL,
            success: res => {
              console.log('文件下载路径--->', res.tempFilePath)
              wx.openDocument({
                filePath: res.tempFilePath,
                success: res => {
                  console.log('文件打开成功---->', res)
                  wx.hideLoading({
                    success: (res) => {},
                  })
                },
                fail: err => {
                  console.log(err)
                  wx.hideLoading({
                    success: (res) => {},
                  })
                  wx.showModal({
                    title: '提示',
                    showCancel: false,
                    content: '暂不支持打开该文件类型，请复制链接到浏览器进行下载',
                  })
                }
              })
            },
            fail: err => {
              console.log(err)
              wx.hideLoading({
                success: (res) => {},
              })
            }
          })
        },
        fail: err => {
          console.log('预览失败', err)
        }
      })
    }
  },

  copyLoad: function (e) { // 复制文件路径
    console.log('当前文件fileid--->', e.currentTarget.dataset.file)
    let file = e.currentTarget.dataset.file
    wxCloud.getTempFileURL({
      fileList: [{
        fileID: file
      }],
      success: res => {
        console.log(res.fileList[0].tempFileURL)
        let tempFileURL = res.fileList[0].tempFileURL;
        wx.setClipboardData({
          data: tempFileURL,
          success(res) {
            console.log(res)
          }
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  lookArticle(e) {
    wx.navigateTo({
      url: '/pages/community/articleDetail?openGid=market&url=' + e.currentTarget.dataset.url,
    })
  },
  essayDetail(e) {
    wx.navigateTo({
      url: '/pages/uploadFile/fileDetail?id=' + e.currentTarget.dataset.id + '&collectionName=market',
    })
  },
  handleChangeScroll({
    detail
  }) {
    console.log(detail)
    this.setData({
      current_scroll: detail.key
    });
    this.getWallData()
  },
  switchTab(e) {
    this.setData({
      ScrollTab: [],
      wallData: []
    })
    console.log(e)
    this.setData({
      selectIndex: e.currentTarget.dataset.index,
      current_scroll: 'tab0'
    })
    this.getScrollTab()
    this.getWallData()
  },
  getScrollTab() {

    let type = ''
    switch (this.data.selectIndex) {
      case 0: {
        type = 'article'
        break
      }
      case 1: {
        type = 'file'
        break
      }
      case 2: {
        type = 'video'
        break
      }
      case 3: {
        type = 'read'
        break
      }
      case 4: {
        type = 'essay'
        break
      }
    }
    console.log('type==>', type)
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      wxCloud.callFunction({
        name: 'classify_manage',
        data: {
          method: 'getList',
          type,
          appid: res.result.appid
        }
      }).then(res => {
        console.log('获取分类', res)
        if (!res.result.data.length) {
          return
        }
        console.log('有')
        let ScrollTab = ['全部']
        ScrollTab.push(...res.result.data[0].content)
        this.setData({
          ScrollTab: ScrollTab
        })
      })
    })
  },
  toEdit() {
    switch (this.data.selectIndex) {
      case 0: {
        console.log('头条')
        wx.navigateTo({
          url: '../community/articleAdd?openGid=market',
        })
        break
      }
      case 1: {
        console.log('文件')
        if (!this.data.userInfo) {
          this.setData({
            dialogShow: true
          })
          return
        }
        wx.navigateTo({
          url: '../uploadFileAdd/uploadFileAdd?openGid=market',
        })
        break
      }
      case 2: {

        console.log('视频')
        wx.navigateTo({
          url: '../community/videoAdd?openGid=market',
        })
        break
      }
      case 3: {
        console.log('朗读')
        wx.navigateTo({
          url: '/pages/speech/createPage/index',
        })
        break
      }
      case 4: {
        console.log('文章')
        wx.navigateTo({
          url: '/pages/community/docAdd?type=market',
        })
        break
      }
    }
  },
  removeData(e) {
    wx.showModal({
      title: '确定删除这条数据吗？',
      content: '删除后无法找回',
      cancelColor: '#00b26a',
      confirmColor: '#ff0011',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '正在删除',
          })
          console.log(e.currentTarget.dataset.index)
          let wallData = this.data.wallData[e.currentTarget.dataset.index]
          wxCloud.callFunction({
            name: 'market_manage',
            data: {
              method: 'remove',
              where: {
                _id: this.data.wallData[e.currentTarget.dataset.index]._id
              }
            }
          }).then(res => {
            console.log('删除数据库成功')
            wx.hideLoading({
              success: (res) => {},
            })
            if (wallData.syncYet.length == 0) {
              let fileid = []
              switch (wallData.type) {
                case 'file': {
                  fileid.push(wallData.file)
                  break
                }
                case 'article': {
                  fileid.push(...wallData.images)
                  break
                }
                case 'speech': {
                  fileid.push(...wallData.images, wallData.voice)
                  break
                }
                case 'video': {
                  fileid.push(wallData.video.filePath)
                  break
                }
              }
              if (fileid.length) {
                wxCloud.deleteFile({
                  fileList: fileid
                }).then(res => {
                  console.log('删除存储==》', res)
                })
              } else {
                console.log('存储为空')
              }
            } else {
              console.log('有人同步')
            }
            this.getWallData()
          })
        }
      }
    })
  },
  getWallData() {
    wx.showLoading({
      title: '正在加载',
    })
    this.setData({
      isLoading: true
    })
    let type = ''
    switch (this.data.selectIndex) {
      case 0: {
        type = 'article'
        break
      }
      case 1: {
        type = 'file'
        break
      }
      case 2: {
        type = 'video'
        break
      }
      case 3: {
        type = 'read'
        break
      }
      case 4: {
        type = 'essay'
        break
      }
    }
    console.log('type==>', type)
    let tab = this.data.ScrollTab[Number(this.data.current_scroll.substring(this.data.current_scroll.length - 1))]
    let where = {}
    where.type = type
    if (this.data.ScrollTab.length && tab !== '全部') {
      where.tab = tab
    }
    console.log('查询条件==》', where)
    where.appid = this.data.userInfo.appid
    wxCloud.callFunction({
      name: 'market_manage',
      data: {
        method: 'get',
        where: where
      }
    }).then(res => {
      console.log('获取数据', res)
      let data = res.result.data
      data.forEach(elem => {
        elem.showTime = tool.parseTime(elem.time)
        if (this.data.userInfo) {
          elem.isSync = elem.syncYet.indexOf(this.data.userInfo.openid) !== -1
        } else if (this.data.myopenid) {
          elem.isSync = elem.syncYet.indexOf(this.data.myopenid) !== -1 ? true : false
        }
      });
      if (type == 'file') {
        data.forEach(element => {
          element.name = element.fileName.split('.')[1]
          if (element.fileType == 'jpg' || element.fileType == 'png' || element.fileType == 'jpeg' || element.fileType == 'gif' || element.fileType == 'bmp') {
            element.icon = 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/fileicon/jpg.png'
          } else if (element.fileType.indexOf('ppt') !== -1) {
            element.icon = 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/fileicon/PPT.png'
          } else if (element.fileType.indexOf('doc') !== -1) {
            element.icon = 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/fileicon/word.png'
          } else if (element.fileType.indexOf('xls') !== -1) {
            element.icon = 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/fileicon/xls.png'
          } else if (element.fileType == 'rar' || element.fileType == 'zip') {
            element.icon = 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/fileicon/zip.png'
          } else if (element.fileType == 'pdf') {
            element.icon = 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/fileicon/pdf.png'
          } else if (element.fileType == 'txt') {
            element.icon = 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/fileicon/txt.png'
          } else {
            element.icon = 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/fileicon/问好.png'
          }
        });
      }
      this.setData({
        wallData: data,
        isLoading: false
      })
      wx.hideLoading()
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
          isAdmin: true
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wxCloud = getApp().globalData.wxCloud
    wx.hideShareMenu()
    this.setData({
      footMenuWidth: this.data.footMenu.length * 20,
      footMenuItemWidth: this.data.footMenu.length <= 5 ? 100 / this.data.footMenu.length : 100 / this.data.footMenu.length
    })

    if (options.selectIndex) {
      this.setData({
        selectIndex: Number(options.selectIndex)
      })
    }
    this.getScrollTab()
    let type = ''
    switch (this.data.selectIndex) {
      case 0: {
        type = 'article'
        break
      }
      case 1: {
        type = 'file'
        break
      }
      case 2: {
        type = 'speech'
        break
      }
      case 3: {
        type = 'video'
        break
      }
    }

    this.setData({
      userInfo: getApp().globalData.userInfo
    })
    wxCloud.callFunction({
      name: 'database_manage',
      data: {
        method: 'get',
        collectionName: 'market_admin',
        where: {
          unionid: this.data.userInfo.unionid,
          appid: this.data.userInfo.appid
        }
      }
    }).then(res => {
      console.log('查询管理员权限==》', res)
      res.result.data.forEach(elem => {
        this.setData({
          totalAdmin: elem.permission == 'totalAdmin',
          Admin: elem.permission == 'Admin'
        })
      });
    })

    wxCloud.callFunction({
      name: 'market_manage',
      data: {
        method: 'count',
        where: {
          type: type
        }
      }
    }).then(res => {
      console.log(res)
      this.setData({
        total: res.result.total
      })
      this.getWallData()
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {


  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    return
    let type = ''
    switch (this.data.selectIndex) {
      case 0: {
        type = 'article'
        break
      }
      case 1: {
        type = 'file'
        break
      }
      case 2: {
        type = 'speech'
        break
      }
      case 3: {
        type = 'post'
        break
      }
    }
    console.log(type)
    wxCloud.callFunction({
      name: 'market_manage',
      data: {
        method: 'get',
        where: {
          type: type
        }
      }
    }).then(res => {
      console.log(res)
      let wallData = this.data.wallData
      wallData.push(...res.result.data)
      this.setData({
        wallData: wallData
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
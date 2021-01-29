// pages/market/ReaddingPage.js
let wxCloud=null
const recorderManager = wx.getRecorderManager()
const backgroundAudioManager = wx.getBackgroundAudioManager()
const AudioContext = wx.createInnerAudioContext()
const {
  changeImageUrl
} = require('../../../lib/tool')
const QQMapWX = require('../../../lib/qqmap-wx-jssdk.min.js');
const qqmapsdk = new QQMapWX({
  key: 'FXVBZ-GFVHO-4WTWC-SKL7R-BA3YQ-CFF2T' // 必填
});

let timer = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlayBgm: false,
    showBgmPannel: false,
    bgmtitle: '选择背景音乐',
    isRecording: false,
    isPlay: false,
    duration: 0,
    durationMsg: '00:00',
    tempVoice: '' //录音临时路径
  },

  playBgm() {
    if (!this.data.bgmUrl) {
      wx.showToast({
        title: '未选择背景音乐',
        icon: 'none'
      })
      return
    }
    AudioContext.stop()
    backgroundAudioManager.src = this.data.bgmUrl
    backgroundAudioManager.title = this.data.bgmtitle
    backgroundAudioManager.play()

    this.setData({
      isPlayBgm: true,
      isPlay: false
    })


  },
  pauseBgm() {
    this.setData({
      isPlayBgm: false,
    })
    backgroundAudioManager.stop()
  },
  chooseBgm(e) {
    AudioContext.stop()
    this.setData({
      isPlay: false,
      bgmUrl: e.currentTarget.dataset.url,
      showBgmPannel: false,
      bgmtitle: e.currentTarget.dataset.title
    })
    if (!e.currentTarget.dataset.url) {
      backgroundAudioManager.stop()
      this.setData({
        isPlayBgm: false,
        subscript: -1
      })
      return
    }
    backgroundAudioManager.src = e.currentTarget.dataset.url
    backgroundAudioManager.title = e.currentTarget.dataset.title

    backgroundAudioManager.play()
    backgroundAudioManager.onWaiting(() => {
      console.log('加载中')
    })
    this.setData({
      isPlayBgm: true,
      subscript: e.currentTarget.dataset.index
    })
  },
  changeBgmPannel() {
    this.setData({
      showBgmPannel: !this.data.showBgmPannel,
    })
  },
  getBGMList() { // 背景音乐
    wxCloud.callFunction({
      name: 'get_BGM',
      data: {
        fun: 'getAllList',
      },
      success: res => {
        console.log('BGM--->', res.result.data)
        this.setData({
          BGM: res.result.data
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  submit() {
    if (this.data.duration < 10) {
      wx.showToast({
        title: '录音时长过短',
        icon: 'none'
      })
      return
    }
    wx.showActionSheet({
      itemList: ['发表', '草稿箱'],
      success: res => {
        console.log('结果==>', res)
        let tapIndex = res.tapIndex
        wx.showLoading({
          title: '正在生成',
        })
        let filePath = this.data.tempVoice
        let cloudPath = 'speech/' + this.data.pageDetail.title + "/" + Date.now() + filePath.match(/\.[^.]+?$/)[0]

        wxCloud.uploadFile({
          filePath,
          cloudPath,
          success: res => {
            console.log('音频', res.fileID)
            let detail = {
              comments: [],
              content: this.data.pageDetail.title,
              pageID: this.data.pageDetail._id,
              images: [],
              openGid: [],
              openid: this.data.userInfo ? this.data.userInfo.openid : '',
              time: Date.now(),
              traffic: [],
              type: 'speech',
              appid: this.data.userInfo.appid,
              unionid: this.data.userInfo.unionid,
              userInfo: this.data.userInfo || '',
              voiceLong: this.data.voiceLong,
              voice: res.fileID,
              voiceHttp: changeImageUrl(res.fileID),
              zans: [],
              localtion: this.data.location,
              locationMsg: this.data.locationMsg
            }
            let collectionName = tapIndex == 0 ? 'chest' : 'drafts'

            wxCloud.callFunction({
              name: 'database_manage',
              data: {
                method: 'add',
                collectionName,
                wallData: detail
              }
            }).then(res => {
              console.log('添加到自媒体成功', res)
              wx.hideLoading()
              let currentOptions = {
                collectionName: "chest",
                id: res.result._id
              }
              let url = tapIndex == 0 ? `/pages/speech/createPoster/index?id=${res.result._id}&title=${this.data.pageDetail.title}&currentOptions=${JSON.stringify(currentOptions)}` : `/pages/drafts/index?unionid=${this.data.userInfo.unionid}&appid=${this.data.userInfo.appid}`
              wx.reLaunch({
                url,
              })
            })

          },
          fail: err => {
            console.log(err)
          }
        })
      }
    })
  },
  stopVoice() {
    AudioContext.stop()
    AudioContext.onStop(() => {
      console.log('手动停止')
      this.setData({
        isPlay: false
      })
    })
  },
  playVoice() {
    if (!this.data.tempVoice) {
      wx.showToast({
        title: '请先录音',
        icon: 'none'
      })
      return
    }
    backgroundAudioManager.stop()
    AudioContext.src = this.data.tempVoice
    AudioContext.title = this.data.pageDetail
    AudioContext.play()
    AudioContext.onPlay(() => {
      this.setData({
        isPlay: true,
        isPlayBgm: false
      })
    })
    AudioContext.onEnded(res => {
      console.log('结束了')
      this.setData({
        isPlay: false
      })
    })
  },
  stopRecord() {
    recorderManager.stop()
    backgroundAudioManager.stop()
    recorderManager.onStop(res => {
      console.log('录音结束==>', res)
      this.setData({
        tempVoice: res.tempFilePath,
        voiceLong: res.duration,
        isPlay: false,
        isPlayBgm: false
      })
    })
    clearInterval(timer)
    this.setData({
      isRecording: false
    })
  },
  startRecord() {
    if (this.data.isPlay) {
      AudioContext.stop()
      this.setData({
        isPlay: false
      })

    }
    console.log('开始录音')
    this.setData({
      durationMsg: '00:00'
    })
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.record']) {
          console.log('用户未打开录音权限')
          wx.showModal({
            content: '请先打开录音权限',
            success: res => {
              if (res.confirm) {
                console.log('用户允许使用录音权限')
                wx.openSetting()
              }
            }
          })
          return
        }
        this.setData({
          isRecording: true,
          duration: 0,
        })
        recorderManager.start({
          duration: 300000,
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 64000,
          format: 'mp3'
        })
        this.setData({
          tempVoice: ''
        })
        recorderManager.onStart(res => {
          console.log('开始录音1')
          timer = setInterval(() => {
            let duration = this.data.duration
            duration++
            console.log(duration)
            let durationMsg = `${Math.floor(duration/60)>=10?Math.floor(duration/60):'0'+Math.floor(duration/60)}:${Math.floor(duration%60)>=10?Math.floor(duration%60):'0'+Math.floor(duration%60)}`
            this.setData({
              duration,
              durationMsg
            })
          }, 1000)
        })
        recorderManager.onError(err => {
          console.log('出错')
        })
      }
    })
  },
  getLocation(location) {
    qqmapsdk.reverseGeocoder({
      location,
      success: res => { //成功后的回调
        console.log(res.result);
        this.setData({
          locationMsg: res.result.ad_info.district
        })
      },
      fail: error => {
        this.setData({
          locationMsg: '定位失败'
        })
      },
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
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
    if (getApp().globalData.userInfo) {
      this.setData({
        userInfo: getApp().globalData.userInfo
      })
    }
    this.getBGMList()
    wx.getSetting({
      success: res => {
        console.log('获取权限', res)
        if (!res.authSetting['scope.record']) {
          console.log('未获取到录音权限')
          wx.authorize({
            scope: 'scope.record',
            success: res => {
              console.log('录音授权成功')
            }
          })
        }
      }
    })
    if (options.type && options.type == 'sign') {
      console.log('daka')
      this.setData({
        circleID: options.id,
        openGid: options.openGid
      })
      return
    }
    wxCloud.callFunction({
      name: 'database_manage',
      data: {
        method: 'get',
        collectionName: 'market',
        where: {
          _id: options.id
        }
      }
    }).then(res => {
      console.log('获取短文', res)
      this.setData({
        pageDetail: res.result.data[0]
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
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        console.log('定位==>', res)
        let {
          latitude,
          longitude
        } = res
        let location = {
          latitude,
          longitude
        }
        this.setData({
          location
        })
        this.getLocation(location)
      },
      fail: err => {
        this.setData({
          locationMsg: '定位失败'
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    backgroundAudioManager.stop()
    AudioContext.stop()
    this.setData({
      tempVoice: '',
      duration: 0,
      durationMsg: '00:00'
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    backgroundAudioManager.stop()
    AudioContext.stop()
    this.setData({
      tempVoice: '',
      duration: 0,
      durationMsg: '00:00'
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

  }
})
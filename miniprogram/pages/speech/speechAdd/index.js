// pages/community/speechAdd.js
const QQMapWX = require('../../../lib/qqmap-wx-jssdk.min.js');
let wxCloud = null
const {
  changeImageUrl
} = require('../../../lib/tool')

const qqmapsdk = new QQMapWX({
  key: 'FXVBZ-GFVHO-4WTWC-SKL7R-BA3YQ-CFF2T' // 必填
});
const recorderManager = wx.getRecorderManager()
const backgroundAudioManager = wx.getBackgroundAudioManager()
const InnerAudioContext = wx.createInnerAudioContext()

const app = getApp();
let timer = null
Page({
  data: {
    isCreatePoster: true,
    showSystemImgPannel: false,
    currentDuration: '00:00',
    recordingDuration: '00:00',
    recordingTime: 0,
    disabled: false,
    showPannel: false,
    speechClassify: [],
    startClick: false,
    tempFilePath: '', //临时录音文件路径
    isplay: false, //播放状态 true--播放中 false--暂停播放
    BGM: null,
    max: 30,
    ifIncrease: true,
    recordImg: false,
    playImg: false,
    okImg: 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/vioceIcon/okg.png',
    isSpeaking: false, //是否正在说话
    rTime: 0, //录音秒数
    playProgress: 0,
    display: false, // 半屏弹窗
    tmpImgs: [],
    tmpVoice: '',
    imgs: [],
    voice: '',
    title: '',
    subscript: null, // 当前选择的BGM下标
    bgmtitle: '可选择背景音乐', // 背景音乐名字
    bgm: null, // bgm的路径
    audition: false
  },
  imgError(e) {
    console.log(e)
  },
  toMarket() {
    if (this.data.recordImg) {
      wx.showToast({
        title: '请先结束当前录音',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/market/square/index',
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
  radioChange() {
    this.setData({
      isCreatePoster: !this.data.isCreatePoster
    })
  },
  randomNum(minNum, maxNum) {
    switch (arguments.length) {
      case 1:
        return parseInt(Math.random() * minNum + 1);
      case 2:
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum);
      default:
        return 0;
    }
  },
  chooseDefaultImg(e) {
    this.setData({
      selectImgIndex: e.currentTarget.dataset.index,
      defaultImg: this.data.systemImgs[e.currentTarget.dataset.index],
      tmpImgs: []
    })
  },
  getSystemImg() {
    let systemImgs = []
    let length = this.randomNum(30)
    for (let i = 0; i < length; i++) {
      systemImgs.push(`https://6c6c-llhui-11qo1-1302848655.tcb.qcloud.la/poster/sky/天空 (${this.randomNum(30)}).jpg`)
    }
    this.setData({
      systemImgs,
    })
  },
  toReadding(e) {
    if (this.data.recordImg) {
      wx.showToast({
        title: '请先结束当前录音',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: `/pages/market/ReaddingPage/index?id=${e.currentTarget.dataset.id}`,
    })
  },
  checkSysImgsPannel() {
    this.setData({
      showSystemImgPannel: !this.data.showSystemImgPannel
    })
  },
  showPannel() {
    this.setData({
      isplay: false
    })
    backgroundAudioManager.stop()
    InnerAudioContext.stop()
    if (this.data.recordImg == true) {
      wx.showToast({
        title: '正在录音中',
        icon: "none"
      })
      return
    }
    if (this.data.tmpVoice == '') {
      wx.showToast({
        title: '请先录音',
        icon: 'none',
      })
      return
    }
    if (this.data.recordingTime < 10) {
      wx.showToast({
        title: '录音时长过短',
        icon: 'none'
      })
      return
    }
    this.setData({
      showPannel: true
    })
  },
  getRecommendList() {
    wxCloud.callFunction({
      name: 'recom_manage',
      data: {
        type: 'read',
        appid: this.data.userInfo.appid
      }
    }).then(res => {
      console.log('获取推荐列表==>', res)
      this.setData({
        recomList: res.result.list
      })
      wx.hideLoading()
    })
  },
  onLoad: function (options) {
    wxCloud = getApp().globalData.wxCloud
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        title: `来自${app.globalData.userInfo.nickName}的语音分享`
      })
    }
    wx.hideShareMenu({
      success: (res) => {},
    })
    this.getSystemImg()
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    wx.hideShareMenu()
    if (options.collectionName) {
      this.setData({
        collectionName: options.collectionName
      })
    }
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
    wx.getSetting({
      complete: (res) => {
        console.log(res)
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success: res => {
              console.log(res)
            }
          })
        } else {
          console.log('已经获取麦克风权限')
        }
      },
    })
    this.getBGMList();
    this.getRecommendList()
    // 查看是否授权
    var that = this
    if (options.isAddQun) {
      this.setData({
        isAddQun: options.isAddQun
      })
    }
    if (options.openGid) {
      that.setData({
        openGid: options.openGid
      })
    }

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
  display() { // 弹窗
    this.setData({
      display: !this.data.display
    })
  },
  chose: function (e) { // 选bgm
    console.log(e.currentTarget.dataset.bgm, e.currentTarget.dataset.index)
    if (!e.currentTarget.dataset.bgm) {
      backgroundAudioManager.stop()
      this.setData({
        audition: false,
        display: false,
        subscript: -1
      })
      return
    }
    this.setData({
      bgm: e.currentTarget.dataset.bgm,
      subscript: e.currentTarget.dataset.index,
      bgmtitle: e.currentTarget.dataset.title,
      display: false,
      audition: true,
      isplay: false
    })
    InnerAudioContext.stop()
    backgroundAudioManager.src = e.currentTarget.dataset.bgm
    backgroundAudioManager.title = e.currentTarget.dataset.title
    backgroundAudioManager.play()
    backgroundAudioManager.onEnded(() => {
      this.setData({
        audition: false
      })
    })
  },
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
  onUnload() { // 页面卸载后
    wx.setKeepScreenOn({
      keepScreenOn: false
    })
    backgroundAudioManager.stop()
    recorderManager.stop()
  },
  startRecord() {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.record']) {
          wx.showModal({
            title: '需要获取麦克风权限',
            confirmColor: '#00b26a',
            success: res => {
              console.log(res)
              if (res.confirm) {
                wx.openSetting({
                  complete: (res) => {},
                })
              }
            }
          })
        } else {
          this.setData({
            recordingDuration: '00:00'
          })
          console.log("开始录音1")
          this.setData({
            k: 0,
            startClick: true,
            recordImg: true,
            isSpeaking: true,
            isplay: false,
            recordingTime: 0,
            tmpVoice: '',
          })
          const options = {
            duration: 300000,
            sampleRate: 16000,
            numberOfChannels: 1,
            encodeBitRate: 64000,
            format: 'mp3'
          }
          InnerAudioContext.stop()
          recorderManager.start(options)
          timer = setInterval(() => {
            let recordingTime = this.data.recordingTime
            recordingTime++
            let recordingDuration = `${Math.floor(recordingTime/60)>=10?Math.floor(recordingTime/60):'0'+Math.floor(recordingTime/60)}:${recordingTime%60>=10?recordingTime%60:'0'+recordingTime%60}`
            this.setData({
              recordingTime,
              recordingDuration
            })
          }, 1000)
        }
      }
    })
  },
  stopRecord() {
    console.log('停止录音')
    recorderManager.stop()
    backgroundAudioManager.stop()
    clearInterval(timer)
    recorderManager.onStop((res) => {
      console.log('结束录音', res)
      this.setData({
        tmpVoice: res.tempFilePath,
        audition: false,
        k: 0,
        j: 1,
        rTime: res.duration,
        startClick: false,
        isSpeaking: false,
        recordImg: false,
        playImg: true,
        okImg: 'cloud://llhui-11qo1.6c6c-llhui-11qo1-1302848655/vioceIcon/ok.png',
      })
    })
  },

  playBgm() {
    if (!this.data.audition) {
      if (!this.data.bgm) {
        wx.showToast({
          title: '未选择背景音乐',
          icon: 'none'
        })
        return
      }
      backgroundAudioManager.src = this.data.bgm
      backgroundAudioManager.title = this.data.bgmtitle
      backgroundAudioManager.play()
      this.setData({
        audition: true
      })
      InnerAudioContext.onError(err => {
        console.log('播放失败')
      })
    } else {
      backgroundAudioManager.pause()
      this.setData({
        audition: false
      })
    }
  },
  playVoice() { // 试听
    let _this = this
    _this.setData({
      currentDuration: '00:00',
      audition: false
    })
    backgroundAudioManager.stop()
    InnerAudioContext.src = this.data.tmpVoice
    InnerAudioContext.play()
    this.setData({
      isplay: true
    })

    InnerAudioContext.onTimeUpdate(() => {
      let e = parseInt(InnerAudioContext.currentTime),
        n = parseInt(e / 60);
      console.log("秒", (n > 9 ? n : "0" + n) + ":" + (e % 60 > 9 ? e % 60 : "0" + e % 60))
      _this.setData({
        currentDuration: (n > 9 ? n : "0" + n) + ":" + (e % 60 > 9 ? e % 60 : "0" + e % 60)
      })
    })
    InnerAudioContext.onEnded(() => {
      _this.setData({
        isplay: false,
        currentDuration: '00:00'
      })
    })
    return
  },
  pauseVoice() {
    InnerAudioContext.stop()
    this.setData({
      isplay: false
    })
  },
  onChange: function (t) { // 输入标题
    this.setData({
      title: t.detail.value
    })
  },

  chooseImage: function (e) { // 添加图片
    var that = this;
    wx.chooseImage({
      count: this.data.tmpImgs.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        console.log(res.tempFilePaths)
        that.setData({
          tmpImgs: res.tempFilePaths,
          ifIncrease: false,
          defaultImg: '',
          selectImgIndex: -1,
          showSystemImgPannel: false
        });
      }
    })
  },

  updateImgs: function () { // 上传图片
    let that = this
    var tempIds = []
    var num = 0
    for (var i = 0; i < that.data.tmpImgs.length; i++) {
      const filePath = that.data.tmpImgs[i]
      var rn = Math.floor(Math.random() * 10000 + 1) //随机数
      var name = Date.parse(new Date()) / 1000
      const cloudPath = 'speech/img/' + that.data.userInfo.nickName + "/" + rn + name + filePath.match(/\.[^.]+?$/)[0]
      wxCloud.uploadFile({
        cloudPath: cloudPath,
        filePath: filePath,
        success: res => {
          console.log('uploadImg--->', res)
          tempIds.push(res.fileID)
          num = num + 1
          if (num === that.data.tmpImgs.length) {
            that.setData({
              imgs: tempIds
            })
            that.updateVoice()
            console.log("图片文件", tempIds)
          }
        },
        fail: err => {
          console.log('uploadImg--err->', err)
          wx.hideLoading()
        }
      })
    }
  },

  updateVoice: function () { // 上传音频
    let that = this
    const filePath = that.data.tmpVoice
    var rn = Math.floor(Math.random() * 10000 + 1) //随机数
    var name = Date.parse(new Date()) / 1000
    const cloudPath = 'speech/voice/' + that.data.userInfo.nickName + "/" + rn + name + filePath.match(/\.[^.]+?$/)[0]
    wxCloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: res => {
        console.log('上传录音', res.fileID)
        that.setData({
          voice: res.fileID
        })
        that.saveData()
      },
      fail: err => {
        console.log('updateVoice--err-->', err)
        wx.hideLoading()
      }
    })
  },

  saveData: function () { // 上传数据
    let that = this
    let imgs = that.data.imgs
    let imagesHttp = []
    if (imgs && imgs.length) {
      console.log(imgs)

      imgs.forEach((elem, index) => {
        imagesHttp[index] = changeImageUrl(elem)
      });
    }
    if (!imgs.length && that.data.defaultImg) {
      imgs = [that.data.defaultImg]
      imagesHttp = [changeImageUrl(that.data.defaultImg)]
    }
    let voiceHttp = changeImageUrl(that.data.voice)
    if (this.data.submitType == 'draft') {
      console.log('草稿箱')
      wxCloud.callFunction({
        name: 'database_manage',
        data: {
          method: 'add',
          collectionName: 'drafts',
          wallData: {
            openGid: [],
            type: 'speech',
            openid:that.data.userInfo.openid,
            unionid: that.data.userInfo.unionid,
            appid: that.data.userInfo.appid,
            userInfo: that.data.userInfo,
            content: that.data.title,
            images: imgs,
            imagesHttp,
            voiceHttp,
            voice: that.data.voice,
            voiceLong: that.data.rTime,
            openid: that.data.userInfo.openid,
            locationMsg: that.data.locationMsg,
            location: this.data.location,
            time: Date.now(),
            appid: that.data.userInfo.appid
          }
        }
      }).then(res => {
        console.log('保存成功==>', res)
        wx.reLaunch({
          url: `/pages/drafts/index?unionid=${that.data.userInfo.unionid}&appid=${that.data.userInfo.appid}`,
        })
      })
      return
    }
    if (this.data.collectionName == "chest") {

      wxCloud.callFunction({
        name: 'chest',
        data: {
          fun: "addChest",
          openGid: [],
          type: 'speech',
          userInfo: that.data.userInfo,
          unionid: that.data.userInfo.unionid,
          appid: that.data.userInfo.appid,
          content: that.data.title,
          images: imgs,
          imagesHttp,
          voiceHttp,
          voice: that.data.voice,
          voiceLong: that.data.rTime,
          openid: that.data.userInfo.openid,
          locationMsg: that.data.locationMsg,
          location: this.data.location
        },
        success: res => {
          console.log('提交成功--->', res)
          wx.showToast({
            title: '提交成功',
            icon: 'success'
          })
          this.setData({
            disabled: false
          })
          if (that.data.isCreatePoster) {
            let currentOptions = {
              collectionName: "chest",
              id: res.result._id
            }
            wx.reLaunch({
              url: `/pages/speech/createPoster/index?id=${res.result._id}&title=${that.data.title}&currentOptions=${JSON.stringify(currentOptions)}`,
            })
          } else {
            wx.reLaunch({
              url: '/pages/warehouse/mine/index',
            })
          }



        },
        fail: err => {
          console.log(err)
        }
      })
    }

  },

  subOk: async function (e) { // 上传开始
    this.setData({
      isplay: false,
      submitType: e.currentTarget.dataset.type
    })
    backgroundAudioManager.stop()

    if (this.data.recordImg == true) {
      wx.showToast({
        title: '正在录音中',
        icon: "none"
      })
      return
    }
    if (this.data.tmpVoice == '') {
      wx.showToast({
        title: '请先录音',
        icon: 'none',
      })
      return
    }
    if (this.data.disabled) {
      console.log('被阻止了')
      return
    }
    this.setData({
      disabled: true
    })
    if (this.data.tmpImgs.length != 0) {
      wx.showLoading({
        title: '数据上传中',
        mask: true
      })
      this.updateImgs()
      console.log("有图片")
    } else {
      wx.showLoading({
        title: '数据上传中',
        mask: true
      })
      this.updateVoice()
      console.log("无图片，上传录音")
    }
  },

  showIncrease: function () { // 显示添加图片按钮
    this.setData({
      ifIncrease: !this.data.ifIncrease
    })
  },
  onHide: function () {
    
  },
  onUnload: function () {
    backgroundAudioManager.stop();
    InnerAudioContext.stop()
    recorderManager.stop()
    this.setData({
      tmpVoice: '',
      recordingDuration: '00:00',
      tempFilePath: '', //临时录音文件路径
      bgm: null,
      tmpImgs: [],
      audition: false,
      isplay: false
    })
    clearInterval(timer)
  },
  onShareAppMessage: function (e) {

  },
})
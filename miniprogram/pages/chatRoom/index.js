// pages/chatRoom/index.js
let wxCloud=null
const {
  changeImageUrl
} = require('../../lib/tool')
let watcher = null
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  async try (fn, title) {
    try {
      await fn()
    } catch (e) {
      this.showError(title, e)
    }
  },
  async onConfirmSendText(e) {
    this.try(async () => {
      if (!e.detail.value) {
        return
      }
      const doc = {
        readStatus: false,
        receiptUnionid: this.data.receiptUnionid,
        roomMember: this.data.roomMember,
        ID: `${Math.random()}_${Date.now()}`,
        avatar: this.data.userInfo.avatarUrl,
        nickName: this.data.userInfo.nickName,
        msgType: 'text',
        textContent: e.detail.value,
        sendTime: new Date(),
        sendTimeTS: Date.now(),
        appid: this.data.appid,
        unionid: this.data.myUnionid
      }
      this.setData({
        textInputValue: '',
        chatList: [
          ...this.data.chatList,
          {
            ...doc,
            writeStatus: 'pending',
          },
        ],
      })
      this.pageScrollToBottom()
      await wxCloud.database().collection('chatroom').add({
        data: doc,
      })
      this.setData({
        chatList: this.data.chatList.map(chat => {
          if (chat.ID === doc.ID) {
            return {
              ...chat,
              writeStatus: 'written',
            }
          } else return chat
        }),
      })
    }, '发送文字失败')
  },
  showError(title, content, confirmText, confirmCallback) {
    console.error(title, content)
    wx.showModal({
      title,
      content: content.toString(),
      showCancel: confirmText ? true : false,
      confirmText,
      success: res => {
        res.confirm && confirmCallback()
      },
    })
  },
  async onChooseImage(e) {
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: async res => {
        const doc = {
          readStatus: false,
          appid: this.data.appid,
          unionid: this.data.myUnionid,
          receiptUnionid: this.data.receiptUnionid,
          ID: `${Math.random()}_${Date.now()}`,
          roomMember: this.data.roomMember,
          avatar: this.data.userInfo.avatarUrl,
          nickName: this.data.userInfo.nickName,
          msgType: 'image',
          sendTime: new Date(),
          sendTimeTS: Date.now(),
        }
        this.setData({
          chatList: [
            ...this.data.chatList,
            {
              ...doc,
              _openid: this.data.myOpenid,
              tempFilePath: res.tempFilePaths[0],
              writeStatus: 0,
            },
          ]
        })
        const uploadTask = wxCloud.uploadFile({
          cloudPath: `${this.data.openId}/${Math.random()}_${Date.now()}.${res.tempFilePaths[0].match(/\.(\w+)$/)[1]}`,
          filePath: res.tempFilePaths[0],
          success: res => {
            console.log(res)
            this.try(async () => {
              await wxCloud.database().collection('chatroom').add({
                data: {
                  ...doc,
                  imgFileID: res.fileID,
                  imgHttp: changeImageUrl(res.fileID)

                },
              })
            }, '发送图片失败')
          },
          fail: e => {
            this.showError('发送图片失败', e)
          },
        })
        uploadTask.onProgressUpdate(({
          progress
        }) => {
          console.log(progress)
          this.setData({
            chatList: this.data.chatList.map(chat => {
              if (chat.ID === doc.ID) {
                return {
                  ...chat,
                  writeStatus: progress,
                }
              } else return chat
            })
          })
        })
      },
    })
  },
  pageScrollToBottom() {
    wx.createSelectorQuery().select('#chat-room').boundingClientRect((rect) => {
      wx.pageScrollTo({
        scrollTop: rect.height
      })
    }).exec()
  },
  initChatList(roomMember, appid) {
    console.log(roomMember,appid)
    let db = wxCloud.database()
    let _ = db.command
    watcher = db.collection('chatroom').orderBy('sendTimeTS', 'asc').where({
      roomMember: _.all(roomMember),
      appid
    }).watch({
      onChange: (snapshot) => {
        console.log('snapshot', snapshot)
        this.setData({
          chatList: snapshot.docs
        })
        this.pageScrollToBottom()
        wx.hideLoading()
      },
      onError: (err) => {
        wx.hideLoading()
        console.error('the watch closed because of error', err)
      }
    })
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
    console.log(options)
    this.setData({
      userInfo: getApp().globalData.userInfo,
      receiptUnionid: options.receiptUnionid,
      appid: options.appid
    })
    let roomMember = [options.receiptUnionid]
    wx.setNavigationBarTitle({
      title: `正在与${options.nickName}聊天`,
    })
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      roomMember.push(res.result.unionid)
      this.setData({
        myUnionid: res.result.unionid,
        roomMember
      })
      this.initChatList(roomMember, res.result.appid)
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
    watcher.close()
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
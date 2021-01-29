// components/chatRoomItem/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    unionid: String,
    chatItem: Object
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onMessageImageTap(e) {
      wx.previewImage({
        urls: [e.target.dataset.fileid],
      })
    },
  }
})
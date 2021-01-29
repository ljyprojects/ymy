// components/productionPannel/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentData: {
      type: Object
    },
    isAdmin: {
      type: Boolean
    },
    showAsyncBtn: {
      type: Boolean,
      value: false
    },
    currentIndex: {
      type: Number
    }
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
    asyncClick() {
      this.triggerEvent('AsynClick', this.data.currentIndex)
    },
    delete(e) {
      this.triggerEvent('delete', {
        id: e.currentTarget.dataset.id,
        index: this.data.currentIndex,
        images: this.data.currentData.images,
        voice: this.data.currentData.voice
      })
    },

    toDetail(e) {
      this.triggerEvent('PannelClick', {
        type: e.currentTarget.dataset.type,
        id: e.currentTarget.dataset.id
      })
    }
  }
})
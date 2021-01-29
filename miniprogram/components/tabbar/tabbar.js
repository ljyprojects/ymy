Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: {
        "color": "#999999",
        "selectedColor": "#707070",
        "borderStyle": "#dcdcdc",
        "backgroundColor": "#ffffff",
        "list": [{
          "key": "home",
          "iconPath": "../../images/icon/homepage.png",
          "selectedIconPath": "../../images/icon/homepage_fill.png",
          "text": "首页"
        }, {
          "key": "msg",
          "iconPath": "../../images/icon/message.png",
          "selectedIconPath": "../../images/icon/message_fill.png",
          "text": "消息"
        }, {
          "key": "new",
          "iconPath": "https://6c6c-llhui-11qo1-1302848655.tcb.qcloud.la/systemIcon/tabBar/Add.png",
          "iconType": "big overflow circle shadow",
          "choose": "disable"
        }, {
          "key": "addressbook",
          "iconPath": "../../images/icon/addressbook.png",
          "selectedIconPath": "../../images/icon/addressbook_fill.png",
          "text": "粉丝"
        }, {
          "key": "mine",
          "iconPath": "../../images/icon/setup.png",
          "selectedIconPath": "../../images/icon/setup_fill.png",
          "text": "我"
        }]
      },
    },
    showTabBar: {
      type: Boolean,
      value: true
    },
    choose_index: {
      type: Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    index: 0
  },
  lifetimes: {
    attached() {
      this.setData({
        index: this.data.choose_index
      })
    }
  },
  pageLifetimes: {
    show: function () {
      console.log('展示==》', this.data.choose_index)
      this.setData({
        index: this.data.choose_index
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    change: function (e) {
      var index = e.currentTarget.dataset.index * 1
      var item = this.data.data.list[index]
      var choose = item.choose

      if (choose != 'disable') {
        this.setData({
          index: index
        })
      }

      this.triggerEvent('change', {
        key: item.key,
        index: index
      })
    }
  }
})
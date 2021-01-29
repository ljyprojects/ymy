let wxCloud = null
const {
  changeImageUrl
} = require('../../../lib/tool')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showCanvas: true,
    poster: {
      width: 450,
      height: 800
    }

  },
  imageLoad() {
    console.log('showimage')
  },
  toWareHouse() {
    wx.reLaunch({
      url: '/pages/warehouse/mine/index',
    })
  },
  // 将文字绘制到行 长文本自动换行 并返回行数
  /**
   * params
   * @text           需要绘制的文本字符
   * @startX         第一行文本的起始X坐标
   * @startY         第一行文本的起始Y坐标
   * @lineHeight     文本行高
   * @MAX_WIDTH      单行文字最大宽度，超过临界值自动换行
   * return rowLength  返回绘制文本的行数
   **/
  drawText(text, canvas, startX, startY, lineHeight, MAX_WIDTH, font) {
    let allAtr = text.split('');
    let rowArr = []; // 拆分出来的每一行
    let rowStrArr = []; // 每一行的文字数组
    canvas.font = font
    for (let i = 0; i < allAtr.length; i++) {
      const currentStr = allAtr[i];
      rowStrArr.push(currentStr);
      const rowStr = rowStrArr.join('');
      if (canvas.measureText(rowStr).width > MAX_WIDTH) {
        rowStrArr.pop(); // 删除最后一个
        rowArr.push(rowStrArr.join('')); // 完成一行
        rowStrArr = [currentStr];
        continue;
      }
      // 最后一个字母 直接添加到一行
      if (i === allAtr.length - 1) {
        rowArr.push(rowStr); // 完成一行
      }
    }

    for (let i = 0; i < rowArr.length; i++) {
      canvas.fillText(rowArr[i], startX, startY + i * lineHeight);
    }
    return rowArr.length;
  },
  lookPoter() {
    wx.previewImage({
      current: this.data.canvasImage,
      urls: [this.data.canvasImage],
    })
  },
  saveImage() {
    wx.authorize({
      scope: 'scope.writePhotosAlbum',
      success: res => {
        console.log('获取权限', res)
        wx.saveImageToPhotosAlbum({
          filePath: this.data.canvasImage,
          success: res => {
            wx.showToast({
              title: '保存成功',
              icon: 'none'
            })

          },
          fail: err => {
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            })
          }
        })
      },
      fail: err => {
        wx.showModal({
          content: '请允许使用相册权限',
          success: res => {
            if (res.confirm) {
              wx.openSetting({
                withSubscriptions: true,
              })
            }
          }
        })
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu({
      success: (res) => {},
    })
    wxCloud = getApp().globalData.wxCloud
    let currentOptions = JSON.parse(options.currentOptions)
    console.log('传入的页面参数', currentOptions)
    this.setData({
      userInfo: getApp().globalData.userInfo
    })
    let _this = this
    let canvas = wx.createCanvasContext('canvas')
    console.log(canvas)
    wx.showLoading({
      title: '正在生成海报',
      mask: true
    })
    let p = new Promise((resolve) => {
      wxCloud.callFunction({
        name: 'database_manage',
        data: {
          method: 'get',
          collectionName: 'chest',
          where: {
            _id: currentOptions.id
          }
        }
      }).then(res => {
        console.log('结果==》', res.result.data[0].images)
        let src = ''
        if (res.result.data[0].images.length) {
          console.log('进来了', res.result.data[0].imagesHttp)
          src = res.result.data[0].imagesHttp[0]
        } else {
          src = `https://6c6c-llhui-11qo1-1302848655.tcb.qcloud.la/poster/sky/天空 (${new Date().getDate()}).jpg`
        }
        console.log('背景图片==>', src)
        wx.getImageInfo({
          src,
          success: function (resd) {
            console.log(resd)
            _this.setData({
              bgImgInfo: {
                width: resd.width,
                height: resd.height,
              }
            })
            resolve(resd.path)
          }
        })
      }).catch(err => {
        console.log('失败==>', err)
      })

    })

    let p2 = new Promise((res) => {
      wxCloud.callFunction({
        name: "QRcode",
        data: {
          url: `/pages/speech/speechDetial/index`,
          currentOptions
        }
      }).then(r => {
        console.log('二维码', changeImageUrl(r.result.fileID))

        wx.getImageInfo({
          src: changeImageUrl(r.result.fileID),

          success: function (resd) {
            res(resd.path)
          }
        })
      }).catch(e => {
        console.log(e)
      })
    })
    let p1 = new Promise((res) => {
      wx.getImageInfo({
        src: _this.data.userInfo.avatarUrl,
        success: function (resd) {
          res(resd.path)
        }
      })
    })
    let p3 = new Promise(result => {
      wxCloud.callFunction({
        name: 'database_manage',
        data: {
          method: 'get',
          collectionName: 'posterOfMsg'
        }
      }).then(res => {
        if (!res.result.data.length) {
          result({
            status: 'fail',
            msg: '未获取到数据'
          })
        }
        result(res.result.data[0])
      })
    })
    let p4 = new Promise(result => {
      wxCloud.callFunction({
        name: 'userInfo',
        data: {
          method: 'update',
          type: 'addPosterNum',
          id: options.id,
          unionid: this.data.userInfo.unionid,
          appid: this.data.userInfo.appid
        }
      }).then(res => {
        result(res.result)
      }).catch(err => {
        console.log('添加海报数量失败=>', err)
      })
    })
    let p5 = new Promise((res) => {
      wx.getImageInfo({
        src: 'https://6c6c-llhui-11qo1-1302848655.tcb.qcloud.la/systemIcon/音符.png',
        success: function (result) {
          console.log('图片信息', res)

          res(result.path)
        }
      })
    })
    Promise.all([p, p1, p2, p3, p4, p5]).then((el) => {

      canvas.setFillStyle('#b9cbea')
      canvas.fillRect(0, 0, this.data.poster.width * 2, this.data.poster.height * 2)
      canvas.save()
      canvas.setFillStyle('#fff')
      canvas.fillRect(22 * 2, 152 * 2, 409 * 2, 600 * 2)
      canvas.save()
      canvas.draw()
      canvas.setFillStyle('#ece6e6')
      canvas.fillRect(35 * 2, 558 * 2, 384 * 2, 140 * 2)
      canvas.drawImage(el[2], 337 * 2, 620 * 2, 70 * 2, 70 * 2)
      canvas.setFillStyle('#000')
      canvas.save()

      canvas.drawImage(el[0], 35 * 2, 167 * 2, 384 * 2, 345 * 2)
      canvas.drawImage(el[5], 195 * 2, 307 * 2, 70 * 2, 70 * 2)
      canvas.save()

      canvas.setShadow(5, 5, 10, '#000000')
      canvas.setFillStyle('#F27E35')
      canvas.setTextAlign('center')
      canvas.font = 'normal lighter 70px SimHei'
      canvas.fillText('DIFFERENCE', 450, 420 * 2)
      canvas.setFontSize(64)
      canvas.setTextAlign('left')
      canvas.fillText('听 ·', 90 * 2, 460 * 2)
      canvas.setFillStyle('#FFFFFF')
      canvas.fillText('见 你 的 声 音', 155 * 2, 460 * 2)
      canvas.save()

      canvas.beginPath() //开始创建一个路径
      canvas.arc(70 * 2, 600 * 2, 50, 0, 2 * Math.PI, false) //画一个圆形裁剪区域
      canvas.clip() //裁剪
      canvas.drawImage(el[1], 70 * 2 - 50, 600 * 2 - 50, 100, 100) //绘制图片
      canvas.restore() //恢复之前保存的绘图上下文
      canvas.closePath()
      canvas.save()

      canvas.setShadow(0, 0, 0, '#ece6e6')
      canvas.setFillStyle('#000')
      canvas.setFontSize(38)
      canvas.fillText(`好友${this.data.userInfo.nickName}的语音分享#`, 110 * 2, 595 * 2)
      let font = `normal lighter 32px 'SimHei'`
      canvas.setFillStyle('#666')
      this.drawText(options.title, canvas, 110 * 2, 627 * 2, 40, 384, font)
      let date = `${new Date().getDate()>=10?new Date().getDate():'0'+new Date().getDate()}`
      canvas.setFontSize(80)
      canvas.setFillStyle('#fff')
      canvas.font = 'normal normal 160px SimHei'
      canvas.fillText(date, 40 * 2, 122 * 2)
      canvas.setFontSize(130)
      canvas.fillText('|', 130 * 2, 115 * 2)
      let format = `${new Date().getFullYear()}.${new Date().getMonth()+1>=10?new Date().getMonth()+1:'0'+(new Date().getMonth()+1)}`
      canvas.setFontSize(50)
      canvas.fillText(format, 150 * 2, 90 * 2)
      let weak = new Date().getDay()
      let weakMsg = ''
      switch (weak) {
        case 0: {
          weakMsg = 'Sunday'
          break
        }
        case 1: {
          weakMsg = 'Monday'

          break
        }
        case 2: {
          weakMsg = 'Tuesday'

          break
        }
        case 3: {
          weakMsg = 'Wednesday'

          break
        }
        case 4: {
          weakMsg = 'Thursday'

          break
        }
        case 5: {
          weakMsg = 'Friday'

          break
        }
        case 6: {
          weakMsg = 'Saturday'

          break
        }
      }
      canvas.fillText(weakMsg, 150 * 2, 120 * 2)
      canvas.setTextAlign('center')
      canvas.setFontSize(40)
      canvas.fillText('每 / 日 / 健 / 康 / 分 / 享', 450, 800 * 2 - 30)
      canvas.save()

      canvas.setTextAlign('left')
      canvas.setFontSize(32)
      canvas.setFillStyle('#333')
      canvas.fillText(`连续打卡${el[4].createdPoster}天`, 80 * 2, 730 * 2)
      canvas.setTextAlign('right')
      let time = `${new Date().getHours()>=10?new Date().getHours():'0'+new Date().getHours()}:${new Date().getMinutes()>=10?new Date().getMinutes():'0'+new Date().getMinutes()}`
      canvas.fillText(`今日打卡 ${time}`, 450 * 2 - 160, 730 * 2)
      canvas.draw(true, () => {
        wx.hideLoading({
          success: (res) => {},
        })
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: _this.data.poster.width * 2,
          height: _this.data.poster.height * 2,
          destWidth: _this.data.poster.width * 2,
          destHeight: _this.data.poster.height * 2,
          canvasId: "canvas",
          fileType: 'jpg'
        }).then(r => {
          console.log('生成图片', r.tempFilePath)
          _this.setData({
            canvasImage: r.tempFilePath,
            isLoading: false,
            showCanvas: false
          })
          wx.hideLoading({
            success: (res) => {},
          })
        })
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
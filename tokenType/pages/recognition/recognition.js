// pages/recognition/recognition.js
Page({
  data: {
    height: '360',
    width: '20',
    status: false,
    scanStatus: 'none',
    msg: "请点击识别图片",
    src: '',
    listener: null,
    isReuqest: false,
    canvasWidth: '10',
    canvasHeight:'10',
  },

  onLoad: function (options) {
    this.ctx = wx.createCameraContext();

    wx.getSystemInfo({
      success: res => {
        this.setData({ height: res.windowHeight * 0.8, width: res.windowWidth});
      }
    });
  },

  stopScan: function () {
    this.setData({ scanStatus: 'none' });
  },

  onShow: function () {
    this.setData({ msg: '请点击识别图片' });
  },

  error: function (e) {
    this.setData({ msg: '打开摄像头失败，请点击“立即体验' });
  },


  searchPhoto: function(imageBase64) {
    let that = this;
    wx.request({
      url: 'https://cn1-crs.easyar.com:8443/search', 
      data: {
        image: imageBase64
      },
      header: {
        'Authorization': '6f2JkthQHm9rBVhsXxl9DNUPb+6H7eaReuzzza3PdYMC77cRX24kp6Hf6srJMgZwL5Z7KR0AjUKEYlxszht8qA==',
        'content-type': 'application/json' // 默认值
      },
      method: 'POST',
      success(res) {
        that.setData({isReuqest: false});
        if (res.data.statusCode == 0) {
          that.listener.stop();
          that.setData({ msg: '识别成功'});
          setTimeout(() => {
            console.info('go to webar');
            wx.navigateTo({
              url: '../show/show'
            });
          }, 500);
        }
      },

      fail(err) {
        console.log(err)
        that.status = false;
        that.setData({ msg: '识别失败，请点击重试', isReuqest: false});
      }
    })
  },

  transformArrayBufferToBase64: function (frame) {
    var that = this;
    const data = new Uint8ClampedArray(frame.data);
    this.setData({canvasWidth: frame.width, canvasHeight: frame.height, isReuqest: true});
    wx.canvasPutImageData({
      canvasId: 'firstCanvas',
      x: 0,
      y: 0,
      width: frame.width,
      height: frame.height,
      data: data,
      success(res) {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: frame.width,
          height: frame.height,
          canvasId: 'firstCanvas',
          success(res) {
            wx.getFileSystemManager().readFile({
              filePath: res.tempFilePath, //选择图片返回的相对路径
              encoding: 'base64', //编码格式
              success: msg => { //成功的回调
                that.searchPhoto(msg.data)
              }
            })
          }
        })
      },
      fail(err) {
        that.setData({isReuqest: false});
      }
    });
  },

  takePhoto: function (e) {
    if (this.status) return;
    this.status = true;
    const context = wx.createCameraContext()
    this.listener = context.onCameraFrame((frame) => {
      if(!this.data.isReuqest) {
        this.transformArrayBufferToBase64(frame);
      }
    });
    this.listener.start({
      success: () => {
        this.setData({ msg: '识别中'});
      },
      fail: (err) => {
        this.setData({ msg: err});
      }
    })
  }
})
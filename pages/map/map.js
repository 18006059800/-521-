var app = getApp()
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js')
var qqmapsdk

var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index')
var config = require('../../config')

var queue = require('../../utils/queue.js')
var q = new queue.Queue();

// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000
});

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
});

// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    });
};

var url = {
  loginUrl: config.service.loginUrl,
  momentUrl: config.service.momentUrl,
  tunnelUrl: config.service.tunnelUrl
}

// 设备信息
var device = {
  width: 375, //设备可用宽度，单位px
  height: 603, //设备可用高度，单位px
  px2rpx: 2, //设备px转rpx值
  rpx2px: 0.5, //设备rpx转px值
  rwidth: 750, //设备可用宽度，单位rpx，规定750rpx
  rheight: 1206, //设备可用高度，单位rpx
  maprHeight: 866, //地图可用高度，单位rpx
  mapHeight: 433 //地图可用高度，单位px
}
// 消息下拉单信息
var message = {
  top: -100, //初始-100%来完全隐藏
  distance: 78, //本身位置与动态发布点的距离
  minute: 5, //步行距离时间
  disWidth: 0, //距离信息单个宽度，单位rpx
  btnWidth: 0, //按钮单个宽度，单位rpx
  btnMargin: 0 //按钮单个外间距，单位rpx
}
// Swiper控制信息
var swiperCtrl = {
  allEnd: 'b', //活动活跃状态，b表示活跃，w表示不活跃
  favEnd: 'w', //动态活跃状态，b表示活跃，w表示不活跃
  accEnd: 'w', //资料活跃状态，b表示活跃，w表示不活跃
  current: 0 //swiper当前所在位置
}
// 用户基本信息
var userBasicInfo = {
  sex: '男', //性别
  age: 20, //年龄
  college: 14 //学院
}
// 活动基本信息
var actInfo = {
  actDay: 3, //活动报名剩余天数
  actHover: '' //活动点击状态,''表示未被点击，'actHover'表示被点击
}

Page({
  data: {
    map: false,
    userInfo:{},
    long: 0,
    lat: 0,
    url,
    device,
    message,
    swiperCtrl,
    userBasicInfo,
    actInfo,
    q,
    markers: [],
    controls: [{
      id: 0,
      iconPath: '/img/shadow.png',
      position: {
        left: 0,
        top: -50,
        width: 20,
        height: 50
      }
    },{
      id: 2,
      iconPath: '/img/location.png',
      position: {
        left: 20,
        top: 520,
        width: 56,
        height: 56
      },
      clickable: true
    },{
      id: 3,
      iconPath: '/img/fresh.png',
      position: {
        left: 20,
        top: 450,
        width: 56,
        height: 56
      },
      clickable: true
    },{
      id: 4,
      iconPath: '/img/moment.png',
      position: {
        left: 0,
        top: 0,
        width: 120,
        height: 56
      },
      clickable: true
    }]
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    if (e.controlId === 2) {
      this.mapCtx.moveToLocation()
    } else if (e.controlId === 3) {
      if (this.data.message.top !== 0) {
        this.data.controls[0].position.top = -10
        this.data.message.top = 0
        this.setData({
          message: this.data.message,
          controls: this.data.controls
        })
      }
    } else if (e.controlId === 4) {
      this.closeTunnel();
      wx.navigateTo({
        url: '../moment/moment'
      })
    }
  },
  tap: function() {
    if(this.data.message.top === 0) {
      this.data.controls[0].position.top = -50
      this.data.message.top = -100
      this.setData({
        message: this.data.message,
        controls: this.data.controls
      })
    }
  },
  addMarker: function() {
    var that = this
    this.mapCtx.getCenterLocation({
      success: function(res) {
        var longitude = res.longitude
        var latitude = res.latitude

        var length = that.data.markers.length;

        that.data.markers.push({
          iconPath: '/img/message.png',
          id: length + 1,
          latitude: latitude,
          longitude: longitude,
          width: 30,
          height: 30
        })

        console.log(that.data.markers)

        that.setData({
          markers: that.data.markers
        })
      }
    })
  },
  swiperChange: function(e) {
    if (e.detail.current === 0) {
      this.data.swiperCtrl.allEnd = 'b'
      this.data.swiperCtrl.favEnd = 'w'
      this.data.swiperCtrl.accEnd = 'w'
      this.data.swiperCtrl.current = 0

      this.setData({
        swiperCtrl: this.data.swiperCtrl
      })
    } else if (e.detail.current === 1) {
      this.data.swiperCtrl.allEnd = 'w'
      this.data.swiperCtrl.favEnd = 'b'
      this.data.swiperCtrl.accEnd = 'w'
      this.data.swiperCtrl.current = 1

      this.setData({
        swiperCtrl: this.data.swiperCtrl
      })
    } else if (e.detail.current === 2) {
      this.data.swiperCtrl.allEnd = 'w'
      this.data.swiperCtrl.favEnd = 'w'
      this.data.swiperCtrl.accEnd = 'b'
      this.data.swiperCtrl.current = 2


      this.setData({
        swiperCtrl: this.data.swiperCtrl
      })
    }
  },
  allTap: function() {
    this.data.swiperCtrl.allEnd = 'b'
    this.data.swiperCtrl.favEnd = 'w'
    this.data.swiperCtrl.accEnd = 'w'
    this.data.swiperCtrl.current = 0

    this.setData({
      swiperCtrl: this.data.swiperCtrl
    })
  },
  favTap: function() {
    this.data.swiperCtrl.allEnd = 'w'
    this.data.swiperCtrl.favEnd = 'b'
    this.data.swiperCtrl.accEnd = 'w'
    this.data.swiperCtrl.current = 1

    this.setData({
      swiperCtrl: this.data.swiperCtrl
    })
  },
  accTap: function() {
    this.data.swiperCtrl.allEnd = 'w'
    this.data.swiperCtrl.favEnd = 'w'
    this.data.swiperCtrl.accEnd = 'b'
    this.data.swiperCtrl.current = 2

    this.setData({
      swiperCtrl: this.data.swiperCtrl
    })
  },
  actTap: function() {
    if (this.data.actInfo.actHover === '') {
      this.data.actInfo.actHover = 'actHover'
      this.setData({
        actInfo: this.data.actInfo
      })
    } else {
      this.data.actInfo.actHover = ''
      this.setData({
        actInfo: this.data.actInfo
      })
    }
  },
  actMore: function() {
    console.log("More")
  },
  actSubmit: function() {
    console.log("Submit")
  },

  openTunnel() {
        // 创建信道，需要给定后台服务地址
        var tunnel = this.tunnel = new qcloud.Tunnel(config.service.momentUrl);
        var that = this

        // 监听信道内置消息，包括 connect/close/reconnecting/reconnect/error
        tunnel.on('connect', () => {
            console.log('WebSocket 信道已连接');
        });

        tunnel.on('close', () => {
            console.log('WebSocket 信道已断开');
        });

        tunnel.on('reconnecting', () => {
            console.log('WebSocket 信道正在重连...')
            showBusy('正在重连');
        });

        tunnel.on('reconnect', () => {
            console.log('WebSocket 信道重连成功')
            showSuccess('重连成功');
        });

        tunnel.on('error', error => {
            showModel('信道发生错误', error);
            console.error('信道发生错误：', error);
        });

        // 监听自定义消息（服务器进行推送）
        tunnel.on('moment', moment => {
            console.log('收到说话消息：', moment);
            q.enqueue(moment);
            console.log(q);

            that.setData({
              q: q
            })
        });

        // 打开信道
        tunnel.open();
    },

    closeTunnel() {
    if (this.tunnel) {
        this.tunnel.close();
    }

},


  onLoad: function() {
    let that = this

    //得到用户信息
    app.getUserInfo(function(userInfo){
      if (userInfo.gender === 1) {
        that.data.userBasicInfo.sex = '男'
      } else {
        that.data.userBasicInfo.sex = '女'
      }

      that.setData({
        userInfo: userInfo,
        userBasicInfo: that.data.userBasicInfo
      })
    })

    //得到用户设备信息
    wx.getSystemInfo({
      success: function(res) {
        // console.log(res);
        that.data.device.width = res.windowWidth
        that.data.device.height = res.windowHeight
        that.data.device.px2rpx = 750 / res.windowWidth
        that.data.device.rpx2px = res.windowWidth / 750
        that.data.device.rheight = res.windowHeight * that.data.device.px2rpx
        that.data.device.maprHeight = that.data.device.rheight - 340
        that.data.device.mapHeight = that.data.device.height - 340 * that.data.device.rpx2px

        that.data.message.disWidth = that.data.device.rwidth / 4
        that.data.message.btnWidth = that.data.device.rwidth / 5
        that.data.message.btnMargin = that.data.device.rwidth / 40

        that.setData({
          device: that.data.device,
          message: that.data.message
        })
      }
    })

    //得到用户定位
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        var latitude = res.latitude
        var longitude = res.longitude
        that.data.controls[0].position.width = that.data.device.width * 1.2
        that.data.controls[0].position.left = -(that.data.device.width * 0.1)
        that.data.controls[1].position.top = that.data.device.mapHeight - 80
        that.data.controls[2].position.top = that.data.device.mapHeight - 145
        that.data.controls[3].position.top = that.data.device.mapHeight - 80
        that.data.controls[3].position.left = that.data.device.width / 2 - 60
        that.setData({
          long: longitude,
          lat: latitude,
          controls: that.data.controls,
          map: true
        })
      }
    })

    qqmapsdk = new QQMapWX({
      key: 'YSEBZ-RLCHU-MCPVC-4YYWU-WQN53-IJFGQ'
    })

    this.openTunnel()
  },
  onReady: function(e) {
    this.mapCtx = wx.createMapContext('map')
  },
  onShow: function() {
  }
})

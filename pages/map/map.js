var app = getApp()

// 获取腾讯地图对象
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js')
var QQMapSDK

// 获取腾讯云对象
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index')
var config = require('../../config')

// 获取一系列工具
var popup = require('../../utils/popup.js')
var Device = require('../../utils/device.js')

// 地址集合
var url = {
	loginUrl: config.service.loginUrl, //登录地址
	momentUrl: config.service.momentUrl, //动态地址
	tunnelUrl: config.service.tunnelUrl //信道地址
}

// 用户位置信息集合
var position = {
	longitude: 0,
	latitude: 0
}

// 地图控件集合
var controls = [
	{
		id: 0,
		iconPath: '/img/locate.png',
		position: {
			left: 20,
			top: 530,
			width: 56,
			height: 56
		},
		clickable: true
	},
	{
		id: 1,
		iconPath: '/img/fresh.png',
		position: {
			left: 20,
			top: 450,
			width: 56,
			height: 56
		},
		clickable: true
	},
	{
		id: 2,
		iconPath: '/img/moment.png',
		position: {
			left: 0,
			top: 0,
			width: 120,
			height: 56
		},
		clickable: true
	}
]

var mapSize = {
	width: 375,
	height: 603
};

Page({
	data: {
		userInfo: {},
		map: false,
		position,
		url,
		mapSize,
		controls
	},
	// 开启信道函数
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
      popup.showBusy('正在重连');
    });

    tunnel.on('reconnect', () => {
      console.log('WebSocket 信道重连成功')
      popup.showSuccess('重连成功');
    });

    tunnel.on('error', error => {
      popup.showModel('信道发生错误', error);
      console.error('信道发生错误：', error);
    });

    // 监听自定义消息（服务器进行推送）
    tunnel.on('moment', moment => {
      console.log('收到说话消息：', moment);
    });

    // 打开信道
    tunnel.open();
  },
  // 关闭信道
  closeTunnel() {
  	if (this.tunnel) {
      	this.tunnel.close();
 	 	}
 	},
  controltap(e) {
    if (e.controlId === 0) {
      this.mapCtx.moveToLocation()
    } else if (e.controlId === 1) {
      // @todo 刷新
    } else if (e.controlId == 2) {
      this.closeTunnel()
      // @todo 发动态
    }
  },
 	// 初始化地图尺寸
 	mapInit() {
 		let device = Device.get()
 		this.data.mapSize.width = device.width
 		this.data.mapSize.height = device.height
 		this.data.controls[0].position.top = this.data.mapSize.height - 80
      this.data.controls[1].position.top = this.data.mapSize.height - 145
      this.data.controls[2].position.top = this.data.mapSize.height - 80
      this.data.controls[2].position.left = this.data.mapSize.width / 2 - 60
 	},
 	onLoad() {
 		let that = this;

 		// 获得用户信息
 		app.getUserInfo((userInfo) => {
 			that.setData({
 				userInfo: userInfo
 			})
 		})

 		// 获得设备信息
 		if (!Device.get()) {
  		wx.getSystemInfo({
  			success: (res) => {
  				let device = {
  				  width: res.windowWidth, //设备可用宽度，单位px
  				  height: res.windowHeight, //设备可用高度，单位px
  				  px2rpx: 750 / res.windowWidth, //设备px转rpx值
  				  rpx2px: res.windowWidth / 750, //设备rpx转px值
  				  rwidth: 750, //设备可用宽度，单位rpx，规定750rpx
  				  rheight: res.windowHeight * 750 / res.windowWidth, //设备可用高度，单位rpx
  				}

  				Device.set(device)
  			}
   		})
 		}

    if (this.openTunnel()) {
      // @todo 请求最近的动态信息
    }

 		// 获得用户定位
 		wx.getLocation({
 			type: 'gcj02',
 			success: (res) => {
 				that.data.position.latitude = res.latitude
 				that.data.position.longitude = res.longitude
 				that.mapInit();
 				that.setData({
 					position: that.data.position,
 					map: true,
 					mapSize: that.data.mapSize,
 					controls: that.data.controls
 				})
 			}
 		})

 		QQMapSDK = new QQMapWX({
    		key: 'YSEBZ-RLCHU-MCPVC-4YYWU-WQN53-IJFGQ'
 		})
 	},
 	onReady() {
 		this.mapCtx = wx.createMapContext('map')
 	}
})
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index')
var config = require('../../config')
var constants = require('../../vendor/qcloud-weapp-client-sdk/lib/constants')

// 活动基本信息
var actInfo = []

Page({
	data: {
		actInfo
	},
  	onLoad: function() {
  		let that= this
  		wx.setNavigationBarColor({
  			frontColor: '#ffffff',
  			backgroundColor: '#F47F59'
  		})

  		wx.request({
		    url: config.service.activityUrl,
		    header: {},
		    method: 'GET',
		    data: {},

		    success: function(result) {
		      var data = result.data;

		      if (data && data[constants.WX_SESSION_MAGIC_ID]) {
		        if (data.res) {
		          // @todo 查询成功后
		          console.log(data.res)
		          that.setData({
		          	actInfo: data.res
		          })
		          console.log(that.data.actInfo)
		        } else {
		          console.log('zaza1')
		        }
		      } else {
		        console.log('zaza2')
		      }
		    },

		    fail: function () {
		      console.log('zaza3')
		    },
		});
  	}
})
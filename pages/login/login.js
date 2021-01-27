// pages/login/login.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    password:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  //获取输入框的值
  handleinput(event){
    //console.log(event.detail.value)
    //console.log(event.currentTarget.id)
    //获得输入框中的数值
    let value=event.detail.value
    //获得是某个输入框在输入
    let name=event.currentTarget.id
    //更新对应输入框的值
    this.setData({
      [name]:value
    })
  },
  //点击登录
  async login(){
    //首先要进行前端验证，验证通过后发起请求进行后端验证
    let {phone,password}=this.data
    //验证手机号码
    if (!phone) {//手机号为空
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none',
        mask: true
      })
      return
    }
    //console.log(/^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/.test(phone))
    if (!/^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/.test(phone)) {//手机格式不对
      wx.showToast({
        title: '手机号不正确',
        icon: 'none',
        mask: true
      })
      return
    }
    //密码不为空验证
    if (!password) {//密码为空
      wx.showToast({
        title: '密码不能为空',
        icon: 'none',
        mask: true
      })
      return
    }
    //前端完成验证发起登录请求
    let res=await request('/login/cellphone',{phone,password})
    //后端验证
    if (res.code===200) {//登录成功
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        mask: true
      })
      //把登录信息保存到本地
      wx.setStorageSync('userInfo', JSON.stringify(res.profile))
      //跳转回上一页
      wx.navigateBack({
        delta: 1,
      })
    } else if (res.code===502){
      wx.showToast({
        title: '密码错误',
        icon: 'none',
        mask: true
      })
    } else if (res.code===501){
      wx.showToast({
        title: '账号不存在',
        icon: 'none',
        mask: true
      })
    } else {
      wx.showToast({
        title: '登录失败，请重新登录',
        icon: 'none',
        mask: true
      })
    }
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
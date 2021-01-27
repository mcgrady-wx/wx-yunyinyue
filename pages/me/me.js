// pages/me/me.js

let startY = 0; // 手指起始的坐标
let moveY = 0; // 手指移动的坐标
let moveDistance = 0; // 手指移动的距离
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    transform:"translateY(0)",
    transition:'',
    userInfo: {}, // 用户信息
    recentPlayList: [], // 用户播放记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  handlestart(event){
    //console.log(event.touches[0].clientY)
    //transition存在一个小BUG，当抬起后设置了过渡效果，那么之后滑动都会有过渡效果，我们只需要在抬起后有。解决方法是按下后重置transition属性
    this.setData({
      transition:''
    })
    //获得按下时候的距离顶部初始距离
    startY=event.touches[0].clientY
  },
  handlemove(event){
    //获得在移动过程中距离顶部的距离
    moveY=event.touches[0].clientY
    //计算出实际运动距离
    moveDistance=moveY-startY
    //判断临界值
    if(moveDistance <= 0){
      moveDistance=0
    }
    if(moveDistance >= 80){
      moveDistance = 80;
    }
    //更新translateY的值，让其运动
    this.setData({
      transform:`translateY(${moveDistance}rpx)`
    })
  },
  handleend(){
    //当抬起后自动回到原位
    this.setData({
      transform:"translateY(0)",
      transition:"all 1s linear"
    })
  },
  //跳转到登录页面
  gotoLogin(){
    //如果用户已经登录，就不需要跳转到登录页面
    let {userInfo}=this.data
    if (userInfo.userId) {//用户已经登录
      return
    }
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  //获取用户最近播放列表函数
  async getRecentPlayList(userId){
    let res=await request('/user/record',{uid:userId,type:0})
    //截取前面10个显示
    let index=0
    let recentPlayList=res.allData.slice(0,10).map(item=>{
      item.id=index++
      return item
    })
    this.setData({
      recentPlayList
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
    //因为在点击游客去登录的时候个人页面只是隐藏不是销毁，所以在登录成功后获取用户信息等操作不能在onLoad中进行，因为页面没销毁，登录成功返回个人中心页面onLoad钩子不会执行
    //获取用户信息
    let userInfo=JSON.parse(wx.getStorageSync('userInfo'))
    if (userInfo.userId) {//如果有登录信息
      this.setData({
        userInfo
      })
      //获取最近播放列表
      this.getRecentPlayList(userInfo.userId)
   }
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
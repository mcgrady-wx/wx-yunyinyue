// pages/recommendSong/recommendSong.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: '', // 天
    month: '', // 月
    recommendList: [], // 推荐列表数据
    index: 0, // 点击音乐的下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 更新日期的状态数据
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1
    })
    //判断用户是否登录，没登录跳转到登录页面
    let userInfo=wx.getStorageSync('userInfo')
    if (!userInfo) {//不存在
      wx.showModal({
        content:'未登录，登录后显示歌单',
        confirmText:'去登录',
        success:(res)=>{
          if (res.confirm) {
            wx.navigateTo({url: '/pages/login/login'})
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    }
    
  },
  //获得每日推荐的歌单数据
  async getRecommendList(){
    //获得登录后提供的cookies数据
    let cookies=JSON.parse(wx.getStorageSync("cookies"));
    //请求之前给用户提示
    wx.showLoading({
      title:'加载中',
      mask:true
    })
    //获得需要的那条cookies
    let cookie=cookies.find(item=>{
      //使用indexOf查询，包含返回字符串中首次出现的位置，不包含返回-1
      //包含返回首次出现的位置为true，而-1也是true，都满足条件这样就会返回出默认的第一条数据；所以要排除-1的情况
      return item.indexOf('MUSIC_U') !==-1
    })
    //发起请求
    let res=await request("/recommend/songs",{},{cookie})
    //console.log(res.recommend)
    this.setData({
      recommendList:res.recommend
    })
    //数据请求成功后关闭交互提示
    wx.hideLoading()
    //把歌单保存到本地，方便播放页面前后切歌使用,只需要ID
    let songListId=res.recommend.map((item)=>{
      return item.id
    })
    //console.log(songListId)
    wx.setStorageSync('songListId', songListId)
  },
  //跳转到歌曲播放页面
  toSongDetail(event){
    let {index,songid}=event.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?songid='+songid,
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
    //已经登录，发起请求获得每日歌单
    this.getRecommendList()
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
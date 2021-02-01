// pages/songDetail/songDetail.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, // 音乐是否播放
    song: {}, // 歌曲详情对象
    musicId: '', // 音乐id
    musicLink: '', // 音乐的链接
    currentTime: '00:00',  // 实时时间
    durationTime: '00:00', // 总时长
    currentWidth: 0, // 实时进度条的宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获得跳转传递过来的参数
    let ids=options.songid
    this.setData({
      musicId:ids
    })
    //发起请求获得音乐详情
    this.getSongInfo(ids)
  },
  //获得音乐详情
  async getSongInfo(ids){  
    let res=await request('/song/detail',{ids})
    this.setData({
      song:res.songs[0]
    })
    //修改当前页面标题
    wx.setNavigationBarTitle({
      title: res.songs[0].name
    })
  },
  //点击播放/暂停
  handleMusicPlay(){
    let isPlay=!this.data.isPlay
    this.setData({
      isPlay
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
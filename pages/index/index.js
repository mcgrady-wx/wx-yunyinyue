import request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], // 轮播图数据
    recommendList: [], // 推荐歌单
    topList: [], // 排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getBannerList()
    this.getRecommendList()
    this.getTopList()
  },
  //封装请求轮播图数据函数
  async getBannerList(){
    let res=await request("/banner",{type:2})
    //console.log(res)
    this.setData({
      bannerList:res.banners
    })
  },
  //封装请求推荐歌单数据函数
  async getRecommendList(){
    let res=await request("/personalized",{limit:10})
    //console.log(res)
    this.setData({
      recommendList:res.result
    })
  },
  //封装请求排行榜数据函数
  async getTopList(){
    let index=0
    let arr=[]
    while (index<5) {
      let res=await request("/top/list",{idx:index++})
      arr.push({name:res.playlist.name,tracks:res.playlist.tracks,id:res.playlist.id})
      // 不需要等待五次请求全部结束才更新，用户体验较好，但是渲染次数会多一些。如果等待五次请求全部结束才更新在等待的过程中下面是空白，用户体验不好
      this.setData({
        topList:arr
      })
    }
    //console.log(arr)
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
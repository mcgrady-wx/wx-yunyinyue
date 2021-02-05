import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '', // placeholder的内容
    hotList: [], // 热搜榜数据
    searchContent: '', // 用户输入的表单项数据
    searchList: [], // 关键字模糊匹配的数据
    historyList: [], // 搜索历史记录
  },
  time:0,//保存定时器ID
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取初始化数据
    this.getInitData();
    //获得默认的历史记录
    this.getSearchHistory()
  },
  //输入框事件
  handleInputChange(event){
    //console.log(event.detail.value)
    let searchContent=event.detail.value.trim()
    //更新data中数据
    this.setData({
      searchContent
    })
    //当输入内容为空时，清除searchList的数据，并且不用发送请求
    if (!searchContent) {//输入的内容为空
      this.setData({
        searchList:[]
      })
      //存在BUG需要清理掉定时器。清除输入框内容太快，为空了就直接return，但是没有清除定时器，定时器还是会延迟发生，导致searchList有值
      clearTimeout(this.time)
      return
    }
    //优化，数据节流
    clearTimeout(this.time)
    this.time=setTimeout(() => {
      this.getSerachlist(searchContent)
    }, 500);
    
  },
  //清空输入框点击事件
  clearSearchContent(){
    this.setData({
      searchContent:'',
      searchList:[]
    })
  },
  //获得初始显示数据
  async getInitData(){
    //获得输入框中默认显示数据
    let res=await request('/search/default')
    //console.log(res.data.showKeyword)
    //获得默认的热搜榜数据
    let res1=await request('/search/hot/detail')
    this.setData({
      placeholderContent:res.data.showKeyword,
      hotList:res1.data
    })
  },
  // 获取本地历史记录的功能函数
  getSearchHistory(){
    let historyList = wx.getStorageSync('searchHistory');
    if(historyList){
      this.setData({
        historyList
      })
    }
  },
  //搜索数据的功能函数
  async getSerachlist(keywords){
    let res=await request('/search',{keywords,limit:10})
    //console.log(res.result.songs)
    this.setData({
      searchList:res.result.songs
    })
  },
  //点击确定搜索
  isOk(){
    //记录搜索记录
    //拿到之前的历史记录和当前输入的内容
    let {historyList,searchContent}=this.data
    if (!searchContent) {//内容为空
      return
    }
    //修改搜索历史记录
    this.handleHistoryList(historyList,searchContent)
    //跳转到搜索结果页面 。。。。。。
  },
  //修改搜索历史记录的功能函数
  handleHistoryList(historyList,content){
    //找到当前输入内容在搜索历史记录中的下标
    let index=historyList.findIndex(item=>{
      return item == content
    })
    //首先判断搜索内容是否存在与搜索历史记录数组，如果存在，删除对应项
    if (index !== -1) {
      historyList.splice(index,1)
    }
    //再判断搜索历史记录数组的长度最大为10
    if (historyList.length >= 10) {//删除最后一个记录
      historyList.splice(9,1)
    }
    //最后把当前输入内容添加到历史记录的前面
    historyList.unshift(content)
    //更新数据
    this.setData({
      historyList
    })
    //保存到本地
    wx.setStorageSync('searchHistory', historyList)
  },
  //清除搜索历史
  deleteSearchHistory(){
    wx.showModal({
      content: '确定删除历史记录',
      success:(res)=>{
        if (res.confirm) {
          this.setData({
            historyList:[]
          })
          wx.removeStorageSync('searchHistory')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //点击热搜词条，让热搜词条显示在搜索输入框中
  handleHot(event){
    //console.log(event.currentTarget.dataset)
    this.setData({
      searchContent:event.currentTarget.dataset.name
    })
  },
  //跳转到歌曲播放页面
  gotoSongDetail(event){
    let songid=event.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?songid='+songid,
    })
     //修改搜索历史记录
     let {historyList} = this.data
     let content=event.currentTarget.dataset.name
     this.handleHistoryList(historyList,content)
    //把歌曲ID本地保存的歌单，用于歌曲前后却换。没有做播放列表
    let songListId=wx.getStorageSync('songListId')
    songListId.push(songid)
    wx.setStorageSync('songListId', songListId)
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
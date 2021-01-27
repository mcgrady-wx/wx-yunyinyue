import request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], // 导航标签数据
    navId: '', // 导航的标识
    videoList: [], // 视频列表数据
    videoId: '', // 视频id标识
    videoUpdateTime: [], // 记录video播放的时长
    isTriggered: false, // 标识下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //获得导航标签数据
    this.getVideoGroupLis()
    
  },
  //获取导航列表数据
  async getVideoGroupLis(){
    let res=await request('/video/group/list')
    //console.log(res)
    //由于数据太多，只截取前面14个
    this.setData({
      videoGroupList:res.data.slice(0,14),
      navId:res.data.slice(0,14)[0].id//设置初始化时候第一个选项高亮
    })
    //同时由于刚加载的时候，在onLoad中不一定能拿到navId的数据，所以首次请求视频数据应放在这
    this.getVideoList(res.data.slice(0,14)[0].id)
  },
  //切换导航标签
  changeNav(event){
    //console.log(event.currentTarget.id)
    //通过id拿到的数据默认转化成字符串
    let nid=Number(event.currentTarget.id)
    this.setData({
      navId:nid//高亮显示切换
    })
    //获得对应的视频数据
    this.getVideoList(nid)
  },
  //获得对应导航标签的视频数据
  async getVideoList(id){
    //获得登录后提供的cookies数据
    let cookies=JSON.parse(wx.getStorageSync("cookies"));
    //获得需要的那条cookies
    let cookie=cookies.find(item=>{
      //使用indexOf查询，包含返回字符串中首次出现的位置，不包含返回-1
      //包含返回首次出现的位置为true，而-1也是true，都满足条件这样就会返回出默认的第一条数据；所以要排除-1的情况
      return item.indexOf('MUSIC_U') !==-1
    })
    //console.log(cookie)
    //发起请求获得对应的视频数据
    let res=await request("/video/group",{id},{cookie})
    let index=0
    let videoList=res.datas.map(item=>{
      item.id=index++
      return item
    })
    this.setData({
      videoList
    })
  },
  //点击播放事件
  handlePlay(event){
    //当点击获得要播放视频的ID
    let vid=event.currentTarget.id
    this.setData({
      videoId:vid
    })
    //创建当前播放video组件的实例来控制播放、暂停等
    let VideoContext=wx.createVideoContext(vid)
    //播放视频
    VideoContext.play()
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
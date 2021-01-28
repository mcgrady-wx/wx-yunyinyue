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
  num:8, //保存用于设置videoList数据中的每一项的id值
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /**
     * 视频页面需要登录后才能显示数据，所以进入视频页面后首先判断用户是否登录
     * 如果用户没有登录弹窗提示，询问用户是否跳转到登录页面
     */
    if (!wx.getStorageSync("cookies")) {
      wx.showModal({
        content:'未登录，登录后显示内容',
        confirmText:'去登录',
        success:(res)=>{
          if (res.confirm) {
            wx.navigateTo({url: '/pages/login/login'})
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
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
    //切换之前把videoList中数据清空
    this.setData({
      videoList:''
    })
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
    //发起请求之前首先判断是否登录，如果没有登录就不起请求
    if (!wx.getStorageSync("cookies")) {
      return
    }
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
    //console.log(cookie)
    //发起请求获得对应的视频数据
    let res=await request("/video/group",{id},{cookie})
    let index=0
    let videoList=res.datas.map(item=>{
      item.id=index++
      return item
    })
    this.setData({
      videoList,
      isTriggered:false//关闭下拉属性状态
    })
    //数据请求成功后关闭交互提示
    wx.hideLoading()
  },
  //点击播放、继续播放事件
  handlePlay(event){
    //当点击获得要播放视频的ID
    let vid=event.currentTarget.id
    this.setData({
      videoId:vid
    })
    /**
     * 如果不使用image图片代替video标签实现性能优化，那么就会存在多个视频同时播放的问题
     * 解决方案是把video组件的实例保存到this中，在点击下一个video组件时候暂停上一个实例，再创建下一个实例
     * this.videoContext && this.videoContext.stop()
     * 这样设置了也会存在BUG，如果点击是同一个video，会出现无法继续播放的BUG，原因是this.videoContext有值每次进入的时候就会执行stop
     * 解决方法和解决多个视频同时播放相似，在this中保存视频的id，当这次点击的视频和上次的视频相同的时候就不执行stop，不相同再执行stop
     * 判断
     * this.vid !==vid && this.videoContext && this.videoContext.stop()
     * 保存本次的vid 用于下次点击调用比较
     * this.vid=vid
     */
    //创建当前播放video组件的实例来控制播放、暂停等
    let VideoContext=wx.createVideoContext(vid)
    //判断该video组件之前是否播放过，播放过就跳转到之前播放的位置
    let {videoUpdateTime} = this.data;
    let currentVideo=videoUpdateTime.find(item=>{
      return item.vid===vid
    })
    if (currentVideo) {//存在，表示播放过，跳转到之前播放的位置
      //跳转到指定位置
      VideoContext.seek(currentVideo.currentTime)
    }
    //播放视频
    VideoContext.play()
  },
  //视频播放中触发事件，用于记录播放的时长，解决停止后切换视频再次回来点击又从最开始播放的BUG
  handletimeupdate(event){
    //console.log(event.detail)
    //记录当前播放video的id和播放时长
    let videoTimeObj = {vid: event.currentTarget.id, currentTime: event.detail.currentTime};
    //获得记录每个video播放时长的数组
    let {videoUpdateTime} = this.data;
    //通过vid判断是否是同一个video，是同一个只需要改变currentTime
    let currentVideo=videoUpdateTime.find(item=>{
      return item.vid===videoTimeObj.vid
    })
    if (!currentVideo) {//不存在，直接push
      videoUpdateTime.push(videoTimeObj)
    } else {//存在，更新时长
      currentVideo.currentTime=event.detail.currentTime
    }
    //更新数组
    this.setData({
      videoUpdateTime
    })
  },
  //视频播放结束出发的函数
  handleEnded(event){
    //当视频播放结束后，应该清除videoUpdateTime中保存的该视频播放时长
    let vid=event.currentTarget.id
    let {videoUpdateTime} = this.data;
    //找到对应对象的index
    let index=videoUpdateTime.findIndex(item=>{
      return item.vid===vid
    })
    videoUpdateTime.splice(index,1)
    this.setData({
      videoUpdateTime
    })
  },
  //scroll-view组件下拉刷新事件
  handleRefresherrefresh(){
    //清空数据，设置当前下拉刷新状态为true，再重新发起请求请求数据
    this.setData({
      videoList:'',
      isTriggered:true
    })
    let {navId} = this.data
    this.getVideoList(navId)
  },
  //scroll-view组件触底事件
  async handleScrolltolower(){
    //交互显示loading
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    //触底加载更多
    let {navId,videoList} = this.data
    //获得登录后提供的cookies数据
    let cookies=JSON.parse(wx.getStorageSync("cookies"));
    //获得需要的那条cookies
    let cookie=cookies.find(item=>{
     })
     //发起请求获得对应的视频数据
     let res=await request("/video/group",{id:navId},{cookie})
     let index=this.num
     let newList=res.datas.map(item=>{
       item.id=index++
       return item
     })
     //重新保存下次请求的时候起使id编号
     this.num=index
     //把新数据push到老数组中
     videoList.push(...newList)
     this.setData({
      videoList
     })
     //关闭loading
     wx.hideLoading()
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
    //获得导航标签数据
    this.getVideoGroupLis()
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
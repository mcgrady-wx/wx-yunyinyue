// pages/songDetail/songDetail.js
import request from '../../utils/request'
import {formatMss} from '../../utils/util'
var appInstance = getApp()
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
    //获得本地中歌曲播放列表的所有id
    this.songListId=wx.getStorageSync('songListId')
    //获得跳转传递过来的参数
    let ids=options.songid
    this.setData({
      musicId:ids,
      isPlay:true //进入页面自动播放音乐
    })
    //发起请求获得音乐详情
    this.getSongInfo(ids)
    
    //优化，当退出当前页面，点击同一首歌曲进入页面又会请求一次数据。每次进入把当前歌曲的ID放在全局的app的data中，用当前ID和上一场的appdata中的ID进行比较如果相同就不再发起请求
    //但是存在问题是如果是在暂停状态下在重新进入同一首歌，页面的isPlay状态是默认设置为true，就会出现页面状态和声音不同步
    //解决办法是，不管是播放\暂停或者监视播放\暂停都把播放状态保存到全局data中，在通过判断，如果是点击的同一首就把全局保存的播放状态赋值给isPlay
    if (appInstance.globalData.musicId !==ids) {//不相同，发起请求获得新的播放地址
      //获得歌曲播放地址
      this.getMusicLink(ids)
      //更新全局data中的数据
      appInstance.globalData.musicId=ids
      appInstance.globalData.isMusicPlay=true
    } else {//同一首歌，更新isPlay的状态为全局保存的播放状态
      this.setData({
        isPlay:appInstance.globalData.isMusicPlay
      })
    }
    
    //创建全局的唯一的背景音频管理器
    this.BackgroundAudioManager=wx.getBackgroundAudioManager()
    //当在外部点击播放、暂停的时候内部isPlay状态不会改变，所以使用监听修改isPlay的值
    //监听播放事件
    this.BackgroundAudioManager.onPlay(()=>{   
      this.setData({
        isPlay:true
      })
      //更新全局data中的id数据
      appInstance.globalData.isMusicPlay=true
    })
    //监听暂停事件
    this.BackgroundAudioManager.onPause(()=>{   
      this.setData({
        isPlay:false
      })
      //更新全局data中的id数据
      appInstance.globalData.isMusicPlay=false
    })
    //监听停止事件
    this.BackgroundAudioManager.onStop(()=>{      
      this.setData({
        isPlay:false
      })
      //更新全局data中的id数据
      appInstance.globalData.isMusicPlay=false
    })
    //监听背景音频播放进度更新
    this.BackgroundAudioManager.onTimeUpdate((e)=>{     
      //通过监听实时获得当前播放的时间，已知当前播放时间、总时间、进度条总长度，求得实时进度条长度
      let {song} = this.data
      let currentWidth=(this.BackgroundAudioManager.currentTime*1000/song.dt)*450
      //console.log(currentWidth)
      this.setData({
        currentWidth,
        currentTime:formatMss(this.BackgroundAudioManager.currentTime*1000)
      })
    })
    //监听背景音频自然播放结束，自动却换到下一首
    this.BackgroundAudioManager.onEnded(()=>{
      let {musicId}=this.data
      let index=this.songListId.findIndex(item=>{
        return item == musicId
      })
      //边界判断
      //(index === this.songListId.length-1) && (index = -1)
      if (index === this.songListId.length-1) {
        index = -1
      }     
      index++
      //更新当前歌曲id
      this.setData({
        musicId:this.songListId[index]
      })
      //重新请求数据
      //发起请求获得音乐详情
      this.getSongInfo(this.songListId[index])
      //获得歌曲播放地址
      this.getMusicLink(this.songListId[index])
      //更新全局data中的数据
      appInstance.globalData.musicId=this.songListId[index]
      appInstance.globalData.isMusicPlay=true
    })
  },
  //获得音乐详情
  async getSongInfo(ids){  
    let res=await request('/song/detail',{ids})
    let durationTime=formatMss(res.songs[0].dt) //歌曲总时长
    this.setData({
      song:res.songs[0],
      durationTime
    })
    //修改当前页面标题
    wx.setNavigationBarTitle({
      title: res.songs[0].name
    })
  },
  //获得歌曲的播放地址
  async getMusicLink(id){
    let res=await request('/song/url',{id})
    //console.log(res.data[0])
    this.setData({
      musicLink:res.data[0].url
    })
    //把歌曲播放地址添加到背景音频管理器上
    this.BackgroundAudioManager.src=res.data[0].url //添加上后歌曲会自动播放
    this.BackgroundAudioManager.title=this.data.song.name
  },
  //点击播放/暂停
  handleMusicPlay(){
    let isPlay=!this.data.isPlay
    if (isPlay) {
      //播放音乐
      this.BackgroundAudioManager.play()
      //更新全局data中的id数据
      appInstance.globalData.isMusicPlay=true
    } else {
      //暂停音乐
      this.BackgroundAudioManager.pause()
      //更新全局data中的id数据
      appInstance.globalData.isMusicPlay=false
    }
    this.setData({
      isPlay
    })
  },
  //切换歌曲
  handleSwitch(event){
    //获得当前播放歌曲的ID，在查找出在列表中的下标，下一首就是下标+1，上一首就是下标-1
    let {musicId}=this.data
    let index=this.songListId.findIndex(item=>{
      return item ==musicId
    })
    //切换之前停止当前歌曲
    this.BackgroundAudioManager.stop()
    //判断是上一首或者下一首
    if (event.currentTarget.id === 'next') {//下一首
      //边界判断
      (index === this.songListId.length-1) && (index = -1)
      index++
      //更新当前歌曲id
      this.setData({
        musicId:this.songListId[index]
      })
      //重新请求数据
      //发起请求获得音乐详情
      this.getSongInfo(this.songListId[index])
      //获得歌曲播放地址
      this.getMusicLink(this.songListId[index])
      //更新全局data中的数据
      appInstance.globalData.musicId=this.songListId[index]
      appInstance.globalData.isMusicPlay=true

    } else {//上一首
      //边界判断
      (index === 0) && (index = this.songListId.length)
      index--
      //更新当前歌曲id
      this.setData({
        musicId:this.songListId[index]
      })
      //重新请求数据
      //发起请求获得音乐详情
      this.getSongInfo(this.songListId[index])
      //获得歌曲播放地址
      this.getMusicLink(this.songListId[index])
      //更新全局data中的数据
      appInstance.globalData.musicId=this.songListId[index]
      appInstance.globalData.isMusicPlay=true

    }
  },
  //小球运动三个事件
  circlestart(event){
    //获得当前的currentWidth值
    this.wid=this.data.currentWidth
    //获得初始小球距离左边的距离
    this.startClientX=event.touches[0].clientX
  },
  circlemove(event){
    
    //获得移动过程中小球距离左边的距离
    this.moveClientX=event.touches[0].clientX
    //计算出移动距离
    this.clientX=this.moveClientX-this.startClientX
    /*//能实时获得currentWidth的长度，看到实时拖拽的效果。但是会和监听背景音频播放进度更新函数中不断根据播放时间更新currentWidth冲突，只能在歌曲暂停的时候使用。
      //所以不用该方法实现拖拽实时显示currentWidth
    let {currentWidth} =this.data
    //不断更新初始位置，不这么设置初始位置不变移动距离会越来越大，每次累加的currentWidth过大。比如开始移动了50，已经加到currentWidth上了，下次移动到51，实际只增加了1，但是由于初始位置不变
    //累加上去的就是51，所以要不断更新初始位置，每次累加后让初始位置等于上一次的结束位置
    this.startClientX=this.moveClientX
    currentWidth+=this.clientX*2
    this.setData({
      currentWidth
    })*/
  },
  circleend(){
    //只能在结束拖拽后来更新currentWidth，这个方法不好的地方就是看不到实时拖拽的效果，但是不会和监听背景音频播放进度更新函数冲突，歌曲在暂停或播放过程中都能使用
    let {currentWidth} =this.data
    currentWidth+=this.clientX*2//*2是因为计算出来的移动距离单位是xp，而currentWidth的单位是rpx
    //设置最小边界值
    if (currentWidth<=0) {
      currentWidth=0
    }
    //设置最大边界值
    if (currentWidth>=450) {
      currentWidth=450
    }
    this.setData({
      currentWidth
    })
    //移动到对应的时间去
    let {song}=this.data
    //计算出要移动到的时间
    let time=(currentWidth/450*song.dt)/1000
    //console.log(time.toFixed(3))
    this.BackgroundAudioManager.seek(Number(time.toFixed(3)))
  },
  //点击进度条移动到相应位置
  handleBar(event){
    let {song}=this.data
    //console.log(event.touches[0].clientX)
    //获得点击距离左边的距离
    let clientX=event.touches[0].clientX
    //计算出在总进度条的移动距离
    let wid=(clientX-75)*2 //单位转换成rpx
    this.setData({
      currentWidth:wid
    })
    //计算出要移动到的时间
    let time=(wid/450*song.dt)/1000
    //console.log(time.toFixed(3))
    this.BackgroundAudioManager.seek(Number(time.toFixed(3)))
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
// 封装网络请求函数
import config from './config'

export default (url,data={},header={'content-type':'application/json'},method="GET")=>{
    return new Promise((resolve, reject)=>{
        wx.request({
            url: config.host+url,
            data,
            method,
            header,
            success: (result)=>{
                //判断是否是登录请求，是登录请求就把返回得到的cookies保存到本地用于请求视频视频数据
                //通过data中的参数是否是phone和password就可以判断是登录请求
                if (data.phone && data.password) {
                    //是登录请求，保存cookies到本地
                    wx.setStorageSync('cookies', JSON.stringify(result.cookies))                    
                }
                resolve(result.data)
            },
            fail: (err)=>{
                reject(err)
            }
        });
    })
}
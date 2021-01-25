// 封装网络请求函数
import config from './config'

export default (url,data={},method="GET")=>{
    return new Promise((resolve, reject)=>{
        wx.request({
            url: config.host+url,
            data,
            method,
            success: (result)=>{
                resolve(result.data)
            },
            fail: (err)=>{
                reject(err)
            }
        });
    })
}
const mongoose = require('mongoose');
// 连接数据库
// mongoose.connect('mongodb://localhost/itcast')
// 定义机构
const Schema = mongoose.Schema;
// mongoose.connect('')

const userSchema = new Schema({
  email:{
    type:String,
    required:true
  },
  nickname:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  // 修改时间
  created_time:{
    type:Date,
    //如果没有传入created_time值时，mongoose会调用Date.now，相当于new Date()
    default: Date.now
  },
  //创建时间
  last_modified_time:{
    type: Date,
    default: Date.now
  },
  // 头像
  avatar:{
    type:String,
    default:'/public/img/avatar-max-img.png'
  },
  // 昵称
  bio:{
    type:String,
    default:""
  },
  // 介绍
  Introduction:{
    type:String,
    default:""
  },
  // 性别
  gender:{
    type:Number,
    //enum多个选一个(-1保密，0男，1女)
    enum:[-1,0,1],
    default:-1
  },
  // 生日
  birthday:{
    type:Date
  },
  // 账号状态
  status:{
    type:Number,
    // (0未设限制，1不可评论，2不可登录)
    enum:[0,1,2],
    default:0
  }
})

module.exports = mongoose.model('User',userSchema)
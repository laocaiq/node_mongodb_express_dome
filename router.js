const express = require('express')
const User = require('./models/user')
const Topic = require('./models/topic')
const Article = require('./models/article')
const Evaluation = require('./models/evaluation')
const md5 = require('blueimp-md5')
const multer = require('multer');
const fs = require('fs')
const path = require('path')

const router = express.Router()
//生成的图片放入uploads文件夹下
var upload = multer({dest:'uploads/'})
// 图片上传
router.post('/upload',upload.single('test'), function (req, res, next) {
  //读取文件路径(uploads/文件夹下面的新建的图片地址)
  fs.readFile(req.file.path,(err,data)=>{
    //如果读取失败
    if(err){return res.send('上传失败')}
    //如果读取成功
    //声明图片名字为时间戳和随机数拼接成的，尽量确保唯一性
    let time = Date.now()+parseInt(Math.random()*999)+parseInt(Math.random()*2222);
    //拓展名
    let extname = req.file.mimetype.split('/')[1]
    //拼接成图片名
    let keepname = time+'.'+extname
    //三个参数
    //1.图片的绝对路径
    //2.写入的内容
    //3.回调函数
    fs.writeFile(path.join(__dirname,'/public/img/'+keepname),data,(err)=>{
        if(err){return res.send('写入失败')}
        res.send({err:0,msg:'上传ok',data:'/public/img/'+keepname})
    });
  });
});

router.get('/',(req,res,next) => {
  var length = 0;
  // 获取文章总数
  Article.find()
  .then(data => {
    length = Math.ceil(data.length / 2)
    let skip = (req.query.skip - 1) * 2
    // 获取文章排序内容
    return Article.find().sort({newtime:-1}).limit(2).skip(skip)
  })
  .then((data) => {
    let page = {
      Arry:[]
    }
    for(var i = 1;i <= length;i ++){
      page.Arry.push(i)
    }
    page.nuber = Number(req.query.skip) ? Number(req.query.skip) : Number(1)
    res.render('index.html',{
      user:req.session.user,
      index:data,
      page:page
    })
  },err => {
    next(err)
  })
})

// 登录
router.get('/login',(req,res,next) => {
  res.render('login.html')
})
router.post('/login',(req,res,next) => {
  let body = req.body
  User.findOne({
    email:body.email,
    password:md5(md5(body.password))
  })
    .then((data) => {
      if(!data){
        return res.status(200).json({
          err_code:1,
          message:'邮箱或者密码错误'
        })
      }
      req.session.user = data
      return res.status(200).json({
        err_code:0,
        message:'登录成功'
      })      
    },(err) => {
      return next(err)
    })
})

// 注册
router.get('/register',(req,res,next) => {
  res.render('register.html')
})
router.post('/register',(req,res,next) => {
  User.findOne({email:req.body.email})
    .then((data) => {
        if(data){
        return res.status(500).json({
          err_code:1,
          message:"邮箱已被注册"
        })
      }
      return User.findOne({nickname:req.body.nickname})
    },(err) => {
      if(err){
        return next(err)
      }
    })
    .then((data) => {
      if(data){
        return res.status(200).json({
          err_code:2,
          message:"昵称已被注册"
        })
      }
      req.body.password = md5(md5(req.body.password))
      return new User(req.body).save()
    },(err) => {
      if(err){
        return next(err)
      }
    })
    .then((data) => {
      req.session.user = data
      return res.status(200).json({
        err_code:200,
        message:"注册账号成功"
      })
    },(err) => {
      return next(err)
    })
})

// 退出
router.get('/logout',(req,res,next) => {
  delete req.session.user
  res.render('index.html')
})

// 基本信息
router.get('/settings/profile',(req,res,next) => {
  res.render('settings/profile.html',{
    user:req.session.user
  })
})
router.post('/settings/profile',(req,res,next) => {
  let user = req.session.user
  User.update(user,req.body)
    .then((data) => {
      for(var key in req.body){
        user[key] = req.body[key]
      }
      req.session.user = user
      return res.status(200).json({
        err_code:200,
      })
    },(err) => {
      return res.status(500).json({
        err_code:500,
      })
    })
})

// 账号设置
router.get('/settings/admin',(req,res,next) => {
  res.render('settings/admin.html',{user:req.session.user})
})
router.post('/settings/admin',(req,res,next) => {
  let user = req.session.user
  // 确认账户密码
  if(user.password != md5(md5(req.body.password))){
    return res.status(200).json({
      err_code:500,
      message:"当前密码错误，请重试"
    })
  }else if(req.body.Newpassword != req.body.Newpassword2){
    return res.status(200).json({
      err_code:500,
      message:"请确认密码是否一致，请重试"
    })
  }else{
  User.update(user,{password:md5(md5(req.body.Newpassword))})
    .then((data) => {
      delete req.session.user
      return res.status(200).json({
        err_code:200,
        message:"密码修改成功"
      })
    },(err) => {
      return res.status(500).json({
        err_code:500,
      })
    })
  }
})

// 销号
router.post('/settings/delete',(req,res,next) => {
  let user = req.session.user
  console.log(user)
  User.remove(user)
    .then((data) => {
      delete req.session.user
      return res.status(200).json({
        err_code:200,
        message:"账号已删除"
      })
    },(err) => {
      console.log(err)
    })
})

// 发布
router.get('/topics/new',(req,res,next) => {
  // 需要板块信息，用下方方法填充板块数据
  // 为后面多表关联做准备
  // new Topic({title:'客户端测试'}).save()
  //   .then((data) => {
  //     console.log(data)
  //     res.render('topic/new.html',{user:req.session.user})
  //   },(err) => {
  //     next()
  //   })
  Topic.find()
    .then((data) => {
      res.render('topic/new.html',{user:req.session.user,topic:data})
    },(err) => {
      console.log(err)
    })
})
router.post('/topics/new',(req,res,next) => {
  let article = req.body
  // 得到的数值会带 " 号，如果不去除会使数据库输入失败报错
  article.plate_id = req.body.plate_id.replace(/\"/g, "")
  article.founder = req.session.user.nickname
  article.avatar = req.session.user.avatar
  new Article(article).save()
    .then((data) => {
      return res.status(200).json({
        err_code:200,
        message:"成功"
      })
    },(err) => {
      next(err)  
    })
})

// 详情
router.use('/topics/show',(req,res,next) => {
  // 关联查询
  Article
    .findById(req.query.id)
    .populate('plate_id')     //需要查询的属性
    .then(data => {
      req.session.show = data
      // 评论查询
      return Evaluation.find({article_id:req.query.id}).sort({time:-1})
    })
    .then(Edata => {
      res.render('topic/show.html',{
        user:req.session.user,
        show:req.session.show,
        evaluation:Edata
      })
      let browse = req.session.show.browse + 1
      // 更新浏览量和评论量
      return Article.findByIdAndUpdate(req.query.id,{browse,evaluationNub:Edata.length})
    })
    .then(data =>{
      console.log(data)
    })
    .catch(err => {
      console.log(err)
      next(err)
    })
})

// 评论
router.post('/topic/show',(req,res,next) => {
  let evaluation = req.body
  evaluation.article_id = req.session.show._id
  new Evaluation(evaluation).save()
    .then(data => {
      res.status(200).json({
        err_code:200,
        message:"成功"
      })
    })
    .catch(err => {
      console.log(err)
      next(err)
    })
})

module.exports = router;
const express = require('express')
const path = require('path')
const router = require('./router')
const bodyParser = require('body-parser')
const session = require('express-session')
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session)
const template = require('art-template')

const app = express();

// 时间过滤器
template.defaults.imports.dateFormat = function(date, format) {
  date = new Date(date); 
  var map = {
      "M": date.getMonth() + 1, //月份
      "d": date.getDate(), //日
      "h": date.getHours(), //小时
      "m": date.getMinutes(), //分
      "s": date.getSeconds(), //秒
      "q": Math.floor((date.getMonth() + 3) / 3), //季度
      "S": date.getMilliseconds() //毫秒
  };
  format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
      var v = map[t];
      if (v !== undefined) {
          if (all.length > 1) {
              v = '0' + v;
              v = v.substr(v.length - 2);
          }
          return v;
      } else if (t === 'y') {
          return (date.getFullYear() + '').substr(4 - all.length);
      }
      return all;
  });
  return format;
};
 
// 文件夹暴露配置
app.use('/public/',express.static(path.join(__dirname,'/public/')))
app.use('/node_modules/',express.static(path.join(__dirname,'/node_modules/')))

app.engine('html',require('express-art-template'))
app.set('views',path.join(__dirname,'/views/'))       //默认为views文件夹

// body-parse配置
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

// session配置
app.use(session({
  secret:'keyboard cat', //加密字符串也可以写数组
  resave:true,     //强制保存session 建议设置成false
  saveUninitialized:true,  //强制保存未初始化的内容
  rolling:true, //动态刷新页面cookie存放时间
  // cookie:{maxAge:24*3600}, //保存时效
  store:new MongoStore({   //将session存进数据库  用来解决负载均衡的问题
      url:'mongodb://127.0.0.1/itcast', //将缓存数据放入数据库中
      touchAfter:1000*60*60*24 //通过这样做，设置touchAfter:1000*60*60*24，您在24小时内
     //只更新一次会话，不管有多少请求(除了在会话数据上更改某些内容的除外)
  })
}))

// 路由挂载
app.use(router)

// 404页面
app.use((req,res,next) => {
  res.send("404.html")
})

// 错误处理
app.use((err,req,res,next) => {
  return res.status(500).send(err)
})

mongoose.connect('mongodb://localhost:27017/itcast', {useNewUrlParser: true}, function (err) {
  if (err) {
    console.log('数据库连接失败');
  } else {
    console.log('数据库连接成功');
    //app.listen(3000)
    let server = app.listen(3000, '127.0.0.1', function (req, res) {
      // console.log(server.address());
      let host = server.address().address;
      let port = server.address().port;
      console.log('Example app listening at http://%s:%s', host, port);
    });
  }
});

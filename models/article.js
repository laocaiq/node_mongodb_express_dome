// const topic = require('./models/topic')
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ArtcleSchema = new Schema({
  plate_id:{        //板块id
    // 多表关联类型
    type: Schema.Types.ObjectId,
    // 需要关联的表名称
    ref : 'Topic'
  },
  title:{           //标题
    type:String,
    required:true
  },
  content:{           //内容
    type:String,
    required:true
  },
  browse:{           //浏览数
    type:Number,
    default:0
  },
  evaluationNub:{    //评论数
    type:Number,
    default:0
  },
  newtime:{           //创建时间
    type:Date,
    default: Date.now
  },
  founder:{           //创建人
    type:String,
    required:true
  },
  avatar:{            //头像
    type:String,
    default:'/public/img/avatar-max-img.png'
  }
})

module.exports = mongoose.model('Artcle',ArtcleSchema)

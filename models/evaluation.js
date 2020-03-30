const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const evaluationSchema = new Schema({
    Avatar:{        //评论人头像
        type:String,
        default:'/public/img/avatar-max-img.png'
    },
    nickname:{       //评论人昵称
        type:String,
        required:true
    },
    time:{           //评论时间
        type: Date,
        default: Date.now
    },
    content:{        //评论内容
        type:String,
        required:true
    },
    article_id:{
        // 多表关联类型
        type: Schema.Types.ObjectId,
        // 需要关联的表名称
        ref : 'Artcle'
    }
})

module.exports = mongoose.model('Evaluation',evaluationSchema)
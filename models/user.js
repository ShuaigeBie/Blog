var mongoose = require('mongoose')
var Schema = mongoose.Schema
mongoose.set('useFindAndModify', false)
mongoose.connect('mongodb://localhost:27017/test124', {useNewUrlParser: true, useUnifiedTopology: true});
var userSchema = new Schema({
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
    created_time:{
        type:Date,
        default:Date.now
    },
    last_modified_time:{
        type:Date,
        default:Date.now
    },
    avatar:{
        type:String,
        default:'/public/img/avatar-max-img.png'
    },
    bio:{
        type:String,
        default:''
    },
    gender:{
        type:Number,
        enum:[-1,0,1],
        default:-1
    },
    birthday:{
        type:String,
        default:''
    },
    status:{
        type:Number,
        //0没有权限限制 1不可以评论 2不可以登录
        enum:[0,1,2],
        default:0
    },
    comments:[
        
    
    ]
})

module.exports = mongoose.model('User',userSchema)
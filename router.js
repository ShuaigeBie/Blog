var express = require('express')
var User = require('./models/user')
var md5 = require('blueimp-md5')



var router = express.Router()


router.get('/',function(req,res){
    var arr = []
    // console.log('重定向后的数据')
    User.find(function(err,users){
        // console.log(users)
       
       users.forEach(function(e){
        //    console.log(e.comments)
          e.comments.forEach(function(comment,index){
            // console.log(comment)
            // console.log(comment,index)
                comment.index=index
                
                comment.id=e._id
                comment.nickname=e.nickname
                comment.avatar = e.avatar
            arr.push(comment)
           
          })
         
       })

      
    //    console.log(arr)
       var list = arr.sort(function(a,b){
           return a.create_date < b.create_date ? 1 : -1
       })
    //    console.log(list)
        res.render('index.html',{
            publish:list,
            users:users,
            user:req.session.user
         })
        // console.log(users)
    })
    // console.log(req.session.user)
   
})

router.get('/login',function(req,res){
    res.render('login.html')
})

router.post('/login',function(req,res){
    // console.log(req.body)
    var body = req.body
    User.findOne({
        email:body.email,
        password:md5(md5(body.password))
    },function(err,user){
        if(err){
            return res.status(500).json({
                err_code:500,
                message:err.message
            })
        }else if(!user){
            return res.status(200).json({
                err_code:1,
                message:'邮箱或者密码错误'
            })
        }else{
                req.session.user=user
                res.status(200).json({
                    err_code:0,
                    message:'ok'
                })
        }
    })

    
})

router.get('/register',function(req,res){
    res.render('register.html')
})

router.post('/register',function(req,res){
    // console.log(req.body)
    console.log('收到请求')
    var body = req.body

    User.findOne({
       $or:[
           {
               email:body.email
           },{
               nickname:body.nickname
           }
       ]
    },function(err,data){
        //json = send(JSON.stringfy())
        if(err){
            return res.status(500).json({
                err_code:500,
                message:'服务端错误'})
        }else if(data){
            return res.status(200).json({
                err_code:1,
                message:'邮箱或者昵称已存在'})
        }else{
            //对密码进行二次加密
            body.password = md5(md5(body.password))
            new User(body).save(function(err,user){
                if(err){
                    return res.status(500).json({
                        err_code:500,
                        message:'服务端错误'
                    })
                }else{
                    // console.log("==="+user)
                    req.session.user = user;
                    res.status(200).json({
                       err_code:0,
                       message:"ok"
                    })
                }
            })
            
        }
    })
})

router.get('/logout',function(req,res){
    //清楚cookic并重定向
   
    // console.log(req.session.user)
    req.session.user = null
    res.redirect('/login')
})


router.get('/settings/profile',function(req,res){
    // console.log("====12234234=")
    // console.log(req.session.user)
    res.render('./settings/profile.html',{
        user:req.session.user
    })
    
})

router.get('/settings/admin',function(req,res){
    res.render('./settings/admin.html',{
        user:req.session.user
    })
})

router.post('/settings/admin',function(req,res){
    // console.log(req.session.user.password)
    req.body.password=md5(md5(req.body.password))
    var id = req.session.user._id.replace(/"/g, '');
    if(md5(md5(req.body.cueerntPas))==req.session.user.password){
        User.findByIdAndUpdate(id,req.body,function(err,use){
            if(err){
                return res.status(500).json({
                    err_code:500,
                    message:'服务器错误,请稍后重试'
                })
            }else{
                return res.status(200).json({
                    err_code:0,
                    message:'修改成功'
                })
            }
        })
    }else{
        return res.status(200).json({
            err_code:1,
            message:'当前密码输入错误,请重新输入'
        })
    }
})

router.post('/settings/profile',function(req,res){
    // console.log(req.session.user)
    // console.log(req.body)
    var id = req.body.id.replace(/"/g, '');
    User.findByIdAndUpdate(id,req.body,function(err,users){
        if(err){
            // console.log("失败了")
            // console.log(err)
            return res.status(500).json({
                err_code:500,
                message:'服务端错误'
            })
        }else{
            User.findById(id,function(err,data){
       
                // console.log("这是更新后的数据")
                // console.log(data);
                req.session.user=data;


                res.status(200).json({
                    err_code:0,
                    message:"ok"
            })
          
               
             })
             
         }
        
           
        
    })

   
//    console.log(editValue)
//     req.session.user=editValue;
})

router.get('/topics/new',function(req,res){
    res.render('./topic/new.html',{
        user:req.session.user
    })
})


router.post('/topics/new',function(req,res){
    // console.log('收到请求')
    // console.log(req.session.user.comments)
    // console.log(req.body)
    User.findById(req.session.user._id,function(err,user){
        // console.log(user)
        req.body.reply=[]
        user.comments.push(req.body)
        // console.log(user.comments.indexOf(req.body))
        // var index = user.comments.indexOf(req.body)
        // user.comments[index].index = index
        // // console.log(user)
        user.save()
        // res.redirect('/')
        res.status(200).json({
            err_code:0,
            message:"ok"
    })
    })
})

router.get('/myshow',function(req,res){
    // console.log(req.session.user._id)
    User.findById(req.session.user._id,function(err,user){
        req.session.user=user
        res.render('./topic/myshow.html',{
            user:req.session.user,
            list:req.session.user.comments
        })
    })
   
})

router.get('/showContent',function(req,res){
    var id = req.query.id.replace(/"/g, '');
    var index =req.query.index;
    // console.log(id)
    User.findById(id,function(err,user){
        user.comments[index].id=id
        user.comments[index].index=index
        // console.log(user.comments);
        res.render('./topic/show.html',{
        publish:user.comments[index],
        user:req.session.user,
        reply:user.comments[index].reply
    })
    })
    // console.log(JSON.parse(req.query.value))
    
    
})

router.get('/delete',function(req,res){
    var id = req.query.id.replace(/"/g, '');
    User.findByIdAndRemove(id,function(err,data){
        if(err){
            return res.status(500).json({
                err_code:500,
                message:'服务端错误'
            })
        }else{
            console.log('删除成功')
            
            // console.log(req.session.user)
            // console.log(req.session.user._id == id)
            if(id == req.session.user._id){
                console.log('666')
                req.session.user = null
                res.redirect('/login')
            }else{
                res.redirect('/')
            }
        }
    })
})

router.post('/avatar',function(req,res){
    User.findByIdAndUpdate(req.session.user._id,req.body,function(err,user){
        if(err){
            throw err
        }else{
            User.findById(req.session.user._id,function(err,data){
       
                // console.log("这是更新后的数据")
                // console.log(data);
                req.session.user=data;
                


                res.status(200).json({
                    err_code:0,
                    message:"ok"
            })

                
          
               
             })
            
        }
    })

   
})

router.get('/deleteMyShow',function(req,res){
    // console.log('收到请求')
   
    var id = req.query.id.replace(/"/g, '');
    // console.log(id)
    User.findById(id,function(err,user){
        // console.log(user.comments)
        user.comments.splice(req.query.index,1)
        user.save();
        res.redirect('/myshow')
    })
})

router.post('/reply',function(req,res){
    // console.log('收到请求le')
    // console.log(req.body.id)
    // console.log(req.session.user._id)
    var list = {
        nickname:req.body.nickname,
        create_date:req.body.create_date,
        content:req.body.content
    }
    // console.log(req.body)
    User.findById(req.body.id,function(err,user){
       
    //    console.log(user.comments[req.body.index])
       user.comments[req.body.index].reply.unshift(list)
       user.markModified('comments')
       console.log(user.comments[req.body.index].reply)
      
      user.save();
      res.status(200).json({
        err_code:0,
        message:"ok"
})
      
    })

})


router.get('/deleteReply',function(req,res){
    // console.log('收到请求了')
    // console.log(req.query)
    User.findById(req.query.id,function(errr,user){
        
        
        user.comments[req.query.replyIndex].reply.splice(req.query.index,1)
        user.markModified('comments')
        user.save();

       res.redirect('/showContent?id="'+req.query.id+'"&index='+req.query.replyIndex)

    
    })
})

// router.get('/serach',function(req,res){
//     console.log()
//     // var reg= new RegExp('w','i')

//     // User.find({$or:[{nickname:{$regex:reg}}]},function(err,user){
//     //     console.log(user)
//     // })
//     var reg= new RegExp('a','i')
//     // User.find(function(err,user){
//     //     // console.log(user[0])
//     // })

//     //  User.find({'comments.title':'Web'},{'comments':{$elemMatch:{'title':'Web'}}},function(err,data){
//     //    console.log(data[0].comments)
//     //  })
//       User.aggregate([{'$unwind':'$comments'},{'$match':{'comments.title':{$regex:reg}}},{'$project':{'comments':1,'gender':1}}],function(err,datas){
//           console.log(datas);
//       })
    
    



// })
router.get('/search',function(req,res){
    // console.log('收到请求了')
    // console.log(req.query)
    var reg= new RegExp(req.query.data,'i')
    
    User.aggregate([{'$unwind':'$comments'},{'$match':{'comments.title':{$regex:reg}}},{'$project':{'comments':1,'nickname':1}}],function(err,datas){
       datas.forEach(e =>{
            User.findById(e._id,function(err,user){
                var index = user.comments.map(item => item.title).indexOf(e.comments.title)
                
                e.comments.index=index
                
                if(datas.length-1 ==datas.indexOf(e) ){
                    // console.log(datas)
                    res.render('./topic/serachResult.html',{
                        searchResult:datas,
                        user:req.session.user
                    })
                }
               
            })

            
            
            })
           
        // console.log(datas)
           
        
    
            
        })
       
        
    
})


module.exports = router
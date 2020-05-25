var express = require('express')
var path = require('path')
var router = require('./router')
var bodyParser = require('body-parser')
var session = require('express-session')

var app = express()

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Content-type');
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS,PATCH");
    res.header('Access-Control-Max-Age',1728000);//预请求缓存20天
    next();  
});

//path.join路径拼接
app.use('/public/',express.static(path.join(__dirname,'./public/')))
app.use('/node_modules/',express.static(path.join(__dirname,'./node_modules/')))

app.engine('html',require('express-art-template'))
app.set('views',path.join(__dirname,'/views'))

//添加session数据：req.session.foo='bar'
//访问session数据：req.session.foo
app.use(session({
    secret:'keyboard cat',//配置加密字符串，在原来的加密基础上和这个字符串拼接
    resave:false,
    saveUninitialized:true//无论是否使用，都会分配一个session
}))

//配置解析表单Post请求体插件
app.use(bodyParser.urlencoded({limit: '50mb', extended: false }))
app.use(bodyParser.json({limit: '50mb'}))


app.use(router)

app.listen(3000,function(){
    console.log('running')
})


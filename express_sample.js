/*


const express= require('express')
const path=require('path')
const app=express()

//midlleware works whenever a req arrives
app.use((req,res,next)=>{
    console.log('START')
    next()
})


app.get('/signup',function(req,res){

    res.sendFile(path.join(__dirname,'signup.html'))
   // res.send('Welcome')
    console.log('MIDLLE')
   // next()
})



/*
app.use((req,res)=>
{
    console.log('END')
})

*/


/*
app.post('/signup',(req,res)=>
{
    res.send('got it')
})



app.listen(4000,function(){
    console.log('Server started!')
    //console.log(__dirname)
})

*/




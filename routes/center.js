var express = require('express');
const { response } = require('../app');
//const { response } = require('express');

var router = express.Router();
var itemHelpers = require('../helpers/item-helpers')
const userHelpers = require('../helpers/user-helpers')




//verify center login status

const verifyCenterLogin = (req,res,next)=>{
  if(req.session.centerLoggedIn){
    next()
  }
  else{
    res.redirect('/center-login')
  }
}




//=======INDEX PAGE======
/* GET users listing. */

router.get('/center-index',verifyCenterLogin, function(req, res, next) {
  let centerDetails = req.session.center

//  console.log(center)

  //to show items fetched from DB
  userHelpers.getMyAddedItems(centerDetails._id).then((items)=>{

  res.render('center/center-index',{center:true,items,centerDetails})

})

});

router.get('/',verifyCenterLogin,  function(req, res, next) {
  //to show items fetched from DB

  let centerDetails = req.session.center


  userHelpers.getMyAddedItems(centerDetails._id).then((items)=>{

    res.render('center/center-index',{center:true,items,centerDetails})
  
  })

}); 




//===============CENTER LOGIN STARTS=============


//login page center
router.get('/center-login',(req,res)=>
{

  if(req.session.centerLoggedIn){
    //console.log("LoggeIN")
    res.redirect('/center/center-index')
  }
  else{
  res.render('center/center-login',{ls:true,"loginErr":req.session.loginErr})
  req.session.loginErr = false

//  res.render('users/login',{ls:true,"loginErr":req.session.loginErr})
  }
});


//center signup
router.get('/center-signup',(req,res)=>
{
  res.render('center/center-signup',{ls:true})
})



//signup form center data
router.post('/center-signup',async(req,res)=>{

 // console.log(req.body)


 await userHelpers.doCenterSignup(req.body).then((response)=>{
    
    console.log(response);


    let centerIdCard = req.files.idCard;
      centerIdCard.mv('./public/images/people/centers/idCards/'+response+'.pdf', (err,data)=>{
        if(!err){

          let certificate = req.files.certificate;
          certificate.mv('./public/images/people/centers/certificates/'+response+'.pdf', (err,data)=>{
            if(!err){
                    
              req.session.center = response
              req.session.centerLoggedIn = true
          
             // res.redirect('/center/center-index')
                  res.render('center/thank-you',{ls:true})  
            }
            else{
              console.log(err);
            }
          })


        //res.render('thank-you')  
        }
        else{
          console.log(err);
        }
      })


    // req.session.center = response
    // req.session.centerLoggedIn = true

    // res.redirect('/center/center-index')

  })

})


//Login Submit
router.post('/center-login',(req,res)=>{

  console.log("testttt")
  console.log(req.body)

  userHelpers.doCenterLogin(req.body).then((response)=>{
    if(response.status){
      req.session.center = response.center
      req.session.centerLoggedIn = true
      res.redirect('/center/center-index')
    }
    else{
      req.session.loginErr = true
      res.redirect('/center-login')
    }

  })
})


//logout
router.get('/center-logout',(req,res)=>
{
  req.session.center=null
  req.session.centerLoggedIn = false
  res.redirect('/center-login')
})


//===============Center LOGIN ENDS=============

//ROUTE FOR SINGLE ITEM NAVIAGTION

router.get('/center-sitem/:id',verifyCenterLogin,async (req,res)=>{
 // let centerDetails = req.session.center

    let singleitem = await itemHelpers.getItemDetails(req.params.id)
    //console.log(singleitem);
    res.render('center/center-sitem',{center:true,singleitem,centerDetails:req.session.center})
  
});




router.get('/center-addwork',verifyCenterLogin, (req,res)=>
{
  console.log(req.session.center)

  let centerDetails = req.session.center;

  res.render('center/center-addwork',{center:true, centerDetails})

})



//to read form items
//NOTE : USE MULTER FOR MULTIPLE FILE UPLOADS!!!
router.post('/center-addwork',verifyCenterLogin,(req,res)=>
{
  console.log(req.body);
  console.log(req.files.image);

  itemHelpers.addItem(req.body,(id)=>{

      let image1 = req.files.image1
      //moving image1 to the folder
      image1.mv('./public/images/workImages/'+id+1+'.png',(err,done)=>{

        if(!err){


          let image2 = req.files.image2
          //moving image to the folder
          image2.mv('./public/images/workImages/'+id+2+'.png',(err,done)=>{
            if(!err){
    
              let image3 = req.files.image3
              //moving image to the folder
              image3.mv('./public/images/workImages/'+id+3+'.png',(err,done)=>{
        
                if(!err){
        
                  let image4 = req.files.image4
                  //moving image to the folder
                  image4.mv('./public/images/workImages/'+id+4+'.png',(err,done)=>{
            
                    if(!err){
            
                         res.redirect("/center/center-index")      
                    }
                    else{
                      console.log(err);
                    }
            
                  })
                
                 // res.redirect("/center/center-index")      
                }
                else{
                  console.log(err);
                }
        
              })
            

              //res.redirect("/center/center-index")      
            }
            else{
              console.log(err);
            }
          })
        

         // res.redirect("/center/center-index")      
        }
        else{
          console.log(err);
        }

      })
    })

});

//delete item routes
router.get('/center-delete-item/:id',verifyCenterLogin,(req,res)=>{

  //getting id of item to be deleted
  let itemId = req.params.id

  itemHelpers.deleteItem(itemId).then((response)=>{
    res.redirect('/center/center-index')
  })

});

//edit item routes

router.get('/center-edit-item/:id',verifyCenterLogin ,async (req,res)=>{

  //let itemId = req.query.id
  console.log(req.params.id)
  let item = await itemHelpers.getItemDetails(req.params.id)
  console.log(item);
  res.render('center/center-edit-item',{center:true,item, centerDetails:req.session.center})

})

//edit updates
router.post('/center-edit-item/:id',verifyCenterLogin, (req,res)=>{
  console.log(req.params.id);
  itemHelpers.updateItem(req.params.id,req.body).then(()=>{

    res.redirect('/center/')

    if(req.files.image){

            //moving image to the folder
           let image = req.files.image
            image.mv('./public/images/workImages/'+req.params.id+'.png')

    }

  })
})



//=======INDEX PAGE ENDS======





//=================APPOINTMENTS PAGE STARTS===============

router.get('/center-appointments',verifyCenterLogin,async(req,res)=>
{
  let centerId = req.session.center._id
  
  let myItems = await userHelpers.getMyAddedItems(centerId)


  console.log(myItems[0])

  var itemIdArray = []

  for (var j = 0; j < myItems.length; j++){
    itemIdArray.push(myItems[j]._id);
    //console.log(myItems[j]._id)
  }



   let bookings = await userHelpers.getMyUserBookings(itemIdArray)
   //let total = await userHelpers.getTotalAmount(req.session.user._id)
//   console.log("booking"+bookings)
   res.render('center/center-appointments',{center:true,bookings,centerDetails:req.session.center})
})



//change work status
router.get('/change-work-status/:id', verifyCenterLogin, (req,res) =>{
  //console.log("heloooooo")
  let itemId = req.params.id
  itemHelpers.changeWorkStatus((itemId)).then(()=>{
    //console.log("heloooooo")
    
    res.redirect('/center/center-appointments')

  })

});




//Delete Appointment
router.get('/delete-appointment/:id',verifyCenterLogin, (req,res) =>{
  let itemId = req.params.id
  itemHelpers.deleteAppointment((itemId)).then(()=>{
    //console.log("heloooooo")
    
    res.redirect('/center/center-appointments')

  })

});




router.get('/change-appointment-date/:id', verifyCenterLogin, async (req,res) =>{

  let item = await itemHelpers.getOrderDetails(req.params.id)

    //console.log("Here!!!")
      //console.log(item)
    res.render('center/center-change-appointment-date',{center:true,item, centerDetails:req.session.center})

})


router.post('/center-change-appointment-date/:id', verifyCenterLogin, async (req,res) =>{

  //let item = await itemHelpers.getOrderDetails(req.params.id)

  console.log(req.params.id)
  console.log(req.body.prefdate)

  itemHelpers.changeAppointmentDate(req.params.id,req.body.prefdate).then(()=>{

    console.log(req.body.prefdate)
    req.session.appointmentStatus = true

    res.redirect('/center/center-appointments')

  })


})


//=================APPOINTMENTS PAGE ENDS===============



//=================BLOG PAGE STARTS===============

router.get('/center-blog',verifyCenterLogin, (req,res)=>
  res.render('center/center-blog',{center:true, centerDetails:req.session.center})
);

//================BLOG PAGE ENDS===============


//=================ABOUT PAGE STARTS===============
router.get('/center-about',verifyCenterLogin, (req,res)=>
  res.render('center/center-about',{center:true, centerDetails:req.session.center})
);

//================ABOUT PAGE ENDS===============


//=================CONTACT PAGE STARTS===============
router.get('/center-contact',verifyCenterLogin, (req,res)=>
  res.render('center/center-contact',{center:true, centerDetails:req.session.center})
);

//================CONTACT PAGE ENDS===============


//=================PROFILE PAGE STARTS===============
router.get('/center-profile',verifyCenterLogin, (req,res)=>
  res.render('center/center-profile',{center:true, centerDetails:req.session.center})
);


//Update Profile
router.post('/center-update-profile',verifyCenterLogin,async (req,res)=>{

  await userHelpers.updateCenterProfile(req.body).then((resolve)=>{
    res.redirect('/center/center-profile')
  })

});





//================PROFILE PAGE ENDS===============



//END OF FILE
module.exports = router;
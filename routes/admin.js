var express = require('express');
var router = express.Router();

const itemHelpers = require('../helpers/item-helpers')
const userHelpers = require('../helpers/user-helpers')


const verifyAdminLogin = (req,res,next)=>{
  if(req.session.adminLoggedIn){
    next()
  }
  else{
    res.redirect('/admin-login')
  }
}




//===============Admin LOGIN STARTS=============


//login page center
router.get('/admin-login',(req,res)=>
{

  if(req.session.adminLoggedIn){
    
    res.redirect('/admin/admin-home')
  }
  else{
  res.render('admin/admin-login',{ls:true,"loginErr":req.session.loginErr})
  req.session.loginErr = false

  }
});





//signup form center data ONE TIME ONLY
router.get('/admin-signup',(req,res)=>{

console.log("Admin Here")

 let adminData = {Name:"Admin", email:"admin@welltour.in", password:"admin"}; 

  userHelpers.doAdminSignup(adminData).then((response)=>{
    
  //  console.log(response);

  })

})



//Login Submit
router.post('/admin-login',(req,res)=>{

  console.log(req.body)

  userHelpers.doAdminLogin(req.body).then((response)=>{
    if(response.status){
      req.session.admin = response.center
      req.session.adminLoggedIn = true
      res.redirect('/admin/admin-home')
    }
    else{
      req.session.loginErr = true
      res.redirect('/admin/admin-login')
    }

  })
})


//logout
router.get('/admin-logout',(req,res)=>
{
  req.session.admin=null
  req.session.adminLoggedIn = false
  res.redirect('/admin-login')
})


//===============Admin LOGIN ENDS=============



/* GET users listing. */
router.get('/',verifyAdminLogin, function(req, res, next) {
  res.render('admin/admin-home',{admin:true});
});

router.get('/admin-home',(req,res,next)=>
{
  res.render('admin/admin-home',{admin:true})
})

//========ALL ITEMS PAGE========
router.get('/admin-all-items',verifyAdminLogin, (req,res,next)=>
{

  itemHelpers.getWorkItems().then((items) =>{

    res.render('admin/admin-all-items',{admin:true,items})

  })

});




//========CENTERS PAGE========

//Center Verificatiom
router.get('/admin-center-verification',verifyAdminLogin, (req,res,next)=>
{

  itemHelpers.getAllCentersForVerification().then((items) =>{

    res.render('admin/admin-center-verification',{admin:true,items})

  })

});

//Verify Center
router.get('/admin-approve-center/:id',verifyAdminLogin, (req,res)=>{

  //getting id of item to be deleted
  let itemId = req.params.id

  itemHelpers.verifyCenter(itemId).then((response)=>{
    res.redirect('/admin/admin-center-verification')
  })

});



//Verified Centers
router.get('/admin-centers',verifyAdminLogin,(req,res,next)=>
{

  itemHelpers.getAllVerifiedCenters().then((items) =>{
  //  console.log(items)
    res.render('admin/admin-centers',{admin:true,items})

  })

});


router.get('/admin-delete-center/:id',verifyAdminLogin, (req,res)=>{

  //getting id of item to be deleted
  let itemId = req.params.id

  itemHelpers.deleteCenter(itemId).then((response)=>{
    res.redirect('/admin/admin-centers')
  })

});



//========CUSTOMERS PAGE========
router.get('/admin-customers',verifyAdminLogin, (req,res,next)=>
{

  itemHelpers.getAllCustomers().then((customers) =>{
     //console.log(customers)
      res.render('admin/admin-customers',{admin:true,customers})
  
    })
  
})

//Delete Customer
router.get('/admin-delete-customer/:id',verifyAdminLogin, (req,res)=>{

  //getting id of item to be deleted
  let itemId = req.params.id

  itemHelpers.deleteCustomer(itemId).then((response)=>{
    res.redirect('/admin/admin-customers')
  })

});




//========ALL ITEMS PAGE========
router.get('/admin-all-items',verifyAdminLogin, (req,res,next)=>
{
  res.render('admin/admin-all-items',{admin:true})
})

//delete item routes
router.get('/admin-delete-item/:id',verifyAdminLogin, (req,res)=>{

  //getting id of item to be deleted
  let itemId = req.params.id

  itemHelpers.deleteItem(itemId).then((response)=>{
    res.redirect('/admin/admin-all-items')
  })

});






//========ABOUT PAGE========
router.get('/admin-about',(req,res,next)=>
{
  res.render('admin/admin-about',{admin:true})
})





//========CONTACT PAGE========
router.get('/admin-contact',(req,res,next)=>
{
  res.render('admin/admin-contact',{admin:true})
})

//========PROFILE PAGE========
router.get('/admin-profile',(req,res,next)=>
{
  res.render('admin/admin-profile',{admin:true})
})



//EOF
module.exports = router;
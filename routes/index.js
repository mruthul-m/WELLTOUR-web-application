const { response } = require('express');
var express = require('express');
var router = express.Router();
const itemHelpers = require('../helpers/item-helpers')
const userHelpers = require('../helpers/user-helpers')


//verfity login status

const verifyLogin = (req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }
  else{
    res.redirect('/login')
  }
}


//=============INDEX PAGE STARTS============

/* GET home page. */
router.get('/',verifyLogin, async function(req, res, next) {

  let user = req.session.user
  let cartCount = 0

  if(req.session.user){
   cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  
  itemHelpers.getWorkItems().then((items)=>{
  res.render('users/user-index',{user:true,items,user,cartCount})
  })
});


//ROUTES FOR USER NAV PANEL BEGINS

//NOT OPTIMIZED , CONTAINS SUSPICIOUS SNIPPETS!!

/* GET home page. */
router.get('/index', verifyLogin, async function(req, res, next) {

  let user = req.session.user
  let cartCount = 0

  if(req.session.user){
   cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  
  itemHelpers.getWorkItems().then((items)=>{
  res.render('users/user-index',{user:true,items,user,cartCount})
  })
});



//=============INDEX PAGE ENDS============




//===============LOGIN STARTS=============

//login page user
router.get('/login',(req,res)=>
{

  if(req.session.userLoggedIn){
    res.redirect('/')
  }
  else{
  res.render('users/login',{ls:true,"loginErr":req.session.loginErr})
  req.session.loginErr = false

//  res.render('users/login',{ls:true,"loginErr":req.session.loginErr})
  }
});


//user signup
router.get('/user-signup',(req,res)=>
{
  res.render('users/user-signup',{ls:true})
})



//center
router.get('/center-signup',(req,res)=>
{
  res.render('center/center-signup',{ls:true})
})
router.get('/center-login',(req,res)=>
{
  res.render('center/center-login',{ls:true})
})
//center

//Admin Login
// router.get('/admin-signup',(req,res)=>
// {
//   res.render('center/center-signup',{ls:true})
// })

router.get('/admin-login',(req,res)=>
{
  res.render('admin/admin-login',{ls:true})
})
//Admin Login




//signup form data
router.post('/user-signup',(req,res)=>{

  userHelpers.doSignup(req.body).then((response)=>{
   // console.log(response);

    //req.session.user = response
    //req.session.userLoggedIn = true

    res.redirect('/login')

  })

})


//Login Submit
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    }
    else{
      req.session.loginErr = true
      res.redirect('/login')
    }

  })
})


//logout
router.get('/logout',(req,res)=>
{
  req.session.user=null
  req.session.userLoggedIn = false
  res.redirect('/login')
})



//===============LOGIN ENDS=============


//============= CART PAGE STARTS=============


//cart navigation
router.get('/user-cart',verifyLogin,async (req,res)=>{

  let items =await userHelpers.getCartItems(req.session.user._id)
  let totalAmount=0
  if(items.length>0)
  {
   totalAmount = await userHelpers.getTotalAmount(req.session.user._id)
  }
 // console.log(items);
  res.render('users/user-cart',{user:true,items,user:req.session.user,totalAmount})
});




router.get('/user-add-to-cart/:id',verifyLogin, async (req,res)=>{
  


await itemHelpers.getItemDetails(req.params.id).then((itemData)=>{

//console.log("api call");
userHelpers.addToCart(req.params.id,req.session.user._id, itemData.centerId, itemData.centerName).then(()=>{
  //res.render('users/user-cart',{user:true,items})
// res.redirect('/')
res.json({status:true})

})

});

 // res.render('users/user-cart',{user:true,items})
})

//simplify the code into single snippet





//change item day count
router.post('/change-item-day-count',(req,res,next)=>{
  userHelpers.changeDayCount(req.body).then(async(response)=>{
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
    
  })
})



//remove item from cart
router.post('/remove-item-from-cart',(req,res,next)=>{
  userHelpers.removeItemFromCart(req.body).then((response)=>{


    res.json(response)
    
  })
})

//============= CART PAGE ENDS==============








/* GET USER EXPLORE PAGE . */
router.get('/user-explore', async function(req, res, next) {

  let user = req.session.user
  let cartCount = 0

  if(req.session.user){
   cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  
  itemHelpers.getWorkItems().then((items)=>{
  res.render('users/user-explore',{user:true,items,user,cartCount})
  })
});








//GET ABOUT PAGE
router.get('/user-about',verifyLogin,async(req,res)=>
{
  let cartCount = 0
  if(req.session.user){
      cartCount = await userHelpers.getCartCount(req.session.user._id)
  }

  res.render('users/user-about',{user:true,user:req.session.user,cartCount})
})


//GET CONTACT PAGE
router.get('/user-contact',verifyLogin,async(req,res)=>
{
  let cartCount = 0
  if(req.session.user){
      cartCount = await userHelpers.getCartCount(req.session.user._id)
  }

  res.render('users/user-contact',{user:true,user:req.session.user,cartCount})
})


//GET PROFILE PAGE
router.get('/user-profile',verifyLogin,async(req,res)=>
{

  let cartCount = 0
  if(req.session.user){
      cartCount = await userHelpers.getCartCount(req.session.user._id)
  }

  res.render('users/user-profile',{user:true,user:req.session.user,cartCount})
})


//Update User Profile
router.post('/user-update-profile',verifyLogin,async (req,res)=>{

  //let userId = req.body.userId;
//  console.log(req.body)
  await userHelpers.updateUserProfile(req.body).then((resolve)=>{
    res.redirect('/user-profile')
  })

})








//ROUTE FOR SINGLE ITEM NAVIAGTION

router.get('/user-sitem/:id',verifyLogin,async (req,res)=>{

  
    let cartCount = 0
    if(req.session.user){
        cartCount = await userHelpers.getCartCount(req.session.user._id)
    }
  
  
    let singleitem = await itemHelpers.getItemDetails(req.params.id)
    //console.log(singleitem);
    res.render('users/user-sitem',{user:true,singleitem,user:req.session.user,cartCount})
  
  })
  
//USER NAV PANEL ROUTES ENDS HERE!




//GET CHECKOUT PAGE //OR BOOK APPOINTMENT
router.get('/user-checkout',verifyLogin,async(req,res)=>
{

  let cartCount = 0
  if(req.session.user){
      cartCount = await userHelpers.getCartCount(req.session.user._id)
  }

  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('users/user-checkout',{user:true,total,user:req.session.user,cartCount})
})

router.post('/user-book-appointment',async(req,res)=>{

    let items = await userHelpers.getCartItemList(req.body.userId)
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
    userHelpers.bookAppointment(req.body,items,totalPrice).then((bookingId)=>{

      if(req.body['payment-method']==='CIH')
        {
          res.json({cihSuccess:true})
        }
      else{
        userHelpers.generateRazorpay(bookingId,totalPrice).then((response)=>{
          res.json(response)
        })
      }  

    })
   // console.log(req.body);
})





//VIEW APPOINTMENTS

router.get('/user-view-appointments',verifyLogin,async(req,res)=>
{



  let cartCount = 0
  if(req.session.user){
      cartCount = await userHelpers.getCartCount(req.session.user._id)
  }

  let bookings = await userHelpers.getUserBookings(req.session.user._id)
  //let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('users/user-view-appointments',{user:true,user:req.session.user,bookings,cartCount,appointmentStatus: req.session.appointmentStatus})

  req.session.appointmentStatus = false

})


//VIEW BOOKING ITEMS
router.get('/user-view-appointments-items/:id',verifyLogin,async(req,res)=>
{

  let cartCount = 0
  if(req.session.user){
      cartCount = await userHelpers.getCartCount(req.session.user._id)
  }

  //let bookings = await userHelpers.getUserBookings(req.session.user._id)
  //let total = await userHelpers.getTotalAmount(req.session.user._id)
  let bookingItems = await userHelpers.getBookingItems(req.params.id)
  //console.log(items)
  res.render('users/user-view-booked-items',{user:true,user:req.session.user,bookingItems,cartCount})
})


//verify payment

router.post('/verify-payment',(req,res)=>{
  console.log(req.body);

  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log("Payment Successfull");
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:''})
  })


});




//END OF FILE
module.exports = router;
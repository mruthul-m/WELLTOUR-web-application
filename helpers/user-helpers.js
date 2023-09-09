var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('../app')
var objectId = require('mongodb').ObjectId


//razorpay
const Razorpay= require('razorpay')

var instance = new Razorpay({
    key_id: 'rzp_test_ZckCUeMI40mXjV',
    key_secret: '3PtsbG643CJotGXW56q0rGtF',
});


module.exports={

    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.password = await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data.insertedId)
            })
        })
    },
    
    //login verification for user
    doLogin:(userData)=>{
        return new Promise (async (resolve,reject)=>{

            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})

            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log("success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    }
                    else{
                        console.log("fail")
                        resolve({status:false})
                    }
                })
            }
            else{
                console.log("failed");
                resolve({status:false})
            }
        })
    },

//=============CENTER=========================

doCenterSignup:(centerData)=>{
    return new Promise(async(resolve,reject)=>{
        centerData.password = await bcrypt.hash(centerData.password,10)
        db.get().collection(collection.CENTER_COLLECTION).insertOne(centerData).then((data)=>{

            resolve(data.insertedId)
        })
    })
},

//login verification for user
doCenterLogin:(centerData)=>{
    return new Promise (async (resolve,reject)=>{

        let loginStatus = false
        let response = {}
        let center = await db.get().collection(collection.CENTER_COLLECTION).findOne({email:centerData.email, status:"Verified"})


        if(center){
            bcrypt.compare(centerData.password,center.password).then((status)=>{
                if(status){
                    console.log("success");
                    response.center = center
                    response.status = true
                    resolve(response)
                }
                else{
                    console.log("fail")
                    resolve({status:false})
                }
            })
        }
        else{
            console.log("failed");
            resolve({status:false})
        }
    })
},

//=================CENTER ENDS===================


//======ADMIN

//One Time 
doAdminSignup:(adminData)=>{
    return new Promise(async(resolve,reject)=>{
        adminData.password = await bcrypt.hash(adminData.password,10)
        db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data)=>{
            resolve(data.insertedId)
        })
    })
},

//login verification 
doAdminLogin:(adminData)=>{
    return new Promise (async (resolve,reject)=>{

        let loginStatus = false
        let response = {}
        let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email})

        if(admin){
            bcrypt.compare(adminData.password,admin.password).then((status)=>{
                if(status){
                    console.log("success");
                    response.admin = admin
                    response.status = true
                    resolve(response)
                }
                else{
                    console.log("fail")
                    resolve({status:false})
                }
            })
        }
        else{
            console.log("failed");
            resolve({status:false})
        }
    })
},

//=====ADMIN



    //add to cart
    addToCart:(itemId,userId)=>{

        let itemObj ={
            singleitem:objectId(itemId),
            days:1
        }

        return new Promise(async (resolve,reject)=>{
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user:objectId(userId) })
            if(userCart){
                let itemExist = userCart.items.findIndex(item=> item.singleitem==itemId)
                console.log(itemExist);

                if(itemExist!=-1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({'items.singleitem':objectId(itemId),user:objectId(userId)},
                    {
                        $inc:{'items.$.days':1}
                    }
                    ).then(()=>{
                        resolve()
                    }
                    )
                }else{

                 db.get().collection(collection.CART_COLLECTION)
                 .updateOne({user:objectId(userId)},
                 {
                     $push:{items:itemObj}  
                }
                
             ).then((response)=>{
                 resolve()
             })
          
        }
        }else{
                let cartObj={
                    user:objectId(userId),
                    items:[itemObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{

                    resolve()
                })
            }
        })
    },


    //get cart items
    getCartItems:(userId)=>{
        return new Promise(async (resolve,reject)=>{
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([

                {
                    $match : {user:objectId(userId)}
                },
                {
                    $unwind:{path:'$items'}
                },
                {
                    $project:{
                        singleitem:'$items.singleitem',
                        days:'$items.days'
                    }
                },
                {
                    $lookup:{
                        from:collection.ITEM_COLLECTION,
                        localField:'singleitem',
                        foreignField:'_id',
                        as:'singleitem'
                      }
                },
                {
                    $project:{
                        singleitem:1,days:1,singleitem:{$arrayElemAt:['$singleitem',0]}
                    }
                }

            ]).toArray()
            //console.log(cartItems[0].items);
            resolve(cartItems)
        })
    },


    //get cart count on badge
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if (cart)
            {
                count = cart.items.length
            }
            resolve(count)
        })
    },


    //change day count at cart page,auto removal when count is zero
    changeDayCount:(details)=>{

        details.count=parseInt(details.count)
        details.days = parseInt(details.days)

        return new Promise((resolve,reject)=>{

            if(details.count==-1 && details.days==1){

                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({_id:objectId(details.cart)},
                    {
                        $pull:{items:{singleitem:objectId(details.singleitem)}}
                    }
                    ).then((response)=>{
                        resolve({removeItem:true})
                    })
            }
            else{
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart),'items.singleitem':objectId(details.singleitem)},
                {
                    $inc:{'items.$.days':details.count}
                }
                ).then((response)=>{
                    resolve({status:true})
                })
            }

        })
    },


//remove item from cart
    removeItemFromCart:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart)},
            {
                $pull:{items:{singleitem:objectId(details.singleitem)}}
            }
            ).then((response)=>{
                resolve({removeItem:true})
            })
        })
    },


    getTotalAmount:(userId)=>{

        return new Promise(async (resolve,reject)=>{
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([

                {
                    $match : {user:objectId(userId)}
                },
                {
                    $unwind:{path:'$items'}
                },
                {
                    $project:{
                        singleitem:'$items.singleitem',
                        days:'$items.days'
                    }
                },
                {
                    $lookup:{
                        from:collection.ITEM_COLLECTION,
                        localField:'singleitem',
                        foreignField:'_id',
                        as:'singleitem'
                      }
                },
                {
                    $project:{
                        singleitem:1,days:1,singleitem:{$arrayElemAt:['$singleitem',0]}
                    }
                },
                {
                    $group :
                    {
                        _id:null,
                        total:{ $sum: {$multiply:['$days',{$toInt: '$singleitem.cost'} ]}  },
                       // count:{$sum:1}

                    }
                }

            ]).toArray()
            

           if (total[0]){
           resolve(total[0].total)
           }

        })
    },

    bookAppointment:(appointment,items,total)=>{

        return new Promise((resolve,reject)=>{
            console.log(appointment,items,total);
            let status = appointment['payment-method'] === 'CIH'?'booked':'pending'
            let appointmentObject={
                billingDetails:{
                    name:appointment.name,
                    mobile:appointment['mobile-number'],
                    address:appointment.address,
                    email:appointment.email,
                    prefdate:appointment['pref-date']
                },
                userId:new objectId(appointment.userId),
                paymentMethod:appointment['payment-method'],
                items:items,
                totalAmount:total,
                status:status,
                date:new Date()
            }

            db.get().collection(collection.APPOINTMENT_COLLECTION).insertOne(appointmentObject).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(appointment.userId)})
                
                
                resolve(response.insertedId)
                //req.body,(insertedId)
            })

        })

    },

    getCartItemList:(userId)=>{
        return new Promise (async(resolve,reject)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            console.log(cart);
            
            
            resolve(cart.items)
            

        })
    },

    getUserBookings:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(userId);
            let bookings = await db.get().collection(collection.APPOINTMENT_COLLECTION)
                    .find({ userId:objectId(userId) }).toArray()
                    console.log(bookings);
                    resolve(bookings)
        })
    },

    getBookingItems:(bookingId)=>{
        return new Promise (async(resolve,reject)=>{
            let bookingItems = await db.get().collection(collection.APPOINTMENT_COLLECTION).aggregate([

                {
                    $match : {_id:objectId(bookingId)}
                },
                {
                    $unwind:{path:'$items'}
                },
                {
                    $project:{
                        singleitem:'$items.singleitem',
                        days:'$items.days'
                    }
                },
                {
                    $lookup:{
                        from:collection.ITEM_COLLECTION,
                        localField:'singleitem',
                        foreignField:'_id',
                        as:'singleitem'
                      }
                },
                {
                    $project:{
                        singleitem:1,days:1,singleitem:{$arrayElemAt:['$singleitem',0]}
                    }
                }

            ]).toArray()
            console.log(bookingItems)
            resolve(bookingItems)
          
            
        })
    },

    generateRazorpay:(bookingId,total)=>{
        return new Promise((resolve,reject)=>{


            // instance.orders.create({
            //     amount: total,
            //     currency: "INR",
            //     receipt: bookingId,
            //     notes: {
            //       key1: "value3",
            //       key2: "value2"
            //     }
            //   })


              var options = {
                amount: total*100,
                currency: "INR",
                receipt: ""+bookingId,
              };
              instance.orders.create(options, function(err, order) {

                if(err){
                    console.log(err);
                }
                else{
                console.log("NEW ORDER:",order);
                resolve(order)
                }
              });


        })
    },

    //verifypayment

    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256','3PtsbG643CJotGXW56q0rGtF');

            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')

            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }
            else{
                reject()
            }
        })
    },


    changePaymentStatus:(bookingId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.APPOINTMENT_COLLECTION)
            .updateOne({_id:objectId(bookingId)},
            {
                $set:{
                    status:'Booked'
                }
            }
            ).then(()=>{
                resolve()
            })
        })
    },



    //to list item filtered 
    getMyAddedItems:(centerId)=>
    {
       // console.log(workerId)
        return new Promise(async(resolve,reject)=>{

            let items = await db.get().collection(collection.ITEM_COLLECTION)
            .find({centerId : centerId}).toArray()
           
            //console.log(items)
            resolve(items)

        })
    },


    getMyUserBookings:(itemIdArray)=>{

        var oids = [];
        itemIdArray.forEach(function(item){
        oids.push(new objectId(item));
    });
    console.log("My Items")

    console.log(oids)

    // let itemId = items.singleitem;
    
        return new Promise(async(resolve,reject)=>{
           // console.log(userId);
            let bookings = await db.get().collection(collection.APPOINTMENT_COLLECTION)
                    .find({ "items.singleitem" : {$in : oids} }).toArray()
                   // console.log("bookings :"+bookings);
                    resolve(bookings)
        })
    },


    //Update User Profile
    updateUserProfile:(item)=>{

        let userId = item.userId;

        return new Promise((resolve,reject)=>{
        
            db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:objectId(userId)},{
                $set: {
                    
                    first_name : item.first_name, 
                    last_name : item.last_name,
                    location : item.location,
                    email : item.email,
                    phone : item.phone

                }
            }).then((response)=>{
                resolve()
            })
        })
    },


    //Update Center Profile
    updateCenterProfile:(item)=>{

        let centerId = item.centerId;

        return new Promise((resolve,reject)=>{
        
            db.get().collection(collection.CENTER_COLLECTION)
            .updateOne({_id:objectId(centerId)},{
                $set: {
                    
                    centerName : item.centerName, 
                    centerType : item.centerType,
                    city : item.city,
                    district: item.district,
                    email : item.email,
                    phone : item.phone

                }
            }).then((response)=>{
                resolve()
            })
        })
    },


    
 //endofmain   
}






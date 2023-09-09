var db = require('../config/connection')
var collection = require('../config/collections');
var objectId = require('mongodb').ObjectId

const { response } = require('../app');
const { ObjectId } = require('mongodb');


module.exports={

    //to add item
    addItem:(item,callback)=>
    {
        console.log(item);

        db.get().collection('item').insertOne(item).then((data)=>
        {
            console.log(data);
            callback(data.insertedId)
        })
    },

    //to list item
    getWorkItems:()=>
    {
        return new Promise(async(resolve,reject)=>{

            let items = await db.get().collection(collection.ITEM_COLLECTION).find().toArray()
            resolve(items)

        })
    },

    //delete item
    deleteItem:(itemId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.ITEM_COLLECTION).deleteOne({_id:objectId(itemId)}).then((response)=>{
                resolve(response)
            })
            
        })
    },

    //edit item
    //single item edit
    getItemDetails:(itemId)=>{
        return new Promise((resolve,reject)=>{

        db.get().collection(collection.ITEM_COLLECTION).findOne({_id:objectId(itemId)}).then((item)=>{
        resolve(item)
        })

        })
    },

    //edit item updates
    updateItem:(itemId,itemDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ITEM_COLLECTION)
            .updateOne({_id:objectId(itemId)},{
                $set: {
                    name:itemDetails.name,
                    description:itemDetails.description,
                    cost:itemDetails.cost,
                    category:itemDetails.category
                }
            }).then((response)=>{
                resolve()
            })
        })
    },


    //Center Change Work Status
    changeWorkStatus:(itemId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.APPOINTMENT_COLLECTION)
            .updateOne({_id:objectId(itemId)},{
                $set: {
                    status: 'Completed'
                }
            }).then((response)=>{
                resolve()
            })
        })
    },

    //delete Appointment
    deleteAppointment:(itemId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.APPOINTMENT_COLLECTION).deleteOne({_id:objectId(itemId)}).then((response)=>{
                resolve(response)
            })
            
        })
    },    



    //Center Change Appointment DATe
    changeAppointmentDate:(itemId,newDate)=>{

       // console.log(newDate)

        return new Promise((resolve,reject)=>{
            db.get().collection(collection.APPOINTMENT_COLLECTION)
            .updateOne(
                
                {'_id' :objectId(itemId)},
                
                {
                    
                  $set : {  'billingDetails.prefdate': newDate, status: 'Rescheduled' }
                }
            
            ).then((response)=>{
                resolve()
            })
        })
    },



    //single item 
    getOrderDetails:(itemId)=>{
        return new Promise((resolve,reject)=>{

        db.get().collection(collection.APPOINTMENT_COLLECTION).findOne({_id:objectId(itemId)}).then((item)=>{
        resolve(item)
        })

        })
    },





    //to list All Centers
    getAllVerifiedCenters:()=>
    {
        return new Promise(async(resolve,reject)=>{
            let items = await db.get().collection(collection.CENTER_COLLECTION).find({status:'Verified'}).toArray()
            resolve(items)
        })
    },


    //delete Center
    deleteCenter:(itemId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.CENTER_COLLECTION).deleteOne({_id:objectId(itemId)}).then((response)=>{
                resolve(response)
            })
            
        })
    },

    //to list All Centers Verification
    getAllCentersForVerification:()=>
    {
        return new Promise(async(resolve,reject)=>{
            let items = await db.get().collection(collection.CENTER_COLLECTION).find({status: "Registered"}).toArray()
            resolve(items)

        })
    },


    //Verify Center
    verifyCenter:(itemId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CENTER_COLLECTION)
            .updateOne({_id:objectId(itemId)},{
                $set: {
                    status: 'Verified'
                }
            }).then((response)=>{
                resolve()
            })
        })
    },


    //to list All Customers
    getAllCustomers:()=>
    {
        return new Promise(async(resolve,reject)=>{

            let items = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(items)

        })
    },
    

    //delete 
    deleteCustomer:(itemId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).deleteOne({_id:objectId(itemId)}).then((response)=>{
                resolve(response)
            })
        })
    },


//endofobject
}
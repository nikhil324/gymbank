const express= require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const { response } = require("express");
const port= process.env.PORT ||8000;
const urlencoded=bodyparser.urlencoded({extended:false});
 
const URL='mongodb+srv://NikhilG:Nikhil123@gymbank.p0uho.mongodb.net/gymbankC?retryWrites=true&w=majority';

mongoose.connect(URL,{useNewUrlParser:true,useUnifiedTopology:true});
const sch=new mongoose.Schema({
    _id:Number,
    Name:String,
    Email:String,
    balance:Number,
});
const sch2=new mongoose.Schema({
    from:String,
    to:String,
    transiction_id:String,
    amount:Number,
    date:{
        type:Date,
        default:new Date
    }
});

const customers = new mongoose.model("customers",sch);
const transictions = new mongoose.model("transictions",sch2);
const app =express();


app.set('view engine','ejs');
app.set('views',"./public/views")
app.use(express.static('public'));
app.get("/",(req,res)=>{
    res.render('index');
})
app.get("/customer",(req,res)=>{
    customers.find({},function(err,data){
        res.render('customers',{
            customer:data,
            msg:""
        });
       
    });
    
})
app.get("/history",(req,res)=>{
    transictions.find({},function(err,data){
        res.render('transictions',{
            transiction:data
        });
       
    });
})
app.post("/success",urlencoded,async(req,res)=>{
   const response={
        name:req.body.name,
        amount:req.body.amount,
        email:req.body.email,
        cid:req.body.cid
    }
    const id = await customers.findOne({Name:response.name,_id:response.cid});
    const rec = await customers.findOne({Email:response.email});
    if(id!=null&&rec!=null){
        tid = Math.floor(Math.random()*100000000);
        await customers.updateOne({"balance":id.balance},{
            $set:{
                "balance":parseInt(id.balance)-parseInt(response.amount)
            }
        })
        await customers.updateOne({"Email":response.email},{
            $set:{
                "balance":parseInt(rec.balance)+parseInt(response.amount)
            }
        })
        res.render("welcome",{tid:tid});
        const data=new transictions({from:response.name,to:response.email,transiction_id:tid,amount:response.amount});
        console.log(data); 
        data.save();
    }
    else{
        customers.find({},function(err,data){
        res.render('customers',{
            customer:data,
            msg:"please enter valid customer_id, customer_name, Reciever_name"
        });
       
    });  
    }   
})
app.get("*",(req,res)=>{
    res.render("error");
});
app.listen(port,()=>{
    console.log(`I M LISTENING ON THE PORT ${port}`);
})


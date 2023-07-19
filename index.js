const express = require("express");
const cors = require("cors")
const app = express();
const pool = require("./db")
const bcrypt =require("bcrypt");
const jwt =require("jsonwebtoken");
const validateToken = require("./middleware/validateToken");
const dotenv=require("dotenv").config();
const Razorpay=require('razorpay');



app.use(cors());
app.use(express.json());


const razorpayInstance=new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_SECRET
})


app.post("/createOrder",(req,res)=>{
    // const {amount,currency,receipt,notes}=req.body;
    const amount=499;
    const currency="INR";
    const payment_capture=1;
    const options={
        amount:(amount*100).toString(),
        currency,
        receipt:"asdfasdfaswasf#412567",
        payment_capture,
    };

    razorpayInstance.orders.create(options,(err,order)=>{
        if(!err)
        res.json(order)
        else
        res.send(err)
    })
});

app.post("/register", async (req, res) => {
    try {
        const {person_id, name, email,phone ,password} = req.body;

        if(!person_id||!name||!email||!phone||!password){
            res.status(404);
            throw new Error("All fields are mendatory")
        }
        const hashpassword=await bcrypt.hash(password,10);

        const newuser = await pool.query(
            "INSERT INTO persons (person_id,name,email,phone,password) VALUES($1,$2,$3,$4,$5)",
            [person_id ,name, email,phone,hashpassword]
        )
        res.json(newuser);
    } catch (err) {
        console.log(err);
    }
})

app.post("/login",async(req,res)=>{
    try{
        const{email,password}=req.body;
        if(!email || !password){
            res.status(404)
            throw new Error("email & password are mandaotry");
        }
        const user=await pool.query("SELECT * FROM PERSONS WHERE email=$1",[email]);
        if(user&&(await bcrypt.compare(password,user.rows[0].password))){
        const accessToken=jwt.sign({
            user:{
                username:user.rows[0].name,
                email:user.rows[0].email,
                id:user.rows[0].person_id
            }
        },process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:'2h'}
        )
        res.status(200).json({accessToken});
        }
        // console.log(user.rows[0].password);
    }catch(err){
        console.log(err);
    }
})

app.get("/user",validateToken, async (req, res) => {
    try {
        const {id}=req.user;
        const getuser = await pool.query("SELECT * FROM PERSONS WHERE person_id = $1",[id]);
        res.json(getuser.rows)
    } catch (err) {
        console.log(err);
    }
})

app.get("/user/:query",async(req,res)=>{
    try{
const {query}=req.params;
const getuser=await pool.query("SELECT * from  persons where email like '%'||$1||'%'",[query]);
res.json(getuser.rows)
    }catch(err){
console.log(err);
    }
})


app.post("/group", async (req, res) => {
    try {
        const{group_id,person_id,grpname,grpmember}=req.body;
        const creategrp = await pool.query("INSERT INTO memgroup (group_id,grpname,grpmember,person_id) VALUES ($1,$2,$3,$4)", 
        [group_id, grpname, grpmember, person_id])
        res.json(creategrp);
    } catch (err) {
        console.log(err);
    }
})

app.get("/groupmem/:id",async(req,res)=>{
    try{
        const {id}=req.params;
const getgroup=await pool.query(`SELECT * FROM memgroup where group_id=$1`,[id])
res.json(getgroup.rows);
    }catch(err){
console.log(err);
    }
})

app.get("/group/:member",async(req,res)=>{
    try{
        const {member}=req.params;
        const getgroup=await pool.query(`SELECT * FROM memgroup where $1=ANY(grpmember)`,[member])
        res.json(getgroup.rows);
    }catch(e){
console.log(e);
    }
})

app.put("/group/:id",async(req,res)=>{
    try{
        const {id} =req.params;
        const {grpmember}=req.body;
    
        const updategroup=await pool.query(`UPDATE memgroup set grpmember=array_append(grpmember,$1) where group_id=$2`,[grpmember,id])
        res.json(updategroup.rows);
    }catch(err){
        console.log(err);
    }
})

app.post("/expense",async(req,res)=>{
    try{
        const {expense_id,payer,topic,totalprice,group_id,member}=req.body;
        const postexpense=await pool.query(`insert into expenses (expense_id,group_id,payer,topic,totalprice,member) values ($1,$2,$3,$4,$5,$6)`,
        [expense_id,group_id,payer,topic,totalprice,member])
        res.json(postexpense);
    }catch(err){
        console.log(err);
    }
})
app.get("/expense/:id",async(req,res)=>{
    try{
        const {id}=req.params;
        const getexpense=await pool.query(`select * from expenses where group_id=$1`,[id]);
        res.json(getexpense.rows);

    }catch(err){
    console.log(err); 
    }
})
app.get("/expensive/:member",async(req,res)=>{
    try{
        const {member}=req.params;
const getexpense=await pool.query('select * from expenses where payer=$1',[member]);
res.json(getexpense.rows);
    }catch(e)
    {
        console.log(e);
    }
})
app.get("/settle/:member",async(req,res)=>{
    try{
        const {member}=req.params;
const getexpense=await pool.query(`select * from expenses where payer!=$1 and $1=ANY(member)`,[member]);
res.json(getexpense.rows);
    }catch(e)
    {
        console.log(e);
    }
})

app.get("/persons",async(req,res)=>{
    try{
        const getperons=await pool.query("select * from persons");
        res.json(getperons.rows);
    }catch(e){
        console.log(e);
    }
})



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("listenning on port" + port)
})
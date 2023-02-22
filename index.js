const express = require("express");
const cors = require("cors")
const app = express();
const pool = require("./db")

app.use(cors());
app.use(express.json());


app.post("/user", async (req, res) => {
    try {
        const { person_id, name, email } = req.body;
        const newuser = await pool.query(
            "INSERT INTO persons (person_id,name,email) VALUES($1,$2,$3)",
            [person_id, name, email]
        )
        res.json(newuser);
    } catch (err) {
        console.log(err);
    }
})
app.get("/user", async (req, res) => {
    try {
        const getuser = await pool.query("SELECT * FROM PERSONS");
        res.json(getuser.rows);
    } catch (err) {
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

app.get("/group/:id",async(req,res)=>{
    try{
        const {id}=req.params;
const getgroup=await pool.query(`SELECT * FROM memgroup where person_id=$1`,[id])
res.json(getgroup.rows);
    }catch(err){
console.log(err);
    }
})

app.put("/group/:id",async(req,res)=>{
    try{
        const {id} =req.params;
        const {grpname,grpmember,group_id}=req.body;
    
        const updategroup=await pool.query(`UPDATE memgroup set grpmember=array_append(grpmember,$1) where grpname=$2 and group_id=$3`,[grpmember,grpname,group_id])
        res.json(updategroup.rows);
    }catch(err){
        console.log(err);
    }
})

app.post("/expense",async(req,res)=>{
    try{
        const {expense_id,payer,topic,totalprice,group_id}=req.body;
        const postexpense=await pool.query(`insert into expenses (expense_id,group_id,payer,topic,totalprice) values ($1,$2,$3,$4,$5)`,
        [expense_id,group_id,payer,topic,totalprice])
        res.json(postexpense);
    }catch(err){
        console.log(err);
    }
})
app.get("/expense",async(req,res)=>{
    try{
        const getexpense=await pool.query(`select * from expenses`);
        res.json(getexpense.rows);

    }catch(err){
    console.log(err);
    }
})



const port = 5000;
app.listen(port, () => {
    console.log("listenning on port" + port)
})
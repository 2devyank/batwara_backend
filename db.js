const Pool=require("pg").Pool;
const dotenv=require("dotenv").config();

const pool=new  Pool({
  user:"devyanknagpal",
  password:"",
  host:"localhost",
  port:5433,
  database:"template1"
})

module.exports=pool;
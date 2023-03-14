const Pool=require("pg").Pool;
const dotenv=require("dotenv").config();

const connectionString=process.env.DATABASE_TOKEN;

const pool=new  Pool({
  connectionString,
})
module.exports=pool;
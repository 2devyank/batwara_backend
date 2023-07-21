const Pool=require("pg").Pool;
const dotenv=require("dotenv").config();
const connectionString=process.env.POSTGRES_LINK

const pool=new  Pool({
  connectionString
})

module.exports=pool;
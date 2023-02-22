const Pool=require("pg").Pool;

const pool=new  Pool({
    user:"postgres",
    password:"devyank",
    host:"localhost",
    port:"5432",
    database:"servergroup"
})
module.exports=pool;
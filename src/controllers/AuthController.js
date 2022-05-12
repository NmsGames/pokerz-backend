const bcrypt = require('bcrypt');
const check = require('../validation/CheckValidation') 
const conn = require('../../config/db')
const moment = require('moment'); 
// User login
var nodemailer = require('nodemailer');

function createRandomString(len) {
    var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return [...Array(len)].reduce(a=>a+p[~~(Math.random()*p.length)],'');
}
 
const authLogin = async (req, res) => {
    let message = null
    let statusCode = 400
    let error = {}
    let data = {}
  
    try {
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        } else {
            const formData = { 
                email: req.body.email,
                password: req.body.password
            };

            // Check requeted user is exist or not
            let sql = `SELECT * FROM users WHERE LOWER(email)= ? limit ?`;
            let user = await conn.query(sql, [formData.email.toLowerCase(), 1]);
            if (user.length > 0) { 
                const usersRows = (JSON.parse(JSON.stringify(user))[0]);
                const comparison = await bcrypt.compare(formData.password, usersRows.password)
                if (comparison) { 
                    const last_login = moment().format("YYYY-MM-DD HH:mm:ss");
                    const formData = {
                        is_login:1,
                        last_login:last_login
                    }
                    let sql1 = "UPDATE users Set ? WHERE user_id= ?"
                    await conn.query(sql1, [formData,usersRows.user_id])
                    statusCode = 200
                    message = 'Login success'
                    //check bonos
            var t = new Date();
            var dd = String(t.getDate()).padStart(2, '0');
            var mm = String(t.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = t.getFullYear();
            
            const today = `${yyyy}-${mm}-${dd}`;
             
            let sql = `SELECT * FROM daily_bonus_table WHERE DATE(currentdate) = ? AND user_id=? limit ?`;
            let bonoss = await conn.query(sql, [today,usersRows.user_id, 1]);
            if(bonoss.length>0){ 
            }else{
                /**
                 * DAILY LOGIn
                 */
                let sql1 = `SELECT * FROM daily_bonus_master_table WHERE is_active = ? limit ?`;
                let bonus_master = await conn.query(sql1, [1, 1]); 
                const formData = {
                    user_id         : usersRows.user_id, 
                    daily_bonus_code : bonus_master[0].weekly_bonus_master_id,
                    currenttime     : moment(Date.now()).format('HH:mm:ss'),
                    currentdate     : today,
                    login_date_time : `${today} ${moment(Date.now()).format('HH:mm:ss')}`
                };

                console.log(formData,bonus_master)
               
                let sql2  = `INSERT INTO daily_bonus_table set ?`;
                await conn.query(sql2, formData)
               
                
                
            }
             
            /**
             * WEEKLY LOGIn
             */
            const day1 = t.getDay(); 
           
            if(day1 == 2)
            {
                let sql = `SELECT * FROM weekly_bonus_table WHERE DATE(currentdate) = ? AND user_id=? limit ?`;
                let bonoss = await conn.query(sql, [today,usersRows.user_id, 1]);
                if(!(bonoss.length>0))
                {
                    let sql1w = `SELECT * FROM weekly_bonus_master_table WHERE is_active = ? limit ?`;
                    let bonus_master = await conn.query(sql1w, [1, 1]);
                    const formData1 = {
                        user_id         : usersRows.user_id, 
                        weekly_bonus_code: bonus_master[0].weekly_bonus_master_id,
                        currenttime     : moment(Date.now()).format('HH:mm:ss'),
                        currentdate     : today,
                        login_date_time : `${today} ${moment(Date.now()).format('HH:mm:ss')}`
                    }; 
                    let sql3  = `INSERT INTO weekly_bonus_table set ?`;
                    await conn.query(sql3, formData1)
                }
                
            }
                    let dsql = `SELECT daily_bonus_table.*,daily_bonus_master_table.coins FROM daily_bonus_table LEFT JOIN daily_bonus_master_table ON 
                    daily_bonus_table.daily_bonus_code=daily_bonus_master_table.weekly_bonus_master_id  
                    WHERE daily_bonus_table.is_used = 0 AND daily_bonus_table.is_active = 1 AND daily_bonus_table.user_id =? limit ?`;
                    let daily = await conn.query(dsql, [usersRows.user_id,30]);

                    let wsql = `SELECT weekly_bonus_table.*,weekly_bonus_master_table.coins FROM weekly_bonus_table LEFT JOIN weekly_bonus_master_table ON 
                    weekly_bonus_table.weekly_bonus_code=weekly_bonus_master_table.weekly_bonus_master_id  
                    WHERE weekly_bonus_table.is_used = 0 AND weekly_bonus_table.is_active = 1 AND weekly_bonus_table.user_id =? limit ?`;
                    let weekly = await conn.query(wsql, [usersRows.user_id,5]);
                    bonus = {
                        weekly:weekly,
                        daily : daily
                    }
        
                    data = {
                    user_id:usersRows.user_id,
                    email  :usersRows.email,
                    username:usersRows.username?usersRows.username:`Guest00${usersRows.user_id}`, 
                    avatar_index:usersRows.avatar_index,
                    ring_index:usersRows.ring_index,
                    watch_index:usersRows.watch_index,
                    date_of_birth:usersRows.date_of_birth,
                    total_points:usersRows.coin_balance,
                    points : usersRowsuser_points+points,
                    coins : usersRows.user_coins+coins,
                    bonus

                } 
              
                } else {
                    statusCode = 401
                    message = 'Login failed'
                    error.password = "Password does not match!"
                }
            } else {
                statusCode = 404
                message = 'Login failed'
                error.error = "Username does not exist!"
            }
            const responseData = {
                status: statusCode,
                message,
                user: data,
                errors: error
            }
            res.send(responseData)
        }
    } catch (error) {
        res.send({ Err: error })
    }
}
 
// User SignUP
const authSignUp = async (req, res) => {
    let message = null
    let statusCode = 400  
    try {
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        } else {
            const confirm_password = req.body.confirm_password
            const encryptedPassword = await bcrypt.hash(req.body.password, 10) 
           const username =  createRandomString(8);
            const formData = { 
                email   : req.body.email,
                role_id : 3,
                username:username,
                password: encryptedPassword
            };
            if(confirm_password !== req.body.password){
                message     = 'Confirm password does not match'
                statusCode  = 401
            }else{
                // Check requeted user is exist or not
                let sql = `SELECT * FROM users WHERE LOWER(email)= ? limit ?`;
                let user = await conn.query(sql, [formData.email.toLowerCase(), 1]);
                if (user.length > 0) {
                    statusCode  = 401
                    message     = 'Sorry! Email already exist try another email' 
                } else { 
                   const sql1  = `INSERT INTO users set ?`;
                   const users = await conn.query(sql1, formData)
                    if(users){
                        statusCode = 201
                        message = "User created success"
                    }else{
                        statusCode = 500
                        message = "Something went wrong! database error"
                    } 
                }
            } 
            const responseData = {
                status: statusCode,
                message, 
            }
            res.send(responseData)
        }
    } catch (error) {
        res.send({ error: error })
    }
}
const forgotPassword = async (req, res) => {
    let message = null
    let statusCode = 400  
    let data = {}
    try {  
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'rajendra@nmsgames.com',
              pass: 'lyszrpneixiqhpxv',
            },
          });
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        } else {
            const { email } = req.body 
                let sql = `SELECT * FROM users WHERE LOWER(email)= ? limit ?`;
                let user = await conn.query(sql, [email.toLowerCase(), 1]); 
                if (user.length > 0) {
                    const otp =  Math.floor(1000 + Math.random() * 9999);
                    const last_minute = moment().format("YYYY-MM-DD HH:mm:ss");
                    //Sent mail
                    transporter.sendMail({
                        from: '"Zynga Poker OTP!" <rajendra@nmsgames.com>', // sender address
                        to: email, // list of receivers
                        subject: "OTP Verfications", // Subject line 
                        html: `<b>The OTP is ${otp}. <br>This OTP generated at ${last_minute} and valid for 5 Minutes.</b>`, // html body
                      }).then(info => {
                        console.log({info});
                      }).catch(console.error);
                    const formData = { 
                        otp : otp,
                        otp_time:last_minute
                    };
                    let sql1 = "UPDATE users Set ? WHERE email= ?"
                    await conn.query(sql1, [formData,email])
                    statusCode  = 200
                    message     = 'Otp have sent on your registered email!'
                    const usersRows = (JSON.parse(JSON.stringify(user))[0]);  
                    data ={
                        user_id     : usersRows.user_id, 
                        email       : usersRows.email,
                        phone       : usersRows.phone, 
                    } 

                } else {  
                    statusCode  = 404
                    message     = 'Sorry! Email does not exist!'  
                }   
            const responseData = {
                status: statusCode,
                message, 
                data
            }
            res.send(responseData)
        }
    } catch (error) {
        res.send({ error: error })
    }
}
const resetPassword = async (req, res) => {
    let message = null
    let statusCode = 400  
    try {
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        } else {
            const current_times = moment().subtract(5, 'minutes').format("YYYY-MM-DD HH:mm:ss"); 
            const {email,password,confirm_password,otp} = req.body
            if(password === confirm_password){ 
                const encryptedPassword = await bcrypt.hash(password, 10)  
                // Check requeted user is exist or not
                let sql = `SELECT * FROM users WHERE email= ? limit ?`;
                let user = await conn.query(sql, [email, 1]);
                if (user.length > 0) {  
                    if(user[0].otp == otp){
                        
                        // const strtotime = strtotime(current_time);
                        let sql1 = `SELECT * FROM users WHERE otp_time >= ? AND user_id= ? limit ?`;
                        let checkuser = await conn.query(sql1, [current_times,user[0].user_id, 1]);
                        if(checkuser.length>0){
                            const formData = { 
                                otp : null,
                                otp_time:null,
                                password:encryptedPassword
                            };
                            let sql2 = "UPDATE users Set ? WHERE user_id= ?"
                            const user  =await conn.query(sql2, [formData,checkuser[0].user_id])
                            if(user){
                                statusCode  = 200
                                message     = 'Password reset successfully' 
                            }else{
                                statusCode  = 500
                                message     = 'Something Went wrong' 
                            }
                        }else{
                            statusCode  = 404
                            message     = 'OTP time expired'
                        }
                         
                    }else{
                        statusCode  = 404
                        message     = 'Sorry Invalid OTP' 
                    }
                    
                } else { 
                    statusCode  = 404
                    message     = 'Sorry Invalid Email' 
                }
                
            }else{
                statusCode = 404
                message = "Confirm password does not match"
            }
           
            const responseData = {
                status: statusCode,
                message
            }
            res.send(responseData)
        }
    } catch (error) {
        statusCode = 500
        message = "Database error" 
            const responseData = {
                status: statusCode,
                message
            }
            res.send(responseData)
    }
}
module.exports = {
    authLogin ,
    authSignUp,
    forgotPassword,
    resetPassword
}
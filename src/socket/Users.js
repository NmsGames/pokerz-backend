// const debug = require("debug")("test");
const db = require("../../config/db");
const bcrypt = require('bcrypt');
const moment = require('moment');
var url = require('url');
const { sendResponse, isValidArray } = require('../../services/AppService');
const { getUserTransactionAmount,userTransactionsHistory } = require('./Transactions');
const sendSms = require('../sms/PhoneSms')
 const hostname = `http://ec2-35-154-110-139.ap-south-1.compute.amazonaws.com:5000`
const emailvalidator = require("email-validator");
/**
 * Desc : User exist or not by phone no  
 * Req  :{ user_id}
 * Function : loggedInUser
 */
const checkUser = async (req) => {
    let status;
    let data = {}; 
    const { phone,type ,user_id} = req 
    if(type !== "userID"){
        if (!phone) return sendResponse(status = 404, "Invalid details d.", data)
        console.log('sddd')
        var regx = /^[6-9]\d{9}$/;
        if (!regx.test(phone)) return sendResponse(status = 404, "Invalid phone details.", data)
        //check user
        let sql = `SELECT * FROM users WHERE phone=? limit ?`;
        let check = await db.query(sql, [phone, 1]); 
        if (check.length > 0) {
            data = {
                status      : 200,
                user_id     : check[0].user_id,
                device_id   : check[0].device_id,
                username    : check[0].username,
                email       : check[0].email,
                phone       : check[0].phone,
                otp         : check[0].otp,
                verify_time : check[0].verify_time,
                is_block    : check[0].is_block,
                is_logged_in: check[0].is_logged_in
            } 
        } else {
            data = {
                status      : 403
            }
        }
    }else{
        let sql     = `SELECT * FROM users WHERE user_id=? limit ?`;
        let check   = await db.query(sql, [user_id, 1]); 
        if (check.length > 0) {
            data = {
                status      : 200,
                user_id     : check[0].user_id,
                device_id   : check[0].device_id,
                username    : check[0].username,
                email       : check[0].email,
                phone       : check[0].phone,
                avatar      : check[0].avatar,
                otp         : check[0].otp,
                verify_time : check[0].verify_time,
                is_block    : check[0].is_block,
                is_logged_in: check[0].is_logged_in
            } 
        } else {
            data = {
                status      : 403
            }
        }
    } 
    
     
    return data
    // return sendResponse(status = 200, message, data)
}
 
/**
 * Desc : check User logged In or not  
 * Req  :{ user_id}
 * Function : loggedInUser
 */
const loggedInUser = async (req) => { 
    let data; 
    const { device_id } = req 
    const user = await checkUser(req)  
    if(user.status === 200){ 
        if((user.device_id).trim() == device_id.trim()){
            if((user.is_block === 0)){
                if(user.is_logged_in ===1){
                    data  = { 
                        status         : 200, 
                        is_logged_in   : true,
                        is_registred   : true,
                        is_blocked     : false
                    }
                }else{
                    data  = { 
                        status         : 200, 
                        is_logged_in   : false,
                        is_registred   : true,
                        is_blocked     : false
                    }
                }
                
            }else{
                data  = { 
                    status         : 200, 
                    is_logged_in   : false,
                    is_registred   : true,
                    is_blocked     : true
                }
            }   
        }else{
            data  = { 
                status         : 200, 
                is_logged_in   : false,
                is_registred   : true
            }
        }
    }else{  
        data  = { 
            status         :200, 
            is_logged_in   : false,
            is_registred   : false
        }
    }
    return data;
}

/**
 * Desc : Get user profile details  
 * Req  :{ user_id}
 * Function : userProfile
 */
const userProfile = async (req) => {
    let message;
    let status = 404;
    let data   = {};
    try {
        const user_id = req.user_id;

        if (!user_id) return sendResponse(status, "Invalid details.", data)
        const request ={
            user_id:user_id,
            type:"userID"
        }
        const user = await checkUser(request)
        
        if(user.status === 200){
            let sql = `SELECT CONCAT(LEFT(account_number, 4), 'XXXXXXXX', RIGHT(account_number, 4)) as acc,bank_name,is_verified ,upi_id
            FROM bank_details WHERE user_id = ? limit ?`;
            let checkBankDetail = await db.query(sql, [user_id, 1]);  
            let points = await userTransactionsHistory(user_id);  

            let sql1 = `SELECT * from kyc_details WHERE user_id = ? AND is_type="VoterID" limit 1`;
            let voterCheck = await db.query(sql1, [user_id]);   
            let sql2 = `SELECT * from kyc_details WHERE user_id = ? AND is_type="DL" limit 1`;
            let dlCheck = await db.query(sql2, [user_id]); 
            let sql3 = `SELECT * from kyc_details WHERE user_id = ? AND is_type="PAN" limit 1`;
            let panCheck = await db.query(sql3, [user_id]); 
            status = 200;
            message = 'My Profile';  
            data = {
                username    : user.username?user.username:`Guest1001${user_id}`,
                phone       : user.phone,
                email       : user.email,
                avatarLink  : user.avatar?`${hostname}/${user.avatar}`:null,
                balance     : points.total_amount?points.total_amount:0, 
                added_amount: points.add_amount?points.add_amount:0, 
                bonus_amount: 100, 
                winnig_amount: points.winning_amount?points.winning_amount:0, 
                is_verified_bank_details :(checkBankDetail.length>0 && checkBankDetail[0].is_verified==1)?true:false,
                is_verified_upi_id       :(checkBankDetail.length>0 && checkBankDetail[0].is_verified==1)?true:false,
                is_submitted_upi_id      :(checkBankDetail.length>0 && checkBankDetail[0].upi_id!=null)?true:false,
                is_submitted_bank_details:checkBankDetail.length>0?true:false,
                kyc:{
                    is_pan_submitted    :panCheck.length>0?true:false,
                    is_voter_submitted  :voterCheck.length>0?true:false,
                    is_derving_submitted:dlCheck.length>0?true:false,
                    is_pan_verified    :(panCheck.length>0 && panCheck[0].is_status==1)?true:false,
                    is_voter_verified  :(voterCheck.length>0 && voterCheck[0].is_status==1)?true:false,
                    is_derving_verified:(dlCheck.length>0 && dlCheck[0].is_status==1)?true:false
                }
            }
            if(checkBankDetail.length>0){
                if(checkBankDetail[0].acc !==null){ 
                    is_bank = true  
                    data.account_number = checkBankDetail[0].acc;
                    data.bank_name   = checkBankDetail[0].bank_name?checkBankDetail[0].bank_name:'A/C';
                }
                if(checkBankDetail[0].upi_id !==null){ 
                    data.upi_id  = checkBankDetail[0].upi_id;
                }
            }
           
            console.log(data)
        }else{
            message = "Invalid details"
            status = 404
        } 
         
     return sendResponse(status, message, data);
         
    } catch (err) {
        console.log(err) 
    }
}

/**
 * Desc : Register on tournaments entry fee  
 * Req  :{ user_id,device_id,game_play_id,category_type_id}
 * Function : userLogin
 */
  
const userLogin = async (req) => {
    let message;
    let status = 404;
    let data = {};
    try { 
        //check user
        const user = await checkUser(req)   
        const {phone,username, device_id} = req  
        if (user.status === 200) {
            if((user.device_id).trim() == device_id.trim()){ 
                const sql = "UPDATE users Set ?  WHERE user_id= ?"
                await db.query(sql, [{ username: username, otp: null, is_verified: 1,is_logged_in:1 }, user.user_id]);
                status  = 200;
                message = 'Login Successfully';
                data = {
                    user_id : user.user_id,
                    username: user.username,
                    phone   : user.phone,
                    device_id
                }
                   
            }else{
                const sql = "UPDATE users Set ?  WHERE user_id= ?"
                await db.query(sql, [{ username: username, is_verified: 1,is_logged_in:1 }, user.user_id]);
                status  = 200;
                message = 'Login Successfully';
                data = {
                    user_id : user.user_id,
                    username: user.username,
                    phone   : user.phone,
                    device_id
                } 
            }
            
        } else {
            const sql2 = "INSERT INTO users Set ?"
            let formData = { 
                username: username,
                is_verified: 1,
                is_logged_in:1,
                device_id:device_id,
                phone:phone
             }
           const u=  await db.query(sql2,formData);
           if(u){
            status  = 200;
            message = 'Login Successfully';
            data = {
                user_id : user.user_id,
                username: user.username,
                phone   : user.phone,
                device_id
            } 
           }else{
            status  = 500;
            message = 'Data base error';
           }
            
        }
        return sendResponse(status, message, data); 
    } catch (err) {
        // debug(err);
    }
}



/**
 * Desc : Send otp  
 * Req  : { phone, email_id,device_id }
 * Function : userLogin
 */
const sendOtp = async (req) => {
    let message;
    let status = 404;
    let data = {};
    try {
        const { phone, email_id,device_id } = req; 
        if (!phone) return sendResponse(status = 404, "Invalid details.", data)
        var regx = /^[6-9]\d{9}$/;
        if (!regx.test(phone)) return sendResponse(status = 404, "Invalid details.", data) 

        var otp = Math.floor(1000 + Math.random() * 9000);
        let date_ob = new Date();
        const verifyotp_time = date_ob.getTime()
        const welcomeMessage = `Welcome to LudoPayz! Your verification code is ${otp}`;
        await sendSms(phone, welcomeMessage);
        let sql = `SELECT * FROM users WHERE LOWER(phone)= ? limit ?`;
        let user = await db.query(sql, [phone, 1]);

        const formData = {
            phone:phone,
            otp,
            device_id:device_id,
            verify_time: verifyotp_time
        }
        console.log(formData)

        if (user.length > 0) {
            sql = "UPDATE users Set ?  WHERE user_id= ?"
            user = await db.query(sql, [formData, user[0].user_id]);
            status = 201
            message = 'Otp have sent'
        } else {
            status = 201
            message = 'Otp have sent'
            sql = `INSERT INTO users set ?`;
            user = await db.query(sql, formData)
        }
        if (!user) {
            status = 500
            message = `Something went wrong!`
            error = `Database error`
        }

        return sendResponse(status, message, data);

    } catch (err) {
        // debug(err);
    }
}
/**
 * Desc : Update bank details  
 * Req  : { user_id, and bank details }
 * Function : bankDetailsUpdate
 */
 const bankDetailsUpdate = async (req) => {

    let message;
    let status = 404;
    let data   = {};
 
    try {
        const { user_id,account_holder_name,ifsc_code,account_number,confirm_account_number } = req; 
         
        let ifsc = ifsc_code.toUpperCase();
        if (!user_id) return sendResponse(status = 404, "Invalid details.", data)
        if(!account_number) return sendResponse(status = 404, "Account number should not be empty.", data)
        var expression=/[0-9]{6}/; 

        if(!(expression.test(account_number))) return sendResponse(status = 200, "Please enter valid account number.", data)
          
        if(!ifsc_code) return sendResponse(status = 404, "IFSC Code name should not be empty.", data)
      
        if(account_number !== confirm_account_number) return sendResponse(status = 404, "Confirm account number does not match", data)
        //check user
        let request = {
            user_id:user_id,
            type:'userID'
        }
        
        const user = await checkUser(request) 
        if (user.status === 200) 
        {  
            const formData ={  
                user_id,
                ifsc_code:ifsc_code,
                account_number,
                account_holder_name
            }
            let sql  = `SELECT * FROM bank_details WHERE user_id= ? limit ?`;
            let user = await db.query(sql, [user_id, 1]); 
            if (user.length > 0) {
                sql   = "UPDATE bank_details Set ?  WHERE user_id= ?"
                user  = await db.query(sql, [formData,user_id]);
                status  = 201
                message = 'Success'
            } else { 
                sql = `INSERT INTO bank_details set ?`;
                user = await db.query(sql, formData)
                status  = 201
                message = 'Success'
            }
            if (!user) {
                status = 500
                message = `Something went wrong!`
                error = `Database error`
            }
        }else{
            status = 400
            message= 'Something went wrong!'
        }
        
        return sendResponse(status, message, data);

    } catch (err) {
       return sendResponse(500, 'Database error', data);
    }
}
const updateUpiID = async (req) => {
    let message;
    let status = 404;
    let data   = {};
     
    try {
        const { user_id,upi_id} = req; 
        if (!user_id) return sendResponse(status = 404, "Invalid details.", data)
        if(!upi_id) return sendResponse(status = 404, "Please enter your UPI.", data)
        var result = /^[\w.-]+@[\w.-]+$/.test(upi_id)
        if(!result) return sendResponse(status = 404, "Invalid UPI ID.", data) 
        var match = /[a-zA-Z0-9_]{3,}@[a-zA-Z]{3,}/; 
        if(!(match.test(upi_id)))return sendResponse(status = 404, "Invalid UPI ID.", data) 

        //check user
        let request = {
            user_id:user_id,
            type:'userID'
        }
        
        const user = await checkUser(request) 
        if (user.status === 200) 
        {  
            const formData ={ 
                user_id,
                upi_id
            }
            let sql  = `SELECT * FROM bank_details WHERE user_id= ? limit ?`;
            let user = await db.query(sql, [user_id, 1]); 
            if (user.length > 0) {
                sql   = "UPDATE bank_details Set ?  WHERE user_id= ?"
                user  = await db.query(sql, [formData,user_id]);
                status  = 201
                message = 'Success! UPI ID upated'
            } else { 
                sql = `INSERT INTO bank_details set ?`;
               let user1 = await db.query(sql, formData)
                
                status  = 201
                message = 'Success! UPI ID upated'
                 
            }
           
            return sendResponse(status, message, data);
        }else{
            status = 400
            message= 'Something went wrong!'
        }
        
        return sendResponse(status, message, data);

    } catch (err) {
        // debug(err);
    }
}
// const upiID = async (req) => {
//     let message;
//     let status = 404;
//     let data   = {};
//     try {
//         const { user_id} = req; 
//         if (!user_id) return sendResponse(status = 404, "Invalid details.", data) 
//         //check user
//         let request = {
//             user_id:user_id,
//             type:'userID'
//         }
        
//         const user = await checkUser(request) 
//         if (user.status === 200) 
//         {  
          
//             let sql  = `SELECT * FROM bank_details WHERE user_id= ? limit ?`;
//             let users = await db.query(sql, [user_id, 1]); 
//             if (users.length > 0) { 
//                 status  = 200
//                 message = 'Success! UPI ID upated'
//                 data = {
//                     upi_id:users[0].upi_id
//                 }
//             } else { 
//                 status  = 200
//                 message = 'Success'
//                 data = {
//                     upi_id:null
//                 }
//             }
             
//         }else{
//             status = 400
//             message= 'Something went wrong!'
//         }
        
//         return sendResponse(status, message, data);

//     } catch (err) {
//         // debug(err);
//     }
// }
const myAccountDetails = async (req) => {
    let message;
    let status = 404;
    let data   = {};
    try {
        const { user_id } = req;   
        //check user
        let request = {
            user_id:user_id,
            type:'userID'
        }
        
        const user = await checkUser(request) 
        if (user.status === 200) 
        {   
            let sql  = `SELECT * FROM bank_details WHERE user_id= ? limit ?`;
            let user = await db.query(sql, [user_id, 1]); 
            if (user.length > 0) { 
                const userAcco = (JSON.parse(JSON.stringify(user))[0]);  
                status  = 201
                message = 'Success'
                data =userAcco
            } else {  
                status  = 404
                message = 'Success'
            } 
        }else{
            status = 400
            message= 'Something went wrong!'
        }
        
        return sendResponse(status, message, data);

    } catch (err) {
        // debug(err);
    }
}
/**
 * Desc : Update profiles
 * Req  : { user_id }
 * Function : profileUpdate
 */
 const profileUpdate = async (req) => {
    let message;
    let status  = 404;
    let data    = {};
    try {
        const { user_id, email_id,username,dob,device_id} = req; 
        if (!user_id) return sendResponse(status, "Invalid details.", data) 
        //Check user ID is correct or not
        req.type= 'userID' 
        const user = await checkUser(req)
        if (user.status === 200) 
        { 
            const dt = moment().format(dob,'YYYY-MM-DD');
            const formData = {
                email:email_id,
                username,
                dob:dt,
                device_id
            } 
            console.log(formData)
            
           let sql = "UPDATE users Set ? WHERE user_id= ?"
          const result = await db.query(sql, [formData, user_id]);
          console.log(result)
           if(result){
                status = 200
                message= 'Profile updated'
            }else{
                status = 500
                message= 'Something went wrong!'
            }
            
        }else{
            status = 500
            message= 'Database error!'
        }
        console.log(status)
       
        return sendResponse(status,message,data);

    } catch (err) {
        // debug(err);
    }
}
//force login with mobile no or email and device_id
const userForceLogin = async (req) => {
    let message;
    let status = 404;
    let data = {};
    try { 
        //check user
        const {phone,email, device_id,username} = req 
        const sql = "SELECT * FROM users  WHERE device_id = ? LIMIT 1"
        const user =  await db.query(sql, [device_id]);
       
        if(email){ 
            if(!email) return sendResponse(status = 404, "Invalid details.", data)
        
            if(!(emailvalidator.validate(email))){
                return sendResponse(status = 404, "Invalid email address .", data)
            } 
            if(user.length>0){ 
                if(user[0].email==email){
                    status = 200
                    message = 'Login success'
                    data = {
                        is_logged_in : true,
                        device_id    : user[0].device_id,
                        user_id      : user[0].user_id
                    }
                }else{
                    status = 200
                    message = `Device already logged in`
                    data = {
                        is_logged_in:false,
                        device_id :user[0].device_id,
                        user_id: user[0].user_id
                    }
                }
            }else{
                const sql1 = "SELECT * FROM users  WHERE email = ? LIMIT 1"
                const user1 =  await db.query(sql1, [email]);
                if(user1.length>0){
                    status = 200
                    message = `Device already logged in`;
                    data = {
                        device_id   :user[0].device_id,
                        is_logged_in:false
                    }
                }else{
                    const sql2 = "INSERT INTO users Set ?"
                    let formData = { 
                        email        : email,
                        username     : username,
                        is_verified  : 1,
                        is_logged_in : 1,
                        device_id    : device_id
                     }
                   const u = await db.query(sql2,formData);
                    status = 200
                    message = 'Login success'
                    data = {
                        is_logged_in: true,
                        device_id   : device_id,
                        user_id     : u.insertId
                    }
                }
            }
 
            return sendResponse(status, message, data); 
        }else if(phone){
            if(!phone) return sendResponse(status = 404, "Invalid details.", data) 
            if(user.length>0){ 
                if(user[0].phone==phone){
                    status = 200
                    message = 'Login success'
                    data = {
                        is_logged_in : true,
                        device_id    : user[0].device_id,
                        user_id      : user[0].user_id
                    }
                }else{
                    status = 200
                    message = `Device already logged in`
                    data = {
                        is_logged_in : false,
                        device_id    : user[0].device_id,
                        user_id      : user[0].user_id
                    }
                }
            }else{
                const sql1 = "SELECT * FROM users  WHERE phone = ? LIMIT 1"
                const user1 =  await db.query(sql1, [phone]);
                if(user1.length>0){
                    status = 200
                    message =`Device already logged in`
                    data = {
                        device_id   :user1[0].device_id,
                        is_logged_in:false
                    }
                }else{
                    const sql2 = "INSERT INTO users Set ?"
                    let formData = { 
                        phone: phone,
                        is_verified  : 1,
                        is_logged_in : 1,
                        device_id    : device_id
                     }
                   const u = await db.query(sql2,formData);
                    status = 200
                    message = 'Login success'
                    data = {
                        is_logged_in: true,
                        device_id   : device_id,
                        user_id     : u.insertId
                    }
                }
            }
            return sendResponse(status, message, data); 
        }
        return sendResponse(status = 404, "Invalid details.", data)
        
    } catch (err) {
        // debug(err);
    }
}


const userEmailVerify = async (req) => {
    let message;
    let status  = 404;
    let data    = {};
    try {
        const { user_id, username,email,device_id} = req; 
        if (!user_id) return sendResponse(status, "Invalid details.", data) 
        if (!device_id) return sendResponse(status, "Invalid device details.", data) 
        //Check user ID is correct or not
        let sql  = `SELECT * FROM users WHERE user_id= ? AND device_id =? limit 1`;
        let user = await db.query(sql, [user_id, device_id]);  
        if (user.length>0) 
        {  
            if(!(emailvalidator.validate(email))){
                return sendResponse(status = 404, "Invalid email address .", data)
            } 
            const formData = {
                email:email,
                username:username 
            }  
           let sql = "UPDATE users Set ? WHERE user_id= ?"
            const result = await db.query(sql, [formData, user_id]); 
           if(result){
                status = 200
                message= 'Email verified'
            }else{
                status = 500
                message= 'Something went wrong!'
            }
            
        }else{
            status = 404
            message= 'User not found'
        }  
        return sendResponse(status,message,data);

    } catch (err) {
        // debug(err);
    }
}

const userPhoneVerify = async (req) => {
    let message;
    let status  = 404;
    let data    = {};
    try {
        const { user_id, phone,device_id} = req; 
        if (!user_id) return sendResponse(status, "Invalid details.", data) 
        if (!device_id) return sendResponse(status, "Invalid device details.", data) 
        //Check user ID is correct or not
        let sql  = `SELECT * FROM users WHERE user_id= ? AND device_id =? limit 1`;
        let user = await db.query(sql, [user_id, device_id]);  
        if (user.length>0) 
        {  
            if (!phone) return sendResponse(status, "Invalid details.", data) 
            const formData = {
                phone:phone, 
            }  
           let sql = "UPDATE users Set ? WHERE user_id= ?"
            const result = await db.query(sql, [formData, user_id]); 
           if(result){
                status = 200
                message= 'Email verified'
            }else{
                status = 500
                message= 'Something went wrong!'
            }
            
        }else{
            status = 404
            message= 'User not found'
        }  
        return sendResponse(status,message,data);

    } catch (err) {
        // debug(err);
    }
}
module.exports = { userProfile, 
    bankDetailsUpdate,
    userLogin,
    sendOtp,
    profileUpdate,
    loggedInUser,
    checkUser,
    myAccountDetails,
    updateUpiID,
    // upiID,
    userForceLogin,
    userPhoneVerify,
    userEmailVerify
    }
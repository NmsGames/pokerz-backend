// const debug = require("debug")("test");
const db = require("../config/db");
// const bcrypt = require('bcrypt');
// const moment = require('moment');
// var url = require('url');
// const { sendResponse, isValidArray } = require('../../services/AppService');
// const { getUserTransactionAmount,userTransactionsHistory } = require('./Transactions');
// const sendSms = require('../sms/PhoneSms')
//  const hostname = `http://ec2-35-154-110-139.ap-south-1.compute.amazonaws.com:5000`
// const emailvalidator = require("email-validator");
 
const checkUserByPhone = async (req) => {
    let status;
    let data = {}; 
    const { phone} = req 
     
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
     
}
const checkUser = async (req) => {
    let status;
    let data = {}; 
    const user_id  = req 
    
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
    return data 
}
 
 
module.exports = {
checkUserByPhone,
checkUser 
}
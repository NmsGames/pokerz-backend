const bcrypt = require('bcrypt');
const check = require('../validation/CheckValidation') 
const conn = require('../../config/db')
const moment = require('moment'); 
 
 
const retrievePromoCode = async (req, res) => {
    let message = null
    let statusCode = 400
    let error = {}
    let data  = {}
    let sql = ""
    try { 
        const user_id = req.params.id; 
        // // Check requeted user is exist or not
        sql = `SELECT * FROM users WHERE LOWER(user_id)= ? limit ?`;
        let user = await conn.query(sql, [user_id, 1]);
        if (user.length > 0){ 
            sql = `SELECT * FROM user_coupon_codes INNER JOIN coupon_codes ON user_coupon_codes.coupon_code_id = coupon_codes.id WHERE LOWER(user_coupon_codes.user_id)= ? AND user_coupon_codes.is_status = ? limit ? `;
            let checkCoupon = await conn.query(sql, [user_id, 1,1]);
            if(checkCoupon.length>0){
                statusCode = 200
                message = 'Success'
                data = {
                    user_id:user_id,
                    referral_code:checkCoupon[0].coupon_code,   
                }
            }else{
                sql = `SELECT * FROM coupon_codes WHERE status= ? limit ? `;
                let checkCoupons = await conn.query(sql, [1,1]); 
                if(checkCoupons.length>0){
                    statusCode = 200
                    message = 'Success'
                    data = {
                        user_id:user_id,
                        referral_code:checkCoupons[0].coupon_code,   
                    }
                    const formData = { 
                        user_id: user_id,
                        coupon_code_id:checkCoupons[0].id
                    };

                    sql = "INSERT INTO user_coupon_codes Set ? "
                    await conn.query(sql, formData)

                }else{
                    statusCode = 404
                    message = 'Referral Code not available'
                }
            } 
        }else{
            statusCode = 404
            message = 'Invalid user id' 
        }
        const responseData = {
            status: statusCode,
            message,
            data: data,
            errors: error
        }
        res.send(responseData)
    } catch (error) {
        const responseData = {
            status: 404,
            message:"Database Error", 
            errors: error
        }
        res.send(responseData)
    }
}
  
module.exports = {
    retrievePromoCode , 
}
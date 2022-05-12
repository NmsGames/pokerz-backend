 
const moment = require('moment');
const check  = require('../validation/CheckValidation')
const crypto = require('crypto')
const {checkUser} = require('../Comman') 
const conn = require('../../config/db')
let message = null
let status  = 400
let response={}
const ifsc = require('ifsc');
 


// Add money function
const addBankDetails  = async (req,res) => {   
    try {  
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        }
       
        const  {  
            user_id, 
            account_number, 
            confirm_account_number,
            account_holder_name
        } = req.body

        let ifsc_code = (req.body.ifsc_code).toUpperCase(); 
        
        if(account_number === confirm_account_number){ 
            var expression=/[0-9]{6}/; 
            if(expression.test(account_number))
            {
                if(ifsc.validate(ifsc_code))
                {
                    const ifscd = await ifsc.fetchDetails(ifsc_code)
                    if(ifscd)
                    {
                        const formData ={  
                            user_id,
                            ifsc_code,
                            account_number,
                            account_holder_name,
                            branch   :ifscd.BRANCH,
                            city     :ifscd.CITY,
                            state   :ifscd.STATE,
                            bank_name:ifscd.BANK,
                            is_verified:1
                        }
                        let sql  = `SELECT * FROM users WHERE user_id= ? limit ?`;
                        let checkUser = await conn.query(sql, [user_id, 1]);
                        if(checkUser.length>0){
                            let sql  = `SELECT * FROM bank_details WHERE user_id= ? limit ?`;
                            let users = await conn.query(sql, [user_id, 1]); 
                            if (users.length > 0) {
                                sql   = "UPDATE bank_details Set ?  WHERE user_id= ?"
                                await conn.query(sql, [formData,user_id]);
                                status  = 201
                                message = 'Success'
                            } else { 
                                sql = `INSERT INTO bank_details set ?`;
                                 await conn.query(sql, formData)
                                status  = 201
                                message = 'Success'
                            }
                        }else{
                            status = 404
                            message = "Invalid User ID"
                        }
                        
                    }else{
                        status = 500
                        message = "Validation error"
                    }
                    
                }else{
                    status = 401
                    message = "Invalid IFSC code!"
                }
            }else{
                status = 401
                message = "Invalid A/C number!"
            } 
        }else{
            status = 401
            message = "Confirm A/C does not match!"
        } 

        return res.send({status,message})
    } catch (err) {
        return res.send({status:500,message:'Server ERROR',err})
    }
}

const addUpiId = async (data) => {   
    try {  
        const sql     = `SELECT * FROM transactions WHERE order_id= ? limit ?`;
        const sql1    = `UPDATE transactions Set ?  WHERE transaction_id= ?`;
        const results = await conn.query(sql, [data.orderId, 1]);
        const transactions  = (JSON.parse(JSON.stringify(results))[0]);   
        const formsData = { 
            status       : (data.txStatus == 'SUCCESS')?1:(data.txStatus == 'FAILED')?3:2,
            is_type      : (data.txStatus == 'SUCCESS')?1:(data.txStatus == 'FAILED')?3:2,
            txn_status   : data.txStatus,
            txn_message  : data.txMsg,  
            txn_time     : data.txTime,
            reference_id : data.referenceId, 
            payment_mode : data.paymentMode,
            checkcum_signature: data.signature, 
        }

        let results1 = await conn.query(sql1, [formsData, transactions.transaction_id]);
        const response = (JSON.parse(JSON.stringify(results1))); 
        if(response){
            status  = 200 
            message = "Success" 
        }else{
            message = "Failed" 
        } 
        const rpdata = {
          status,
          message,
          response 
         }
        return rpdata
    } catch (err) {
        console.log(err) 
    }
}

module.exports = { 
    addBankDetails, 
    addUpiId, 
}
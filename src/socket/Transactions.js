// const debug = require("debug")("test");
const db     = require("../../config/db"); 
const crypto = require("crypto"); 
const moment = require('moment')
const {sendResponse,isValidArray} = require('../../services/AppService');

 
/**
 * Desc :Get user wallet amount by ID
 * Req  :{ user_id}
 * Function : userTransactionsHistory
 */
async function getUserTransactionAmount(playerId){
	try{ 
		let sql = `SELECT sum(txn_amount) as amount from transactions WHERE user_id= ? and status = 1 and is_type = 1 group by user_id limit ?`;
		const results = await db.query(sql,[playerId,1]);   
		const amount =  (results.length>0)? results[0].amount:0;
	    return amount;
    } catch (err){
        console.log(err)
        // debug(err);
	}   
}

 
/**
 * Desc :GET User transaction Amount 
 * Req  :{ user_id}
 * Function : userTransactionsHistory
 */
 async function userTransactionsHistory(playerId){
	try{  
        /**
         * By userID
         * Get Loss amount
         */  
        
        let sql1 = `SELECT sum(txn_amount) as amount from transactions WHERE user_id= ? and status = 1 and is_type = 2`; 
        const results1 = await db.query(sql1,[playerId]);
        /**
         * By userID
         * Entry fee debited amount
         */ 
        let sql2 = `SELECT sum(txn_amount) as amount from transactions WHERE user_id= ? and status = 1 and is_type = 5`;
        const results2 = await db.query(sql2, [playerId]);
        /**
         * By userID
         * added amount
         */ 
        let sql3 = `SELECT sum(txn_amount) as amount from transactions WHERE user_id= ? and status = 1 and is_type = 1`;
        const results3 = await db.query(sql3, [playerId]); 
        let added_amount=(results3.length>0)? results3[0].amount:0;
        let entry_amount= (results2.length>0)? results2[0].amount:0;
        let winning_amount=(results1.length>0)? results1[0].amount:0;

        const data = {
            total_amount:((added_amount-entry_amount)+winning_amount),
            add_amount: ((added_amount-entry_amount)), 
            winning_amount:winning_amount
        }
	    return data;
    } catch (err){
        console.log(err) 
	}   
}
 

// Check battle types
const battleType = async(id)=>{
    const sql = `SELECT category.category_name FROM game_reports INNER JOIN category ON 
    category.category_id = game_reports.category_id WHERE game_reports.tournament_id = ? LIMIT 1;`
    let battles = await db.query(sql,[id]); 
    let data ;
    console.log(battles,'battles')
    if(battles.length>0){
        // console.log(battles[0].category_name,'categor')
        data={
            category_name:battles[0].category_name
        }
    }else{
        data={
            category_name:null
        }
    }
    return data;
}
/**
 * Desc : Get user transactions history  
 * Req  :{ user_id,tournament_id,game_play_id,category_type_id}
 * Function : getTransactionHistory
 */

const getTransactionHistory = async(req) => {
    let message;
	let status = 404;
	let data   = {};
    try{ 
        const user_id = req.user_id; 
        if(!user_id) return sendResponse(status,"Invalid details.",data)  
        let sql = `SELECT transaction_id,added_type,tournament_id,txn_amount as amount 
        ,status, currency,payment_mode,local_txn_id,DATE_FORMAT(txn_date,'%Y-%m-%d') AS txn_date,TIME( CASE WHEN txn_time IS NOT NULL THEN TIME(txn_time) ELSE TIME(txn_date) END )AS txn_time,is_type from transactions WHERE user_id= ?`;
	    let checkTransaction = await db.query(sql,[user_id]); 
        console.log('checkTransaction',checkTransaction)
	    if(isValidArray(checkTransaction)) {
            let response = [];
            const transactions = (JSON.parse(JSON.stringify(checkTransaction)));    
            for(i= 0; i<checkTransaction.length;i++){
                let rresponse = {
                    transaction_id  : checkTransaction[i].transaction_id,
                    added_type      : checkTransaction[i].added_type,
                    amount          : checkTransaction[i].amount,
                    status          : checkTransaction[i].status,
                    currency        : checkTransaction[i].currency,
                    payment_mode    : checkTransaction[i].payment_mode,
                    local_txn_id    : checkTransaction[i].local_txn_id,
                    txn_date        : checkTransaction[i].txn_date,
                    txn_time        : checkTransaction[i].txn_time,
                    is_type         : checkTransaction[i].is_type
                 }  
                response.push(rresponse);
                if(checkTransaction[i].tournament_id){
                    const types=await battleType(checkTransaction[i].tournament_id) 
                    response[i].category = types.category_name 
                    response[i].tournament_id = checkTransaction[i].tournament_id
                }  
                
            }
	    	status = 200;
            message = 'My Transactions'; 
            data = response
            return sendResponse(status,message,data);
	    } else { 
           return sendResponse(status,"No trasaction history.",data);
	    }	
	} catch (err){
        console.log(err) 
	}   
}
/**
 * Desc : Register on tournaments entry fee  
 * Req  :{ user_id,tournament_id,game_play_id,category_type_id}
 * Function : createGamePlayTransactionReports
 */
const createGamePlayTransactionReports = async(req) => {
    const orderId      = crypto.randomBytes(16).toString("hex"); 
    let message;
	let status = 404;
	let data   = {};
    try{  
        if(!req.user_id) return sendResponse(status,"Invalid details.",data)  
        const sql1  = `INSERT INTO transactions Set ?`;
        const forms = {
            user_id     : req.user_id,
            order_id    : crypto.randomBytes(8).toString("hex"),
            txn_id      : orderId,
            tournament_id:req.tournament_id,
            currency    : 'INR', 
            txn_amount  : req.orderAmount,
            txn_date    : moment().format(),
            banktxn_id  : 1,
            added_type  : 'Entry Fee',
            gateway_name: 'Local Wallet', 
            local_txn_id: `LTD${moment().format('YYYYMMDDHHmmss')}`,
            payment_mode: "WALLET",
            banktxn_id : `${moment().format('MMDDHHmmss')}${req.user_id}`,
            status : 1,
            is_type: 5
        } 
        let results = await db.query(sql1,forms); 
	    if(results) { 
            status = 201
            message = "Success" 
	    } else { 
            status = 403
            message = 'failed' 
	    }	
        return sendResponse(status,message,data);
	} catch (err){
        console.log(err) 
	}   
}

const withdrawRequest = async(req) => { 
    let message;
	let status = 404;
	let data   = {};
    try{  
        const {user_id,req_amount,is_mode} = req
        if(!req.user_id) return sendResponse(status,"Invalid details.",data)  
        const sql1  = `SELECT * FROM users WHERE user_id = ? LIMIT ?`;
        let results = await db.query(sql1,[user_id,1]); 
        let sql2 = `SELECT * FROM bank_details WHERE user_id = ? limit ?`;
        let checkBankDetails = await db.query(sql2, [user_id, 1]); 
        if(results.length>0){
            const data = await userTransactionsHistory(user_id) 
            if(req_amount>1){
                if(checkBankDetails.length>0){
                    if(data.winning_amount>=req_amount){
                        const forms = {
                            user_id     : req.user_id,
                            order_id    : crypto.randomBytes(8).toString("hex"),
                            txn_id      : crypto.randomBytes(6).toString("hex"), 
                            currency    : 'INR', 
                            txn_amount  : req_amount,
                            txn_date    : moment().format(),
                            banktxn_id  : 1,
                            added_type  : 'Withdraw request',
                            gateway_name: 'Withdraw', 
                            local_txn_id: `WTD${moment().format('YYYYMMDDHHmmss')}`,
                            payment_mode: "WALLET",
                            banktxn_id : `${moment().format('MMDDHHmmss')}${req.user_id}`,
                            status : 1,
                            is_type: 7,
                            is_request_mode:is_mode
                        } 
                        const sql  = `INSERT INTO transactions Set ?`;
                        let results = await db.query(sql,forms); 
                        if(results) { 
                            status = 201
                            message = "Withdraw request submitted" 
                        } else { 
                            status = 403
                            message = 'failed' 
                        }
                    }else{
                        status = 404
                        message = "Insufficient balance!"
                    }
                }else{
                    status = 404
                    message = "Please add bank account details"
                }
                 
            }else{
                status = 404
                message= "Minimum withdraw limit greater 1"
            }
        }else{
            status = 404
            message= "User not valid"
        }
       	
        return sendResponse(status,message,data);
	} catch (err){
        console.log(err) 
	}   
}

module.exports = {
    withdrawRequest,
    getTransactionHistory,
    getUserTransactionAmount,
    createGamePlayTransactionReports,
    userTransactionsHistory}
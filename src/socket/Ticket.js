// const debug = require("debug")("test");
const db     = require("../../config/db"); 
const crypto = require("crypto"); 
const moment = require('moment')
const {sendResponse,isValidArray} = require('../../services/AppService');
const {checkUser} = require('./Users')

let status = 404;
let data ={};
let message
// Check battle types
const getUserTickets = async(req)=>{
    try {
        const { user_id} = req;  
        if (!user_id) return sendResponse(status = 404, "Invalid details.", data) 
        let request = {
            user_id:user_id,
            type:'userID'
        } 
        const user = await checkUser(request) 
        if(user.status ===200){
            const sql = `SELECT * FROM user_tickets WHERE user_id = ?`
            let tickets = await db.query(sql,[user_id]);  
            console.log(tickets,'tickets')
            if(tickets.length>0){
                const ticket = (JSON.parse(JSON.stringify(tickets)));
                message = "Success"
                status = 200
                data=ticket
            }else{
                message = "Success"
                status = 200
                data={}
            }
        }else{
            status = 404
            message ="Invalid details!"
        }
       
       return sendResponse(status, message, data)
    } catch (error) {
        
    }
}
/**
 * Desc : Get user transactions history  
 * Req  :{ user_id,tournament_id,game_play_id,category_type_id}
 * Function : getTransactionHistory
 */

const createUserTickets = async(req) => { 
    try{ 
        const { user_id,description,ticket_title} = req;  
        if (!user_id) return sendResponse(status = 404, "Invalid details.", data) 
        if (!description) return sendResponse(status = 404, "Description should not be empty.", data) 
        if (!ticket_title) return sendResponse(status = 404, "Invalid ticket title", data) 

        let request = {
            user_id:user_id,
            type:'userID'
        } 
        const user = await checkUser(request) 
        if(user.status ===200){
            const tickeId = crypto.randomBytes(6).toString("hex");
            let form = {
                user_id    :user_id,
                ticket_id   :tickeId,
                ticket_title:ticket_title,
                created_date:moment().format('ll'),
                ticket_generate_time:moment().format('lll'),
                description :description
            }
            const sql = `INSERT INTO user_tickets SET ?`
            let tickets = await db.query(sql,form);
            if(tickets) {
                message = 'Ticket created'
                status = 201
                data= {
                    ticke_id:tickeId
                }
            }else{
                message = 'Data base error'
                status = 500
            }
	    } else { 
            message = "Something went wrong! database error"
	    }	
        return sendResponse(status,message,data);
	} catch (err){
        console.log(err) 
	}   
}
 

module.exports = {
    createUserTickets,
    getUserTickets
}
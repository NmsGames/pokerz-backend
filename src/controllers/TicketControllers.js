 
const check  = require('../validation/CheckValidation') 
const conn   = require('../../config/db')
const moment = require('moment')
// User raise tickets
let status = 404;
const getRaiseTickets = async (req, res) => {  
    // con
    try { 
        let sql = `SELECT * FROM user_tickets left join users on users.user_id = user_tickets.user_id where user_tickets.ticket_title !='' AND (user_tickets.is_status = 0 or user_tickets.is_status = 1) order by user_tickets.created_at DESC`;
        let user = await conn.query(sql);
        if(user.length>0){
            status = 200;
            message ='Success'
            const usersRows = (JSON.parse(JSON.stringify(user))); 
            data = usersRows
        }else{
            status = 404
            message = 'Users not found'
            data = {};
        } 
        const responseData = {
            status: status,
            message:message, 
            data: data
        } 
        res.send(responseData) 
    } catch (e) {
        res.status(404).send('ERR')
    }

}

const getTicketById = async (req, res) => {  
    // con
    // console.log(req.params.ticketId)
    try { 
        let sql = `SELECT * FROM user_tickets left join users on users.user_id = user_tickets.user_id where (user_tickets.is_status = 0 or user_tickets.is_status = 1) AND user_tickets.ticket_id = ? order by user_tickets.created_at`;
        let user = await conn.query(sql,[req.params.ticketId]);
        if(user.length>0){
            status = 200;
            message ='Success'
            const usersRows = (JSON.parse(JSON.stringify(user))); 
            data = usersRows
        }else{
            status = 404
            message = 'Users not found'
            data = {};
        } 
        const responseData = {
            status: status,
            message:message, 
            data: data
        } 
        res.send(responseData) 
    } catch (e) {
        res.status(404).send('ERR')
    }

}
 
const replyTickets = async (req, res) => {  
    // con
    // console.log(req.params.ticketId)
    let data = {};
    try {  
        console.log(req.body)
        let form = {
            user_id     :req.body.user_id,
            ticket_id   :req.body.ticket_id,
            ticket_title:null,
            created_date:moment().format('ll'),
            ticket_generate_time:moment().format('lll'),
            description :req.body.description
        }
        let let_status = 0
        if(req.body.is_status ==3){
            let_status = 2
        }else{
            let_status = 1
        }
        let sql1 = "UPDATE user_tickets Set is_status= ? WHERE ticket_id= ?"
        await conn.query(sql1, [let_status, req.body.ticket_id]);

        const sql = `INSERT INTO user_tickets SET ?`
        let tickets = await conn.query(sql,form);
        if(tickets) {
            message = 'Replied'
            status = 201 
            let sql = `SELECT * FROM user_tickets left join users on users.user_id = user_tickets.user_id where (user_tickets.is_status = 0 or user_tickets.is_status = 1) AND user_tickets.ticket_id = ? order by user_tickets.created_at`;
            let tickets = await conn.query(sql,[req.body.ticket_id]);
            if(tickets.length>0){
                status = 200;
                message ='Success'
                const ticketssRows = (JSON.parse(JSON.stringify(tickets))); 
                data = ticketssRows
            }else{
                status = 404
                message = 'Users not found'
                data = {};
            } 
            const responseData = {
                status: status,
                message:message, 
                data: data
            }
        }else{
            message = 'Data base error'
            status = 500
        }
         
        const responseData = {
            status: status,
            message:message, 
            data: data
        } 
        res.send(responseData) 
    } catch (e) {
        res.status(404).send('ERR')
    }

}


const getTicketsByStatus = async (req, res) => {  
    // con
    try { 
        let status = req.params.status;  
        let sql = `SELECT * FROM user_tickets left join users on users.user_id = user_tickets.user_id where user_tickets.ticket_title !='' AND user_tickets.is_status = ? order by user_tickets.created_at DESC`;
        let tickets = await conn.query(sql,[status]);
        if(tickets.length>0){
            status = 200;
            message ='Success'
            const ticketssRows = (JSON.parse(JSON.stringify(tickets))); 
            data = ticketssRows
        }else{
            status = 404
            message = 'Tickets not found'
            data = {};
        } 
        const responseData = {
            status: status,
            message:message, 
            data: data
        } 
        res.send(responseData) 
    } catch (e) {
        res.status(404).send('ERR')
    }

}
module.exports = {
    getTicketById,
    getRaiseTickets,
    replyTickets,
    getTicketsByStatus
}
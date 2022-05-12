const conn   = require('../../config/db') 
const moment = require('moment');
const path   = require('path');
const check  = require('../validation/CheckValidation')
const {checkUser} = require('../socket/Users')
var pan = require('validate-india').pan;
let message = null
let status  = 400
let response={}
let errors={}
let data = {};
// Add money function

const uploadProfilePic = async (req, res) => { 
    try {
        // const errors = check.resultsValidator(req)
        // if (errors.length > 0) {
        //     return res.status(400).json({
        //         method: req.method,
        //         status: res.statusCode,
        //         error: errors
        //     })
        // }d
        let sql = `SELECT * FROM users WHERE user_id= ? limit ?`;
        let user = await conn.query(sql, [req.body.user_id, 1]);
        console.log(user,'as')
        if(!user.length>0)res.send({status:404,message:"user not found"})
        console.log(req.body)
        if (!req.files || Object.keys(req.files).length == 0) {
            res.status(400).send({ status: statusCode, message: 'No file are uploaded' })
        }
        prfoileFile = req.files.avatar
        let reqPath = path.join(__dirname, '../../public')
        const imagUrl= `Avatars/${prfoileFile.name}`
        uploadPath = `${reqPath}/${imagUrl}` 
        const profile = await prfoileFile.mv(uploadPath)

        let sql1 = "UPDATE users Set avatar= ? WHERE user_id= ?"
        const users = await conn.query(sql1, [imagUrl, req.body.user_id]);
        let statusCode = 404
        if (users) {
            statusCode = 200
            message = 'Image uploaded success'
        } else {
            statusCode = 500
            message = 'Unable to upload'
        }

        const responseData = {
            status: statusCode,
            message,
            errors: {}
        }
        res.send(responseData)
    } catch (error) {
        res.send('error')
    }

}
const retrieveProfilePic = async (req, res) => {
    console.log('121221212121212',pan.isValid('DPVPM8916J'))
    try {
        console.log('re',req.params.id)
        let sql = `SELECT * FROM users WHERE user_id= ? limit ?`;
        let user = await conn.query(sql, [req.params.id, 1]);
        const usersRows = (JSON.parse(JSON.stringify(user))[0]); 

        if(usersRows.avatar ==null) usersRows.avatar = 'Avatars/default.png';
        const responseData = {
            status: 200,
            message:'Success',
            avatarLink:`${req.protocol}://${req.headers.host}/${usersRows.avatar}`,
            errors: 'error'
        }  
        res.send(responseData) 
    } catch (e) {
        res.status(404).send()
    }

}

const getUsers = async (req, res) => {  
    // con
    try { 
        let sql = `SELECT * FROM users`;
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

const getProfiles = async (req, res) => {  
    // con
    try { 
        const { user_id } = req.body 
        let sql = `SELECT * FROM users WHERE user_id= ? limit ?`;
        let user = await conn.query(sql, [user_id, 1]);
        if(user.length>0){
            status = 200;
            message ='My Profile'
            const usersRows = (JSON.parse(JSON.stringify(user))[0]); 
            console.log(usersRows)
            data ={
                user_id     : usersRows.user_id,
                username    : usersRows.username,
                first_name  : usersRows.first_name,
                last_name   : usersRows.last_name,
                email       : usersRows.email,
                phone       : usersRows.phone,
                gender      : usersRows.gender==1?"M":"F",
                state       : usersRows.state,
                city        : usersRows.city,
                postal_code : usersRows.postal_code,
                google_id   : usersRows.google_id,
                cash_balance: usersRows.cash_balance,
                bonus_amount: usersRows.bonus_amount,
                vip_points  : usersRows.vip_points,
                last_login  : usersRows.last_login,
                coin_balance: usersRows.coin_balance,
                date_of_birth: usersRows.date_of_birth,
                winning_balance: usersRows.winning_balance,
                monthly_vip_points: usersRows.monthly_vip_points,
                yearly_vip_points: usersRows.yearly_vip_points
            } 
        }else{
            status = 404
            message = 'Invalid user Id'
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

const searchPlayers = async (req, res) => {  
    // con
    try { 
        const search = req.query.name
        const user_id    = req.query.user_id
        let data = [];
        if(search.length>2){
            sql = `SELECT * FROM users WHERE LOWER(user_id)= ? limit ?`;
            let user = await conn.query(sql, [user_id, 1]);
        if (user.length > 0){ 
            var searchEmployees = `SELECT user_id,username,first_name,email FROM users WHERE user_id !=${user_id} AND (username LIKE '${search}%' OR first_name LIKE '${search}%' OR email LIKE '${search}%')`
       
            const dat = await conn.query(searchEmployees)
            if(dat.length>0)
            {
                status = 200;
                message ='Success'
                data = (JSON.parse(JSON.stringify(dat)));  
            }else{
                status = 404;
                message ='Players not found'
            }
        }else{
            status = 404;
            message ='Unauthorized'
        }
       
        }else{
            status = 404;
            message ='Search key length must be greater 2'
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

const friendRequest = async (req, res) => {  
    // con
    try {  
        const from_player_id = req.body.from_player_id
        const to_player_id   = req.body.to_player_id
        let data ={}; 
        let user = ""
        sql = `SELECT * FROM users WHERE user_id= ? limit ?`;
        user = await conn.query(sql, [from_player_id, 1]);
        if(user.length>0){
            sql = `SELECT * FROM users WHERE user_id= ? limit ?`;
            user = await conn.query(sql, [to_player_id, 1]);
            if(user.length>0){
                const formData = {
                    from_player_id,
                    to_player_id
                }
                sql = `SELECT * FROM friend_request_table WHERE from_player_id= ? AND to_player_id =? limit ?`;
                let checkFriend = await conn.query(sql, [from_player_id,to_player_id, 1]);
                if (checkFriend.length > 0){ 
                if(checkFriend[0].is_status == 0)
                {
                    status = 404;
                    message ='Already requested'
                }else if(checkFriend[0].is_status == 1){
                        status = 404;
                        message ='Already in friend list'
                }else{
                        sql = `INSERT INTO friend_request_table Set ?`;
                        let user = await conn.query(sql,formData);
                        if(user){
                            status = 200;
                            message ='Friend request has sent'
                        }else{
                            status = 404;
                            message ='Something Went wrong'
                        }
                } 
                }else{ 
                    sql = `INSERT INTO friend_request_table Set ?`;
                    let check = await conn.query(sql,formData);
                    if(check){
                        status = 200;
                        message ='Friend request has sent'
                    }else{
                        status = 404;
                        message ='Something Went wrong'
                    }
                }
            }else{
                status = 404;
                message ='Invalid to player id'
            }
        }else{
            status = 404;
            message ='Invalid from player id'
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
 

const getFriendReqNotify = async (req, res) => {  
    // con
    try {   
        const to_player_id = req.params.user_id 
        let data ={}; 
        let user = ""  
        let sql = ''
            sql = `SELECT * FROM users WHERE user_id= ? limit ?`;
            user = await conn.query(sql, [to_player_id, 1]);
            if(user.length>0){
                sql = `SELECT users.user_id,users.username,users.email,friend_request_table.fr_id as req_id FROM friend_request_table LEFT JOIN users ON users.user_id = friend_request_table.from_player_id where friend_request_table.to_player_id =? and friend_request_table.is_status =0`;
                let users = await conn.query(sql, [to_player_id]);
                if(users.length>0){
                    status = 200;
                    message ='Success'
                    let result = new Array();
                    for (var i = 0; i < users.length; i++) { 
                        let req_id  = users[i].req_id?users[i].req_id:0; 
                        let email   = users[i].email?users[i].email:''; 
                        let username= users[i].username?users[i].username:`Guest000${users[i].user_id}`; 
                        result[i]= { req_id ,username,email};
                    }
                    data = result;  
                }else{
                    status = 404;
                    message ='No request'
                }    
            }else{
                status = 404;
                message ='Invalid player UserId'
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

const getFriendList = async (req, res) => {  
    // con
    try {   
        const to_player_id = req.params.user_id 
        let data ={}; 
        let user = ""  
        let sql = ''
            sql = `SELECT * FROM users WHERE user_id= ? limit ?`;
            user = await conn.query(sql, [to_player_id, 1]);
            if(user.length>0){
                sql = `SELECT users.user_id,users.username,users.email,friend_request_table.fr_id as req_id FROM friend_request_table LEFT JOIN users ON users.user_id = friend_request_table.from_player_id where friend_request_table.to_player_id =? and friend_request_table.is_status =1`;
                let users = await conn.query(sql, [to_player_id]);
                if(users.length>0){
                    status = 200;
                    message ='Success'
                    let result = new Array();
                    for (var i = 0; i < users.length; i++) { 
                        let req_id  = users[i].req_id?users[i].req_id:0; 
                        let email   = users[i].email?users[i].email:''; 
                        let username= users[i].username?users[i].username:`Guest00${users[i].user_id}`; 
                        result[i]= { req_id ,username,email};
                    }
                    data = result;  
                }else{
                    status = 404;
                    message ='No Friends'
                }    
            }else{
                status = 404;
                message ='Invalid player UserId'
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
const updateFriendReqStatus = async (req, res) => {  
    // con
    let statusCode = 404
    let message;
    try {  
        const {req_id,status} = req.body  
        if(!status) res.send('Invalid status code') 
        let data ={}; 
        let user = ""  
        let sql = ''
            sql = `SELECT * FROM friend_request_table WHERE fr_id= ? AND is_status = ? limit ?`;
            user = await conn.query(sql, [req_id,0,1]);
            if(user.length>0)
            {   
                let sql1 = "UPDATE friend_request_table Set is_status= ? WHERE fr_id= ?"
                const fr_status = await conn.query(sql1, [status, req_id]);
                if(fr_status){
                    statusCode = 200;
                    if(status ==1){
                        message ='Accepted friend request' 
                    }else{
                        message ='Rejected friend request' 
                    } 
                }else{
                    statusCode = 404;
                    message ='Unable to updated'
                }    
            }else{
                statusCode = 404;
                message ='Invalid Id'
            }
       
        const responseData = {
            status: statusCode,
            message:message, 
            data: data
        } 
        res.send(responseData) 
    } catch (e) {
        res.status(500).send('Database error')
    }

}
const updateProfile = async (req, res) => { 
    let statusCode=404;
    let message=null;
    try { 
        
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        } 
        const {user_id,avatar_index,watch_index,ring_index,username} = req.body

        let sql = `SELECT * FROM users WHERE user_id = ? limit ?`;
        let user = await conn.query(sql, [user_id, 1]);
        
       
        if(user.length>0){ 
            const formData = {
                ring_index:ring_index?ring_index:user[0].ring_index,
                watch_index:watch_index?watch_index:user[0].watch_index,
                avatar_index:avatar_index?avatar_index:user[0].avatar_index,
                username:username?username:user[0].username,
            } 
            let sql1 = "UPDATE users Set ? WHERE user_id= ?"
            const users = await conn.query(sql1, [formData, user_id]);
            
            if (users) {
                statusCode = 200
                message = 'Profie Updated'
            } else {
                statusCode = 500
                message = 'Unable to update'
            } 
        }else{
            message="user not found"
        }
         const responseData = {
            status: statusCode,
            message, 
        }
        res.send(responseData)
    } catch (error) {
        res.send({
            status:500,
            message:'database error',
            error
        })
    }

}

const updatePoints = async (req, res) => { 
    let statusCode=404;
    let message=null;
    let data;
    try { 
        
        
        const {user_id,coins,points} = req.body

        let sql = `SELECT * FROM users WHERE user_id = ? limit ?`;
        let user = await conn.query(sql, [user_id, 1]);

        let re = /^[[0-9]/; 
        if(user.length>0){ 
            if(re.test(coins)){
                if(re.test(points)){
                    const formData = {
                        user_points : user[0].user_points>0?(user[0].user_points+points):points,
                        user_coins : user[0].user_coins>0?(user[0].user_coins+coins):coins,
                    } 
                    let sql1 = "UPDATE users Set ? WHERE user_id= ?"
                    const users = await conn.query(sql1, [formData, user_id]);
                    if(users){
                        statusCode = 200
                        message = 'Wallet updated'
                        data = {
                            points : user[0].user_points>0?(user[0].user_points+points):points,
                            coins : user[0].user_coins>0?(user[0].user_coins+coins):coins,
                        }
                    }
                }else{
                    statusCode = 404
                    message = 'Invalid points'
                }
            }else{
                statusCode = 404
                message = 'Invalid Coins'
            } 
        }else{
            message="Invalid Id"
        }
         const responseData = {
            status: statusCode,
            message, 
            user:data
        }
        res.send(responseData)
    } catch (error) {
        res.send({
            status:500,
            message:'database error',
            error
        })
    }

}

module.exports = { 
updateProfile,
    uploadProfilePic,
    retrieveProfilePic,
    getUsers,
    getProfiles,
    searchPlayers,
    friendRequest,
    getFriendReqNotify,
    getFriendList,
    updateFriendReqStatus,
    updatePoints
}
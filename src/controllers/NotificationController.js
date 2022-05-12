const check  = require('../validation/CheckValidation') 
const conn   = require('../../config/db')
const moment = require('moment')
// User raise tickets
let status = 404;
const getNotification = async (req, res) => {  
    // con
    try { 
        let sql = `SELECT * FROM notification`;
        let user = await conn.query(sql);
        if(user.length>0){
            status = 200;
            message ='Success'
            const usersRows = (JSON.parse(JSON.stringify(user))); 
            data = usersRows
        }else{
            status = 404
            message = 'Game Play category not found'
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

 


// const getGameCategory = async (req, res) => {  
//     // con
//     try { 
//         let status = req.params.status;  
//         let sql = `SELECT * FROM category`;
//         let games = await conn.query(sql,[status]);
//         if(games.length>0){
//             status = 200;
//             message ='Success'
//             const gamessRows = (JSON.parse(JSON.stringify(games))); 
//             data = gamessRows
//         }else{
//             status = 404
//             message = 'Game Category not found'
//             data = {};
//         } 
//         const responseData = {
//             status: status,
//             message:message, 
//             data: data
//         } 
//         res.send(responseData) 
//     } catch (e) {
//         res.status(404).send('ERR')
//     }

// }

// //Prize distrubtion ranks

// const getRanksByID = async (req, res) => {  
//     // con
//     try { 
//         let category_id = req.params.categoryID;  
//         let sql = `SELECT * FROM ranks left join winner_type on ranks.winner_type_id = winner_type.type_id where game_category_id = ? order by ranks.winner_type_id`;
//         let user = await conn.query(sql,[category_id]);
//         let categories = {};
//         if(user.length>0){
//             status = 200;
//             message ='Success'
//             let sql1 = `SELECT * FROM game_play_category left join category on category.category_id = game_play_category.category_id WHERE game_play_category.game_category_id = ? order by category.category_id`;
//             let cat = await conn.query(sql1,[category_id]);
//             categories =(JSON.parse(JSON.stringify(cat))[0]); 
//             const usersRows = (JSON.parse(JSON.stringify(user)));  
//             data = usersRows
//         }else{
//             status = 404
//             message = 'Ranks not found'
//             data = {};
//         } 
//         const responseData = {
//             status: status,
//             message:message, 
//             data: data,
//             categories
//         } 
//         res.send(responseData) 
//     } catch (e) {
//         res.status(404).send('ERR')
//     }

// }
module.exports = {
    getNotification,
    // getGameCategory,
    // getRanksByID,
    // getTicketsByStatus
}
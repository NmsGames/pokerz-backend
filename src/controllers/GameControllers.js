 
const check  = require('../validation/CheckValidation') 
const conn   = require('../../config/db')
const moment = require('moment')
const {GetRandomNo} = require('../AppService')
// User raise tickets
let status = 404;
const getGameBidAmounts = async (req, res) => {  
    // con
    try { 
        let sql = `SELECT * FROM game_play_category left join category on category.category_id = game_play_category.category_id order by category.category_id`;
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

 


const getGameCategory = async (req, res) => {  
    // con
    try { 
        let status = req.params.status;  
        let sql = `SELECT * FROM category`;
        let games = await conn.query(sql,[status]);
        if(games.length>0){
            status = 200;
            message ='Success'
            const gamessRows = (JSON.parse(JSON.stringify(games))); 
            data = gamessRows
        }else{
            status = 404
            message = 'Game Category not found'
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

//Prize distrubtion ranks

const getRanksByID = async (req, res) => {  
    // con
    try { 
        let category_id = req.params.categoryID;  
        let sql = `SELECT * FROM ranks left join winner_type on ranks.winner_type_id = winner_type.type_id where game_category_id = ? order by ranks.winner_type_id`;
        let user = await conn.query(sql,[category_id]);
        let categories = {};
        if(user.length>0){
            status = 200;
            message ='Success'
            let sql1 = `SELECT * FROM game_play_category left join category on category.category_id = game_play_category.category_id WHERE game_play_category.game_category_id = ? order by category.category_id`;
            let cat = await conn.query(sql1,[category_id]);
            categories =(JSON.parse(JSON.stringify(cat))[0]); 
            const usersRows = (JSON.parse(JSON.stringify(user)));  
            data = usersRows
        }else{
            status = 404
            message = 'Ranks not found'
            data = {};
        } 
        const responseData = {
            status: status,
            message:message, 
            data: data,
            categories
        } 
        res.send(responseData) 
    } catch (e) {
        res.status(404).send('ERR')
    }

}

const gameRegister = async (req, res) => {  
    // con
    try { 
        // let status = req.params.status;  
        let user_id = 2
        let master_table_id = 1
        let challenge_id = 1
 
        let today_date = moment(new Date()).format("YYYY-MM-DD")
        let sql = `SELECT * FROM master_table where master_table_id = ? limit 1`;
        let tables_history = await conn.query(sql,[master_table_id]);
        res.send(tables_history)
        if(tables_history.length>0){
            status  = 200;
            message ='Success'
            let playerSize = tables_history[0].player_size
            if(tables_history[0].maximum_stack ==8){
                if(playerSize){

                }
            }else{

            }
            const  gamessRows = (JSON.parse(JSON.stringify(tables_history))); 
            let sql = `SELECT * FROM round_history where master_table_id = ? AND created_at = ? GROUP BY round_count`;
            let round_history = await conn.query(sql,[master_table_id,today_date]);
            if(round_history.length>0)
            {
                status  = 404
                message = 'dist!'
            }else{
                const round = GetRandomNo(1000,9999)
                const date  = moment(new Date()).format("HHmmss");
                const RoundCount = (parseInt(date)+parseInt(round))  
                const formData = {
                    round_count     : RoundCount,
                    master_table_id : master_table_id,
                    challenge_id    : challenge_id,
                    created_at      : today_date
                }
                const sql = `INSERT INTO round_history SET ?`
                let tickets = await conn.query(sql,formData);
               const  table = {  
                // category_id:1  , 
                // challenge_id:tables_history[0].challenge_id,
                // category_id:tables_history[0].category_id, 
                // tournament_name:tables_history[0].tournament_name,
                // image:tables_history[0].image,
                // pot_limit:tables_history[0].pot_limit,
                // minimum_pot_limit:tables_history[0].minimum_pot_limit,
                // maximum_pot_limit:tables_history[0].maximum_pot_limit,
                // minimum_stack:tables_history[0].minimum_stack,
                // maximum_stack:tables_history[0].maximum_stack,
                // tournament_size:tables_history[0].tournament_size,
                // winners:tables_history[0].winners,
                // admin_comission:tables_history[0].admin_comission,
                // tournament_type:tables_history[0].tournament_type,
                // start_date:tables_history[0].maximum_stack,
                // end_date:tables_history[0].maximum_stack,
                // start_time:tables_history[0].maximum_stack,
                // end_time:tables_history[0].maximum_stack,
                // winning_type:tables_history[0].winning_type,
                // end_time:tables_history[0].end_time,
                // player_size:tables_history[0].player_size,
                // is_croned:tables_history[0].is_croned, 
                     }
            }
            data = gamessRows
        }else{
            status = 404
            message = 'Sorry Table not exist!'
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
    getGameBidAmounts,
    getGameCategory,
    getRanksByID,
    gameRegister
}
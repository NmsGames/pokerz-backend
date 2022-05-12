 
const check  = require('../validation/CheckValidation') 
const conn   = require('../../config/db')
const moment = require('moment')

const {sendResponse,GetRandomNo,isValidArray} = require('../AppService');
// User raise tickets
let status = 404;

const roundTablesList = async (req, res) => {  
    // con 
    let message;
    let status =404
    let data = {}
    try { 
        
        // winning_type = "INR",
        let sql = `SELECT  * FROM master_table LEFT JOIN game_challenge_table ON game_challenge_table.challenge_id = master_table.challenge_id WHERE master_table.is_active =1`;
        let challenge = await conn.query(sql);
        if(isValidArray(challenge)){
            status = 200;
            message ='Success' 
            let result = new Array(); 
            for (var i = 0; i < challenge.length; i++) { 
                let master_table_id       = challenge[i].master_table_id;  
                let challenge_id       = challenge[i].challenge_id; 
                let game_category       = challenge[i].game_category;  
                let game_type           = challenge[i].game_type; 
                let minimum_pot_limit   = challenge[i].minimum_pot_limit; 
                let tournament_size     = challenge[i].tournament_size; 
                let maximum_pot_limit   = challenge[i].maximum_pot_limit;  
                let start_date          = challenge[i].start_date; 
                let end_date            = challenge[i].end_date;
                let winning_amount      = challenge[i].winning_amount;   
                let start_time          = challenge[i].start_time; 
                let end_time            = challenge[i].end_time;
                let minimum_stack       = challenge[i].minimum_stack;
                let maximum_stack       = challenge[i].maximum_stack;
                let winning_type        = challenge[i].winning_type;
                let is_active        = challenge[i].is_active;
                let players             = challenge[i].player_size?challenge[i].player_size:0;
                let image              = '';
                result[i] = {  
                    master_table_id  , 
                    players,
                    challenge_id  , 
                    image,
                     game_category , 
                     game_type   , 
                     minimum_pot_limit , 
                     tournament_size, 
                     maximum_pot_limit, 
                     winning_amount ,   
                     start_time     , 
                     end_time       ,
                     minimum_stack  , 
                     maximum_stack,
                     winning_type   , 
                     start_date     , 
                     end_date    ,
                     is_active   
                     
                     }
            } 
            data = result
        }else{
            status = 404
            message = 'Not found'
            data = {};
        } 
        const responseData = {
            status: status,
            message:message, 
            data: data
        } 
        res.send(responseData) 
    } catch (e) {
        res.status(404).send({
            status:500,
            message:'Database error'
        })
    }

}



//GEt challenges
const getChallenges = async (req, res) => {  
    // con
 
    let message;
    let status =404
    let data = {}
    try {  
      
        // winning_type = "INR",
        let sql = `SELECT * from game_challenge_table `;
        let challenge = await conn.query(sql);
        if(isValidArray(challenge)){
            status = 200;
            message ='Success' 
            let result = new Array(); 
            for (var i = 0; i < challenge.length; i++) { 
                let challenge_id        = challenge[i].challenge_id;   
                let hands               = challenge[i].hands;   
                let description          = challenge[i].description;
                let chips               = challenge[i].chips;   
                let start_time          = challenge[i].start_time; 
                let end_time            = challenge[i].end_time; 
                let type                =( challenge[i].is_type==1)?'Weekly':(challenge[i].is_type ==2)?'Daily':"Monthly" 
                let is_status           =( challenge[i].is_type==1)?'Active':(challenge[i].is_type ==2)?'Coming':"Closed" 
                let image               = challenge[i].image;  
                let icon                = challenge[i].icon;  
                result[i] = {  
                    is_status,
                        challenge_id  , 
                        type,
                        image,
                        icon, 
                        description,
                        hands, 
                        chips ,   
                        start_time , 
                        end_time , 
                     }
            } 
            data = result
        }else{
            status = 404
            message = 'Not found'
            data = {};
        } 
        const responseData = {
            status: status,
            message:message, 
            data: data
        } 
        res.send(responseData) 
    } catch (e) {
        res.status(404).send({
            status:500,
            message:'Database error'
        })
    }

}

 
const recentPlayers = async (req, res) => {  
    // con
 
    let message;
    let status =404
    let data = {}
    try { 
        console.log(req.params)
         const {user_id}  = req.params
        // winning_type = "INR",
        let sql = `SELECT A.*,U.email,U.username,U.user_id,U.avatar_index,U.ring_index,U.watch_index,F.*,A.created_at FROM game_round_record A 
        INNER JOIN game_play_history C ON A.player_id = C.player_id
        INNER JOIN game_play_history AS B ON A.table_round_count = B.table_round_count
        INNER JOIN users U ON U.user_id = A.player_id
        LEFT JOIN friend_request_table F ON F.from_player_id = A.player_id
        WHERE B.player_id =? AND A.player_id !=?
         GROUP BY A.player_id`;
        //  let sql = `SELECT A.* FROM game_round_record A`;
        //  console.log('recentPlayer')
        let id = user_id
        let recentPlayer = await conn.query(sql,[id,user_id]);
        if(isValidArray(recentPlayer)){
            status = 200;
            message ='Success' 
            let result = new Array(); 
             
            for (var i = 0; i < recentPlayer.length; i++) { 
                let user_ids       = recentPlayer[i].user_id;  
                let username       = recentPlayer[i].username?recentPlayer[i].username:`Guest00${recentPlayer[i].user_id}`; 
                let avatar_index   = recentPlayer[i].avatar_index; 
                let ring_index     = recentPlayer[i].ring_index; 
                let watch_index = recentPlayer[i].watch_index; 
                let is_friend      =   ((user_id == recentPlayer[i].to_palyer_id) && (recentPlayer[i].is_status ==1))?1:0;
                let is_active      = 0; 
                let played_date_time=recentPlayer[i].created_at; 
                let email          = recentPlayer[i].email;  
                 
                result[i] = {  
                    user_id:user_ids, 
                     username, 
                     avatar_index,
                     ring_index,
                     watch_index,
                     email, 
                     played_date_time,
                     is_active,
                     is_friend 
                     }
            }  
          
            data = result   
        }else{
            status = 404
            message = 'No recent players'
            data = {};
        } 
        const responseData = {
            status: status,
            message:message, 
            data: data
        } 
        res.send(responseData) 
    } catch (e) {
        res.status(404).send({
            status:500,
            message:'Database errors'
        })
    }

}




 
module.exports = {
    getChallenges, 
    recentPlayers, 
    roundTablesList
}
const conn          = require("../../config/db.js");
const events        = require("../../Utility/Constant").Events;  
const {checkUser}   = require('./Users') 
const {sendResponse} = require('../../services/AppService');
const {createGamePlayTransactionReports,
    userTransactionsHistory} = require('./Transactions');
const moment = require('moment');
var cron = require('node-cron');
const crypto = require("crypto"); 
let message;
let status = 404;
const categoryType = async () => {
    try {
        let categoryTypeArray = [];
        sql = `SELECT game_category_id as category_id,category_name as type FROM game_play_category`;
        if (categoryTypeArray.length < 1) {
            let results = await conn.query(sql);
            const catgeory = (JSON.parse(JSON.stringify(results)));
            categoryTypeArray = catgeory
        }
        return categoryTypeArray; 
    } catch (err) {
        console.log(err)
    }
}
/**
 * Desc : Check category exist or not
 * Req  : { category_id}
 * Function : gameCategory()
 */
const gameCategory = async (category_id) => {
    try { 
        const sql   = `SELECT category_id,category_name FROM category WHERE category_id= ? limit ?`; 
        let results = await conn.query(sql,[category_id,1]);
        let data = {}; 
        let status = 404
        if(results.length > 0){  
            status=200 
            data = {
                category_name:results[0].category_name,
                category_id:results[0].category_id
            }
        }else{ 
            status=404 
        }
        return sendResponse(status,"message.",data); 
    } catch (err) {
        console.log(err)
    }
}
/**
 * Desc : Check game play category exist or not
 * Req  : { game_pc_id}
 * Function : gamePlayCategory()
 */
const gamePlayCategory = async (game_pc_id) => {
    try { 
        const sql   = `SELECT game_category_id,entry_fee,play_time FROM game_play_category WHERE game_category_id= ? limit ?`; 
        let results = await conn.query(sql,[game_pc_id,1]);
        let data = {};
        if(results.length >0){ 
            data = {
                status:200,
                entry_fee:results[0].entry_fee,
                play_time:results[0].play_time
            }
        }else{
            data = {
                status:404
            }
        }
     return data;  
    } catch (err) {
        console.log(err)
    }
}
 
/**
 * Desc : Check tournaments entry time expired or not
 * Req  : { tournament_id}
 * Function : lobbyTournaments()
 */
const lobbyTournaments = async (req) => { 
    try {  
        let data = {};
        let status = 404;
        const tournament_id = req; 
        if(!tournament_id) return sendResponse(404,"Invalid details.",data) 
        const sql       = `SELECT * from tournaments where tournament_id = ? limit ?`; 
        let results     = await conn.query(sql,[tournament_id,1]);  
        if(results.length > 0){
            const usersRows = (JSON.parse(JSON.stringify(results))[0]);
            status = 200
            data = usersRows
        }  
        return sendResponse(status,"message.",data); 
    } catch (err) {
        console.log(err)
    }
}
 
/**
 * Desc : Prize distrubution on all players
 * Req  :{ game_category_id}
 * Function : getPrizeDistrubtionRank()
 */
const getPrizeDistrubtionRank = async (ID) => {
    try { 
        const sql = `SELECT winner_type.*,ranks.* FROM winner_type RIGHT JOIN ranks
        ON ranks.winner_type_id = winner_type.type_id  WHERE  ranks.game_category_id = ?`; 
        let results = await conn.query(sql,[ID]);
        const catgeory = (JSON.parse(JSON.stringify(results)));
        const ranks = (results.length >0)?catgeory:null; 
        return ranks; 
    } catch (err) {
        console.log(err)
    }
}
/**
 * Desc : Displany all lobby tournaments
 * Req  :{ category_type}
 * Function : lobbyCardList()
 */
const lobbyCardList = async (data,socket) => {
    let  game_pc_id; 
    try {  
        cron.schedule("08 * * * * *", function () {
            socket.to(socket.id).emit(events.OnLobbyCardList,{type:'all'})
         });
        const sql = `SELECT game_play_category.entry_fee,game_play_category.category_id,game_play_category.prize_pool,game_play_category.game_category_id,tournaments.current_time,tournaments.game_duration,tournaments.timer as timer ,tournaments.tournament_id,tournaments.category_id,tournaments.timer_end_time,tournaments.room_id ,category.category_name FROM game_play_category INNER JOIN category ON category.category_id = game_play_category.category_id 
        INNER JOIN tournaments ON tournaments.game_pc_id = game_play_category.game_category_id where tournaments.category_id = ?`;
        if ('1V1 BATTLE' === data.type) {
            game_pc_id = 1 
            results = await conn.query(sql, [game_pc_id]);
        }
        else if ('1 WINNER' === data.type) {
            game_pc_id = 2
            results = await conn.query(sql, [game_pc_id]);
        }
        else if ('2 WINNERS' === data.type) {
            game_pc_id = 3
            results = await conn.query(sql, [game_pc_id]);
        }
        else if ('3 WINNERS' === data.type) {
            game_pc_id = 4
            results = await conn.query(sql, [game_pc_id]);
        } else { 
            const sql1 =`SELECT game_play_category.entry_fee,game_play_category.category_id,game_play_category.prize_pool,game_play_category.game_category_id,tournaments.game_duration,tournaments.timer,tournaments.tournament_id ,tournaments.category_id,tournaments.current_time,tournaments.timer_end_time,category.category_name FROM game_play_category INNER JOIN category ON category.category_id = game_play_category.category_id INNER JOIN tournaments ON tournaments.game_pc_id = game_play_category.game_category_id`;
            results = await conn.query(sql1); 
        } 
    
        let response =[];
        if( results.length >0){
            for (var i = 0; i < results.length; i++) {
                const ranks = await getPrizeDistrubtionRank(results[i].game_category_id)  
                let rresponse = {
                    tournament_id   : results[i].tournament_id,
                    game_play_id    : results[i].game_category_id,
                    category_type_id: results[i].category_id,  
                    category_name   : results[i].category_name,
                    prize_pool      : results[i].prize_pool,
                    game_duration   : results[i].game_duration, 
                    entry_fee       : results[i].entry_fee,
                    timer           : results[i].timer,
                    timer_end_time  : results[i].timer_end_time,
                    current_time  : results[i].current_time,
                    join_user       : 12,
                    ranks:ranks 
                }   
                response.push(rresponse);
            } 
            message = 'Success'
            status = 200 
        }else{
             message = 'Not found'
             status = 404 
        } 
        return sendResponse(status,message,response);
     
    } catch (err) {
        console.log(err) 
    } 
}

 
/**
 * Desc : Cretae tournament REports
 * Req  : { user_id,  category_id, tournament_id, game_play_id,
            timer, tournament_play_date, tournament_play_time 
        }
 * Function : gameEntryReports
 */
const gameEntryReports = async(req)=>{ 
    try { 
        let data = {};
        let status = 404;
        if(!req.user_id) return sendResponse(status,"Invalid details.",data)  
        const sql1  = `INSERT INTO game_reports Set ?`;
        const forms = {
            tournament_id   : req.tournament_id,
            user_id         : req.user_id,
            timer           : req.timer,
            category_id     : req.category_id,
            game_play_id    : req.game_play_id, 
            tournament_play_date : req.tournament_play_date,
            tournament_play_time : req.tournament_play_time,
            tournament_end_time  : req.tournament_end_time  
        } 
        let results = await conn.query(sql1,forms); 
        if(results) { 
            status = 201
            message = "Success" 
            data ={
                lastId :results.insertId
            }
	    } else { 
            status = 500
            message = 'failed' 
	    } 
         
        return sendResponse(status,"success.",data); 
    } catch (error) {
        
    }
}

const createTemporary = async(req)=>{
    const sql1  = `INSERT INTO temporary_entry_records Set ?`; 
    let results = await conn.query(sql1,req); 
    let status;
    if(results){
        status =200
    }else{
        status =500
    }
    return status;
}

//slice chunck
function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}
const deleteTempData = async(req)=>{
    var sql = `DELETE FROM temporary_entry_records WHERE id IN (${req})`;  
    let check = await conn.query(sql);
    if(check){
        console.log('deleted')
    }else{
        console.log('note deleted')
    }
}
/**
 * Desc : Match making on tournaments 
 * Req  :{ user_id,tournament_id,game_play_id,category_type_id}
 * Function : matchMakingTournaments
 */
const matchMakingTournaments = async (req) => {  
    
    try {   
        let data ;
        let status = 404;
        let message;
        const { user_id,tournament_id,game_play_id} = req
        const request = {type: 'userID',user_id:user_id} ; 
      /**
       * Desc : Check User valid or not  
       * Function : checkUser
       */
        const user    = await checkUser(request); 
        if(user.status === 200){ 
          const tournaments = await lobbyTournaments(tournament_id)  
            if(tournaments.status === 200)
            { 
                const gamePlay = await gamePlayCategory(game_play_id) 
                if(gamePlay.status === 200)
                {  
                    const category = await gameCategory(tournaments.data.category_id)    
                    const userAmount= await userTransactionsHistory(user_id)
                    if(userAmount.total_amount >= gamePlay.entry_fee)
                    {
                         // const timer = gamePlay.play_time
                        const timer = 1;
                        let geme_play_time = moment().add(timer, 'minutes').format("HH:mm:ss");
                        let current_time   = moment().format("HH:mm:ss"); 
                        const playing_date = moment().format("YYYY-MM-DD")
                        
                        let sql = `SELECT * FROM game_reports WHERE is_status = 1 AND user_id= ? AND tournament_end_time >= ? AND DATE(tournament_play_date) = ?`;
                        let checkTransaction = await conn.query(sql,[user_id,current_time,playing_date]); 
                        if(!(checkTransaction.length>0))
                        {  
                            let sql = `SELECT * FROM temporary_entry_records WHERE user_id= ? AND tournament_end_time >= ? AND DATE(tournament_play_date) = ?`;
                            let checkuser = await conn.query(sql,[user_id,current_time,playing_date]); 
                            if(checkuser.length>0){
                                const category = await gameCategory(checkuser[0].category_id) 
                                status  = 403
                                message =  `Already registered with ${category.data.category_name}`
                            }else{
                                let sql1 = `SELECT * FROM temporary_entry_records`;
                                let usermatching = await conn.query(sql1); 
                                
                                const reqData = {
                                    user_id        : user_id, 
                                    tournament_id  : tournament_id, 
                                    tournament_play_date:playing_date, 
                                    tournament_end_time : geme_play_time,
                                    category_id:category.data.category_id,
                                    entry_fee:gamePlay.entry_fee,
                                    game_play_id:game_play_id
                                }
                                if(category.data.category_id ===1){
                                    let sql1 = `SELECT * FROM temporary_entry_records WHERE tournament_id = ? AND tournament_end_time >= ?`;
                                    let usermatching = await conn.query(sql1,[tournament_id,current_time,playing_date]); 
                                    if(usermatching.length>1)
                                    {
                                        const usersRows = (JSON.parse(JSON.stringify(usermatching)));
                                        //players data
                                        const playerData = sliceIntoChunks(usersRows, 2)
                                        let userId = [];
                                        for(i=0;i<playerData.length; i++)
                                        {
                                            let room_id = crypto.randomBytes(8).toString("hex");
                                            if(playerData[i].length>1)
                                            {
                                                for(j=0;j<playerData[i].length; j++)
                                                {
                                                    userId.push(playerData[i][j].user_id)         
                                                    const gameReportData = {
                                                        user_id        : playerData[i][j].user_id,
                                                        room_id        : room_id,
                                                        category_id    : category.data.category_id,
                                                        tournament_id  : playerData[i][j].tournament_id,
                                                        game_play_id   : playerData[i][j].game_play_id,
                                                        timer          : timer,
                                                        tournament_play_date:playing_date,
                                                        tournament_play_time: current_time,
                                                        tournament_end_time : geme_play_time 
                                                    }
                                                    const transactionObj = {
                                                        user_id         :user_id,
                                                        tournament_id   :tournament_id,
                                                        orderAmount     :gamePlay.entry_fee
                                                    }
                                                    const UserTransaction = await createGamePlayTransactionReports(transactionObj)
                                                    if(UserTransaction.status ===201){
                                                        await gameEntryReports(gameReportData)  
                                                    }
                                                }
                                                //delete
                                            // await deleteTempData(userId)
                                            // userId =[]
                                            }
                                            
                                        }
                                        message = 'Processing'
                                        status= 200
                                        data={
                                            tournament_id:tournament_id,
                                            user_id:user_id
                                        }
                                    }else{
                                        const temp = await createTemporary(reqData)
                                        if(temp){
                                            message = 'Processing'
                                            status= 200
                                            data={
                                                tournament_id:tournament_id,
                                                user_id:user_id
                                            }
                                        }
                                    }    
                                }else{
                                    /**
                                     * Two winner 3rd winner 0ne winer
                                     * 
                                     */
                                     let sql1 = `SELECT * FROM temporary_entry_records WHERE tournament_id = ? AND tournament_end_time >= ?`;
                                    let usermatching = await conn.query(sql1,[tournament_id,current_time,playing_date]); 
                                    if(usermatching.length>3)
                                    {
                                        const usersRows = (JSON.parse(JSON.stringify(usermatching)));
                                        //players data
                                        const playerData = sliceIntoChunks(usersRows, 4)
                                        let userId = [];
                                        for(i=0;i<playerData.length; i++)
                                        {
                                            let room_id = crypto.randomBytes(8).toString("hex");
                                            if(playerData[i].length>3)
                                            {
                                                for(j=0;j<playerData[i].length; j++)
                                                {
                                                    userId.push(playerData[i][j].user_id)          
                                                    const gameReportData = {
                                                        user_id        : playerData[i][j].user_id,
                                                        room_id        : room_id,
                                                        category_id    : category.data.category_id,
                                                        tournament_id  : playerData[i][j].tournament_id,
                                                        game_play_id   : playerData[i][j].game_play_id,
                                                        timer          : timer,
                                                        tournament_play_date:playing_date,
                                                        tournament_play_time: current_time,
                                                        tournament_end_time : geme_play_time 
                                                    }
                                                    console.log('gameReportData',gameReportData)
                                                    const transactionObj = {
                                                        user_id         :user_id,
                                                        tournament_id   :tournament_id,
                                                        orderAmount     :gamePlay.entry_fee
                                                    }
                                                    const UserTransaction = await createGamePlayTransactionReports(transactionObj)
                                                    if(UserTransaction.status ===201){
                                                        await gameEntryReports(gameReportData)  
                                                    }
                                                    
                                                }
                                                //delete
                                            // await deleteTempData(userId)
                                            // userId =[]
                                            }
                                            
                                        }
                                        message = 'Processing'
                                        status= 200
                                        data={
                                            tournament_id:tournament_id,
                                            user_id:user_id
                                        }
                                    }else{
                                        const temp = await createTemporary(reqData)
                                        if(temp){
                                            message = 'Processing'
                                            status= 200
                                            data={
                                                tournament_id:tournament_id,
                                                user_id:user_id
                                            }
                                        }
                                    }

                                    /**
                                     * End
                                     */
                                }
                                
                            } 
                        }
                        else //if already registered
                        {
                            status  = 403
                            message =  `Already registered with ${catgeory.data.category_name}`
                        }
                    }else{
                        status = 404
                        message = "Sorry! game tournament details balance"
                    }
                }else{
                    status = 404
                    message = "Sorry! invalid details"
                }
                
            }else{
                status  = 404
                message = "Tournament registration time expired" 
            } 
           
        }else{
            status = 404
            message = "Something went wrong! invalid user details"
        }
        return sendResponse(status,message,data);  
    } catch (err) {
        console.log(err)
        // debug(err);
    }
}


module.exports = { lobbyCardList ,matchMakingTournaments}
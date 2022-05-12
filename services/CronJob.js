
var cron = require('node-cron');
var shell = require('shelljs');
const db = require("../config/db");
const moment = require('moment');
let date = moment().format("YYYY-MM-DD");
let last_date = moment().subtract(1, 'day').format("YYYY-MM-DD");
const crypto = require("crypto"); 
 
const onBattle = async (tournament_id, game_id, timer , type,room_id) => {
    const last_minute = moment().subtract(timer, 'minutes').format("HH:mm:ss");
    const curret_time = moment().format("mm:ss")
    try {
        const sql = `SELECT * FROM tournaments WHERE time(current_time) >= ? and timer=? and ct_type = ?`;
        const results = await db.query(sql, [last_minute, timer,type]);  
        const endtime = moment().add(timer, 'minutes').format("mm:ss");
        let formsData = {
            tournament_id   : tournament_id,
            game_pc_id      : game_id,
            game_duration   : 8,
            current_date    : date,
            room_id         : room_id,
            timer           : timer,
            current_time    : curret_time,
            timer_end_time  : endtime,
            ct_type:type
        }
        if (results.length > 0) {
            const sql1 = `UPDATE tournaments Set ?  WHERE id = ?`;
            await db.query(sql1, [formsData, results[0].id]);
        } else {
            const sql12 = `INSERT INTO tournaments Set ?`;
            await db.query(sql12, [formsData]);
        }
let date_ob = new Date();
       console.log("running a task every " + timer + " Minute", date_ob.getSeconds());
    } catch (error) {
        console.log('err',error)
    }
}

 

let tournament_id;
let game_pc_id ;
let timer ;
let type ;

// V1V BAttlE1382112302232138200 .
cron.schedule("00 */1 * * * *", function () {
    let time        =  moment().format("MMDDHHmmss");
    let random      =  Math.floor(100 + Math.random() * 999);
    tournament_id   = `104${time}${random}`;
    game_pc_id  = 4;
    timer       = 1
    type        = '1104'
    const room      = crypto.randomBytes(8).toString("hex");
    onBattle(tournament_id, game_pc_id,timer,type,room) 
 });
cron.schedule("01 */1 * * * *", function () {
    let time        =  moment().format("MMDDHHmmss");
    let random      =  Math.floor(100 + Math.random() * 999); 
    tournament_id   = `103${time}${random}`;
    game_pc_id  = 3;
    timer       = 1
    type        = '1103'
    const room      = crypto.randomBytes(8).toString("hex");
    onBattle(tournament_id, game_pc_id,timer,type,room) 
 });
cron.schedule("02 */2 * * * *", function () {
    let time        =  moment().format("MMDDHHmmss");
    let random      =  Math.floor(100 + Math.random() * 999);
    tournament_id   = `102${time}${random}`;
    game_pc_id  = 2;
    timer       = 2;
    type        = '1102';
    const room      = crypto.randomBytes(8).toString("hex");
    onBattle(tournament_id, game_pc_id,timer,type,room) 
});
cron.schedule("03 */3 * * * *", function () {
    let time        =  moment().format("MMDDHHmmss");
    let random      =  Math.floor(100 + Math.random() * 999);
    tournament_id   = `101${time}${random}`;
    game_pc_id  = 1;
    timer       = 3
    type        = '1101'
    const room      = crypto.randomBytes(8).toString("hex");
    onBattle(tournament_id, game_pc_id,timer,type,room)   
});


// 1 winner tournaments
cron.schedule("06 */1 * * * *", function () {
    let time        =  moment().format("MMDDHHmmss");
    let random      =  Math.floor(100 + Math.random() * 999);
    tournament_id   = `115${time}${random}`;
    game_pc_id  = 5;
    timer       = 1
    type        = '1105'
    const room      = crypto.randomBytes(8).toString("hex");
    onBattle(tournament_id, game_pc_id,timer,type,room)  
 });
 //Two winner
cron.schedule("08 */1 * * * *", function () {
    let time        =  moment().format("MMDDHHmmss");
    let random      =  Math.floor(100 + Math.random() * 999); 
    tournament_id   = `126${time}${random}`;
    game_pc_id  = 6;
    timer       = 1
    type        = '1126'
    const room      = crypto.randomBytes(8).toString("hex");
    onBattle(tournament_id, game_pc_id,timer,type,room)   
 });
cron.schedule("11 */1 * * * *", function () {
    let time        =  moment().format("MMDDHHmmss");
    let random      =  Math.floor(100 + Math.random() * 999);
    tournament_id   = `127${time}${random}`;
    game_pc_id  = 7;
    timer       = 1;
    type        = '1127';
    const room      = crypto.randomBytes(8).toString("hex");
    onBattle(tournament_id, game_pc_id,timer,type,room) 
});

//3 Winners
cron.schedule("13 */1 * * * *", function () {
    let time        =  moment().format("MMDDHHmmss");
    let random      =  Math.floor(100 + Math.random() * 999);
    tournament_id   = `138${time}${random}`;
    game_pc_id  = 8;
    timer       = 1
    type        = '1138'
    const room      = crypto.randomBytes(8).toString("hex");
    onBattle(tournament_id, game_pc_id,timer,type,room)   
});
cron.schedule("15 */2 * * * *", function () {
    let time        =  moment().format("MMDDHHmmss");
    let random      =  Math.floor(100 + Math.random() * 999);
    tournament_id   = `139${time}${random}`;
    game_pc_id  = 9;
    timer       = 2
    type        = '1139'
    const room      = crypto.randomBytes(8).toString("hex");
    onBattle(tournament_id, game_pc_id,timer,type,room)  
});
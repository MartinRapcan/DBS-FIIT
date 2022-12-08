if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Setup express app
const express = require('express');
const { init } = require("express/lib/application");
const { path } = require("express/lib/application");
const { is } = require("express/lib/request");
const { Sequelize } = require('sequelize');
const app = express()

const sequelize = new Sequelize(process.env.DATABASE, process.env.NAME, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: 'postgres'
});
(async () => {
try {
  await sequelize.authenticate();
  console.log('Funguje.');
} catch (error) {
  console.error('Nefunguje.');
}})()
const initModels = require("./database/models/init-models").initModels; 
const models = initModels(sequelize);
// Setup client that connects to db
const { Client } = require('pg')
const client = new Client({
  host: process.env.HOST,
  port: '5432',
  user: process.env.NAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
})
client.connect()

// Define get request on specific URL
app.get('/v1/health', async(req, res) => {
  try{
    const responseVersion = await client.query('SELECT VERSION()')
    const responseLength = await client.query(`SELECT pg_database_size('dota2')/1024/1024 as dota2_db_size`)
    const response = {
      "pgsql": {
        "version": responseVersion.rows[0]["version"],
        "dota2_db_size": parseInt(responseLength.rows[0]["dota2_db_size"])
     }
    }
    res.status(200).json(response)
  }catch(e){
    res.json(e)
  }
})

app.get("/v2/patches", async(req, res) => {
  try {
    const patches = await client.query(`select pts.name as patch_version, pts.patch_start_date,
    pts.patch_end_date, mt.id as match_id, round(mt.duration/60.0, 2) as duration
    from (select name, EXTRACT(EPOCH FROM patches.release_date) AS patch_start_date, 
        extract(epoch from LEAD(patches.release_date,1) OVER (ORDER BY patches.name)) as patch_end_date
    from patches) as pts left join matches as mt on mt.start_time >= pts.patch_start_date and mt.start_time <= pts.patch_end_date 
    order by pts.name, mt.id`)

    const parsedPatches = patches.rows.reduce((initial, patch) => {
      const {patch_version, patch_start_date, patch_end_date, ...others} = patch;

      const index = initial.patches.findIndex((element) => element.patch_version === patch_version)

      const matchObj = {
        "match_id": others.match_id,
        "duration": parseFloat(others.duration)
      }

      if(index > -1){
        initial.patches[index].matches.push(matchObj)
      } else {
        const obj = {
          "patch_version": patch_version,
          "patch_start_date": patch_start_date,
          "patch_end_date": patch_end_date,
          "matches": []
        }
        if(others.duration && others.match_id || others.match_id == 0){
          obj.matches.push(matchObj)
        }
        initial.patches.push(obj)
      }
      return initial
    }, {"patches": []})

    res.status(200).json(parsedPatches);
  } catch(e) {
    res.status(400).json(e);
  }
})

app.get('/v2/players/:player_id/game_exp', async(req, res) => {
  const player_id = req.params.player_id;
  if(parseInt(player_id).toString().length == player_id.length && !isNaN(parseInt(player_id))){
  try {
    const player_id = req.params.player_id;

    const playerStats = await client.query(`select players.id, COALESCE(nick, 'unknown') as player_nick
    , heroes.localized_name as hero_localized_name, round(matches.duration/60.0, 2) as match_duration_minutes
    , (COALESCE(mpd.xp_hero, 0) + COALESCE(mpd.xp_creep, 0) + 
    COALESCE(mpd.xp_other, 0) + COALESCE(mpd.xp_roshan, 0)) as experiences_gained
    , mpd.level as level_gained, matches.id as match_id,
	CASE
	when (mpd.player_slot < 5 and matches.radiant_win) or (mpd.player_slot > 127 and NOT matches.radiant_win) then CAST('true' AS BOOLEAN)
	else CAST('false' AS BOOLEAN)
	end as winner
    from players 
    join matches_players_details as mpd on players.id = mpd.player_id 
    join heroes on mpd.hero_id = heroes.id 
    join matches on mpd.match_id = matches.id where players.id = ${player_id} order by matches.id`)

    const playerObject = {
      "id": playerStats.rows[0].id,
      "player_nick": playerStats.rows[0].player_nick,
      "matches": []
    }

    const parsedPlayerStats = playerStats.rows.reduce((initial, player) => {
      player.match_duration_minutes = parseFloat(player.match_duration_minutes)
      const {id, player_nick, ...others} = player
      initial.matches.push(others)
      return initial
    }, playerObject)

    res.status(200).json(parsedPlayerStats);
  } catch(e){
    res.status(400).json(e)
  }
}else {
  res.status(400).json({error: "Invalid Input"})
}
})

app.get('/v2/players/:player_id/game_objectives', async(req, res) => {
  const player_id = req.params.player_id;
  if(parseInt(player_id).toString().length == player_id.length && !isNaN(parseInt(player_id))){
  try {
    const player_id = req.params.player_id;

    const playerObjectiveStats = await client.query(`select distinct players.id, COALESCE(nick, 'unknown') as player_nick, 
    heroes.localized_name as hero_localized_name, 
    matches.id as match_id, COALESCE(go.subtype, 'NO_ACTION') as hero_action, 
    count(*) as count
    from players 
    join matches_players_details as mpd on players.id = mpd.player_id 
    join heroes on mpd.hero_id = heroes.id 
    join matches on mpd.match_id = matches.id
    full join game_objectives as go on go.match_player_detail_id_1 = mpd.id
    where players.id = ${player_id} group by(players.id, heroes.localized_name, matches.id, go.subtype) order by matches.id`);

    const playerObject = {
      "id": playerObjectiveStats.rows[0].id,
      "player_nick": playerObjectiveStats.rows[0].player_nick,
      "matches": []
    }

    const parsedPlayerObjectiveStats = playerObjectiveStats.rows.reduce((initial, player) => {
      const {match_id, hero_localized_name, count, hero_action} = player

      const index = initial.matches.findIndex((element) => element.match_id === match_id)

      const actionObject = {
        "count": parseInt(count),
        "hero_action": hero_action
      }

      if(index > -1){
        initial.matches[index].actions.push(actionObject)
      } else {

        const matchObject = {
          "match_id": match_id,
          "hero_localized_name": hero_localized_name,
          "actions": []
        }

        matchObject.actions.push(actionObject)
        initial.matches.push(matchObject) 
      }

      return initial
    }, playerObject)

    res.status(200).json(parsedPlayerObjectiveStats);
  } catch(e) {
    res.status(400).json(e)
  }
  }else {
    res.status(400).json({error: "Invalid Input"})
  }
})

app.get('/v2/players/:player_id/abilities', async(req, res) => {
  const player_id = req.params.player_id;
  if(parseInt(player_id).toString().length == player_id.length && !isNaN(parseInt(player_id))){
    try {
      const playerAbilitiesStats = await client.query(`select distinct players.id, COALESCE(nick, 'unknown') as player_nick
      , heroes.localized_name as hero_localized_name
      , matches.id as match_id, abilities.name as ability_name
      , COUNT(abilities.name) as count,
      COALESCE(max(au.level), 0) as upgrade_level
      from players 
      join matches_players_details as mpd on players.id = mpd.player_id 
      join heroes on mpd.hero_id = heroes.id 
      join matches on mpd.match_id = matches.id
      join ability_upgrades as au on au.match_player_detail_id = mpd.id
      join abilities on au.ability_id = abilities.id
      where players.id = ${player_id} 
      group by (players.id, heroes.localized_name, matches.id, abilities.name)
      order by matches.id`)

      const playerObject = {
        "id": playerAbilitiesStats.rows[0].id,
        "player_nick": playerAbilitiesStats.rows[0].player_nick,
        "matches": []
      }

      const parsedPlayerAbilityStats = playerAbilitiesStats.rows.reduce((initial, player) => {
        const {match_id, hero_localized_name, count, ability_name, upgrade_level} = player
        
        const index = initial.matches.findIndex((element) => element.match_id === match_id)
        
        const abilityObject = {
          "count": parseInt(count),
          "ability_name": ability_name,
          "upgrade_level": upgrade_level
        }
        
        if(index > -1){
          initial.matches[index].abilities.push(abilityObject)
        } else {
          const matchObject = {
            "match_id": match_id,
            "hero_localized_name": hero_localized_name,
            "abilities": []
          }

          matchObject.abilities.push(abilityObject)
          initial.matches.push(matchObject) 
        }
        
        return initial
      }, playerObject)

      res.status(200).json(parsedPlayerAbilityStats);
    } catch(e){
      res.status(400).json(e)
  }
  }else {
    res.status(400).json({error: "Invalid Input"})
  }
})

app.get("/v3/matches/:match_id/top_purchases", async(req, res) => {
  const match_id = req.params.match_id;
  if(parseInt(match_id).toString().length == match_id.length && !isNaN(parseInt(match_id))){
    try {
      const matchPurchases = await client.query(`select match_id, hero_id, hero_localized_name,
      item_id, item_name, item_count, ranks
      from (select distinct heroes.localized_name as hero_localized_name, 
            matches.id as match_id, items.name as item_name, 
          heroes.id as hero_id,
          items.id as item_id,
            count(*) as item_count,
          row_number() over (partition by heroes.localized_name order by count(*) desc, items.name) as ranks
            from players 
            join matches_players_details as mpd on players.id = mpd.player_id 
            join heroes on mpd.hero_id = heroes.id 
            join matches on mpd.match_id = matches.id
            join purchase_logs as purchases on purchases.match_player_detail_id = mpd.id
            join items on purchases.item_id = items.id
            where matches.id = 21421 and 
          ((mpd.player_slot < 5 and matches.radiant_win) or (mpd.player_slot > 127 and NOT matches.radiant_win))
          group by(players.id, heroes.localized_name, matches.id, items.name, heroes.id, items.id)
		  order by hero_id, item_count desc, item_name)
          as all_or_nothing where ranks < 6`)

      const matchObject = {
        "id": matchPurchases.rows[0].match_id,
        "heroes": []
      }

      const parsedMatchPurchases = matchPurchases.rows.reduce((initial, result) => {
        const {hero_id, hero_localized_name, item_name, item_count, item_id} = result

        const index = initial.heroes.findIndex((element) => element.id === hero_id)

        const purchaseObject = {
          "id": item_id,
          "name": item_name,
          "count": parseInt(item_count)
        }

        if(index > -1){
          initial.heroes[index].top_purchases.push(purchaseObject)
        } else {
          const matchObject = {
            "id": hero_id,
            "name": hero_localized_name,
            "top_purchases": []
          }

          matchObject.top_purchases.push(purchaseObject)
          initial.heroes.push(matchObject) 
        }

        return initial
      }, matchObject)

      res.status(200).json(parsedMatchPurchases);
    } catch(e){
      res.status(400).json(e)
    }
  }else {
    res.status(400).json({error: "Invalid Input"})
  }
})

app.get("/v3/abilities/:ability_id/usage" , async(req, res) => {
  const ability_id = req.params.ability_id;

  if(parseInt(ability_id).toString().length == ability_id.length && !isNaN(parseInt(ability_id))){
    try {
      const abilityUsage = await client.query(`select id, name, hero_name, bucket, hero_id, results, count from 
      (select *, row_number() over (partition by results, hero_name order by count desc) as ranks from
      (select distinct *, count(*) over (partition by hero_name, bucket, results) from
      (select abilities.id, abilities.name, heroes.localized_name  as hero_name,
            case 
            when au.time < matches.duration/10.0 then '0-9' 
            when au.time < matches.duration/10.0*2 then '10-19'
            when au.time < matches.duration/10.0*3 then '20-29'
            when au.time < matches.duration/10.0*4 then '30-39'
            when au.time < matches.duration/10.0*5 then '40-49'
            when au.time < matches.duration/10.0*6 then '50-59'
            when au.time < matches.duration/10.0*7 then '60-69'
            when au.time < matches.duration/10.0*8 then '70-79'
            when au.time < matches.duration/10.0*9 then '80-89'
            when au.time < matches.duration then '90-99'
            else '100-109'
            end as bucket, heroes.id as hero_id,
            case 
            when (mpd.player_slot < 5 and matches.radiant_win) or (mpd.player_slot > 127 and NOT matches.radiant_win) then TRUE
            else FALSE end as Results
            from ability_upgrades as au 
            join abilities on au.ability_id = abilities.id
            join matches_players_details as mpd on mpd.id = au.match_player_detail_id
            join matches on mpd.match_id = matches.id
       join players on mpd.player_id = players.id
            JOIN heroes ON mpd.hero_id = heroes.id
            where abilities.id = ${ability_id} and mpd.hero_id = heroes.id) as first) as second) as third where ranks = 1`)      

      const abilityObject = {
        "id": abilityUsage.rows[0].id,
        "name": abilityUsage.rows[0].name,
        "heroes": []
      }
    
      const booleanHelper = {
        "true": "usage_winners",
        "false": "usage_loosers"
      }
  
      const parsedAbilityUsages = abilityUsage.rows.reduce((initial, result) => {
        const {hero_id, hero_name, results, count, bucket} = result

        const index = initial.heroes.findIndex((element) => element.id === hero_id)
        console.log(index)
        if(index > -1){
          initial.heroes[index][booleanHelper[results]] = {"bucket": bucket, "count": parseInt(count)}
        } else {
          const usageObject = {
            "id": hero_id,
            "name": hero_name,
          }
          usageObject[booleanHelper[results]] = {"bucket": bucket, "count": parseInt(count)}
          initial.heroes.push(usageObject) 
        }

        return initial
      }, abilityObject) 

      res.status(200).json(parsedAbilityUsages);
    } catch(e){
      res.status(400).json(e)
    }
  }else {
    res.status(400).json({error: "Invalid Input"})
  }
})

app.get("/v3/statistics/tower_kills", async(req, res) => {
    try {
      const towerKills = await client.query(`select * from
      (SELECT distinct on (hero_id) hero_id, hero_name,
      row_number() OVER (PARTITION BY match_id, grp ORDER BY row1) AS amount FROM 
      (SELECT count(rst) OVER (partition by match_id ORDER BY row1) AS grp, * from
      (SELECT CASE WHEN hero_name != lag(hero_name,1) OVER (partition by match_id ORDER BY row1) THEN 1 END AS rst, * from
      (select match_id, subtype, time, hero_name, hero_id, row_number() over (partition by match_id order by time) as row1 from
      (select matches.id as match_id, subtype, time, heroes.id as hero_id,
      heroes.localized_name  as hero_name 
      from matches_players_details as mpd
      join game_objectives as go on mpd.id = go.match_player_detail_id_1
      join heroes on heroes.id = mpd.hero_id
      join matches on matches.id = mpd.match_id
      where go.subtype = 'CHAT_MESSAGE_TOWER_KILL' and not go.match_player_detail_id_1 is Null) 
      as first) 
      as second) 
      as third) 
      as fourth order by hero_id, amount desc) 
      as fifth order by amount desc, hero_name`)

      const towerObject = { heroes: []}

      const parsedTowerKills = towerKills.rows.reduce((initial, result) => {
        const {hero_id, hero_name, amount} = result

        const heroObject = {
          "id": hero_id,
          "name": hero_name,
          "tower_kills": parseInt(amount)
        } 
        initial.heroes.push(heroObject)

        return initial
      }, towerObject)
      
      res.status(200).json(parsedTowerKills);
  } catch(e){
    res.status(400).json(e)
  }
})

app.get('/v4/players/:player_id/game_exp', async(req, res) => {
  const player_id = req.params.player_id;
  if(parseInt(player_id).toString().length == player_id.length && !isNaN(parseInt(player_id))){
  try {
    const player_id = req.params.player_id;

    const [playerStats, metadata] = await sequelize.query(`select players.id, COALESCE(nick, 'unknown') as player_nick
    , heroes.localized_name as hero_localized_name, round(matches.duration/60.0, 2) as match_duration_minutes
    , (COALESCE(mpd.xp_hero, 0) + COALESCE(mpd.xp_creep, 0) +
    COALESCE(mpd.xp_other, 0) + COALESCE(mpd.xp_roshan, 0)) as experiences_gained
    , mpd.level as level_gained, matches.id as match_id,
    CASE
    when (mpd.player_slot < 5 and matches.radiant_win) or (mpd.player_slot > 127 and NOT matches.radiant_win) then CAST('true' AS BOOLEAN)
    else CAST('false' AS BOOLEAN)
    end as winner
    from players
    join matches_players_details as mpd on players.id = mpd.player_id
    join heroes on mpd.hero_id = heroes.id
    join matches on mpd.match_id = matches.id where players.id = ${player_id} order by matches.id`)

    const playerObject = {
      "id": playerStats[0].id,
      "player_nick": playerStats[0].player_nick,
      "matches": []
    }

    const parsedPlayerStats = playerStats.reduce((initial, player) => {
      player.match_duration_minutes = parseFloat(player.match_duration_minutes)
      const {id, player_nick, ...others} = player
      initial.matches.push(others)
      return initial
    }, playerObject)

    res.status(200).json(parsedPlayerStats);
  } catch(e){
    res.status(400).json(e)
  }
}else {
  res.status(400).json({error: "Invalid Input"})
}
})

app.get("/model_test", async(req, res) => {
  const {heroes, matches_players_details} = models;
  const results = await matches_players_details.findAll({ 
    where: {match_id: 1}, include: [{model: heroes, as: 'hero'}]
  })

  res.status(200).json(results);
})

// All other routes send 404 and empty JSON
app.all("*", (req, res) => {
  res.status(404).json();
})

// Setup port for app to listen
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port:${PORT}`)
});
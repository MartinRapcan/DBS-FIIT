if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Setup express app
const express = require('express');
const { init } = require("express/lib/application");
const { path } = require("express/lib/application");
const { is } = require("express/lib/request");
const app = express()

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

// All other routes send 404 and empty JSON
app.all("*", (req, res) => {
  res.status(404).json({})
})

// Setup port for app to listen
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port:${PORT}`)
})
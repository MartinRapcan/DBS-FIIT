# Links to my Endpoints

[fiit-dbs-xrapcan-app.herokuapp.com](https://fiit-dbs-xrapcan-app.herokuapp.com)

[fiit-dbs-xrapcan-app.herokuapp.com/v1/health](https://fiit-dbs-xrapcan-app.herokuapp.com/v1/health)

[fiit-dbs-xrapcan-app.herokuapp.com/v2/patches](https://fiit-dbs-xrapcan-app.herokuapp.com/v2/patches)

[fiit-dbs-xrapcan-app.herokuapp.com/v2/players/:player_id/game_exp](https://fiit-dbs-xrapcan-app.herokuapp.com/v2/players/14944/game_exp)

[fiit-dbs-xrapcan-app.herokuapp.com/v2/players/:player_id/game_objectives](https://fiit-dbs-xrapcan-app.herokuapp.com/v2/players/14944/game_objectives)

[fiit-dbs-xrapcan-app.herokuapp.com/v2/players/:player_id/abilities](https://fiit-dbs-xrapcan-app.herokuapp.com/v2/players/14944/abilities)

# Queries

## /v2/patches

```
select pts.name as patch_version, pts.patch_start_date,
pts.patch_end_date, mt.id as match_id, round(mt.duration/60.0, 2) as duration
from (select name, EXTRACT(EPOCH FROM patches.release_date) AS patch_start_date, 
extract(epoch from LEAD(patches.release_date,1) OVER (ORDER BY patches.name)) as patch_end_date
from patches) as pts left join matches as mt on mt.start_time >= pts.patch_start_date 
and mt.start_time <= pts.patch_end_date order by pts.name, mt.id
```

## /v2/players/:player_id/game_exp

```
select players.id, COALESCE(nick, 'unknown') as player_nick, 
heroes.localized_name as hero_localized_name, round(matches.duration/60.0, 2) as match_duration_minutes, 
(COALESCE(mpd.xp_hero, 0) + COALESCE(mpd.xp_creep, 0) + 
COALESCE(mpd.xp_other, 0) + COALESCE(mpd.xp_roshan, 0)) as experiences_gained,
mpd.level as level_gained, matches.id as match_id,
CASE
    when (mpd.player_slot < 5 and matches.radiant_win) or (mpd.player_slot > 127 and NOT matches.radiant_win) 
        then CAST('true' AS BOOLEAN)
    else CAST('false' AS BOOLEAN)
end as winner
from players 
join matches_players_details as mpd on players.id = mpd.player_id 
join heroes on mpd.hero_id = heroes.id 
join matches on mpd.match_id = matches.id where players.id = 14944 order by matches.id
```

## /v2/players/:player_id/game_objectives

```
select distinct players.id, COALESCE(nick, 'unknown') as player_nick, 
heroes.localized_name as hero_localized_name, 
matches.id as match_id, COALESCE(go.subtype, 'NO_ACTION') as hero_action, 
count(*) as count
from players 
join matches_players_details as mpd on players.id = mpd.player_id 
join heroes on mpd.hero_id = heroes.id 
join matches on mpd.match_id = matches.id
full join game_objectives as go on go.match_player_detail_id_1 = mpd.id
where players.id = 14944 
group by(players.id, heroes.localized_name, matches.id, go.subtype) order by matches.id
```

## /v2/players/:player_id/abilities

```
select distinct players.id, COALESCE(nick, 'unknown') as player_nick, 
heroes.localized_name as hero_localized_name, 
matches.id as match_id, abilities.name as ability_name, 
COUNT(abilities.name) as count,
COALESCE(max(au.level), 0) as upgrade_level
from players 
join matches_players_details as mpd on players.id = mpd.player_id 
join heroes on mpd.hero_id = heroes.id 
join matches on mpd.match_id = matches.id
join ability_upgrades as au on au.match_player_detail_id = mpd.id
join abilities on au.ability_id = abilities.id
where players.id = 14944 
group by (players.id, heroes.localized_name, matches.id, abilities.name)
order by matches.id
```

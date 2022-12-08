# Links to my Endpoints

[fiit-dbs-xrapcan-app.herokuapp.com](https://fiit-dbs-xrapcan-app.herokuapp.com)

[fiit-dbs-xrapcan-app.herokuapp.com/v1/health](https://fiit-dbs-xrapcan-app.herokuapp.com/v1/health)

[fiit-dbs-xrapcan-app.herokuapp.com/v2/patches](https://fiit-dbs-xrapcan-app.herokuapp.com/v2/patches)

[fiit-dbs-xrapcan-app.herokuapp.com/v2/players/:player_id/game_exp](https://fiit-dbs-xrapcan-app.herokuapp.com/v2/players/14944/game_exp)

[fiit-dbs-xrapcan-app.herokuapp.com/v2/players/:player_id/game_objectives](https://fiit-dbs-xrapcan-app.herokuapp.com/v2/players/14944/game_objectives)

[fiit-dbs-xrapcan-app.herokuapp.com/v2/players/:player_id/abilities](https://fiit-dbs-xrapcan-app.herokuapp.com/v2/players/14944/abilities)

[fiit-dbs-xrapcan-app.herokuapp.com/v3/matches/:match_id/top_purchases](https://fiit-dbs-xrapcan-app.herokuapp.com/v3/matches/21421/top_purchases)

[fiit-dbs-xrapcan-app.herokuapp.com/v3/abilities/:ability_id/usage](https://fiit-dbs-xrapcan-app.herokuapp.com/v3/abilities/5004/usage)

[fiit-dbs-xrapcan-app.herokuapp.com/v3/statistics/tower_kills](https://fiit-dbs-xrapcan-app.herokuapp.com/v3/statistics/tower_kills)

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

## /v3/matches/:match_id/top_purchases

```
select match_id, hero_id, hero_localized_name,
item_id, item_name, item_count
from (select distinct heroes.localized_name as hero_localized_name, 
matches.id as match_id, items.name as item_name, 
heroes.id as hero_id,
items.id as item_id,
count(*) as item_count,
row_number() over (partition by heroes.localized_name order by count(*) desc) as ranks
from players 
join matches_players_details as mpd on players.id = mpd.player_id 
join heroes on mpd.hero_id = heroes.id 
join matches on mpd.match_id = matches.id
join purchase_logs as purchases on purchases.match_player_detail_id = mpd.id
join items on purchases.item_id = items.id
where matches.id = ${match_id} and 
((mpd.player_slot < 5 and matches.radiant_win) or (mpd.player_slot > 127 and NOT matches.radiant_win))
group by(players.id, heroes.localized_name, matches.id, items.name, heroes.id, items.id))
as all_or_nothing	where ranks < 6
order by hero_id, item_count desc
```

## /v3/abilities/:ability_id/usage

```
select id, name, hero_name, bucket, hero_id, results, count from 
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
where abilities.id = ${ability_id} and mpd.hero_id = heroes.id) as first) as second) as third where ranks = 1
```

## /v3/statistics/tower_kills

```
select * from
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
as fifth order by amount desc, hero_name
```
const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('matches_players_details', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    match_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    hero_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    player_slot: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold_spent: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold_per_min: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xp_per_min: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    kills: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deaths: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    assists: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    denies: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    last_hits: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    stuns: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    hero_damage: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    hero_healing: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tower_damage: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    item_id_1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    item_id_2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    item_id_3: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    item_id_4: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    item_id_5: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    item_id_6: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    leaver_status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xp_hero: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xp_creep: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xp_roshan: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    xp_other: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold_other: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold_death: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold_buyback: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold_abandon: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold_sell: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold_destroying_structure: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold_killing_heroes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold_killing_creeps: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold_killing_roshan: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gold_killing_couriers: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    sequelize,
    tableName: 'matches_players_details',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_match_id_player_id",
        fields: [
          { name: "match_id" },
          { name: "player_slot" },
          { name: "id" },
        ]
      },
      {
        name: "matches_players_details_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }, this.associate = function(models) {
    this.belongsTo(models.matches, {
      foreignKey: 'match_id',
      as: 'match',
      targetKey: "id",
    }
    );
    this.belongsTo(models.players, {
      foreignKey: 'player_id',
      as: 'player',
      targetKey: "id",
    }
    );
    this.belongsTo(models.heroes, {
      foreignKey: 'hero_id',
      as: 'hero',
      targetKey: "id",
    }
    );
    this.belongsTo(models.items, {
      foreignKey: 'item_id_1',
      as: 'item_id_1',
      targetKey: "id",
    }
    );
    this.belongsTo(models.items, {
      foreignKey: 'item_id_2',
      as: 'item_id_2',
      targetKey: "id",
    
  }  );
  this.belongsTo(models.items, {
    foreignKey: 'item_id_3',
    as: 'item_id_3',
    targetKey: "id",
  });
  this.belongsTo(models.items, {
    foreignKey: 'item_id_4',
    as: 'item_id_4',
    targetKey: "id",
  });
  this.belongsTo(models.items, {
    foreignKey: 'item_id_5',
    as: 'item_id_5',
    targetKey: "id",
  });
  this.belongsTo(models.items, {
    foreignKey: 'item_id_6',
    as: 'item_id_6',
    targetKey: "id",
  });

});
  
};

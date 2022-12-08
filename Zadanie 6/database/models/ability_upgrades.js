const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const ability_upgrades = sequelize.define('ability_upgrades', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ability_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    match_player_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ability_upgrades',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "ability_upgrades_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  ability_upgrades.associate = function(models) {
    ability_upgrades.belongsTo(models.abilities, {
      foreignKey: 'ability_id',
      as: 'ability',
      targetKey: "id",
    }
    );
    ability_upgrades.belongsTo(models.matches_players_details, {
      foreignKey: 'match_player_detail_id',
      as: 'match_player_detail',
      targetKey: "id",
    }
    );
  }

  return ability_upgrades;
};

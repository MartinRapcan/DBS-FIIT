const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const purchase_logs =  sequelize.define('purchase_logs', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    match_player_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'purchase_logs',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "purchase_logs_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  purchase_logs.associate = function(models) {
    purchase_logs.belongsTo(models.matches_players_details, {
      foreignKey: 'match_player_detail_id',
      as: 'match_player_detail',
      targetKey: "id",
    }
    );
    purchase_logs.belongsTo(models.items, {
      foreignKey: 'item_id',
      as: 'item',
      targetKey: "id",
    }
    );
  }
  

  return purchase_logs;
};

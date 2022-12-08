const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const teamfights = sequelize.define('teamfights', {
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
    start_teamfight: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    end_teamfight: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    last_death: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deaths: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'teamfights',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "teamfights_match_id_start_teamfight_id_idx",
        fields: [
          { name: "match_id" },
          { name: "start_teamfight" },
          { name: "id" },
        ]
      },
      {
        name: "teamfights_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  teamfights.associate = function(models) {
    teamfights.belongsTo(models.matches, {
      foreignKey: 'match_id',
      as: 'match',
      targetKey: "id",
    }
    );
  }

  return teamfights;
};

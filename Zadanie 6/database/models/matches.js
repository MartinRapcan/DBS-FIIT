const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('matches', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cluster_region_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    start_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tower_status_radiant: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tower_status_dire: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    barracks_status_radiant: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    barracks_status_dire: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    first_blood_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    game_mode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    radiant_win: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    negative_votes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    positive_votes: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'matches',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "matches_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }, this.associate = function(models) {
    matches.belongsTo(models.cluster_regions, {
      foreignKey: 'cluster_region_id',
      as: 'cluster_region',
      targetKey: "id",
      }
    );
  })
};

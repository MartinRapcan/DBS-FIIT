const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cluster_regions', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'cluster_regions',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "cluster_regions_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

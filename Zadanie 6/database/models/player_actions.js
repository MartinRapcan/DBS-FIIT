const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const player_actions = sequelize.define('player_actions', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    unit_order_none: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_move_to_position: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_move_to_target: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_attack_move: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_attack_target: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_cast_position: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_cast_target: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_cast_target_tree: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_cast_no_target: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_cast_toggle: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_hold_position: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_train_ability: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_drop_item: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_give_item: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_pickup_item: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_pickup_rune: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_purchase_item: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_sell_item: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_disassemble_item: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_move_item: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_cast_toggle_auto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_stop: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_buyback: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_glyph: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_eject_item_from_stash: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_cast_rune: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_ping_ability: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_order_move_to_direction: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    match_player_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'player_actions',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "player_actions_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  player_actions.associate = function(models) {
    player_actions.belongsTo(models.match_player_detail, {
      foreignKey: 'match_player_detail_id_1',
      as: 'match_player_detail_1',
      targetKey: "id",
    }
    );
  }

  return player_actions;
};

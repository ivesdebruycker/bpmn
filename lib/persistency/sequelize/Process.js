"use strict";


module.exports = function (sequelize, DataTypes) {
    var dataFieldtype;
    if (sequelize.options.dialect === 'postgres') {
        dataFieldtype = DataTypes.JSONB;
    } else {
        dataFieldtype = DataTypes.TEXT;
    }
    return sequelize.define("process",
        {
            _id: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            processId: {
                type: DataTypes.STRING
            },
            processName: {
                type: DataTypes.STRING
            },
            data: {
                type: dataFieldtype
            }
        })
}
/**
 * Copyright: E2E Technologies Ltd
 */
"use strict";


var util = require('util');

/**
 * @param {String} sequelize
 * @param {*} options
 * @constructor
 */
var Process;


var jsonbTransformer={
    fromData:function(data){return data},
    toData:function(field){return field}
}

var textTransformer={
    fromData:function(data){return JSON.stringify(data)},
    toData:function(field){return JSON.parse(field)}
}


var Persistency = exports.Persistency = function (sequelize, options) {
    this.sequelize = sequelize;
    Process = sequelize.import(__dirname + "/Process");
    this.options = options || {};
    if (this.options.logger) {
        this._trace = this.options.logger.trace || function () {
            };
    } else {
        this._trace = function () {
        };
    }
    var self = this;
    if (sequelize.options.dialect === 'postgres'){
        self.transformer=jsonbTransformer;
    }else{
        self.transformer=textTransformer;
    }
    Process.sync()
        .catch(function (err) {
            self._trace(err.message)
        });
};

/**
 * @param {{processInstanceId: String}} persistentData
 * @param {Function} done
 */
Persistency.prototype.persist = function (persistentData, done) {
    var sequelize = this.sequelize;
    this._trace(util.format('Try to connect %s, host: %s, database: %s, port %d',
        sequelize.options.dialect,
        sequelize.config.host,
        sequelize.config.database,
        sequelize.config.port)
    );
    var processId = persistentData.processId;
    var processName = persistentData.processName;

    var self=this;
    self._trace("Start persisting '" + processName + "'");
    Process.find({
            where: {
                processId: processId,
                processName: processName
            },
            order: [['_id', 'desc']]
        })
        .then(function (process) {
            if (!!process) {
                process.data = self.transformer.fromData(persistentData);
                return process.save();
            } else {
                return Process.create({
                        processId: processId,
                        processName: processName,
                        data: self.transformer.fromData(persistentData)
                    })
            }
        })
        .then(function(record){
            var data= self.transformer.toData(record.data)
            data._id=record._id;
            return data;
        })
        .then(function (data){
            self._trace("Persisted '" + processName + "' ('" + processId + "').");
            done(null,data);
        })
        .catch(function (error){
            self._trace("Couldn't persist '" + processName + "' ('" + processId + "'). Error: '" + error + "'.");
            done(error);
        });
};

/**
 * @param {String} processId
 * @param {String} processName
 * @param done
 */
Persistency.prototype.load = function (processId, processName, done) {
    var sequelize = this.sequelize;
    this._trace(util.format('Try to connect %s, host: %s, database: %s, port %d',
        sequelize.options.dialect,
        sequelize.config.host,
        sequelize.config.database,
        sequelize.config.port)
    );

    var self=this;
    self._trace("Start finding '" + processName + "' ('" + processId + "').");

    Process.findAll({
            where: {
                processId: processId,
                processName: processName
            },
            limit: 2
        })
        .then(function (records) {
            var size = records.length;
            if (size === 0) {
                self._trace("Didn't find '" + processName + "' ('" + processId + "').");
                done();
            } else if (size === 1) {
                self._trace("Found '" + processName + "' ('" + processId + "').");
                var data=self.transformer.toData(records[0].data);
                data._id=records[0]._id;
                done(null, data);
            } else {
                var errorMessage = "Found more than one process of " + processName + "' ('" + processId + "').";
                self._trace("ERROR '" + errorMessage + "'");
                done(new Error(errorMessage));
            }
        })
        .catch(function (error) {
            console.log(error)
            self._trace("Couldn't find '" + processName + ". Error: '" + error + "'.");
            done(error)
        });
};

/**
 * @param {String} processName
 * @param done
 */
Persistency.prototype.loadAll = function (processName, done) {
    var sequelize = this.sequelize;
    this._trace(util.format('Try to connect %s, host: %s, database: %s, port %d',
        sequelize.options.dialect,
        sequelize.config.host,
        sequelize.config.database,
        sequelize.config.port)
    );


    var self=this;

    Process.findAll({
            where: {
                processName: processName
            }
        })
        .then(function(records){
            return records.map(function(record){
                return self.transformer.toData(record.data);
            })
        })
        .asCallback(done);
};

/**
 * @param done
 */
Persistency.prototype.close = function (done) {
    done();

};




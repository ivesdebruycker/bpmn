/**
 * Copyright: E2E Technologies Ltd
 */
"use strict";

var SequelizePersistency = require('../../lib/persistency/sequelize/sequelize').Persistency;
var Sequelize =require('sequelize');
var executionTrace = [];
var logger = {
    trace: function(message) {
        //console.log(message);
        executionTrace.push(message);
    }
};

var dbUri = 'postgres://bpmn:bpmn@localhost:5432/bpmn';
var sequelize=new Sequelize(dbUri)
var persistency = new SequelizePersistency(sequelize, {
    "logger": logger
});

var Process=sequelize.import('../../lib/persistency/sequelize/process');

exports.resetSequelize = function(test) {
    Process.sync()
        .then(function(){return Process.destroy({ truncate: true })})
        .then(function(){
            test.done()
        })
        .catch(function(error){
            test.ok(false, "resetSequelize: nok");
        })

};

exports.testSequelizeConnectionOK = function(test) {

    var data = {
        processId: "myId",
        processName: "testprocess",
        properties: {
            x: "test data"
        }
    };

    persistency.persist(data, function(error, document) {

        test.ok(error === undefined || error === null, "testSequelizeConnectionOK: no error");

        test.ok(document._id !== undefined, "testSequelizeConnectionOK: _id 1 exists");
        document._id = "_dummy_id_";

        test.deepEqual(document,
            {
                "_id": "_dummy_id_",
                "processId": "myId",
                "processName": "testprocess",
                "properties": {
                    "x": "test data"
                }
            },
            "testSequelizeConnectionOK: data");
        test.done();
    });
};

exports.testSequelizeConnectionOKExecutionTrace = function(test) {
    test.deepEqual(executionTrace,
        [
            'Try to connect postgres, host: localhost, database: bpmn, port 5432',
            "Start persisting 'testprocess'",
            "Persisted 'testprocess' ('myId')."
        ],
        "testSequelizeConnectionOKExecutionTrace"
    );
    test.done();
};

exports.testSequelizeClose = function(test) {
    persistency.close(function() {
        test.done();
    });
};

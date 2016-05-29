/**
 * Copyright: E2E Technologies Ltd
 */
"use strict";

var SequelizePersistency = require('../../lib/persistency/sequelize/sequelize').Persistency;
var Sequelize = require('sequelize');
var executionTrace = [];
var logger = {
    trace: function (message) {
        //console.log(message);
        executionTrace.push(message);
    }
};
var dbUri = 'postgres://bpmn:bpmn@localhost:5432/nonexistent';
var sequelize = new Sequelize(dbUri)
var persistency = new SequelizePersistency(sequelize, {
    "logger": logger
});

exports.testSequelizeConnectionNOK = function (test) {

    persistency.persist({
        processName: 'dummyProcessName',
        processId: 'dummyProcessId',
    }, function (error) {
        test.ok(error !== undefined || error !== null, "testSequelizeConnectionNOK: error occurred");
        test.done();
    });
};

exports.testSequelizeConnectionNOKExecutionTrace = function (test) {
    test.deepEqual(executionTrace,
        [
            'Try to connect postgres, host: localhost, database: nonexistent, port 5432',
            'Start persisting \'dummyProcessName\'',
            'database "nonexistent" does not exist',
            'Couldn\'t persist \'dummyProcessName\' (\'dummyProcessId\'). Error: \'SequelizeConnectionError: database "nonexistent" does not exist\'.'
        ],
        "testSequelizeConnectionNOKExecutionTrace"
    );
    test.done();
};

exports.testSequelizeClose = function (test) {
    // there is nothing to close, but the call has to work anyway
    persistency.close(function () {
        test.done();
    });
};

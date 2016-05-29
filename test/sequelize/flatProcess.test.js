/**
 * Copyright: E2E Technologies Ltd
 */
"use strict";

var path = require('path');
var BpmnManager = require('../../lib/manager.js').ProcessManager;

var util=require('util');

require("../../lib/history.js").setDummyTimestampFunction();

var SequelizePersistency = require('../../lib/persistency/sequelize/sequelize').Persistency;

var bpmnFileName = path.join(__dirname, "../resources/projects/simple/taskExampleProcess.bpmn");

var bpmnProcess1, bpmnProcess2;

var Sequelize = require('sequelize');
var executionTrace = [];
var logger = {
    trace: function (message) {
        //console.log(message);
        executionTrace.push(message);
    }
};

var dbUri = 'postgres://bpmn:bpmn@localhost:5432/bpmn';
var sequelize = new Sequelize(dbUri)

var Process = sequelize.import('../../lib/persistency/sequelize/process');


exports.resetSequelize = function (test) {
    Process.sync()
        .then(function () {
            return Process.destroy({truncate: true})
        })
        .then(function () {
            test.done()
        })
        .catch(function (error) {
            test.ok(false, "resetSequelize: nok");
        })

};

exports.testSequelizePersistProcess1 = function (test) {
    var doneSaving = function (error) {
        test.ok(error === null, "testSequelizePersistProcess1: no error saving.");
        test.done();
    };
    var bpmn = new BpmnManager({
        persistencyOptions: {
            sequelize: sequelize,
            doneSaving: doneSaving,
            logger: logger
        },
        bpmnFilePath: bpmnFileName
    })
    bpmn.createProcess("myid1", function (err, process) {
        bpmnProcess1 = process;
        process.triggerEvent("MyStart");
    });


};

exports.testSequelizeAfterPersistingProcess1 = function (test) {
    Process.findAll()
        .then(function (results) {
            var process=results[0].dataValues;

            test.ok(process!== undefined, "testSequelizeAfterPersistingProcess1: got results");
            test.ok(process._id !== undefined, "testSequelizeAfterPersistingProcess1: _id 1 exists");
            process._id = "_dummy_id_";
                    test.deepEqual(process,
                        {
                            _id:"_dummy_id_",
                            processId: 'myid1',
                            processName: 'TaskExampleProcess',
                            data:{
                                "processName": "TaskExampleProcess",
                                "processId": "myid1",
                                "parentToken": null,
                                "properties": {
                                    "myFirstProperty": {}
                                },
                                "state": {
                                    "tokens": [
                                        {
                                            "position": "MyTask",
                                            "owningProcessId": "myid1"
                                        }
                                    ]
                                },
                                "history": {
                                    "historyEntries": [
                                        {
                                            "name": "MyStart",
                                            "type": "startEvent",
                                            "begin": "_dummy_ts_",
                                            "end": "_dummy_ts_"
                                        },
                                        {
                                            "name": "MyTask",
                                            "type": "task",
                                            "begin": "_dummy_ts_",
                                            "end": null
                                        }
                                    ],
                                    "createdAt": "_dummy_ts_",
                                    "finishedAt": null
                                },
                                "pendingTimeouts": {},
                                "views": {
                                    "startEvent": {
                                        "name": "MyStart",
                                        "type": "startEvent",
                                        "begin": "_dummy_ts_",
                                        "end": "_dummy_ts_"
                                    },
                                    "endEvent": null,
                                    "duration": null
                                }
                            }

        }
                        ,
                        "testSequelizeAfterPersistingProcess1");
            test.done();

        })
    //mongodb.MongoClient.connect(persistencyUri, function(err, db) {
    //    var collection = db.collection('TaskExampleProcess');
    //    collection.find().toArray(function(err, results) {
    //        db.close();
    //
    //        test.ok(results[0] !== undefined, "testSequelizeAfterPersistingProcess1: got results");
    //
    //        test.ok(results[0]._id !== undefined, "testSequelizeAfterPersistingProcess1: _id 1 exists");
    //        results[0]._id = "_dummy_id_";
    //
    //        test.deepEqual(results,
    //            [
    //                {
    //                    "_id": "_dummy_id_",
    //                    "processName": "TaskExampleProcess",
    //                    "processId": "myid1",
    //                    "parentToken": null,
    //                    "properties": {
    //                        "myFirstProperty": {}
    //                    },
    //                    "state": {
    //                        "tokens": [
    //                            {
    //                                "position": "MyTask",
    //                                "owningProcessId": "myid1"
    //                            }
    //                        ]
    //                    },
    //                    "history": {
    //                        "historyEntries": [
    //                            {
    //                                "name": "MyStart",
    //                                "type": "startEvent",
    //                                "begin": "_dummy_ts_",
    //                                "end": "_dummy_ts_"
    //                            },
    //                            {
    //                                "name": "MyTask",
    //                                "type": "task",
    //                                "begin": "_dummy_ts_",
    //                                "end": null
    //                            }
    //                        ],
    //                        "createdAt": "_dummy_ts_",
    //                        "finishedAt": null
    //                    },
    //                    "pendingTimeouts": {},
    //                    "views": {
    //                        "startEvent": {
    //                            "name": "MyStart",
    //                            "type": "startEvent",
    //                            "begin": "_dummy_ts_",
    //                            "end": "_dummy_ts_"
    //                        },
    //                        "endEvent": null,
    //                        "duration": null
    //                    }
    //                }
    //            ],
    //            "testSequelizeAfterPersistingProcess1");
    //
    //        test.done();
    //    });
    //});
};

exports.testSequelizePersistProcess2 = function (test) {
    var doneSaving = function (error) {
        test.ok(error === null, "testSequelizePersistProcess2: no error saving.");
        test.done();
    };

    var bpmn = new BpmnManager({
        persistencyOptions: {
            sequelize: sequelize,
            doneSaving: doneSaving,
            logger: logger
        },
        bpmnFilePath: bpmnFileName,
        logger: logger
    })


    bpmnProcess2 = bpmn.createProcess("myid2", function (err, process) {
            bpmnProcess2 = process;
            process.triggerEvent("MyStart");
        }
    );

};

exports.testSequelizeAfterPersistingProcess2 = function (test) {
    Process.findAll()
        .then(function (processes) {
            test.done();
        })
    //mongodb.MongoClient.connect(persistencyUri, function(err, db) {
    //    var collection = db.collection('TaskExampleProcess');
    //    collection.find().toArray(function(err, results) {
    //        db.close();
    //
    //        test.ok(results[0]._id !== undefined, "testSequelizeAfterPersistingProcess2: _id 1 exists");
    //        results[0]._id = "_dummy_id_";
    //
    //        test.ok(results[1]._id !== undefined, "testSequelizeAfterPersistingProcess2: _id 2 exists");
    //        results[1]._id = "_dummy_id_";
    //
    //        test.deepEqual(results,
    //            [
    //                {
    //                    "_id": "_dummy_id_",
    //                    "processName": "TaskExampleProcess",
    //                    "processId": "myid1",
    //                    "parentToken": null,
    //                    "properties": {
    //                        "myFirstProperty": {}
    //                    },
    //                    "state": {
    //                        "tokens": [
    //                            {
    //                                "position": "MyTask",
    //                                "owningProcessId": "myid1"
    //                            }
    //                        ]
    //                    },
    //                    "history": {
    //                        "historyEntries": [
    //                            {
    //                                "name": "MyStart",
    //                                "type": "startEvent",
    //                                "begin": "_dummy_ts_",
    //                                "end": "_dummy_ts_"
    //                            },
    //                            {
    //                                "name": "MyTask",
    //                                "type": "task",
    //                                "begin": "_dummy_ts_",
    //                                "end": null
    //                            }
    //                        ],
    //                        "createdAt": "_dummy_ts_",
    //                        "finishedAt": null
    //                    },
    //                    "pendingTimeouts": {},
    //                    "views": {
    //                        "startEvent": {
    //                            "name": "MyStart",
    //                            "type": "startEvent",
    //                            "begin": "_dummy_ts_",
    //                            "end": "_dummy_ts_"
    //                        },
    //                        "endEvent": null,
    //                        "duration": null
    //                    }
    //                },
    //                {
    //                    "_id": "_dummy_id_",
    //                    "processName": "TaskExampleProcess",
    //                    "processId": "myid2",
    //                    "parentToken": null,
    //                    "properties": {
    //                        "myFirstProperty": {}
    //                    },
    //                    "state": {
    //                        "tokens": [
    //                            {
    //                                "position": "MyTask",
    //                                "owningProcessId": "myid2"
    //                            }
    //                        ]
    //                    },
    //                    "history": {
    //                        "historyEntries": [
    //                            {
    //                                "name": "MyStart",
    //                                "type": "startEvent",
    //                                "begin": "_dummy_ts_",
    //                                "end": "_dummy_ts_"
    //                            },
    //                            {
    //                                "name": "MyTask",
    //                                "type": "task",
    //                                "begin": "_dummy_ts_",
    //                                "end": null
    //                            }
    //                        ],
    //                        "createdAt": "_dummy_ts_",
    //                        "finishedAt": null
    //                    },
    //                    "pendingTimeouts": {},
    //                    "views": {
    //                        "startEvent": {
    //                            "name": "MyStart",
    //                            "type": "startEvent",
    //                            "begin": "_dummy_ts_",
    //                            "end": "_dummy_ts_"
    //                        },
    //                        "endEvent": null,
    //                        "duration": null
    //                    }
    //                }
    //            ],
    //            "testSequelizeAfterPersistingProcess2");
    //
    //        test.done();
    //
    //    });
    //
    //
    //});
};

exports.testSequelizePersistentProcess2persistAtEnd = function (test) {
    var doneSaving = function (error) {
        test.ok(error === null, "testSequelizePersistentProcess2persistAtEnd: no error saving.");
        test.done();
    };


    bpmnProcess2._implementation.doneSavingHandler = doneSaving;

    // we let the process run to the very end
    bpmnProcess2.taskDone("MyTask");

};

exports.testSequelizeAfterEndOfProcess2 = function (test) {
    test.done();
    //mongodb.MongoClient.connect(persistencyUri, function(err, db) {
    //    var collection = db.collection('TaskExampleProcess');
    //    collection.find().toArray(function(err, results) {
    //        db.close();
    //
    //        test.ok(results[0]._id !== undefined, "testSequelizeAfterEndOfProcess2: _id 1 exists");
    //        results[0]._id = "_dummy_id_";
    //
    //        test.ok(results[1]._id !== undefined, "testSequelizeAfterEndOfProcess2: _id 2 exists");
    //        results[1]._id = "_dummy_id_";
    //
    //        // "_dummy_ts_" - "_dummy_ts_" = NaN, but NaN != NaN, so deepEqualFails
    //        test.ok(isNaN(results[1].views.duration), "testCreatePersistentHierarchicalProcess: saving: duration calculated" );
    //        results[1].views.duration = "_calculated_";
    //
    //        test.deepEqual(results,
    //            [
    //                {
    //                    "_id": "_dummy_id_",
    //                    "processName": "TaskExampleProcess",
    //                    "processId": "myid1",
    //                    "parentToken": null,
    //                    "properties": {
    //                        "myFirstProperty": {}
    //                    },
    //                    "state": {
    //                        "tokens": [
    //                            {
    //                                "position": "MyTask",
    //                                "owningProcessId": "myid1"
    //                            }
    //                        ]
    //                    },
    //                    "history": {
    //                        "historyEntries": [
    //                            {
    //                                "name": "MyStart",
    //                                "type": "startEvent",
    //                                "begin": "_dummy_ts_",
    //                                "end": "_dummy_ts_"
    //                            },
    //                            {
    //                                "name": "MyTask",
    //                                "type": "task",
    //                                "begin": "_dummy_ts_",
    //                                "end": null
    //                            }
    //                        ],
    //                        "createdAt": "_dummy_ts_",
    //                        "finishedAt": null
    //                    },
    //                    "pendingTimeouts": {},
    //                    "views": {
    //                        "startEvent": {
    //                            "name": "MyStart",
    //                            "type": "startEvent",
    //                            "begin": "_dummy_ts_",
    //                            "end": "_dummy_ts_"
    //                        },
    //                        "endEvent": null,
    //                        "duration": null
    //                    }
    //                },
    //                {
    //                    "_id": "_dummy_id_",
    //                    "processName": "TaskExampleProcess",
    //                    "processId": "myid2",
    //                    "parentToken": null,
    //                    "properties": {
    //                        "myFirstProperty": {}
    //                    },
    //                    "state": {
    //                        "tokens": []
    //                    },
    //                    "history": {
    //                        "historyEntries": [
    //                            {
    //                                "name": "MyStart",
    //                                "type": "startEvent",
    //                                "begin": "_dummy_ts_",
    //                                "end": "_dummy_ts_"
    //                            },
    //                            {
    //                                "name": "MyTask",
    //                                "type": "task",
    //                                "begin": "_dummy_ts_",
    //                                "end": "_dummy_ts_"
    //                            },
    //                            {
    //                                "name": "MyEnd",
    //                                "type": "endEvent",
    //                                "begin": "_dummy_ts_",
    //                                "end": "_dummy_ts_"
    //                            }
    //                        ],
    //                        "createdAt": "_dummy_ts_",
    //                        "finishedAt": "_dummy_ts_"
    //                    },
    //                    "pendingTimeouts": {},
    //                    "views": {
    //                        "startEvent": {
    //                            "name": "MyStart",
    //                            "type": "startEvent",
    //                            "begin": "_dummy_ts_",
    //                            "end": "_dummy_ts_"
    //                        },
    //                        "endEvent": {
    //                            "name": "MyEnd",
    //                            "type": "endEvent",
    //                            "begin": "_dummy_ts_",
    //                            "end": "_dummy_ts_"
    //                        },
    //                        "duration": "_calculated_"
    //                    }
    //                }
    //            ],
    //            "testSequelizeAfterEndOfProcess2");
    //
    //        test.done();
    //
    //    });
    //});
};

exports.testSequelizeLoadProcess1 = function (test) {
    // clear cache otherwise we wouldn't load process one from the db

    var doneLoading = function (error, loadedData) {
        test.ok(error === null, "testSequelizeLoadProcess1: no error loading.");

        test.ok(loadedData._id !== undefined, "testSequelizeLoadProcess1: _id 1 exists");
        loadedData._id = "_dummy_id_";

        test.deepEqual(loadedData,
            {
                "_id": "_dummy_id_",
                "processName": "TaskExampleProcess",
                "processId": "myid1",
                "parentToken": null,
                "properties": {
                    "myFirstProperty": {}
                },
                "state": {
                    "tokens": [
                        {
                            "position": "MyTask",
                            "owningProcessId": "myid1"
                        }
                    ]
                },
                "history": {
                    "historyEntries": [
                        {
                            "name": "MyStart",
                            "type": "startEvent",
                            "begin": "_dummy_ts_",
                            "end": "_dummy_ts_"
                        },
                        {
                            "name": "MyTask",
                            "type": "task",
                            "begin": "_dummy_ts_",
                            "end": null
                        }
                    ],
                    "createdAt": "_dummy_ts_",
                    "finishedAt": null
                },
                "pendingTimeouts": {},
                "views": {
                    "startEvent": {
                        "name": "MyStart",
                        "type": "startEvent",
                        "begin": "_dummy_ts_",
                        "end": "_dummy_ts_"
                    },
                    "endEvent": null,
                    "duration": null
                }
            },
            "testSequelizeAfterPersistingProcess2");

        test.done();
    };

    var bpmn = new BpmnManager({
        persistencyOptions: {
            sequelize: sequelize,
            doneLoading: doneLoading,
            logger: logger
        },
        bpmnFilePath: bpmnFileName
    })

    bpmnProcess1 = bpmn.createProcess("myid1");
};

exports.testSequelizeFlatProcessPersistenceExecutionTrace = function (test) {
    test.deepEqual(executionTrace,
        [
            'Try to connect postgres, host: localhost, database: bpmn, port 5432',
            'Try to connect postgres, host: localhost, database: bpmn, port 5432',
            'Start finding \'TaskExampleProcess\' (\'myid1\').',
            'Didn\'t find \'TaskExampleProcess\' (\'myid1\').',
            'Try to connect postgres, host: localhost, database: bpmn, port 5432',
            'Start persisting \'TaskExampleProcess\'',
            'Persisted \'TaskExampleProcess\' (\'myid1\').',
            'Try to connect postgres, host: localhost, database: bpmn, port 5432',
            'Try to connect postgres, host: localhost, database: bpmn, port 5432',
            'Start finding \'TaskExampleProcess\' (\'myid1\').',
            'Found \'TaskExampleProcess\' (\'myid1\').',
            'Try to connect postgres, host: localhost, database: bpmn, port 5432',
            'Start finding \'TaskExampleProcess\' (\'myid2\').',
            'Didn\'t find \'TaskExampleProcess\' (\'myid2\').',
            'Try to connect postgres, host: localhost, database: bpmn, port 5432',
            'Start persisting \'TaskExampleProcess\'',
            'Persisted \'TaskExampleProcess\' (\'myid2\').',
            'Try to connect postgres, host: localhost, database: bpmn, port 5432',
            'Start persisting \'TaskExampleProcess\'',
            'Persisted \'TaskExampleProcess\' (\'myid2\').',
            'Try to connect postgres, host: localhost, database: bpmn, port 5432',
            'Try to connect postgres, host: localhost, database: bpmn, port 5432',
            'Start finding \'TaskExampleProcess\' (\'myid1\').',
            'Try to connect postgres, host: localhost, database: bpmn, port 5432',
            'Start finding \'TaskExampleProcess\' (\'myid2\').',
            'Found \'TaskExampleProcess\' (\'myid1\').'
        ],
        "testSequelizeFlatProcessPersistenceExecutionTrace"
    );
    test.done();
};

exports.closeConnections = function (test) {
    test.done();
    //bpmnProcess2.closeConnection(function() {
    //    bpmnProcess1.closeConnection(function() {
    //       test.done();
    //    });
    //});
};

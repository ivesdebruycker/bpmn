/**
 * Copyright: E2E Technologies Ltd
 */
"use strict";

var Sequelize =require ('sequelize');
var sequelize = new Sequelize('postgres://bpmn:bpmn@localhost:5432/bpmn');
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

exports.testSequelizeInsert = function(test) {
    Process
        .sync()
        .then(function(){
            return Process.create({
                _id: 'testid'
            })
        })
        .then(function(){
            return Process.findById('testid')
        })
        .then(function(record){
            if (!!record){
                test.done();
            }else{
                test.fail("no record found")
            }
        })
        .catch(function(error){
            test.ok(error === null || error === undefined, "testSequelizeInsert: nok");
        })

};


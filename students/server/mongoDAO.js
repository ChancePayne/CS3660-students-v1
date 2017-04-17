/**
 * Created by cmpay on 4/16/2017.
 */
// CRUDL for tasks stored on Mongodb

let mongo = require('mongodb').MongoClient;
//Connection URL
const URL = `mongodb://${process.env.IP}:27017/todolist`;

exports.create = function(err, id) {
    // Use connect method to connect to the server
    mongo.connect(URL, function(err, db) {
        if (err) throw err;
        console.log("Connected correctly to server");

        db.collection('tasks').insertOne({}, function(err, result) {
            if (err) throw err;
            console.log(result);
        });

        db.close();
    });
};

exports.read = function(err, callbackFunc) {
    // Use connect method to connect to the server
    mongo.connect(URL, function(err, db) {
        if (err) return callbackFunc(err, null);;
        console.log("Connected correctly to server");

        // db.collection('tasks').findOne({key:value}, {field:yes(1)/no(0)} function(err, result) {
        // id requries ObjectID object, ObjectID = require('mongodb').MongoClient;
        db.collection('tasks').findOne(
            {"text": "Another sample"},
            function(err, result) {
                // if (err) throw err;
                console.log(result);
                callbackFunc(err, result);
                db.close();
            });
    });
};

exports.update = function(id, data, callbackFunc) {
    mongo.connect(URL, function(err, db) {
        if (err) return callbackFunc(err);
        console.log("Connected correctly to server");

        db.collection('tasks').updateOne(
            {_id : ObjectID(id)},
            {$set: data},
            function(err, result) {
                if (err) return callbackFunc(err);
                callbackFunc(err, result);
                db.close();
            })
    });
};

exports.delete = function(err) {
    if (err) return callbackFunc(err, null);
    console.log("Connected correctly to server");

    // db.collection('tasks').findOne({key:value}, {field:yes(1)/no(0)} function(err, result) {
    // id requries ObjectID object, ObjectID = require('mongodb').MongoClient;
    db.collection('tasks').deleteOne(
        {_id : ObjectID(id)},
        function(err, result) {
            if (err) return callbackFunc(err);
            console.log(result);
            callbackFunc(err, result);
            db.close();
        });
};


exports.list = function() {

};


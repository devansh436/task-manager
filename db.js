const {MongoClient} = require('mongodb');
const { ObjectId } = require('mongodb');
const uri = 'mongodb://localhost:27017';

let client, db, collection;

// CONNECT
async function connectDB() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db('taskDB');
        collection = db.collection('myTasks');
        console.log("Connected to database.");
    }
}

// CLOSE
async function closeConnection() {
    if (client) {
        await client.close();
        console.log("Connection closed.");
    }
}

// CREATE
async function createTask(task) {
    let result;
    try {
        await connectDB();
        result = await collection.insertOne({title: task.title, desc: task.desc});
    } catch(err) {
        console.log("DB error:", err);
    }
    return result;
}


// READ
async function readTasks() {
    let result;
    try {
        await connectDB();
        result = await collection.find({}).toArray();
    } catch(err) {
        console.log("DB error:", err);
    }
    return result;
}


// UPDATE
async function updateTask(task, taskID) {
    try {
        await connectDB();
        await collection.updateOne(
            { _id :  new ObjectId(taskID) }, 
            { $set :{ title: task.title, desc: task.desc }}
        );
    } catch(err) {
        console.log("DB error:", err);
    }
}


// DELETE
async function deleteTask(taskID) {
    try {
        await connectDB();
        result = await collection.deleteOne({ _id : new ObjectId(taskID) });
        
        if (result.deletedCount !== 0) {
            console.log("Task deleted successfully.");
            return true;
        } else {
            console.log("No such task found.");
        }
    } catch(err) {
        console.log("DB error:", err);
    }
    return false;
}


module.exports = { createTask, readTasks, updateTask, deleteTask, closeConnection };

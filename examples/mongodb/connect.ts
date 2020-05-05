import { MongoClient } from "mongodb"

// 先にdocker-compose upしておく
const uri = "mongodb://localhost:27017"
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((client) => {
        console.log("接続しました")
    })
    .catch((reason) => {
        console.log(reason)
    })

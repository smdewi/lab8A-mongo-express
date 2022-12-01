const e = require("express");
const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const PORT = 3000;

const MongoUtil = require("./MongoUtil");

require("dotenv").config();

const app = express();

app.set("view engine", "hbs");
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

//get view helpers 189 helpers
require("handlebars-helpers")({
    handlebars: hbs,
})

app.use(express.urlencoded({extended : false}));

async function main(){
    //connect to database first before routing
    const url = process.env.MONGO_URI;
    const dbName = "foodpanda_pau";

    await MongoUtil.connect(url, dbName);
    console.log("Connected to the database");

    //ROUTING
    app.get("/", function (req, res){
        res.send("Hi there");
    });

    //Create routes and connect with DB

    //DISPLAY FOOD - GET
    app.get("/display-food", async function(req, res){
        let db = MongoUtil.getDB();//get database "foodpanda_pau"

        let foodRecords = await db.collection("food_records").find({}).toArray();
        console.log(foodRecords);
        res.render("display-food", {
            foodRecords: foodRecords,
        })
    });


    //ADD FOOD - GET
    app.get("/add-food", function(req, res){
        res.render("add-food");
    });

    app.post("/add-food", function(req, res){
        //data from form inside `req.body`
        //let foodRecordName = req.body.foodRecordName;
        //let calories = req.body.calories;
        //let tags = req.body.tags;

        //Javascript destructing process 
        let { foodRecordName, calories, tags } = req.body;

        //check tags whether array, 1 element or exist
        if(!tags){
            tags = [];
        }else{
            if(!Array.isArray(tags)){
                tags = [tags];//force into a tag with 1 element
            }
        }
        console.log(`Food record: ${foodRecordName} : ${calories} : ${tags}`);

        //connect to db n insert
        let db = MongoUtil.getDB();

        /*
        let newRecord = {
            foodRecordName: foodRecordName,
            calories: calories,
            tags: tags 
         }*/

        db.collection("food_records").insertOne({
           foodRecordName: foodRecordName,
           calories: calories,
           tags: tags 
        });
        res.redirect("/display-food");
    })
}

main();

app.listen(PORT, function(){
    console.log(`Server is running at PORT ${PORT}`);
})
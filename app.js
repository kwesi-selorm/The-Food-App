//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const path = require("path");
const https = require("https");
const bodyParser = require("body-parser");

const port = process.env.PORT || 3000;

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", function (req, res) {
  //Render page
  res.render("index");
});

app.post("/", function (req, res) {
  //Implement spoonacular API
  const apiKey = "ad59ac4f3ca94357ae291b4d9243d386";
  const ingredients = req.body.ingredients;
  const number = req.body.number;
  const ranking = req.body.ranking; //number: 1-maximise used ingredients, 2-minimise missing ingredients first

  //Recipes
  const recipeUrl =
    "https://api.spoonacular.com/recipes/findByIngredients?ingredients=" +
    ingredients +
    "&ranking=" +
    ranking +
    "&number=" +
    number +
    "&apiKey=" +
    apiKey;

  https.get(recipeUrl, function (response) {
    console.log("statusCode:", response.statusCode);

    let chunks = [];
    let recipes = [];

    response
      .on("data", function (data) {
        chunks.push(data);
      })
      .on("end", function () {
        let data = Buffer.concat(chunks);
        let rawData = JSON.parse(data);

        let [a, b, ...otherRecipes] = rawData;
        let recipeData = [a, b, ...otherRecipes];

        //Display the fetched recipe details
        for (let i = 0; i < recipeData.length; i++) {
          if (typeof recipeData[i] === "object") {
            let innerArray = recipeData[i];
            for (j = 0; j < innerArray.length; j++) {
              if (
                recipes.includes({
                  name: innerArray[j].title,
                  url: innerArray[j].image,
                }) === false
              ) {
                recipes.push({
                  name: innerArray[j].title,
                  url: innerArray[j].image,
                });
              }
            }
          }
          if (
            recipes.includes({
              name: recipeData[i].title,
              url: recipeData[i].image,
            }) === false
          ) {
            recipes.push({
              name: recipeData[i].title,
              url: recipeData[i].image,
            });
          }
        }

        res.render("recipe-list", { recipes });
      });
  });
});

app.listen(port, function () {
  console.log("Server running on port " + port);
});

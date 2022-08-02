const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')

const app = express()
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect('mongodb://localhost:27017/Food');

const itemSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  protein: Number,
  carbohydrates: Number,
  fat: Number,
  itemWeight: Number,
  acceptedUnits: {
    type: String,
    enum: ['ml', 'liter', 'KG', 'g', 'item'],
    default: 'g',
    required: false
  }
});

const FoodItem = mongoose.model('fooditem', itemSchema);

const mealSchema = new mongoose.Schema({
  category: String,
  name: String,
  fooditems: Array
})

const Meal = mongoose.model('meal', mealSchema)

const userSchema = new mongoose.Schema({
  name: String,
  calorieRequirement: Number,
  mealPlan: [
    {date: { type: Date, default: Date.now },
    meal: []}
  ]
})

const User = mongoose.model('user',userSchema)

app.post("/food", function(req, res) {
  console.log(req.body)
  const foodItem = new FoodItem({
    name: req.body.name,
    calories: req.body.calories,
    protein: req.body.protein,
    carbohydrates: req.body.carbohydrates,
    fat: req.body.fat,
    itemWeight: req.body.itemWeight,
    acceptedUnits:(req.body.type)?req.body.type:'g'
  })
  foodItem.save((err)=>{if (err){console.log(err)}else{res.send("Success")}})
})

app.post("/meal",function(req,res){
  function typeOfMeal() {
    var date = new Date();
    var hours = date.getHours();
    if (hours >= 6 && hours <= 9) {
      return "Breakfast"
    } else if (hours >= 12 && hours <= 15) {
      return "Lunch"
    } else if (hours >= 16 && hours <= 18) {
      return "Evening Snack"
    } else if (hours >= 20 && hours <= 22) {
      return "Dinner"
    }
  }

  eatItems=[]

  function pickFive(){
    FoodItem.find({},function(err,docs){
      if (err){
        console.log(err)
      }else{
        var l=docs.length
        var arr=[]
        var c=5
        while (c>0) {
          arr=[docs[Math.floor(Math.random() * l)],docs[Math.floor(Math.random() * l)],docs[Math.floor(Math.random() * l)],docs[Math.floor(Math.random() * l)],docs[Math.floor(Math.random() * l)]]
          c-=1
        }
        eatItems=arr
        return
      }
    })
  }
  pickFive()
  const meal=new Meal({
    category: typeOfMeal() ,
    name: req.body.name,
    fooditems: eatItems
  })

  meal.save(function(err){
    if(err){
      console.log(err)
    }else{
      res.send("Success")
    }
  })
})

app.post("/user",function(req,res){
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;

  const formattedToday = dd + '/' + mm + '/' + yyyy;
  const meals=Meal.find({})

  const user=new User({
    name: req.body.user,
    calorieRequirement: req.body.calorieRequirement,
    mealPlan: [
      {date: formattedToday,
      meal: meals}
    ]
  })
  user.save(function(err){
    if (err){
      console.log(err)
    }else{
      res.send("Success")
    }
  })
})

app.listen(process.env.port || 3000, function() {
  console.log("Running on port")
})

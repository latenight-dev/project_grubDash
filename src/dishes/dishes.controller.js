const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function idExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish)=> dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
       return next()
    }
    next({
        status: 404,
        message: `ty`
    });
    
    
};

function idMatch(req, res, next) {
    const { dishId } = req.params;
    const {data = {} } = req.body;
    let body_id = data['id'];
    if(body_id === undefined ||body_id === "" || body_id === null ) {
        body_id = dishId;
    }
    const foundDish = dishes.find((dish)=> dish.id === dishId);
    if(body_id === foundDish.id){
        return next();
    }
    next({status: 400 , message: `id ${body_id}`});
};
function checkProperty(property) {
    return function (req, res, next) {
        const {data = {} } = req.body;
        if(data[property]) {
            return next();
        }
        next({status: 400 , message: `Dish must include a ${property}` });
    }
};
function nameCheck (req, res, next) { 
    const {data = {} } = req.body;
    if( typeof data.name === 'string' ){
        return next();
    }
    next({
        status: 400,
        message: `name`
    });
};
function descriptionCheck (req, res, next) { 
    const { data: { description } = {} } = req.body;
    if( description === ''){
        return next({
            status: 400,
            message: `name`
        });
    }
    next();
};
function priceCheck (req, res, next) { 
    const {data = {} } = req.body;
    let price = data['price']; 
    if( price > 0 && typeof price === 'number'){
        return next();
    }
    next({
        status: 400,
        message: `Dish must have a price that is an integer greater than 0`
    });
};
function imageCheck (req, res, next) { 
    const { data: { image_url } = {} } = req.body;
    if( image_url  === ''){
        return next({
            status: 5,
            message: `Dish must include a image_url`
        });
    }
    next();
};
function create(req, res) {
    const { data: {name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name, 
        description, 
        price, 
        image_url
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish })
};
function read(req,res) {
    res.json({data: res.locals.dish})
}
function list(req, res) {
    res.json({ data: dishes});
}
function update(req,res) {
    const dish = res.locals.dish;
    const { data: {id,name, description, price, image_url } = {} } = req.body;
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    res.status(200).json({ data: dish });
}
module.exports = {
    create: [
        checkProperty('name'),
        checkProperty('description'),
        checkProperty('price'),
        checkProperty('image_url'),
        nameCheck,
        priceCheck,
        descriptionCheck,
        imageCheck,
        create
    ],
    list,
    read: [
        idExists,
        read
    ],
    update: [
        idExists,
        idMatch,
        checkProperty('name'),
        checkProperty('description'),
        checkProperty('price'),
        checkProperty('image_url'),
        nameCheck,
        descriptionCheck,
        priceCheck,
        imageCheck,
        update
    ]
}

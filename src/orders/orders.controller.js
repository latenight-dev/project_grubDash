const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function idExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order)=> order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `${orderId}`,
    });
};
function idMatch(req, res, next) { 
    const { data: { id } = {} } = req.body;
    const { orderId } = req.params;
    if(id) {
        if(id === orderId) {
            return next();
        }
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
        });
    }
    return next();
}

function statuscheck(req, res, next) {
    const { data: { status } = {} } = req.body;
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
    if (validStatus.includes(status)) {
        return next();
    }
    next({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
  
    })
  }
  function quantityCheckNumber(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if(dishes.length > 0) {
        if ( dishes instanceof Array) {
            for (let i = 0; i < dishes.length; i++) {
                let index = i;
                if(dishes[index].quantity && typeof dishes[index].quantity === 'number' ) {
                    if(i === dishes.length - 1) {
                        return next();
                    } 
                    else {
                        continue;
                    }
                }
                next({
                    status: 400,
                    message: `Dish ${index} must have a quantity that is an integer greater than 0`,
                });
            }
        } 
        next({
            status: 400,
            message: 'dish',
        });
        
    }
    next({
        status: 400,
        message: 'Order must include at least one dish',
    });
  }

  function statuscheckPending(req, res, next) {
    if (res.locals.order.status !== 'pending') {
        next({
            status: 400,
            message: 'pending',
      
        })
    }
    return next();
  }
function checkProperty(property) {
    return function (req, res, next) {
        const {data = {} } = req.body;
        if(data[property]) {
            return next();
        }
        next({status: 400, message: `Order must include a ${property}` });
    }
}
function checkDish(req, res, next) {
    const {data = {} } = req.body;
    if(data['dishes']) {
        return next();
    }
    next({status: 400, message: `Order must include a dish` });
}
function create(req, res) {
    const { data: {
        deliverTo, 
        mobileNumber, 
        status, 
        dishes: [
            {
                id,
                name,
                description,
                image_url,
                price,
                quantity
            }
        ] } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo, 
        mobileNumber, 
        status, 
        dishes: [
            {
                id,
                name,
                description,
                image_url,
                price,
                quantity
            }
            
        ]
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder })
}
function read(req,res) {
    res.json({data: res.locals.order})
}
function list(req, res) {
    res.json({ data: orders});
}
function update(req,res) {
    const order = res.locals.order;
    const { data: {
        deliverTo, 
        mobileNumber, 
        status, 
        dishes: [
            {
                id,
                name,
                description,
                image_url,
                price,
                quantity
            }
        ] } = {} } = req.body;
    order.deliverTo = deliverTo; 
    order.mobileNumber =mobileNumber; 
    order.status= status;
    order.dishes = dishes =[
        {
            id,
            name,
            description,
            image_url,
            price,
            quantity
        }
        
    ];
    res.json({ data: order })
}
function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
    // splice() returns an array of the deleted elements even if its one element
    const deletedOrders = orders.splice(index, 1);
    res.sendStatus(204);
}
// TODO: Implement the /dishes handlers needed to make the tests pass
module.exports = {
    create: [
        checkProperty('deliverTo'),
        checkProperty('mobileNumber'),
        checkDish,
        quantityCheckNumber,
        create
    ],
    list,
    read: [
        idExists,
        read
    ],
    update: [
        checkProperty('deliverTo'),
        checkProperty('mobileNumber'),
        checkProperty('status'),
        checkDish,
        idExists,
        idMatch,
        statuscheck,
        quantityCheckNumber,
        update
    ],
    delete: [idExists, statuscheckPending, destroy],
}


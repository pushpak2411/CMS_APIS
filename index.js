//EXPRESS SPECIFIC STUFF
const express = require('express');
const app = express();
app.use(express.json());
const mongodb = require('mongodb');


//DATABASE SPECIFIC STUFF
require('./db/config.js');
const Admin_properties = require('./db/admin.js');
const Admin = Admin_properties.Admin;
const User = require('./db/user.js');
const Order = require('./db/order.js');
const WishList = require('./db/wishlist.js');
const Product = require('./db/product.js');

//JWT SPECIFIC STUFF
const Jwt = require('jsonwebtoken');

//COOKIE SPECIFIC STUFF
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//JOI SPECIFIC STUFF
const Joi = require('joi');
const { ref } = require('joi');

//Random String 
const randomstring = require('randomstring');

//Nodemailer
const nodemailer = require('nodemailer');

//Admin Token Keys
const Admin_AccessTokenKey  = 'Admin_AccessTokenKeyfbgh4e5u7jnhney6utjmhngtdrtynngt';
const Admin_RefreshTokenKey = 'Admin_RefreshTokenKey14984445dfhsdhsdhsdhdfh563w5gsf';

//User Token Keys
const User_AccessTokenKey   = 'User_AccessTokenKeygf89h7dsgb8dfg7h9df7gdfghdf7g87f7';
const User_RefreshTokenKey  = 'User_RefreshTokenKeygdb87dg8b78xgcv7b89ncvx97b8n9n87';

const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: '',
                pass: ''
            }
        })

        const mailOptions = {
            from: '',
            to: email,
            subject: 'For Reset Password',
            html: '<p> Hii ' + name + ', Your Reset Password Token Is :- ' + token + '</p>'
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)
            } else {
                console.log({ result: 'Email Send Successfully', data: info.response })
            }
        })

    } catch (error) {
        console.log({ success: false, msg: error.message })
    }
}

app.post('/resetPassword', async (req, res) => {
    const token = req.body.token;
    const password = req.body.password;
    if (token && password) {
        const chk_token = await Admin.findOne({ token: req.body.token });
        if (chk_token) {
            const resUpdate = await Admin.findByIdAndUpdate(
                { _id: chk_token._id },
                { $set: { password: password, token: '' } }
            )
            if (resUpdate) {
                res.status(200).json({ result: 'Password Updated Successfully' })
            } else {
                res.status(400).json({ result: 'Something Went Wrong, Please Try Again...' })
            }
        } else {
            res.status(400).json({ success: false, msg: 'Invalid Token' });
        }
    } else {
        res.status(400).json({ success: false, msg: 'Token And Password Both Fields Are Required' });
    }
})

app.use('/', (req, res)=>{
    res.json({msg:`Hello From Server 3000 CMS API TESTING MODULE`});
})

app.post('/forgotPassword', async (req, res) => {

    if (req.body.email) {
        const email = req.body.email;
        const adminData = await Admin.findOne({ email: email });
        if (adminData) {
            const randomString = randomstring.generate();
            const res_update = await Admin.updateOne(
                { email: email },
                { $set: { token: randomString } }
            )
            //  sendResetPasswordMail(adminData.fullname, adminData.email, randomString);
            if (res_update.modifiedCount) {
                res.status(200).json({ result: 'Token Send Successfully, Please Check Your Email To Process Further..' });
            } else {
                res.status(400).json({ result: 'Something Went Wrong, Please Try Again...' });
            }
        } else {
            res.status(400).json({ result: 'Email Does Not Exist...' });
        }

    } else {
        res.status(400).json({ result: 'Email Field Is Required, Please Enter Valid Email...' });
    }

})

const validationMiddleware = (req, res, next) => {
    const schema = Joi.object().keys({
        fullname: Joi.string().pattern(new RegExp(/^[a-zA-Z]+$/)).required(),
        email: Joi.string().email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "in"] }
        }).required(),
        password: Joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z])(.{8,15})$/)).required(),
        //password: Joi.string().required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        mobile: Joi.number().min(1000000000).max(9999999999).required(),
        status: Joi.number().integer().required().valid(0, 1),
        category: Joi.string().optional().valid("car", "bike", "truck"),
        amount: Joi.number().integer().min(1).max(2500).optional(),
        age: Joi.number().when('fullname', { is: 'test', then: Joi.required(), otherwise: Joi.optional() }),
        item: Joi.object().keys({
            id: Joi.number().required(),
            name: Joi.string().optional()
        }).required().unknown(true),
        items: Joi.array().items(Joi.object().keys({
            id: Joi.number().required(),
            name: Joi.string().optional()
        })).required(),

        //ref
        limit: Joi.number().required(),
        arr_test: Joi.array().min(Joi.ref('limit')).required(),

        field1: Joi.string(),
        field2: Joi.string(),
        custom_name: Joi.string().custom((value, msg) => {
            if (value == 'test') {
                return msg.message('test name not allowed')
            } else {
                return true
            }
        })


    }).xor("field1", "field2").unknown(true) //.unknown method allows us to accept or reject unknown field which is not defined in schema

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const { details } = error;
        res.status(200).send({ error: details })
    } else {
        next();
    }
}

app.post('/joi', validationMiddleware, async (req, res) => {
    res.status(200).json(req.body);
})

const adminvalidationMiddleware = (req, res, next) => {
    const schema = Joi.object().keys({
        fullname: Joi.string().pattern(new RegExp(/^[a-zA-Z]+$/)).required(),
        email: Joi.string().email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "in"] }
        }).required(),
        //password: Joi.string().pattern(new RegExp('/^[ A-Za-z0-9_@./#&+-]*$/')).required(),
        password: Joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z])(.{8,15})$/)).required(),
        address: Joi.string().required(),
        mobile: Joi.number().min(1000000000).max(9999999999).required(),
        //amount: Joi.number().integer().min(1).max(2500).required(),
        status: Joi.number().integer().required().valid(0, 1),

    }).unknown(false) //.unknown method allows us to accept or reject unknown field which is not defined in schema

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const { details } = error;
        res.status(200).send({ error: details })
    } else {
        next();
    }
}
//Admin Signup Api
app.post("/adminRegister", adminvalidationMiddleware, async (req, res) => {
    let data = new Admin(req.body);
    let email_chk = await Admin.find({ email: req.body.email });

    if (email_chk.length) {
        res.status(200).json({ result: 'This Email Is Already Exist' })
    } else {
        let result = await data.save();
        result = result.toObject();
        delete result.password;

        Jwt.sign({ result }, Admin_RefreshTokenKey, { expiresIn: '24h' }, (err, reftoken) => {
            if (err) {
                res.send({ result: 'Something Went Wrong, please try again..', err });
                process.exit(0);
            } else {
                res.cookie('refreshToken', reftoken, { httpOnly: true, maxAge: 86400000 });
            }
        })

        Jwt.sign({ result }, Admin_AccessTokenKey, { expiresIn: '1m' }, (err1, token) => {
            if (err1) {
                res.send({ result: 'Something Went Wrong, please try again..', err });
            } else {
                res.send({ 'msg': 'Admin Register Successfully', result, accessToken: token });
            }
        })
    }

})

//Admin Login Api
app.post('/adminLogin', async (req, res) => {
    if (req.body.email && req.body.password) {
        let result = await Admin.findOne(req.body).select('-password');
        if (result) {

            if (result.status == 1) {
                Jwt.sign({ result }, Admin_RefreshTokenKey, { expiresIn: '24h' }, (err, reftoken) => {
                    if (err) {
                        res.send({ result: 'Something Went Wrong, please try again..', err });
                        process.exit(0);
                    } else {
                        res.cookie('refreshToken', reftoken, { httpOnly: true, maxAge: 86400000 });
                    }
                })

                Jwt.sign({ result }, Admin_AccessTokenKey, { expiresIn: '1m' }, (err1, token) => {
                    if (err1) {
                        res.send({ result: 'Something Went Wrong, please try again..', err });
                    } else {
                        res.send({ 'msg': 'Admin Login Successful', result, accessToken: token });
                    }
                })
            } else {
                res.send('Admin Is Currently Inactive');
            }

        } else {
            res.send('Admin Not Found');
        }
    } else {
        res.send('Please Enter Email And Password Both');
    }
})

//Update Admin Api
app.put('/updateAdmin/:_id', async (req, res) => {
    let result = await Admin.updateOne(
        req.params,
        { $set: req.body }
    )
    if (result) {
        res.status(200).json({ result: 'Admin Updated Successfully' })
    } else {
        res.status(400).json({ result: 'Admin Updation Failed' })
    }
})

//Delete Admin Api
app.delete('/deleteAdmin/:_id', async (req, res) => {
    let result = await Admin.deleteOne(req.params);
    if (result) {
        res.status(200).json({ result: 'Admin Deleted Successfully' })
    } else {
        res.status(400).json({ result: 'Admin Deletion Failed' })
    }
})

// Admin PROFILE API
app.get('/getAdminProfile/:_id', verifyTokenAdmin, async (req, res) => {
    let result = await Admin.findOne(req.params).select('-password');
    if (result) {
        res.send({ result: 'success', adminData: result });
    } else {
        res.send({ result: 'Something Went Wrong, please try again..' })
    }
})

//User Signup Api
app.post("/userRegister", async (req, res) => {
    let data = new User(req.body);
    let result = await data.save();
    result = result.toObject();
    delete result.password;

    Jwt.sign({ result }, User_RefreshTokenKey, { expiresIn: '24h' }, (err, reftoken) => {
        if (err) {
            res.send({ result: 'Something Went Wrong, please try again..', err });
            process.exit(0);
        } else {
            res.cookie('refreshToken', reftoken, { httpOnly: true, maxAge: 86400000 });
        }
    })

    Jwt.sign({ result }, User_AccessTokenKey, { expiresIn: '1m' }, (err1, token) => {
        if (err1) {
            res.send({ result: 'Something Went Wrong, please try again..', err });
        } else {
            res.send({ 'msg': 'User Register Succesfully', result, accessToken: token });
        }
    })
})

//User Login Api
app.post('/userLogin', async (req, res) => {
    if (req.body.email && req.body.password) {
        let result = await User.findOne(req.body).select('-password');
        if (result) {

            if (result.status == 1 && result.role == 1) {
                Jwt.sign({ result }, User_RefreshTokenKey, { expiresIn: '24h' }, (err, reftoken) => {
                    if (err) {
                        res.send({ result: 'Something Went Wrong, please try again..', err });
                        process.exit(0);
                    } else {
                        res.cookie('refreshToken', reftoken, { httpOnly: true, maxAge: 86400000 });
                    }
                })

                Jwt.sign({ result }, User_AccessTokenKey, { expiresIn: '1m' }, (err1, token) => {
                    if (err1) {
                        res.send({ result: 'Something Went Wrong, please try again..', err });
                    } else {
                        res.send({ 'msg': 'User Login Successful', result, accessToken: token });
                    }
                })
            } else {
                res.send('User Is Currently Inactive');
            }

        } else {
            res.send('User Not Found');
        }
    } else {
        res.send('Please Enter Email And Password Both');
    }
})

//Update User Api
app.put('/updateUser/:_id', verifyTokenUser, async (req, res) => {
    let result = await User.updateOne(
        req.params,
        { $set: req.body }
    )
    if (result) {
        res.status(200).json({ result: 'User Updated Successfully' })
    } else {
        res.status(400).json({ result: 'User Updation Failed' })
    }
})

//Delete User Api
app.delete('/deleteUser/:_id', verifyTokenAdmin, async (req, res) => {
    let result = await User.deleteOne(req.params);
    if (result) {
        res.status(200).json({ result: 'User Deleted Successfully' })
    } else {
        res.status(400).json({ result: 'User Deletion Failed' })
    }
})

// USER PROFILE API
app.get('/getUserProfile/:_id', verifyTokenUser, async (req, res) => {
    let result = await User.findOne(req.params).select('-password');
    if (result) {
        res.send({ result: 'success', userData: result });
    } else {
        res.send({ result: 'Something Went Wrong, please try again..' })
    }
})

//Add Product Api
app.post('/addProduct', verifyTokenAdmin, async (req, res) => {
    let data = new Product(req.body);
    let result = await data.save();
    if (result) {
        res.status(200).json({ result: 'Product Added Successfully' })
    } else {
        res.status(400).json({ result: 'Something Went Wrong, please try again..' })
    }
})

//Update Product Api
app.put('/updateProduct/:_id', verifyTokenAdmin, async (req, res) => {
    let result = await Product.updateOne(
        req.params,
        { $set: req.body }
    )
    if (result) {
        res.status(200).json({ result: 'Product Updated Successfully' })
    } else {
        res.status(400).json({ result: 'Product Updation Failed' })
    }
})

//Delete Product Api
app.delete('/deleteProduct/:_id', verifyTokenAdmin, async (req, res) => {
    let result = await Product.deleteOne(req.params);
    if (result) {
        res.status(200).json({ result: 'Product Deleted Successfully' })
    } else {
        res.status(400).json({ result: 'Product Deletion Failed' })
    }
})

//Product Listing Api
app.get('/productList', async (req, res) => {
    let result = await Product.find();
    if (result) {
        res.status(200).json({ result: 'success', Product_List: result });
    } else {
        res.status(400).json({ result: 'Something Went Wrong, please try again..' })
    }
})

//Product Detail Api
app.get('/productDetails/:_id', async (req, res) => {
    let result = await Product.findOne(req.params);
    if (result) {
        res.status(200).json({ result: 'success', Product_Detail: result });
    } else {
        res.status(400).json({ result: 'Something Went Wrong, please try again..' })
    }
})

//Create Order Api
app.post('/addOrder', verifyTokenUser, async (req, res)=>{
    let data = new Order(req.body);
    let result = await data.save();
    if (result) {
        res.status(200).json({ result: 'Order Created Successfully' })
    } else {
        res.status(400).json({ result: 'Something Went Wrong, please try again..' })
    }
})

//Order List Api
app.get('/orderList/:userID', verifyTokenUser, async (req, res) => {
    let result = await Order.find(req.params);
    if (result) {
        res.status(200).json({ result: 'success', Order_List: result });
    } else {
        res.status(400).json({ result: 'Something Went Wrong, please try again..' })
    }
})

//USER ORDERS API
app.get('/orderDetails/:_id', verifyTokenUser, async (req, res) => {
    let result = await Order.findOne(req.params);
    if (result) {
        res.status(200).json({ result: 'success', Order_Detail: result });
    } else {
        res.status(400).json({ result: 'Something Went Wrong, please try again..' })
    }
})

//Create Wishlist Api
app.post('/addTOWishlist', verifyTokenUser, async (req, res)=>{
    let data = new WishList(req.body);
    let result = await data.save();
    if (result) {
        res.status(200).json({ result: 'Product Added To Your Wishlist Successfully' })
    } else {
        res.status(400).json({ result: 'Something Went Wrong, please try again..' })
    }
})

//USER WISHLIST API
app.get('/getWishlist/:userID', verifyTokenUser, async (req, res) => {
    //console.log(req.params);
    let result = await WishList.find(req.params);
    if (result) {
        res.send({ WishList_Data: result });
    } else {
        res.send({ result: 'Something Went Wrong, please try again..' })
    }
})

//Remove Wishlist Api
app.delete('/removeFromWishlist/:_id', verifyTokenUser, async (req, res)=>{
    let result = await WishList.deleteOne(req.params);
    if (result) {
        res.status(200).json({ result: 'Product Removed From Your Wishlist Successfully' })
    } else {
        res.status(400).json({ result: 'Something Went Wrong, please try again..' })
    }
})

app.get('/getAccessTokenAdmin', (req, res) => {
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken) {
        Jwt.verify(refreshToken, Admin_RefreshTokenKey, (err, valid) => {
            if (err) {
                res.send({ result: 'Invalid Token', err });
            } else {
                Jwt.sign({ result: 'Access Token' }, Admin_AccessTokenKey, { expiresIn: '15m' }, (err, token) => {
                    if (err) {
                        res.send({ result: 'Something Went Wrong, please try again..', err });
                    } else {
                        res.send({ accessToken: token })
                    }
                })
            }
        })
    } else {
        res.send({ result: 'Refresh Token Not Found' });
    }
})

app.get('/getAccessTokenUser', (req, res) => {
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken) {
        Jwt.verify(refreshToken, User_RefreshTokenKey, (err, valid) => {
            if (err) {
                res.send({ result: 'Invalid Token', err });
            } else {
                Jwt.sign({ result: 'Access Token' }, User_AccessTokenKey, { expiresIn: '15m' }, (err, token) => {
                    if (err) {
                        res.send({ result: 'Something Went Wrong, please try again..', err });
                    } else {
                        res.send({ accessToken: token })
                    }
                })
            }
        })
    } else {
        res.send({ result: 'Refresh Token Not Found' });
    }
})

function verifyTokenAdmin(req, res, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        Jwt.verify(token, Admin_AccessTokenKey, (err, valid) => {
            if (err) {
                res.send({ result: 'Please Provide Valid Token', err });
            } else {
                next();
            }
        })

    } else {
        res.send({ result: 'Token Not Found' });
    }
}

function verifyTokenUser(req, res, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        Jwt.verify(token, User_AccessTokenKey, (err, valid) => {
            if (err) {
                res.send({ result: 'Please Provide Valid Token', err });
            } else {
                next();
            }
        })

    } else {
        res.send({ result: 'Token Not Found' });
    }
}

app.listen(3000);
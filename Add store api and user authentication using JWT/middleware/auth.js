// const jwt = require('jsonwebtoken');
// const config = require('../config/config');

// const verifyToken = async (req, res, next) => {
//     const token = req.body.token || req.query.token || req.headers['authorization'];
//     if (!token) {
//         res.send({ success: false, msg: "A token is required for authentication" });
//     }
//     try {
//         const decode =jwt.verify(token, config.secret_jwt);
//         res.send = decode;
//         next();
//     }
//     catch (error) {
//         console.log("verifyToken :", error.message);
//     }
// }

// module.exports=verifyToken;

// auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const verifyToken = async (req, res, next) => {
    console.log(req.query)
    const token = req.body.token || req.query.token || req.headers['authorization'];
    if (!token) {
        return res.status(401).send({ success: false, msg: "A token is required for authentication" });
    }
    try {
        const decoded = jwt.verify(token, config.secret_jwt);
        req.user = decoded; // Assign the decoded token to the request object
        return next();
    } catch (error) {
        console.log("verifyToken :", error.message);
        return res.status(401).send({ success: false, msg: "Failed to authenticate token" });
    }
};

module.exports = verifyToken;


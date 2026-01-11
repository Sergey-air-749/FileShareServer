const jwt = require('jsonwebtoken')

const authMidelwares = (req, res, next) => {
    // console.log(req.headers);
    // console.log(req.body);

    const tokenReq = req.headers["authorization"]
    console.log(tokenReq);
    

    if (!tokenReq) {
        return res.status(401).json({msg: "No token"})
    }

    try {
        const decoded = jwt.verify(tokenReq.split(" ")[1], process.env.JWT_SECRET_KEY)
        console.log(decoded);
        req.userId = decoded.id
        req.decoded = decoded
        next()
    } catch (error) {
        return res.status(401).json({msg: "invalid token"}) 
    }
}

module.exports = authMidelwares;
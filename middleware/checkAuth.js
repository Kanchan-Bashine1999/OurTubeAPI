const jwt = require('jsonwebtoken')

module.exports = async(req,res,next)=>{
    try
    {   //code for token//
        
        const token =req.headers.authorization.split(" ")[1]
        await jwt.verify(token,'FSD online classes 123')
        next()
    }
    catch(err)
    {
        console.log(err)
        return res.status(500).json({
            error:'invalid token'
        })
    }
}
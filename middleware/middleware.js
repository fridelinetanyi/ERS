const {verifyTokenAndReturnPayload} = require('../utility/jwt-util');

//Middleware to Check if user is authenticated
function authentication(){
    return async (req, res, next) => {   
        try{
        let token = req.headers['bearer'];         

        if (!token) {
            res.statusCode = 401; //Unauthorized, it means you are not authenticated
            res.send({
                "success": false,
                "message": "No token provided"
            })
            return;
        }
            
        let payload = await verifyTokenAndReturnPayload(token);
        
        req.payload = payload;

        next();
    } catch(e){
        res.statusCode = 400;
        res.send({
                "success": false,
                "message": "Failed to authenticate token."
            });
    }          
    }
}

module.exports = {
    authentication
}

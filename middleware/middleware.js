const {verifyTokenAndReturnPayload} = require('../utility/jwt-util');

//Middleware to Check if user is authenticated by verifying the jwt
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
        
        //verify and decode jwt
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

//Middleware to check if the user is authorized to access an endpoint
function authorization(role){
    return async (req, res, next) => {   
        try{    
            if (req.payload.role !== role) {
                res.statusCode = 403; //Forbidden, it means you are not authorized
                return res.send({
                    "success": false,
                    "message": "You don't have access to this endpoint"
                })
            }
            next();
    } catch(e){
        res.statusCode = 400;
        return res.send({
                "success": false,
                "message": "Failed to get authorization"
            });
    }          
    }
}

module.exports = {
    authentication,
    authorization
}

const AWS = require('aws-sdk');
const uuid = require("uuid");

AWS.config.update({
    region: 'us-east-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

function retrieveUserByUsername(username) {
    const params = {
        TableName: 'users',
        IndexName: 'username-index',
        KeyConditionExpression: '#u = :value',
        ExpressionAttributeNames: {
            "#u": "username"
        },
        ExpressionAttributeValues: {
            ":value": username
        }
    };

    return docClient.query(params).promise();
}

async function loginDao(username, password) {
    
    let user = await retrieveUserByUsername(username);

    if (!user.Items) {
        return {
            success: false,
            message: `User with username ${username} does not exist`
        }
    }

    if (user.Items[0].password === password) { 
        return {
            username: user.Items[0].username,
            role: user.Items[0].role,
            success: true,
            message: "Successfully authenticated"
        }
    }

    return {
        success: false,
        message: "Invalid password"
    }
}

async function registerDao(username, password, role) {
    let user = await retrieveUserByUsername(username);

    if (user.Count) {
        return {
            success: false,
            message: "username already exists"
        }
    }

    try {
        await saveUser(username, password, role);
        return {
            success: true,
            message: "New account successfully created!"
        }
    } catch (err) {
        return {
            success: false,
            message: "Something wrong happened, Try again later"
            
        }
    }  
}


async function saveUser(username, password, role) {
    const params = {
        TableName: 'users',
        Item: {
            user_id: uuid.v4(),
            username,
            password,
            role
        }
    };

    return docClient.put(params).promise();
}

module.exports = {
    retrieveUserByUsername,
    loginDao,
    registerDao
};

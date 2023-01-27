const AWS = require('aws-sdk');
const uuid = require("uuid");
const { retrieveUserByUsername } = require('../dao/authDao');

AWS.config.update({
    region: 'us-east-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

//Retrieve user id and save new employee reimbursement ticket
async function submitNewReimbursementDao(amount, description, payload, status) {

    let user = await retrieveUserByUsername(payload.username);

    let userId;
    if (user.Items && user.Items[0] && user.Items[0].user_id) {
        userId = user.Items[0].user_id;
    }

    try {
        await saveReimbursement(userId, amount, description, status);
        return {
            success: true,
            message: "New reimbursement succesffuly added!"
        }
    } catch (err) {
        return {
            success: false,
            message: "Something wrong happened, Try again later"
            
        }
    } 
}

//DB request to save new reimbursement
function saveReimbursement(userId, amount, description, status) {
    const params = {
        TableName: 'reimbursements',
        Item: {
            reimbursement_id: uuid.v4(),
            amount,
            description,
            status,
            reimbursement_user_id: userId
        }
    };

    return docClient.put(params).promise();
}

//Get reimbursement id to use it to process (approve or deny) reimbursement by manager
async function processReimbursementDao(reimbursementId, status) {
    let reimbursement = await getReimbursementById(reimbursementId);

    if (!reimbursement.Item) {
        return {
            success: false,
            message: "Reimbursement id doesn't exist"
        }
    }

    if (reimbursement.Item.status !== "Pending") {
        return {
            success: false,
            message: "Reimbursement has already been processed"
        }
    }

    try {
        await updateReimbursementStatus(reimbursementId, status);
        return {
            success: true,
            message: "Reimbursement successfully " + status 
        }
    } catch(err) {
        return {
            success: false,
            message: "Something wrong happened, Try again later"
        }
    }
}

//DB request to process (approve or deny) reimbursement
function updateReimbursementStatus(reimbursementId, status) {
    const params = {
        TableName: 'reimbursements',
        Key: {
            reimbursement_id: reimbursementId
        },
        UpdateExpression: 'set #s = :value',
        ExpressionAttributeNames: {
            '#s': 'status'
        },
        ExpressionAttributeValues: {
            ':value': status
        }
    };

    return docClient.update(params).promise();
}

//DB request to get reimbursement by id
function getReimbursementById(reimbursementId) {
    const params = {
        TableName: 'reimbursements',
        Key: {
            reimbursement_id: reimbursementId
        }
    };

    return docClient.get(params).promise();
}

//Get all pending reimbursement for managers
async function pendingReimbursementDao(status) {
    let allReimbursements = await getAllReimbursementsByStatus(status);

    if (!allReimbursements.Count) {
        return {
            success: false,
            message: "No more pending reimbursements left!"
        }
    }

    return {
        success: true,
        message: "All pending reimbursements successfully retrieved",
        reimbursementList : allReimbursements.Items
    }
}

//DB request to get all reimbursements by status for employee
function getAllReimbursementsByStatus(status) {
    const params = {
        TableName: 'reimbursements',
        IndexName: 'status-index',
        KeyConditionExpression: '#s = :value',
        ExpressionAttributeNames: {
            "#s": "status",
            "#r": "reimbursement_id",
            "#a": "amount",
            "#d": "description",
        },
        ExpressionAttributeValues: {
            ":value": status
        },
        ProjectionExpression: '#r, #a, #d'
    };

    return docClient.query(params).promise();
}

//Get employee by username and use userId to get employee reimbursements by status
async function employeeReimbursementDao(payload, status) {
    let user = await retrieveUserByUsername(payload.username);

    let userId;
    if (user.Items && user.Items[0] && user.Items[0].user_id) {
        userId = user.Items[0].user_id;
    }

    let employeeReimbursements = await getEmployeeReimbursementsByStatus(userId, status);

    if (!employeeReimbursements.Count) {
        return {
            success: false,
            message: "No reimbursement found" 
        }
    }

    return {
        success: true,
        message: "Reimbursements successfully retrieved",
        reimbursementList : employeeReimbursements.Items
    }
}

//DB request to get employee reimbursement by status, undefined status means to get all reimbursements
function getEmployeeReimbursementsByStatus(userId, status) {
    let params;
    if (!status) {
        //Get all reimbursements by user Id
        params = {
            TableName: 'reimbursements',
            IndexName: 'reimbursement_user_id-index',
            KeyConditionExpression: '#u = :value',
            ExpressionAttributeNames: {
                "#u": "reimbursement_user_id",
                "#a": "amount",
                "#d": "description",
                "#s": "status"
            },
            ExpressionAttributeValues: {
                ":value": userId
            },
            ProjectionExpression: '#a, #d, #s'
        };
    } else {
        //Get All reimbursements by user Id and status
        params = {
            TableName: 'reimbursements',
            IndexName: 'reimbursement_user_id-index',
            KeyConditionExpression: '#u = :value',
            FilterExpression : '#s = :val',
            ExpressionAttributeNames: {
                "#u": "reimbursement_user_id",
                "#a": "amount",
                "#d": "description",
                "#s": "status"
            },
            ExpressionAttributeValues: {
                ":value": userId,
                ":val": status
            },
            ProjectionExpression: '#a, #d, #s'
        };
    }

    return docClient.query(params).promise();
}

module.exports = {
    submitNewReimbursementDao,
    processReimbursementDao,
    pendingReimbursementDao,
    employeeReimbursementDao
}

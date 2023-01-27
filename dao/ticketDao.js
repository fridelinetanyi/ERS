const AWS = require('aws-sdk');
const uuid = require("uuid");
const { retrieveUserByUsername } = require('../dao/authDao');

AWS.config.update({
    region: 'us-east-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

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

function getReimbursementById(reimbursementId) {
    const params = {
        TableName: 'reimbursements',
        Key: {
            reimbursement_id: reimbursementId
        }
    };

    return docClient.get(params).promise();
}

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

function getEmployeeReimbursementsByStatus(userId, status) {
    let params;
    if (!status) {
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

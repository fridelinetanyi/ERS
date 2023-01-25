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

module.exports = {
    submitNewReimbursementDao
}

const {submitNewReimbursementService, processReimbursementService, pendingReimbursementService, employeeReimbursementService} = require('../service/ticketService'); 
const {authorization} = require('../middleware/middleware');

const express = require('express');
const reimbursementRouter = express.Router();

reimbursementRouter.get('/reimbursements', authorization("Employee"), async (req, res) => {
    const status = req.query.status;
    const payload = req.payload;

    const employeeReimbursements = await employeeReimbursementService(payload, status);

    if (employeeReimbursements.success === true) {
        res.send({
            "success": employeeReimbursements.success,
            "message": employeeReimbursements.message,
            "reimbursementList": employeeReimbursements.reimbursementList
        });
    } else {
        res.statusCode = 400;
            res.send({
                "success": employeeReimbursements.success,
                "message": employeeReimbursements.message
            })
    }  
});

reimbursementRouter.post('/add', async (req, res) => {
    const amount = req.body.amount;
    const description = req.body.description;

    //If amount doesn't exist OR amount exists but is less than 0
    if (!amount || (amount && amount <= 0)) {
        res.statusCode = 400;
            res.send({
                "success": false,
                "message": "Amount must be greater than 0"
            })
            return;
    }

    if (!description) {
        res.statusCode = 400;
            res.send({
                "success": false,
                "message": "Description is required"
            });
            return;
    }

    const reimbursement = await submitNewReimbursementService(amount, description, req.payload);

    if (reimbursement.success === true) {
        res.send({
            "success": reimbursement.success,
            "message": reimbursement.message
        });
    } else {
        res.statusCode = 400;
            res.send({
                "success": reimbursement.success,
                "message": reimbursement.message
            })
    }  
});

reimbursementRouter.patch('/update', authorization("Finance Manager"), async (req, res) => {    
    const reimbursementId = req.body.reimbursementId;
    const status = req.body.status;

    const reimbursement = await processReimbursementService(reimbursementId, status);

    if (reimbursement.success === true) {
        res.send({
            "success": reimbursement.success,
            "message": reimbursement.message
        });
    } else {
        res.statusCode = 400;
            res.send({
                "success": reimbursement.success,
                "message": reimbursement.message
            })
    }  
});

reimbursementRouter.get('/pending', authorization("Finance Manager"), async (req, res) => {    
    const pendingReimbursements = await pendingReimbursementService();

    if (pendingReimbursements.success === true) {
        res.send({
            "success": pendingReimbursements.success,
            "message": pendingReimbursements.message,
            "reimbursementList": pendingReimbursements.reimbursementList
        });
    } else {
        res.statusCode = 400;
            res.send({
                "success": pendingReimbursements.success,
                "message": pendingReimbursements.message
            })
    }  
});

module.exports = reimbursementRouter;
const {submitNewReimbursementService} = require('../service/ticketService'); 

const express = require('express');
const reimbursementRouter = express.Router();

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
    }

    if (!description) {
        res.statusCode = 400;
            res.send({
                "success": false,
                "message": "Description is required"
            })
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

// reimbursementRouter.get('/:status', async (req, res) => {
//     const amount = req.body.amount;
//     const description = req.body.description;

//     //If amount doesn't exist OR amount exists but is less than 0
//     if (!amount || (amount && amount <= 0)) {
//         res.statusCode = 400;
//             res.send({
//                 "success": false,
//                 "message": "Amount must be greater than 0"
//             })
//     }

//     if (!description) {
//         res.statusCode = 400;
//             res.send({
//                 "success": false,
//                 "message": "Description is required"
//             })
//     }

//     const reimbursement = submitNewReimbursementService(amount, description);

//     if (reimbursement.success === true) {
//         res.send({
//             "success": reimbursement.success,
//             "message": reimbursement.message
//         });
//     } else {
//         res.statusCode = 400;
//             res.send({
//                 "success": reimbursement.success,
//                 "message": reimbursement.message
//             })
//     }  
// });

module.exports = reimbursementRouter;
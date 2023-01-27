const { submitNewReimbursementDao, processReimbursementDao, pendingReimbursementDao, employeeReimbursementDao } = require("../dao/ticketDao")

//New reimbursement service with default status "Pending"
function submitNewReimbursementService(amount, description, payload) {
    let status = "Pending";
    return submitNewReimbursementDao(amount, description, payload, status);
}

//Process (Approve or Deny) reimbursement service
function processReimbursementService(reimbursementId, status) {
    return processReimbursementDao(reimbursementId, status);
}

//Pending reimbursement service with default status "Pending" for managers
function pendingReimbursementService(){
    let status = "Pending";
    return pendingReimbursementDao(status);
}

//Employee reimbursement service to get all reimbursement by status
function employeeReimbursementService(payload, status){
    return employeeReimbursementDao(payload, status);
}

module.exports = {
    submitNewReimbursementService,
    processReimbursementService,
    pendingReimbursementService,
    employeeReimbursementService
}

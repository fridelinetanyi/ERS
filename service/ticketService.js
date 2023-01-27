const { submitNewReimbursementDao, processReimbursementDao, pendingReimbursementDao, employeeReimbursementDao } = require("../dao/ticketDao")


function submitNewReimbursementService(amount, description, payload) {
    let status = "Pending";
    return submitNewReimbursementDao(amount, description, payload, status);
}

function processReimbursementService(reimbursementId, status) {
    return processReimbursementDao(reimbursementId, status);
}

function pendingReimbursementService(){
    let status = "Pending";
    return pendingReimbursementDao(status);
}

function employeeReimbursementService(payload, status){
    return employeeReimbursementDao(payload, status);
}

module.exports = {
    submitNewReimbursementService,
    processReimbursementService,
    pendingReimbursementService,
    employeeReimbursementService
}
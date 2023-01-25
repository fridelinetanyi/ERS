const { submitNewReimbursementDao } = require("../dao/ticketDao")


function submitNewReimbursementService(amount, description, payload) {
    let status = "Pending";
    return submitNewReimbursementDao(amount, description, payload, status);
}

module.exports = {
    submitNewReimbursementService
}
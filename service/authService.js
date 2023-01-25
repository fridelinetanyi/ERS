const { createJWT, verifyTokenAndReturnPayload } = require('../utility/jwt-util');
const {loginDao, registerDao} = require('../dao/authDao');

async function loginService (username, password) {
    let user = await loginDao(username, password);

    if (user.success === false) {
        return user;
    }

    const token = createJWT(user.username, user.role);
    user.token = token;
    return user;
}


function registerService (username, password) {
    let role = "Employee";
    return registerDao(username, password, role);
}

module.exports = {
    loginService,
    registerService
}

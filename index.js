const express = require('express');
const bodyParser = require('body-parser');
const {loginService, registerService} = require('./service/authService');
const reimbursementRouter = require('./routers/reimbursementRouter');
const { authentication } = require('./middleware/middleware');

const app = express();

app.use(bodyParser.json());

const PORT = 3000;

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        res.statusCode = 400;
            res.send({
                "message": "username or password cannot be empty"
            })
    }

    //Call login service with username and password
    const user = await loginService(username, password);

    //Check if username retrieval was successful
    if (user.success === true) {
            res.send({
                "success": user.success,
                "message": user.message,
                "token": user.token 
            });
    } else {
        res.statusCode = 400;
            res.send({
                "success": user.success,
                "message": user.message
            })
    }
});

app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        res.statusCode = 400;
            res.send({
                "success": user.success,
                "message": "username or password cannot be empty"
            })
    }

    const user = await registerService(username, password);

    if (user.success === true) {
        res.send({
            "success": user.success,
            "message": user.message,
            "token": user.token 
        });
    } else {
        res.statusCode = 400;
            res.send({
                "success": user.success,
                "message": user.message
            })
    }
});

app.use(authentication());

app.use('/reimbursement', reimbursementRouter);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

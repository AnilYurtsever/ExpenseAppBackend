const express = require("express");
const cors = require("cors");
const database = require("./../databaseService/database");
const app = express();
app.use(express.json());
app.use(cors());

function createExpenseHandler() {
    app.post("/expense/create", (request, response) => {
        const headers = request.headers;
        isUserExist(headers).then(
            (data) => {
                if (data.error) {
                    response.status(500);
                    response.send({
                        status: "Something happened with the database!"
                    });
                } else if (!data.error && !data.ok) {
                    response.status(400);
                    response.send({
                        status: "Invalid user credentials!"
                    });
                } else if (data.ok) {
                    if (!isExpenseDataValidForCreate(headers)) {
                        response.status(400);
                        response.send({
                            status: "Missing property in the request object!"
                        });
                    } else {
                        const expense = headers;
                        if (!isExpenseValid(expense)) {
                            response.status(400);
                            response.send({
                                status: "Wrong/inconsistent expense data!"
                            });
                        } else {
                            database.addExpense(expense).then(
                                () => {
                                    response.status(200);
                                    response.send({
                                        status: "Expense successfully created!"
                                    })
                                }
                            ).catch(
                                (err) => {
                                    if (err.errno === 1062) {
                                        response.status(400);
                                        response.send({
                                            status: "There is another expense with the same receipt number!"
                                        });
                                    } else if (err.errno === "ECONNREFUSED") {
                                        response.status(500);
                                        response.send({
                                            status: "Can't access to the database!"
                                        });
                                    } else {
                                        response.status(500);
                                        response.send({
                                            status: "Something happened!"
                                        });
                                    }
                                }
                            );
                        }
                    }
                }
            }
        );
    });
}

function getExpensesHandler() {
    app.get("/expense/get", (request, response) => {
        let headers = request.headers;
        database.getExpenses(headers).then(
            (result) => {
                response.status(200);
                response.send(result);
            }
        ).catch(
            (err) => {
                response.status(500);
                if (err.errno === 'ECONNREFUSED') {
                    response.send({
                        status: "Can't access to the database!"
                    });
                } else {
                    response.send({
                        status: "Something happened!"
                    });
                }
            }
        );
    });
}

function updateExpenseHandler() {
    app.put("/expense/update", (request, response) => {
        const headers = request.headers;
        isUserExist(headers).then(
            (data) => {
                if (data.error) {
                    response.status(500);
                    response.send({
                        status: "Something happened with the database!"
                    });
                } else if (!data.error && !data.ok) {
                    response.status(400);
                    response.send({
                        status: "Invalid user credentials!"
                    });
                } else if (data.ok) {
                    if (!isExpenseDataValidForUpdate(headers)) {
                        response.status(400);
                        response.send({
                            status: "Missing property in the request object!"
                        });
                    } else {
                        const expense = headers;
                        if (!isExpenseValid(expense)) {
                            response.status(400);
                            response.send({
                                status: "Wrong/inconsistent expense data!"
                            });
                        } else {
                            database.updateExpense(expense).then(
                                () => {
                                    response.status(200);
                                    response.send({
                                        status: "Expense successfully updated!"
                                    });
                                }
                            ).catch(
                                (error) => {
                                    response.status(500);
                                    if (err.errno === 'ECONNREFUSED') {
                                        response.send({
                                            status: "Can't access to the database!"
                                        });
                                    } else {
                                        response.send({
                                            status: "Something happened!"
                                        });
                                    }
                                }
                            )
                        }
                    }
                }
            }
        );
    });
}

function deleteExpenseHandler() {
    app.delete("/expense/delete", (request, response) => {
        const receiptNumber = request.headers.receiptnumber;
        if (!isReceiptNumberValid(receiptNumber)) {
            response.status(400);
            response.send({
                status: "Invalid receipt number!"
            })
        } else {
            database.deleteExpense(receiptNumber).then(
                () => {
                    response.status(200);
                    response.send({
                        status: "Expense successfully deleted!"
                    });
                }
            ).catch(
                () => {
                    response.status(500);
                    if (err.errno === 'ECONNREFUSED') {
                        response.send({
                            status: "Can't access to the database!"
                        });
                    } else {
                        response.send({
                            status: "Something happened!"
                        });
                    }
                }
            )
        }
    });
}

function createUserHandler() {
    app.post("/user/create", (request, response) => {
        const headers = request.headers;
        if (headers.username.length < 5 || headers.password.length < 5) {
            response.status(400);
            response.send({
                status: "Username or password too short!"
            });
        }
        database.addUser(headers).then(
            () => {
                response.status(200);
                response.send({
                    status: "User created successfully!"
                });
            }
        ).catch(
            (err) => {
                if (err.errno === 1062) {
                    response.status(400);
                    response.send({
                        status: "This user already exists!"
                    });
                } else if (err.errno === "ECONNREFUSED") {
                    response.status(500);
                    response.send({
                        status: "Can't access to the database!"
                    });
                } else {
                    response.status(500);
                    response.send({
                        status: "Something happened!"
                    });
                }
            }
        );
    });
}

function getUserHandler() {
    app.get("/user/get", (request, response) => {
        let headers = request.headers;
        if (headers.username.length < 5 || headers.password.length < 5) {
            response.status(400);
            response.send({
                status: "Username or password too short!"
            });
        }
        database.getUser(headers).then(
            (result) => {
                if (result.length === 0) {
                    response.status(400);
                    response.send({
                        status: "Invalid credentials!"
                    });
                }
                result = result[0];
                response.status(200);
                response.send(result);
            }
        ).catch(
        (err) => {
            response.status(500);
                if (err.errno === 'ECONNREFUSED') {
                    response.send({
                        status: "Can't access to the database!"
                    });
                } else {
                    response.send({
                        status: "Something happened!"
                    });
                }
            }
        );
    });
}

function startHandlers() {
    createExpenseHandler();
    getExpensesHandler();
    updateExpenseHandler();
    deleteExpenseHandler();
    createUserHandler();
    getUserHandler();
    app.listen(3000);
}

function isExpenseValid(expense) {
    return ((expense.vatamount == expense.totalamount * expense.vatrate) &&
    (expense.currency === "TRY" || expense.currency === "EUR" || expense.currency === "USD") &&
    isReceiptNumberValid(expense.receiptnumber));
}

function isExpenseDataValidForCreate(headers) {
    return (
        isExpenseDataValidForUpdate(headers) &&
        headers.receiptnumber);
}

function isExpenseDataValidForUpdate(headers) {
    return (
        headers.organizationname &&
        headers.totalamount &&
        headers.vatamount &&
        headers.vatrate &&
        headers.currency &&
        headers.receiptdate);
}

function isExpenseFilterValid(headers) {
    return (
        headers.receiptnumber ||
        headers.organizationname ||
        (headers.totalamountmin && headers.totalamountmax) ||
        headers.vatrate ||
        headers.currency ||
        (headers.receiptdateearliest && headers.receiptdatelatest));
}

function isReceiptNumberValid(receiptNumber) {
    return receiptNumber / 100000 >= 1;
}

async function isUserExist(headers) {
    return new Promise((resolve) => {
        database.getUser(headers).then(
            (result) => {
                if (result.length === 0) {
                    resolve({
                        ok: false,
                        error: false
                    });
                } else {
                    resolve({
                        ok: true,
                        error: false
                    });
                }
            }
        ).catch(
            () => {
                resolve({
                    ok: false,
                    error: true
                });
            }
        );
    });
}

module.exports = {startHandlers};


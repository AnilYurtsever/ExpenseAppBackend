const express = require("express");
const cors = require("cors");
const database = require("./../databaseService/database");
const app = express();
app.use(express.json());
app.use(cors());

function createExpenseHandler() {
    app.post("/expense/create", (request, response) => {
        const headers = request.headers;
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
                    (error) => {
                        response.status(500);
                        response.send({
                            status: "Failed to create expense!"
                        });
                    }
                );
            }
        }
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
            (error) => {
                response.status(500);
                response.send({
                    status: "Failed to get expenses!"
                });
            }
        );
    });
}

function updateExpenseHandler() {
    app.put("/expense/update", (request, response) => {
        const headers = request.headers;
        console.log(headers);
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
                    () => {
                        response.status(500);
                        response.send({
                            status: "Failed to update expense!"
                        });
                    }
                )
            }
        }
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
                    response.send({
                        status: "Failed to delete expense!"
                    });
                }
            )
        }
    });
}

function startHandlers() {
    createExpenseHandler();
    getExpensesHandler();
    updateExpenseHandler();
    deleteExpenseHandler();
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

module.exports = {startHandlers};


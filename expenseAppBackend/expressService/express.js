const express = require("express");
const database = require("./../databaseService/database");
const app = express();
app.use(express.json());

function createExpenseHandler() {
    app.post("/expense/create", (request, response) => {
        const body = request.body;
        if (!isExpenseDataValidForCreate(body)) {
            response.status(400);
            response.send({
                status: "Missing property in the request object!"
            });
        } else {
            const expense = body.expense;
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
                        console.log(error);
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
        const body = request.body;
        if (!isExpenseFilterValid(body)) {
            response.status(400);
            response.send({
                status: "Missing property in the request object!"
            });
        } else {
            const expenseFilter = body.expenseFilter;
            database.getExpenses(expenseFilter).then(
                (result) => {
                    response.status(200);
                    response.send(result);
                }
            ).catch(
                (error) => {
                    console.log(error);
                    response.status(500);
                    response.send({
                        status: "Failed to get expenses!"
                    });
                }
            );
        }
    });
}

function updateExpenseHandler() {
    app.put("/expense/update", (request, response) => {
        const receiptNumber = request.headers.receiptNumber;
        const body = request.body;
        if (!isExpenseDataValidForUpdate(body)) {
            response.status(400);
            response.send({
                status: "Missing property in the request object!"
            });
        } else {
            const expense = body.expense;
            if (!isExpenseValid(expense)) {
                response.status(400);
                response.send({
                    status: "Wrong/inconsistent expense data!"
                });
            } else {
                database.updateExpense(receiptNumber, expense).then(
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
        const receiptNumber = request.headers.receiptNumber;
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
    return ((expense.vatAmount === expense.totalAmount * expense.vatRate) &&
    (expense.currency === "TRY" || expense.currency === "EUR" || expense.currency === "USD") &&
    isReceiptNumberValid(expense.receiptNumber));
}

function isExpenseDataValidForCreate(body) {
    if (!body.expense) {
        return false;
    }
    return (
        isExpenseDataValidForUpdate(body) &&
        body.expense.receiptNumber);
}

function isExpenseDataValidForUpdate(body) {
    if (!body.expense) {
        return false;
    }
    return (
        body.expense.organizationName &&
        body.expense.totalAmount &&
        body.expense.vatAmount &&
        body.expense.vatRate &&
        body.expense.currency &&
        body.expense.receiptDate);
}

function isExpenseFilterValid(body) {
    if (!body.expenseFilter) {
        return false;
    }
    return (
        body.expenseFilter.receiptNumber ||
        body.expenseFilter.organizationName ||
        (body.expenseFilter.totalAmountMin && body.expenseFilter.totalAmountMax) ||
        body.expenseFilter.vatRate ||
        body.expenseFilter.currency ||
        (body.expenseFilter.receiptDateEarliest && body.expenseFilter.receiptDateLatest));
}

function isReceiptNumberValid(receiptNumber) {
    return receiptNumber / 100000 >= 1;
}

module.exports = {startHandlers};


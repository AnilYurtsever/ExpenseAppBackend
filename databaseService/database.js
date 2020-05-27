const mysql = require("mysql");

const config = {
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'ExpenseDatabase'
};

async function sendQuery(query) {
    const connection = mysql.createConnection(config);
    connection.connect();
    return new Promise((resolve, reject) => {
        connection.query(query, async (error, result) => {
            if (error) {
                connection.destroy();
                reject(error);
            }
            connection.destroy();
            resolve(result);
        });
    });
}

async function addExpense(expense) {
    const query = `
    INSERT INTO Expense
        (
        OrganizationName,
        TotalAmount,
        VATAmount,
        VATRate,
        Currency,
        ReceiptNumber,
        ReceiptDate
        )
    VALUES
        (
        '${expense.organizationName}',
        ${expense.totalAmount},
        ${expense.vatAmount},
        ${expense.vatRate},
        '${expense.currency}',
        ${expense.receiptNumber},
        '${convertToMySQLDate(expense.receiptDate)}'
    );`;
    return sendQuery(query);
}

function getExpenses(expenseFilter) {

    let query;
    if (expenseFilter.receiptNumber) {
        query = `
        SELECT * FROM Expense
        WHERE
            ReceiptNumber = ${expenseFilter.receiptNumber}
        ;`;
    } else {
        query = `
        SELECT * FROM Expense
        WHERE
        `;
        if (expenseFilter.organizationName) {
            query += `OrganizationName LIKE '%${expenseFilter.organizationName}%' AND `;
        }
        if (expenseFilter.totalAmount) {
            const min = expenseFilter.totalAmount.min;
            const max = expenseFilter.totalAmount.max;
            query += `TotalAmount BETWEEN ${min} AND ${max} AND `;
        }
        if (expenseFilter.vatRate) {
            query += `VATRate = ${expenseFilter.vatRate} AND `;
        }
        if (expenseFilter.currency) {
            query += `Currency = '${expenseFilter.currency}' AND `;
        }
        if (expenseFilter.receiptDate) {
            const earliestDate = convertToMySQLDate(expenseFilter.receiptDate.earliest);
            const latestDate = convertToMySQLDate(expenseFilter.receiptDate.latest);
            query += `ReceiptDate BETWEEN CAST('${earliestDate}' AS DATE) AND CAST('${latestDate}' AS DATE) AND `;
        }
        query = query.substr(0, query.length - 5);
    }
    return sendQuery(query);
}

function updateExpense(receiptNumber, updatedExpense) {
    const query = `
        UPDATE Expense
        SET
            OrganizationName = '${updatedExpense.organizationName}',
            TotalAmount = ${updatedExpense.totalAmount},
            VATAmount = ${updatedExpense.vatAmount},
            VATRate = ${updatedExpense.vatRate},
            Currency = '${updatedExpense.currency}',
            ReceiptDate = '${convertToMySQLDate(updatedExpense.receiptDate)}'
        WHERE ReceiptNumber = ${receiptNumber};`;
    return sendQuery(query);
}

function deleteExpense(receiptNumber) {
    const query = `DELETE FROM Expense WHERE ReceiptNumber = ${receiptNumber};`;
    return sendQuery(query);
}

function convertToMySQLDate(date) {
    date = new Date(date);
    return date.toISOString().slice(0, 10);
}

module.exports = {addExpense, getExpenses, updateExpense, deleteExpense};

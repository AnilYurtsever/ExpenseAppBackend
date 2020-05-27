const express = require("./expressService/express");

express.startHandlers();

// dbTest();

// async function dbQuickInstall() {
//     let result;
//     for (let i = 100000; i < 100020; i++) {
//         result = await db.addExpense({
//             organizationName: "test" + i,
//             totalAmount: 8,
//             vatAmount: 1.5,
//             vatRate: 0.18,
//             currency: "EUR",
//             receiptNumber: i,
//             receiptDate: "2016-01-15 12:17:32"
//         });
//     }
// }

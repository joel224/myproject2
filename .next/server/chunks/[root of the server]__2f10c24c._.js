module.exports = {

"[project]/.next-internal/server/app/api/invoices/[invoiceId]/record-payment/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route.runtime.dev.js [external] (next/dist/compiled/next-server/app-route.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/@opentelemetry/api [external] (@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("@opentelemetry/api", () => require("@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page.runtime.dev.js [external] (next/dist/compiled/next-server/app-page.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/src/lib/mockData.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "mockAppointments": (()=>mockAppointments),
    "mockInvoices": (()=>mockInvoices),
    "mockPatients": (()=>mockPatients),
    "mockProgressNotes": (()=>mockProgressNotes),
    "mockStaff": (()=>mockStaff),
    "mockTreatmentPlans": (()=>mockTreatmentPlans)
});
const mockPatients = [
    {
        id: 'pat1',
        name: 'Alice Wonderland',
        email: 'alice@example.com',
        dateOfBirth: '1990-05-15',
        phone: '555-0101'
    },
    {
        id: 'pat2',
        name: 'Bob The Builder',
        email: 'bob@example.com',
        dateOfBirth: '1985-11-20',
        phone: '555-0102'
    },
    {
        id: 'pat3',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        dateOfBirth: '2000-01-30',
        phone: '555-0103'
    }
];
const mockStaff = [
    {
        id: 'doc1',
        name: 'Dr. Loji',
        role: 'Dentist',
        email: 'drloji@example.com'
    },
    {
        id: 'staff1',
        name: 'Sarah Miller',
        role: 'Receptionist',
        email: 'sarah@example.com'
    },
    {
        id: 'hyg1',
        name: 'Mike Ross',
        role: 'Hygienist',
        email: 'mike@example.com'
    }
];
const mockAppointments = [
    {
        id: 'apt1',
        patientId: 'pat1',
        patientName: 'Alice Wonderland',
        doctorId: 'doc1',
        doctorName: 'Dr. Loji',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        type: 'Check-up',
        status: 'Scheduled'
    },
    {
        id: 'apt2',
        patientId: 'pat2',
        patientName: 'Bob The Builder',
        doctorId: 'doc1',
        doctorName: 'Dr. Loji',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '02:30 PM',
        type: 'Cleaning',
        status: 'Confirmed'
    },
    {
        id: 'apt3',
        patientId: 'pat1',
        patientName: 'Alice Wonderland',
        doctorId: 'doc1',
        doctorName: 'Dr. Loji',
        date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
        time: '09:00 AM',
        type: 'Filling',
        status: 'Completed'
    }
];
const mockTreatmentPlans = [
    {
        id: 'tp1',
        patientId: 'pat1',
        doctorId: 'doc1',
        title: 'Comprehensive Oral Care Plan',
        procedures: [
            {
                id: 'proc1',
                name: 'Full Mouth X-Ray',
                cost: 150
            },
            {
                id: 'proc2',
                name: 'Deep Cleaning (Scaling & Root Planing)',
                cost: 400
            },
            {
                id: 'proc3',
                name: 'Fluoride Treatment',
                cost: 50
            }
        ],
        startDate: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
        status: 'Active',
        totalCost: 600
    },
    {
        id: 'tp2',
        patientId: 'pat2',
        doctorId: 'doc1',
        title: 'Implant Placement - Phase 1',
        procedures: [
            {
                id: 'proc4',
                name: 'Dental Implant Surgery (Single Tooth)',
                cost: 2000
            }
        ],
        startDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        totalCost: 2000
    }
];
const mockProgressNotes = [
    {
        id: 'pn1',
        patientId: 'pat1',
        treatmentPlanId: 'tp1',
        doctorId: 'doc1',
        date: new Date(Date.now() - 86400000 * 9).toISOString().split('T')[0],
        time: '10:30 AM',
        note: 'Initial consultation. Discussed treatment plan. Patient agreeable. Full mouth X-rays taken.',
        images: [
            {
                id: 'img1',
                url: 'https://placehold.co/300x200.png',
                caption: 'X-Ray Left Side'
            }
        ],
        progressStage: 'Initial Assessment'
    },
    {
        id: 'pn2',
        patientId: 'pat1',
        treatmentPlanId: 'tp1',
        doctorId: 'doc1',
        date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        time: '11:00 AM',
        note: 'Deep cleaning performed on upper quadrant. Patient tolerated well. Advised on post-op care.',
        progressStage: 'Procedure Day 1'
    }
];
const mockInvoices = [
    {
        id: 'inv1',
        patientId: 'pat1',
        date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
        items: [
            {
                description: 'Full Mouth X-Ray',
                quantity: 1,
                unitPrice: 150,
                totalPrice: 150
            },
            {
                description: 'Deep Cleaning (Scaling & Root Planing)',
                quantity: 1,
                unitPrice: 400,
                totalPrice: 400
            }
        ],
        totalAmount: 550,
        amountPaid: 200,
        status: 'Partial'
    },
    {
        id: 'inv2',
        patientId: 'pat2',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        items: [
            {
                description: 'Dental Implant Surgery (Single Tooth) - Deposit',
                quantity: 1,
                unitPrice: 1000,
                totalPrice: 1000
            }
        ],
        totalAmount: 1000,
        amountPaid: 0,
        status: 'Pending'
    }
];
}}),
"[project]/src/lib/mockServerDb.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/lib/mockServerDb.ts
__turbopack_context__.s({
    "authorize": (()=>authorize),
    "db": (()=>db),
    "generateId": (()=>generateId)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mockData.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
function generateId(prefix = 'id_') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
// Initialize users array
let users = [];
// Populate users from initialStaff
__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockStaff"].forEach((staffMember)=>{
    let userAuthRole = 'staff'; // default
    if (staffMember.role === 'Dentist') userAuthRole = 'doctor';
    else if (staffMember.role === 'Hygienist') userAuthRole = 'hygienist';
    else if (staffMember.role === 'Assistant') userAuthRole = 'assistant';
    else if (staffMember.role === 'Admin') userAuthRole = 'admin';
    users.push({
        id: staffMember.id,
        name: staffMember.name,
        email: staffMember.email,
        role: userAuthRole,
        passwordHash: `$2a$10$mockPasswordFor${staffMember.id}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
});
// Populate users from initialPatients
__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockPatients"].forEach((patient)=>{
    users.push({
        id: patient.id,
        name: patient.name,
        email: patient.email,
        role: 'patient',
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        // other patient fields from Patient type can be added here if they exist in UserAuth
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
});
let appointments = JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockAppointments"]));
let treatmentPlans = JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockTreatmentPlans"]));
let progressNotes = JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockProgressNotes"]));
let invoices = JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockInvoices"]));
let staff = JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockStaff"]));
let paymentTransactions = [];
let clinicWaitTime = {
    text: "<10 mins",
    updatedAt: new Date().toISOString()
};
const db = {
    users,
    appointments,
    treatmentPlans,
    progressNotes,
    invoices,
    clinicWaitTime,
    staff,
    paymentTransactions
};
async function authorize(req, requiredRole) {
    const mockSessionToken = req.cookies.get('sessionToken')?.value;
    if (!mockSessionToken) {
        return {
            authorized: false,
            user: null,
            error: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Unauthorized: No session token'
            }, {
                status: 401
            })
        };
    }
    const [userIdFromToken, userRoleFromToken] = mockSessionToken.split(':');
    const user = db.users.find((u)=>u.id === userIdFromToken);
    if (!user) {
        return {
            authorized: false,
            user: null,
            error: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Unauthorized: Invalid session'
            }, {
                status: 401
            })
        };
    }
    const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : requiredRole ? [
        requiredRole
    ] : [];
    if (rolesToCheck.length > 0 && !rolesToCheck.includes(user.role)) {
        return {
            authorized: false,
            user: null,
            error: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Forbidden: Insufficient permissions'
            }, {
                status: 403
            })
        };
    }
    return {
        authorized: true,
        user: user,
        error: null
    };
}
}}),
"[project]/src/app/api/invoices/[invoiceId]/record-payment/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/app/api/invoices/[invoiceId]/record-payment/route.ts
__turbopack_context__.s({
    "POST": (()=>POST)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/lib/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockServerDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mockServerDb.ts [app-route] (ecmascript)");
;
;
;
const recordPaymentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    amountPaidNow: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().positive("Payment amount must be positive"),
    paymentMethod: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().min(1, "Payment method is required").optional().default("Card"),
    paymentDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().regex(/^\d{4}-\d{2}-\d{2}$/, "Payment date must be YYYY-MM-DD").optional().default(new Date().toISOString().split('T')[0]),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().optional().nullable()
});
async function POST(request, { params }) {
    // const authResult = await authorize(request, 'staff');
    // if (!authResult.authorized || !authResult.user) { return authResult.error; }
    const { invoiceId } = params;
    const invoice = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockServerDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].invoices.find((inv)=>inv.id === invoiceId);
    if (!invoice) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Invoice not found"
        }, {
            status: 404
        });
    }
    if (invoice.status === 'Paid') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Invoice is already fully paid"
        }, {
            status: 400
        });
    }
    try {
        const body = await request.json();
        const validation = recordPaymentSchema.safeParse(body);
        if (!validation.success) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors
            }, {
                status: 400
            });
        }
        const { amountPaidNow, paymentMethod, paymentDate, notes } = validation.data;
        // Create new payment transaction record
        const newPaymentTransaction = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockServerDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateId"])('pt_'),
            invoiceId: invoice.id,
            amountPaid: amountPaidNow,
            paymentDate: paymentDate,
            paymentMethod: paymentMethod,
            notes: notes ?? undefined,
            recordedAt: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockServerDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].paymentTransactions.push(newPaymentTransaction);
        // Update invoice details
        invoice.amountPaid += amountPaidNow;
        if (invoice.amountPaid >= invoice.totalAmount) {
            invoice.status = 'Paid';
            invoice.amountPaid = invoice.totalAmount; // Ensure not overpaid in mock
        } else if (invoice.amountPaid > 0) {
            invoice.status = 'Partial';
        }
        // Overdue logic would require checking dueDate against current date, typically done on GET or a cron job
        console.log(`Payment of ${amountPaidNow} recorded for invoice ${invoiceId}. New amount paid: ${invoice.amountPaid}, Status: ${invoice.status}. Notes: ${notes}`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(invoice, {
            status: 200
        }); // Return updated invoice
    } catch (error) {
        console.error(`Error recording payment for invoice ${invoiceId}:`, error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Error recording payment'
        }, {
            status: 500
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__2f10c24c._.js.map
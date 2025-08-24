module.exports = {

"[project]/.next-internal/server/app/api/invoices/[invoiceId]/transactions/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

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
    return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}
let users = [];
__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockStaff"].forEach((staffMember)=>{
    let userAuthRole = 'staff';
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
__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockPatients"].forEach((patient)=>{
    users.push({
        id: patient.id,
        name: patient.name,
        email: patient.email,
        role: 'patient',
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
});
let appointments = JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockAppointments"]));
let treatmentPlans = JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockTreatmentPlans"]));
let progressNotes = JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockProgressNotes"]));
let invoices = JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockInvoices"]));
// Removed: let staff: StaffMember[] = JSON.parse(JSON.stringify(initialStaff));
let paymentTransactions = [];
let clinicWaitTime = {
    text: "<10 mins",
    updatedAt: new Date().toISOString()
};
// Mock conversations and messages
let conversations = [
    {
        id: 'convo1',
        patientId: 'pat1',
        staffId: 'staff1',
        patientName: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockPatients"].find((p)=>p.id === 'pat1')?.name,
        patientAvatarUrl: `https://placehold.co/40x40.png?text=${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockPatients"].find((p)=>p.id === 'pat1')?.name?.charAt(0)}`,
        lastMessageText: "Hi, can I reschedule my appointment?",
        lastMessageTimestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        unreadCountForStaff: 1
    },
    {
        id: 'convo2',
        patientId: 'pat2',
        staffId: 'staff1',
        patientName: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockPatients"].find((p)=>p.id === 'pat2')?.name,
        patientAvatarUrl: `https://placehold.co/40x40.png?text=${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockPatients"].find((p)=>p.id === 'pat2')?.name?.charAt(0)}`,
        lastMessageText: "Thank you for the reminder!",
        lastMessageTimestamp: new Date(Date.now() - 86400000).toISOString(),
        unreadCountForStaff: 0
    },
    {
        id: 'convo3',
        patientId: 'pat3',
        staffId: 'staff1',
        patientName: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockPatients"].find((p)=>p.id === 'pat3')?.name,
        patientAvatarUrl: `https://placehold.co/40x40.png?text=${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockPatients"].find((p)=>p.id === 'pat3')?.name?.charAt(0)}`,
        lastMessageText: "Is parking available at the clinic?",
        lastMessageTimestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        unreadCountForStaff: 1
    }
];
let messages = [
    {
        id: generateId('msg_'),
        conversationId: 'convo1',
        senderId: 'pat1',
        senderRole: 'patient',
        text: "Hi, can I reschedule my appointment scheduled for tomorrow?",
        timestamp: new Date(Date.now() - 3600000 * 2 - 60000).toISOString()
    },
    {
        id: generateId('msg_'),
        conversationId: 'convo1',
        senderId: 'staff1',
        senderRole: 'staff',
        text: "Hello Alice, certainly! Which day and time would work best for you?",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
        id: generateId('msg_'),
        conversationId: 'convo2',
        senderId: 'staff1',
        senderRole: 'staff',
        text: "Hi Bob, just a friendly reminder about your appointment tomorrow at 2:30 PM.",
        timestamp: new Date(Date.now() - 86400000 - 3600000).toISOString()
    },
    {
        id: generateId('msg_'),
        conversationId: 'convo2',
        senderId: 'pat2',
        senderRole: 'patient',
        text: "Thank you for the reminder!",
        timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: generateId('msg_'),
        conversationId: 'convo3',
        senderId: 'pat3',
        senderRole: 'patient',
        text: "Is parking available at the clinic?",
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
    }
];
const db = {
    users,
    appointments,
    treatmentPlans,
    progressNotes,
    invoices,
    clinicWaitTime,
    // staff, // Removed staff from here
    paymentTransactions,
    conversations,
    messages
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
"[project]/src/app/api/invoices/[invoiceId]/transactions/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/app/api/invoices/[invoiceId]/transactions/route.ts
__turbopack_context__.s({
    "GET": (()=>GET)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockServerDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mockServerDb.ts [app-route] (ecmascript)");
;
;
async function GET(request, { params }) {
    // const authResult = await authorize(request, 'staff'); 
    // if (!authResult.authorized || !authResult.user) { return authResult.error; }
    const { invoiceId } = params;
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockServerDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].invoices.some((inv)=>inv.id === invoiceId)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Invoice not found"
        }, {
            status: 404
        });
    }
    const transactions = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockServerDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].paymentTransactions.filter((pt)=>pt.invoiceId === invoiceId);
    // Sort by recordedAt or paymentDate for consistency
    transactions.sort((a, b)=>new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(transactions, {
        status: 200
    });
}
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__30720cfa._.js.map
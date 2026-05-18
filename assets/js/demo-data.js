const today = new Date();
const offset = (days) => {
    const next = new Date(today);
    next.setDate(next.getDate() + days);
    return next.toISOString().slice(0, 10);
};

export const fallbackVehicles = [
    { id: 101, brand: "Toyota", model: "Land Cruiser", year: 2023, type: "SUV", dailyRate: 138, vehicleNumber: "VEL-2201", available: true },
    { id: 102, brand: "BMW", model: "5 Series", year: 2022, type: "Sedan", dailyRate: 164, vehicleNumber: "VEL-3118", available: true },
    { id: 103, brand: "Ford", model: "Ranger Wildtrak", year: 2024, type: "Pickup", dailyRate: 149, vehicleNumber: "VEL-4720", available: true },
    { id: 104, brand: "Mercedes-Benz", model: "Vito Tourer", year: 2021, type: "Van", dailyRate: 172, vehicleNumber: "VEL-6409", available: false }
];

export const fallbackDrivers = [
    { id: 21, username: "Aarav Perera", email: "aarav.driver@velox.demo", phoneNumber: "0771234567", licenseNumber: "B-224199", licenseType: "HEAVY" },
    { id: 22, username: "Mila Fernando", email: "mila.driver@velox.demo", phoneNumber: "0779876543", licenseNumber: "C-118420", licenseType: "PREMIUM" }
];

export const fallbackCustomers = [
    { id: 11, username: "Nadia Silva", name: "Nadia Silva", email: "nadia.customer@velox.demo", phoneNumber: "0711122233", nationalId: "199456789V" },
    { id: 12, username: "Theo Jay", name: "Theo Jay", email: "theo.customer@velox.demo", phoneNumber: "0719988776", nationalId: "200145678V" }
];

export const fallbackAdmins = [
    { id: 1, username: "Velox Ops", email: "ops@velox.demo", phoneNumber: "0700000001", accessLevel: "SUPER_ADMIN" }
];

export const fallbackRentals = [
    {
        id: 501,
        customer: fallbackCustomers[0],
        vehicle: fallbackVehicles[0],
        driver: fallbackDrivers[0],
        startDate: offset(-2),
        endDate: offset(2),
        totalCost: 552,
        status: "ACTIVE"
    },
    {
        id: 502,
        customer: fallbackCustomers[0],
        vehicle: fallbackVehicles[1],
        driver: null,
        startDate: offset(-11),
        endDate: offset(-6),
        totalCost: 820,
        status: "COMPLETED"
    },
    {
        id: 503,
        customer: fallbackCustomers[1],
        vehicle: fallbackVehicles[2],
        driver: fallbackDrivers[1],
        startDate: offset(3),
        endDate: offset(7),
        totalCost: 596,
        status: "ACTIVE"
    }
];

export const fallbackReviews = [
    {
        id: 801,
        rental: fallbackRentals[1],
        rating: 5,
        comment: "Smooth pickup, spotless cabin, and a really clear billing process.",
        reviewDate: offset(-5)
    }
];

export const fallbackReceipts = [
    {
        id: 901,
        rental: fallbackRentals[1],
        receiptNumber: "RCPT-2026-00901",
        baseCost: 820,
        lateFee: 0,
        finalTotal: 820,
        voided: false,
        isVoided: false
    }
];

export const fallbackPayments = [
    {
        id: 701,
        rental: fallbackRentals[1],
        amountPaid: 820,
        paymentDate: `${offset(-6)}T09:12:00`,
        transactionId: "TRX-220891",
        paymentMethod: "CARD"
    }
];

export function cloneFallback(value) {
    return JSON.parse(JSON.stringify(value));
}

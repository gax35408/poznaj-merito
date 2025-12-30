type tableObj = {
    name: string,
    score: string,
    date: Date | string
}

export const defaultData: tableObj[] = [
    {"name": "AA1", "score": "10123", "date": new Date()},
    {"name": "BB1", "score": "10234", "date": new Date()},
    {"name": "CC1", "score": "14201", "date": new Date()},
    {"name": "AA2", "score": "12232132134", "date": new Date("2025-10-25T00:02:00.000Z")},
    {"name": "BB2", "score": "12234", "date": new Date("2025-10-25T00:01:00.000Z")},
    {"name": "CC2", "score": "15203", "date": new Date()},
    {"name": "AA3", "score": "1123", "date": new Date()},
    {"name": "BB3", "score": "9234", "date": new Date()},
    {"name": "CC3", "score": "3201", "date": new Date()},
    {"name": "AA4", "score": "123", "date": new Date()},
    {"name": "BB4", "score": "-1", "date": new Date("2025-10-25")},
    {"name": "AA1", "score": "10123", "date": new Date()},
    {"name": "BB1", "score": "10234", "date": new Date()},
    {"name": "CC1", "score": "14201", "date": new Date()},
    {"name": "AA2", "score": "12234", "date": new Date("2025-10-25T00:02:00.000Z")},
    {"name": "BB2", "score": "12234", "date": new Date("2025-10-25T00:01:00.000Z")},
    {"name": "CC2", "score": "15201", "date": new Date()},
    {"name": "AA3", "score": "1123", "date": new Date()},
    {"name": "BB3", "score": "9234", "date": new Date()},
    {"name": "CC3", "score": "3201", "date": new Date()},
    {"name": "AA4", "score": "123", "date": new Date()},
    {"name": "BB4", "score": "-1", "date": new Date("2025-10-24")},
    {"name": "AA3", "score": "1123", "date": new Date()},
    {"name": "BB3", "score": "9234", "date": new Date()},
    {"name": "CC3", "score": "3201", "date": new Date()},
    {"name": "AA4", "score": "123", "date": new Date()},
    {"name": "BB4", "score": "-1", "date": new Date("2025-10-24")},
    {"name": "CC4", "score": "123", "date": new Date("2025-10-25")}
]
export function readStorage(key, fallback = null) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
        return fallback;
    }
}

export function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function upsertStoredRecord(key, record) {
    const list = readStorage(key, []);
    const next = [...list];
    const index = next.findIndex((item) => Number(item.id) === Number(record.id));

    if (index >= 0) {
        next[index] = record;
    } else {
        next.unshift(record);
    }

    writeStorage(key, next);
    return next;
}

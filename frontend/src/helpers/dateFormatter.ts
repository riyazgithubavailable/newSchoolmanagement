export function formatDateOnly(dateString: string | null | undefined) {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";

    // Subtract 5:30 for IST adjustment
    const adjustedDate = new Date(date.getTime() - (5.5 * 60 * 60 * 1000));

    return adjustedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }); // Output: dd/MM/yyyy
}

export function formatDateTime(dateString: string | null | undefined) {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";

    // Subtract 5:30 for IST adjustment
    const adjustedDate = new Date(date.getTime() - (5.5 * 60 * 60 * 1000));

    // Round based on seconds
    const seconds = adjustedDate.getSeconds();
    if (seconds >= 30) {
        adjustedDate.setMinutes(adjustedDate.getMinutes() + 1);
    }
    adjustedDate.setSeconds(0);
    adjustedDate.setMilliseconds(0);

    const datePart = adjustedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }); // dd/MM/yyyy

    const timePart = adjustedDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).toUpperCase(); // hh:mm AM/PM

    return `${datePart}, 
    ${timePart}`; // Output: dd/MM/yyyy, hh:mm AM/PM
}

export function formatTimeOnly(dateString: string | null | undefined) {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";

    const adjustedDate = new Date(date.getTime() - (5.5 * 60 * 60 * 1000));

    const seconds = adjustedDate.getSeconds();
    if (seconds >= 30) {
        adjustedDate.setMinutes(adjustedDate.getMinutes() + 1);
    }

    adjustedDate.setSeconds(0);
    adjustedDate.setMilliseconds(0);

    return adjustedDate
        .toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
        .toUpperCase();
}
export function formatTimeInIST(dateString: string | null | undefined) {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "-";

    return date.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).toUpperCase();
}
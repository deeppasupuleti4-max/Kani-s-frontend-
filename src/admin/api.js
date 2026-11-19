const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// The backend sets a readable "adminCsrfToken" cookie; every write must echo it in X-CSRF-Token.
const csrfToken = () => {
    const row = document.cookie.split("; ").find((c) => c.startsWith("adminCsrfToken="));
    return row ? decodeURIComponent(row.split("=")[1]) : "";
};

export async function api(path, { method = "GET", body } = {}) {
    const isForm = body instanceof FormData;

    const res = await fetch(BASE + path, {
        method,
        credentials: "include",
        headers: {
            // For FormData the browser sets the multipart boundary itself.
            ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
            "X-CSRF-Token": csrfToken(),
        },
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const error = new Error(data.message || "Request failed");
        error.status = res.status;
        throw error;
    }

    return data;
}
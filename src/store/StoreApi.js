// storeApi.js

// Base URL of your Express backend.
// Set VITE_API_URL in .env (e.g. http://localhost:5000/api/v1), or leave it
// unset to use a relative /api/v1 (works with a Vite proxy).
const BASE = (import.meta.env?.VITE_API_URL || "/api/v1").replace(/\/$/, "");

// Your backend sets this (non-httpOnly) cookie at customer login and expects its
// value back in the X-CSRF-Token header on every POST / PATCH / PUT / DELETE.
const CSRF_COOKIE = "customerCsrfToken";
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

// FIX for production: if the frontend and API are on different domains, the
// browser cannot read the API's cookie with document.cookie and every POST
// fails with 403. As a fallback we remember the token in memory when the
// backend returns it in a JSON response (e.g. { csrfToken: "..." } at login).
// If your backend does not return it, serve the API from the same domain
// as the site (reverse proxy /api) and this fallback is never needed.
let memoryCsrf = "";

function readCookie(name) {
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

/**
 * Fetch helper used across the storefront.
 *   storeApi("/products/store?limit=24")
 *   storeApi("/cart/items", { method: "POST", body: { productId, variantId, quantity: 1 } })
 *
 * Returns parsed JSON. On failure, throws an Error with .status and .message,
 * which the gate, ProductPage and Checkout use (err.status === 401 means signed out).
 */
export async function storeApi(path, { method = "GET", body, headers = {} } = {}) {
    const upper = method.toUpperCase();
    const csrf = SAFE_METHODS.includes(upper)
        ? ""
        : readCookie(CSRF_COOKIE) || memoryCsrf;

    let res;
    try {
        res = await fetch(`${BASE}${path}`, {
            method: upper,
            credentials: "include", // send/receive auth cookies
            headers: {
                Accept: "application/json",
                ...(body ? { "Content-Type": "application/json" } : {}),
                ...(csrf ? { "X-CSRF-Token": csrf } : {}),
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch {
        // Network failure: no status, so callers never mistake it for a 401
        const err = new Error("Network error. Check your connection and try again.");
        err.status = 0;
        throw err;
    }

    let data = null;
    try {
        data = await res.json();
    } catch {
        // empty or non-JSON response
    }

    if (data && typeof data.csrfToken === "string" && data.csrfToken) {
        memoryCsrf = data.csrfToken;
    }

    if (!res.ok) {
        const err = new Error(data?.message || data?.error || `Request failed (${res.status})`);
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data;
}

/** Format a number as Indian rupees: 1499 -> "₹1,499" */
export function rupees(amount) {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(n);
}

/** URL of a product's main photo, or "" if it has none. */
export function primaryImage(product) {
    const images = product?.images || [];
    if (!images.length) return "";
    const sorted = [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return (sorted.find((i) => i.isPrimary) || sorted[0]).url || "";
}
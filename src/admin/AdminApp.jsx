
import { useEffect, useState } from "react";
import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Layers,
    Shirt,
    ClipboardList,
    Wallet,
    Boxes,
    LogOut
} from "lucide-react";

import { api } from "./api.js";
import { rupees, LOW_STOCK } from "./common.jsx";
import AdminLogin from "./AdminLogin.jsx";
import Collections from "./pages/Collections.jsx";
import Products from "./pages/Products.jsx";
import { Orders, Payments } from "./pages/Orders.jsx";
import Inventory from "./pages/Inventory.jsx";
import "./admin.css";

/* ---------- Dashboard ---------- */
function Dashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const [orders, products] = await Promise.all([
                    api("/orders/admin?limit=100"),
                    api("/products?limit=50&status=active").catch(() => null),
                ]);

                const low = products
                    ? products.products
                        .flatMap((p) => p.variants)
                        .filter((v) => v.stock <= LOW_STOCK).length
                    : null;

                setData({
                    orders: orders.orders,
                    total: orders.pagination.total,
                    low
                });
            } catch (err) {
                setError(err.message);
            }
        })();
    }, []);

    if (error) return <p className="ka-error">{error}</p>;
    if (!data) return <p className="ka-muted">Loading dashboard…</p>;

    const live = data.orders.filter((o) => o.status !== "cancelled");
    const revenue = live.reduce((sum, o) => sum + o.totalAmount, 0);
    const toConfirm = data.orders.filter((o) => o.status === "pending").length;
    const codDue = data.orders.filter(
        (o) => o.paymentStatus === "pending" && o.status !== "cancelled"
    ).length;

    const cards = [
        ["Total orders", data.total],
        ["Orders to confirm", toConfirm],
        ["Revenue (latest 100 orders)", rupees(revenue)],
        ["Payments not collected", codDue],
        ["Low-stock items", data.low ?? "–"],
    ];

    return (
        <>
            <h2>Dashboard</h2>

            <div className="ka-cards">
                {cards.map(([label, value]) => (
                    <div className="ka-card" key={label}>
                        <strong>{value}</strong>
                        <span>{label}</span>
                    </div>
                ))}
            </div>

            <h3>Recent orders</h3>

            <div className="ka-table-wrap">
                <table className="ka-table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Payment</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.orders.slice(0, 8).map((o) => (
                            <tr key={o._id}>
                                <td>{o.orderNumber}</td>
                                <td>{o.customer?.name || "–"}</td>
                                <td>{rupees(o.totalAmount)}</td>
                                <td>
                                    <span className={`ka-pill ka-${o.status}`}>
                                        {o.status}
                                    </span>
                                </td>
                                <td>{o.paymentStatus}</td>
                            </tr>
                        ))}

                        {data.orders.length === 0 && (
                            <tr>
                                <td colSpan="5" className="ka-muted">
                                    No orders yet. New orders will appear here.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

/* ---------- Shell ---------- */
function Shell({ admin, onLogout }) {
    const navigate = useNavigate();

    const logout = async () => {
        try {
            await api("/auth/admin/logout", { method: "POST" });
        } catch {
            // Cookie may already be gone
        }

        onLogout();
        navigate("/admin/login");
    };

    const link = ({ isActive }) => (isActive ? "active" : "");

    return (
        <div className="ka-shell">
            <aside className="ka-side">
                <div className="ka-logo">
                    KANI'S <b>STUDIO</b>
                </div>

                <nav>
                    <NavLink end to="/admin" className={link}>
                        <LayoutDashboard size={18} /> Dashboard
                    </NavLink>

                    <NavLink to="/admin/collections" className={link}>
                        <Layers size={18} /> Collections
                    </NavLink>

                    <NavLink to="/admin/products" className={link}>
                        <Shirt size={18} /> Products
                    </NavLink>

                    <NavLink to="/admin/orders" className={link}>
                        <ClipboardList size={18} /> Orders
                    </NavLink>

                    <NavLink to="/admin/payments" className={link}>
                        <Wallet size={18} /> Payments
                    </NavLink>

                    <NavLink to="/admin/inventory" className={link}>
                        <Boxes size={18} /> Inventory
                    </NavLink>
                </nav>

                <div className="ka-side-foot">
                    <span>{admin.name}</span>

                    <button className="ka-link" onClick={logout}>
                        <LogOut size={16} /> Sign out
                    </button>
                </div>
            </aside>

            <main className="ka-main">
                <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="collections" element={<Collections />} />
                    <Route path="products" element={<Products />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="payments" element={<Payments />} />
                    <Route path="inventory" element={<Inventory />} />

                    <Route
                        path="*"
                        element={<Navigate to="/admin" replace />}
                    />
                </Routes>
            </main>
        </div>
    );
}

/* ---------- Entry: checks the session once ---------- */
export default function AdminApp() {
    const [admin, setAdmin] = useState(undefined);
    // undefined = checking, null = signed out

    useEffect(() => {
        api("/auth/admin/me")
            .then((r) => setAdmin(r.admin))
            .catch(() => setAdmin(null));
    }, []);

    if (admin === undefined) {
        return (
            <p className="ka-muted ka-center">
                Checking your session…
            </p>
        );
    }

    return (
        <Routes>
            <Route
                path="login"
                element={
                    admin
                        ? <Navigate to="/admin" replace />
                        : <AdminLogin onLogin={setAdmin} />
                }
            />

            <Route
                path="*"
                element={
                    admin
                        ? <Shell admin={admin} onLogout={() => setAdmin(null)} />
                        : <Navigate to="/admin/login" replace />
                }
            />
        </Routes>
    );
}

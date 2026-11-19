export const rupees = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
export const LOW_STOCK = 5;
export const Pill = ({ s }) => <span className={`ka-pill ka-${s}`}>{s}</span>;
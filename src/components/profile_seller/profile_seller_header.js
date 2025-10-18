import "./profile_seller_header.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function ProfileSellerHeader({ seller, openOrders, orders }) {
  const openOrdersCount = openOrders?.length || 0;
  const totalOrdersCount = orders?.length || 0;

    const ordersByMonthWithStatus = (() => {
    const months = {};

    orders?.forEach((order) => {
        const date = new Date(order.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`; // "2025-9"
        const monthLabel = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
        });

        const lastStatus = order.status?.length
        ? order.status[order.status.length - 1].update
        : "pending";

        if (!months[monthKey]) {
        months[monthKey] = {
            label: monthLabel,
            total: 0,
            pending: 0,
            cancelled: 0,
            delivered: 0,
            returned_to_sender: 0,
        };
        }

        months[monthKey].total++;
        if (months[monthKey][lastStatus] !== undefined) {
        months[monthKey][lastStatus]++;
        }
    });

    const keys = Object.keys(months)
        .map((k) => k.split("-").map(Number))
        .sort((a, b) => new Date(a[0], a[1]) - new Date(b[0], b[1]));

    if (keys.length === 0) return [];

    // Ersten Monat finden
    const first = keys[0];

    // Einen Monat davor hinzufügen (aber keinen danach!)
    const extendedKeys = [[first[0], first[1] - 1], ...keys];

    const finalMonths = extendedKeys.map(([year, month]) => {
        const d = new Date(year, month, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const label = d.toLocaleString("default", { month: "short", year: "numeric" });

        if (months[key]) return { month: label, ...months[key] };
        else
        return {
            month: label,
            total: 0,
            pending: 0,
            cancelled: 0,
            delivered: 0,
            returned_to_sender: 0,
        };
    });

    return finalMonths;
    })();


  return (
    <div className="profile-header">
      {/* Linke Profilseite */}
      <div className="profile-left">
        <img src={seller.image} alt={seller.shopName} className="profile-image" />
        <h2 className="shop-name">{seller.shopName}</h2>
        <h3>
          {seller.firstName} {seller.lastName}
        </h3>
        <p>{seller.address}</p>
        <p>{seller.email}</p>
        <p>{seller.phone}</p>
      </div>

      {/* Rechte Seite (eigene Cards, nicht verschachtelt) */}
      <div className="right-content">
        {/* === Orders Card === */}
        <div className="order-stats-card">
          <div className="stat-item">
            <h4>Open Orders</h4>
            <p className="stat-number">{openOrdersCount}</p>
          </div>
          <div className="stat-item">
            <h4>Total Orders</h4>
            <p className="stat-number">{totalOrdersCount}</p>
          </div>
        </div>

        {/* === Diagram Card === */}
        <div className="order-chart-card">
          <h4>Orders Over Time</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={ordersByMonthWithStatus}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#555" />
              <YAxis stroke="#555" allowDecimals={false} domain={[0, "dataMax + 2"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              />
              {/* Gesamt (blau) */}
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={false} />
              {/* Pending (lila) */}
              <Line type="monotone" dataKey="pending" stroke="#8b5cf6" strokeWidth={3} dot={false} />
              {/* Cancelled (rosa) */}
              <Line type="monotone" dataKey="cancelled" stroke="#ff66b2" strokeWidth={3} dot={false} />

              {/* Delivered (grün) */}
              <Line type="monotone" dataKey="delivered" stroke="#4caf50" strokeWidth={3} dot={false} />
              {/* Returned to sender (rot) */}
                <Line type="monotone" dataKey="returned_to_sender" stroke="#b71c1c" strokeWidth={3} dot={false} />

            </LineChart>
          </ResponsiveContainer>
            <div className="order-legend">
            <div><span className="dot total"></span> Total</div>
            <div><span className="dot pending"></span> Pending</div>
            <div><span className="dot cancelled"></span> Cancelled</div>
            <div><span className="dot delivered"></span> Delivered</div>
            <div><span className="dot returned"></span> Returned</div>
            </div>
           
        </div>
      </div>
    </div>
  );
}

export default ProfileSellerHeader;

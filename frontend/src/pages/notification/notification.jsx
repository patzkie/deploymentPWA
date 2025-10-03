import { useEffect, useState } from "react";
import axios from "axios";
import "./notification.css";

function Notification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token"); // whatever you store the JWT as
        const res = await axios.get("https://deploymentpwa.onrender.com/api/notification", {
          headers: { token } // matches your authMiddleware: `const { token } = req.headers;`
        });
        setNotifications(res.data.notifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="notifications-container">
      <h2>🔔 Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`notification-item ${n.read ? "read" : "unread"}`}
            >
              <p>{n.message}</p>
              <small>{n.read ? "Read" : "New"}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notification;

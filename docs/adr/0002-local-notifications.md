# Local on-device notifications, no cloud push

Installment due-date notifications are scheduled locally on the device (via Expo Notifications) instead of push triggered by a cloud backend. This avoids keeping a scheduled function running 24/7 just for a single user, at the cost of depending on the app being opened every so often to keep the schedules correctly up to date (rescheduling when dates change).

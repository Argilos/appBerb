Barbershop App 📅💈
A modern barbershop management and booking system built with React Native and Firebase. This app allows customers to easily book appointments, while providing barbers and administrators with a powerful admin panel to manage schedules, approve or cancel appointments, and block time slots.

✨ Features
For Customers:
📆 Book appointments by selecting preferred services, barbers, dates, and times.

✅ Receive booking confirmations and details.

🛡️ Secure authentication for user management (requires Firebase setup).

For Admins (Barbershop Staff):
🔑 Admin Panel:

View and manage all pending, approved, and blocked bookings.

Approve or reject customer booking requests.

Block or unblock time slots directly in the calendar.

View detailed information about bookings and customers.

📊 Calendar View:

Visual overview of scheduled appointments.

Color-coded status indicators (e.g., approved, blocked, pending).

📝 Cancel bookings with a reason for transparency.

🚀 Technologies Used
React Native for mobile development.

Firebase Firestore for backend data storage and real-time updates.

Firebase Authentication for secure user management.

React Navigation for app routing.

Custom Components and clean, modern UI design.

📂 File Structure (Key Components)
bash
Copy
Edit
/components
  - AdminPanel.js          # Admin interface for managing bookings.
  - BookingConfirmation.js # Confirmation screen for users after booking.
  - (Other components)
  
/utils
  - dateFormatter.js       # Utility for formatting dates.

firebase/
  - config.js              # Firebase configuration file.
📸 Screenshots
(Add screenshots or gifs here of the app in action if you have them!)

⚙️ Setup & Installation
Clone the repository:

bash
Copy
Edit
git clone https://github.com/Argilos/appBerb.git
cd barbershop-app
Install dependencies:

bash
Copy
Edit
npm install
Set up Firebase:

Create a Firebase project.

Configure Firestore and Authentication.

Replace the Firebase config in /firebase/config.js with your project details.

Run the app:

bash
Copy
Edit
npx react-native run-android   # For Android
npx react-native run-ios       # For iOS
🛡️ Security & Data
User data and bookings are stored securely in Firebase Firestore.

Authentication is handled via Firebase Authentication.

Admin access can be limited by user roles (not fully implemented yet, but recommended).

🌱 Future Improvements
🎨 Enhanced UI/UX with more themes.

🔐 User role management (e.g., Admins vs. Clients).

📲 Push notifications for booking updates.

📈 Analytics for appointment trends.

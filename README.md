🌱 IoT Smart Pot

The IoT Smart Pot is an IoT-powered flower pot that helps you monitor and automate plant care at home. It collects real-time environmental data, displays it in a collaborative web application, and even waters itself when your plant needs it.

🚀 Features

🌡️ Real-time Monitoring – Track temperature, soil humidity, light, and water level in each pot

💧 Automatic Watering – Built-in irrigation system activates when soil humidity drops too low

⚡ Live Data Updates – WebSocket-based communication keeps the web app always in sync

📊 Web Dashboard – Visualize plant health data and monitor multiple pots in one place

👨‍👩‍👧 Household Management – Owners can invite and manage other users in their household

📩 Notifications & Alerts – Get warnings in-app and via email when conditions are not optimal

🛠️ Tech Stack
Hardware

Hardwario Tower (C) – Embedded system for sensor data collection and watering control

Backend

Fastify (TypeScript) – Lightweight and fast Node.js web framework

MongoDB – NoSQL database for storing sensor data and household/user information

Frontend

React (TypeScript) – Web application for real-time plant monitoring and household management

Other

WebSockets – Real-time communication between IoT device, backend, and frontend

Git – Version control and collaboration

📐 System Architecture

Sensors & Hardware: Hardwario Tower collects environmental data (temperature, humidity, light, water level).

Backend (Fastify): Handles data ingestion, WebSocket connections, and business logic.

Database (MongoDB): Stores user accounts, households, and historical sensor data.

Frontend (React): Displays real-time data, household management UI, and notifications.

Automation: Automatic watering triggered by low soil humidity.

Notifications: Alerts sent via web app and email.

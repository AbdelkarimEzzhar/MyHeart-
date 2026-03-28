# 🏥 MyHeart - Healthcare Management System

A comprehensive microservices-based healthcare management platform built with React, Node.js, Java Spring Boot, and Python FastAPI. The system provides complete management of patients, doctors, appointments, medical records, billing, and lab reports with persistent data storage and real-time service discovery.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Services Overview](#services-overview)
- [Database Configuration](#database-configuration)
- [API Gateway](#api-gateway)
- [User Management](#user-management)
- [Usage Guide](#usage-guide)
- [Data Persistence](#data-persistence)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Functionality
- **👤 Patient Management** - Create, read, update, and delete patient records
- **👨‍⚕️ Doctor Management** - Manage doctor profiles with specialties and departments
- **📅 Appointment Scheduling** - Schedule and track appointments between patients and doctors
- **💳 Billing & Invoicing** - Generate and manage patient invoices with payment tracking
- **📋 Medical Records** - Maintain comprehensive medical history with diagnoses and treatments
- **🧪 Lab Reports** - Track and manage laboratory test results
- **🔐 Authentication & Authorization** - JWT-based authentication with role-based access control

### Smart Features
- **Auto-Fill Dropdowns** - When creating appointments, medical records, or billing:
  - Select patient from dropdown (no need to retype)
  - Select doctor from dropdown (no need to retype)
  - Patient and doctor information auto-populated
- **Real-time Service Discovery** - Consul-based dynamic service registration and discovery
- **Data Persistence** - All data persists across container restarts
- **Multi-Database Architecture** - Optimized databases for each service

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                    │
│                    Port 3001 (Nginx)                    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────┐
│              API Gateway (Node.js Express)                │
│          Port 8080 (Service Discovery + JWT)              │
└──────────────────────────┬────────────────────────────────┘
       │          │        │       │       │       │
    ┌──▼───┐  ┌───▼──┐  ┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
    │ 8081 │  │ 8082 │  │ 8083│ │ 8084│ │ 8085│ │ 8086│
    │      │  │      │  │     │ │     │ │     │ │     │
    └──┬───┘  └──┬───┘  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘
       │         │         │       │       │       │
    Patient   Appt.    Billing   Lab   Medical  Doctor
    Service   Service   Service  Service Records Service
    (Java)   (Java)    (Java)   (Python) (Java)  (Java)
       │         │        │        │       │       │
    ┌──▼──┐   ┌──▼──┐  ┌──▼──┐  ┌──▼──┐ ┌──▼──┐ ┌──▼───┐
    │PgSQL│   │Mongo│  │MySQL│  │Mongo│ │PgSQL│ │PgSQL │
    └─────┘   └─────┘  └─────┘  └─────┘ └─────┘ └──────┘

┌──────────────────────────────────────────────────────────┐
│                    Infrastructure                        │
├──────────────┬──────────────┬──────────────┐─────────────┤
│   Consul     │    Kafka     │  Kafka UI    │Context Svc  │
│ (Discovery)  │   (Messaging)│  (Monitoring)│ (Caching)   │
│  Port 8501   │   Port 9092  │  Port 8090   │ Port 8087   │
└──────────────┴──────────────┴──────────────┴─────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Axios** - HTTP client
- **Nginx** - Reverse proxy

### API Gateway
- **Node.js Express** - HTTP server
- **JWT** - Authentication
- **Opossum** - Circuit breaker pattern
- **Consul API** - Service discovery

### Microservices
- **Java Spring Boot** - Patient, Doctor, Appointment, Billing, Medical Records services
- **Python FastAPI** - Lab Report service
- **Node.js** - Context service (caching)

### Databases
- **PostgreSQL** - Patient, Doctor, Medical Records (relational data)
- **MongoDB** - Appointments, Lab Reports (document storage)
- **MySQL** - Billing (financial transactions)

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Consul** - Service discovery & registry
- **Apache Kafka** - Event messaging
- **Kafka UI** - Message monitoring

## 📦 Prerequisites

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **4GB RAM** (minimum)
- **20GB Disk Space** (with all volumes)
- **Linux/Mac/Windows** with Docker support

## 🚀 Installation & Setup

### 1. Clone & Navigate to Project

```bash
cd /home/user/myheart
```

### 2. Start All Services

```bash
docker-compose up -d
```

This will:
- ✅ Create all 19 containers
- ✅ Initialize all databases
- ✅ Start Kafka broker
- ✅ Register services with Consul
- ✅ Launch API Gateway
- ✅ Deploy Frontend

### 3. Wait for Services to be Ready

```bash
# Check service health (wait ~2 minutes)
curl http://localhost:8080/health
```

### 4. Access the Application

- **Frontend:** http://localhost:3001
- **API Gateway:** http://localhost:8080
- **Consul UI:** http://localhost:8501
- **Kafka UI:** http://localhost:8090

## 🔧 Services Overview

| Service                    | Port | Database                | Language | Purpose                       |
|----------------------------|------|-------------------------|----------|-------------------------------|
| **Patient Service**        | 8081 | PostgreSQL              | Java     | Patient data management       |
| **Appointment Service**    | 8082 | MongoDB                 | Java     | Appointment scheduling        |
| **Billing Service**        | 8083 | MySQL                   | Java     | Invoice & payment tracking    |
| **Lab Report Service**     | 8084 | MongoDB                 | Python   | Lab test results              |
| **Medical Record Service** | 8085 | PostgreSQL              | Java     | Medical history               |
| **Doctor Service**         | 8086 | PostgreSQL              | Java     | Doctor profiles & specialties |
| **Context Service**        | 8087 | Redis (cache)           | Node.js  | Request caching               |
| **API Gateway**            | 8080 | users.json (persistent) | Node.js  | Request routing & auth        |

## 🗄️ Database Configuration

### PostgreSQL Services
- **Host:** `[service-name]-db`
- **Database:** `[service]db`
- **User:** postgres
- **Password:** postgres
- **Port:** 5432

### MongoDB Services
- **Host:** `[service-name]-db`
- **Port:** 27017
- **Database:** `[service]db`

### MySQL (Billing)
- **Host:** `billing-db`
- **Database:** `billingdb`
- **User:** root
- **Password:** root
- **Port:** 3306

## 🔐 API Gateway

The API Gateway is the single entry point for all client requests.

### Routes
```
POST   /auth/login              - Authenticate user
GET    /api/patients            - List all patients
POST   /api/patients            - Create patient
GET    /api/doctors             - List all doctors
POST   /api/doctors             - Create doctor
GET    /api/appointments        - List appointments
POST   /api/appointments        - Create appointment
GET    /api/billing             - List invoices
POST   /api/billing             - Create invoice
GET    /api/medical-records     - List medical records
POST   /api/medical-records     - Create record
GET    /api/lab-reports         - List lab reports
POST   /api/lab-reports         - Create lab report
```

### Authentication

All endpoints (except `/auth/login`) require JWT token:

```bash
# 1. Login to get token
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"changeme"}'

# Response: {"token": "eyJhbGc..."}

# 2. Use token in requests
curl http://localhost:8080/api/doctors \
  -H "Authorization: Bearer eyJhbGc..."
```

## 👤 User Management

### Default Admin Account
- **Username:** `admin`
- **Password:** `changeme`
- **Role:** `admin`

### Create New User

Users are stored persistently in `/app/data/users.json` (Docker volume).

## 📱 Usage Guide

### 1. Login
- Go to http://localhost:3001
- Enter: `admin` / `changeme`

### 2. Create a Doctor
- Click **👨‍⚕️ Doctors** tab
- Fill in: First Name, Last Name, Specialty, Email, Phone, Department
- Click **Add Doctor**
- ✅ Doctor is now available in all other services

### 3. Create a Patient
- Click **👤 Patients** tab
- Fill in patient details
- Click **Add Patient**
- ✅ Patient is now available in all other services

### 4. Create an Appointment
- Click **📅 Appointments** tab
- **Select Doctor** from dropdown (auto-populated)
- **Select Patient** from dropdown (auto-populated)
- Choose date, time, reason, status
- Click **Add Appointment**

### 5. Create Medical Record
- Click **📋 Medical Records** tab
- **Select Patient** from dropdown
- **Select Doctor** from dropdown (optional)
- Add visit date, diagnosis, treatment, notes
- Click **Add Record**

### 6. Create Lab Report
- Click **🧪 Lab Reports** tab
- **Select Patient** from dropdown
- **Select Doctor** from dropdown (optional)
- Enter test type, results, status, notes
- Click **Add Lab Report**

### 7. Create Invoice
- Click **💳 Billing** tab
- **Select Patient** from dropdown
- Enter description and amount
- Click **Create Invoice**
- Manage payment status (Pending → Paid/Cancelled)

## 💾 Data Persistence

### How Persistence Works

All data is stored in **Docker named volumes**:

```
docker volume ls | grep myheart
```

**Volume Mapping:**
- `myheart_patient-db-data` ← Patient database
- `myheart_doctor-db-data` ← Doctor database
- `myheart_appointment-db-data` ← Appointments
- `myheart_billing-db-data` ← Billing
- `myheart_medical-record-db-data` ← Medical records
- `myheart_lab-db-data` ← Lab reports
- `myheart_api-gateway-data` ← User accounts

### Important: Stopping & Restarting

**✅ CORRECT - Keeps all data:**
```bash
docker-compose down
docker-compose up -d
```

**❌ WRONG - Deletes all data:**
```bash
docker-compose down -v    # DO NOT USE -v flag!
```

### Backup Data

```bash
# Backup volumes
docker run --rm -v myheart_doctor-db-data:/data \
  -v $(pwd)/backup:/backup \
  postgres:15 \
  pg_dump -U postgres -d doctordb > /backup/doctor-backup.sql
```

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs [service-name]

# Example: Check doctor-service
docker-compose logs doctor-service

# Full service status
docker-compose ps
```

### Can't Access Frontend

```bash
# Check if frontend is running
docker-compose ps | grep frontend

# Restart frontend
docker-compose restart frontend

# Check Nginx logs
docker-compose logs frontend
```

### Database Connection Issues

```bash
# Check if database is healthy
docker-compose ps | grep "db"

# Verify database is running
curl http://localhost:5432  # PostgreSQL

# Check Docker network
docker network inspect myheart_myheart-network
```

### API Gateway Not Routing Requests

```bash
# Check gateway health
curl http://localhost:8080/health

# Verify services discovered
curl http://localhost:8080/health | jq '.services'

# Check if specific service registered
curl http://localhost:8501/v1/health/service/doctor-service
```

### Data Not Persisting After Restart

```bash
# Verify volumes exist
docker volume ls | grep myheart

# Never use -v flag on down command
docker-compose down    # ✅ Correct
# Don't do: docker-compose down -v  ❌

# Inspect volume
docker volume inspect myheart_doctor-db-data
```

### Clear Cache & Restart Everything

```bash
# Stop all services (keeps data)
docker-compose down

# Remove images to force rebuild
docker-compose build --no-cache

# Clean and rebuild
docker-compose up -d --build

# Wait for services to be healthy (2 minutes)
sleep 120

# Verify
curl http://localhost:8080/health
```

### Port Already in Use

```bash
# Find what's using port
lsof -i :3001        # Frontend
lsof -i :8080        # API Gateway
lsof -i :8501        # Consul

# Stop the service using the port
kill -9 <PID>

# Or modify docker-compose.yml ports section
```

## 📊 Monitoring

### Consul UI (Service Discovery)
- **URL:** http://localhost:8501
- **View:** All registered services and health status
- **Access:** Services → doctor-service (check health checkpass)

### Kafka UI (Message Queue)
- **URL:** http://localhost:8090
- **View:** Topics, messages, consumer groups
- **Access:** Real-time monitoring of service events

### API Gateway Health
```bash
curl http://localhost:8080/health | jq '.'
```

Shows:
- ✅ Service status
- ✅ Registered services
- ✅ Circuit breaker states
- ✅ Service instances and ports

## 📝 API Examples

### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"changeme"}'
```

### List Doctors
```bash
TOKEN="eyJhbGc..."
curl http://localhost:8080/api/doctors \
  -H "Authorization: Bearer $TOKEN"
```

### Create Doctor
```bash
TOKEN="eyJhbGc..."
curl -X POST http://localhost:8080/api/doctors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "specialty": "Cardiology",
    "email": "john@hospital.com",
    "phone": "555-1234",
    "department": "Cardiology Department"
  }'
```

## 🎯 Project Structure

```
myheart/
├── docker-compose.yml          # Service orchestration
├── README.md                   # This file
│
├── frontend/                   # React UI
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── api/
│   │   │   └── axios.js       # API configuration
│   │   └── main.jsx
│   └── package.json
│
├── api-gateway/               # Node.js Express
│   ├── index.js              # Main server
│   ├── users.json            # Users storage (persistent)
│   └── package.json
│
├── patient-service/          # Java Spring Boot
├── doctor-service/           # Java Spring Boot
├── appointment-service/      # Java Spring Boot
├── billing-service/          # Java Spring Boot
├── medical-record-service/   # Java Spring Boot
├── lab-report-service/       # Python FastAPI
└── context-service/          # Node.js caching
```

## 🔄 Service Communication Flow

```
1. User Action (Frontend)
               ↓
2. API Request → API Gateway (Port 8080)
               ↓
3. Gateway authenticates JWT token
               ↓
4. Gateway queries Consul for service location
               ↓
5. Gateway routes request to microservice
               ↓
6. Service processes request & queries database
               ↓
7. Service publishes event to Kafka (if applicable)
               ↓
8. Response returns to Frontend
```

## 🚨 Common Issues & Solutions

| Issue                      | Cause                              | Solution                         |
|----------------------------|------------------------------------|----------------------------------|
| 503 Service Unavailable    | Service not registered with Consul | Wait 30 seconds, restart service |
| 401 Unauthorized           | Missing/invalid JWT token          | Login again, get new token       |
| Cannot connect to database | Database not started               | Check `docker-compose ps`        |
| Port already in use        | Another service on same port       | Kill process or change port      |
| Data disappeared           | Used `docker-compose down -v`      | Don't use `-v` flag on down      |
| Frontend showing old code  | Browser cache                      | Hard refresh: Ctrl+Shift+R       |

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review service logs: `docker-compose logs [service]`
3. Check Consul UI: http://localhost:8501
4. Verify gateway health: `curl http://localhost:8080/health`

## 🎉 You're All Set!

Your healthcare management system is now ready to use. Start creating doctors, patients, and managing their healthcare records!

**Quick Start:**
```bash
cd /home/user/myheart
docker-compose up -d
# Wait 2 minutes for services to start
# Open http://localhost:3001
# Login: admin / changeme
```

Happy healing! 🏥


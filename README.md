# SupplySense AI

SupplySense AI is a multi-agent grocery demand forecasting and inventory optimization system developed as part of my Summer Internship at the Center of Cognitive Computing and Computational Intelligence, PES University.

The project focuses on predicting household grocery consumption and helping suppliers make better inventory decisions using Machine Learning and Agentic AI. Instead of relying only on historical sales, the system analyzes household consumption patterns to estimate future demand and supports proactive inventory replenishment.

---

## Project Overview

Traditional grocery inventory systems often struggle with inaccurate demand estimation, leading to stock shortages, overstocking, and food wastage. SupplySense AI addresses this problem by combining Machine Learning models with a multi-agent architecture to forecast household demand and optimize supplier inventory at a hyperlocal level.

The application consists of two modules:

- **User Module** – Predicts household grocery consumption.
- **Admin Module** – Monitors demand, inventory, supplier allocation, and delivery planning.

---

## Features

### User Module

- Household registration
- Grocery consumption data collection
- Monthly rice consumption prediction
- Weekly milk consumption prediction
- Rule-based grocery purchase frequency estimation
- Rule-based vegetable purchase frequency estimation
- Supplier allocation
- Warehouse allocation
- Estimated delivery schedule

### Admin Module

- Zone-wise demand monitoring
- Locality-wise demand analysis
- Inventory status tracking
- Low-stock and critical inventory detection
- Supplier recommendations
- Warehouse allocation
- Inventory reports

---

## Project Workflow

```
User Input
        │
        ▼
Data Validation
        │
        ▼
Data Preprocessing
        │
        ▼
Feature Engineering
        │
        ▼
Machine Learning Models
        │
        ▼
Consumption Agent
        │
        ▼
Demand Forecasting Agent
        │
        ▼
Inventory Agent
        │
        ▼
Delivery Agent
        │
        ▼
Prediction & Dashboard
```

---

## Multi-Agent Architecture

### Consumption Agent

- Validates user input
- Preprocesses household data
- Predicts monthly rice consumption
- Predicts weekly milk consumption
- Estimates purchasing frequency

### Demand Forecasting Agent

- Aggregates household predictions
- Calculates locality-wise demand
- Generates zone-wise demand

### Inventory Agent

- Compares predicted demand with available inventory
- Identifies inventory shortages
- Categorizes stock as Healthy, Low Stock, or Critical
- Allocates suppliers and warehouses

### Delivery Agent

- Generates delivery schedules
- Estimates delivery time
- Updates delivery status

---

## Machine Learning Models

The project uses supervised learning models for consumption prediction.

| Model | Purpose |
|--------|----------|
| Random Forest Regressor | Monthly Rice Prediction |
| Random Forest Regressor | Weekly Milk Prediction |

Rule-based logic is used for estimating:

- Grocery purchase frequency
- Vegetable purchase frequency

---

## Dataset

The dataset was created through a Google Form survey and contains household grocery consumption information collected from Bangalore households.

The dataset includes information such as:

- Family size
- Locality
- Diet preference
- Vegetables purchased
- Fruits purchased
- Food grains
- Rice type
- Dairy products
- Grocery purchase frequency
- Vegetable purchase frequency
- Rice consumption
- Milk consumption

The collected data was cleaned, encoded, and transformed before model training.

---

## Technologies Used

### Frontend

- HTML
- CSS
- JavaScript

### Backend

- FastAPI
- Python

### Machine Learning

- Scikit-learn
- Pandas
- NumPy
- Joblib

---

## Project Structure

```
SupplySense AI
│
├── backend
├── frontend
│   ├── assets
│   ├── css
│   ├── js
│   └── index.html
│
├── Agents
├── utils
├── Data
├── Models
├── Notebooks
└── README.md
```

---

## Installation

Clone the repository

```bash
git clone https://github.com/nandithaa1128-bit/SupplySense-AI.git
```

Move into the project directory

```bash
cd SupplySense-AI
```

Install the required packages

```bash
pip install -r requirements.txt
```

Run the backend

```bash
cd backend
uvicorn app:app --reload
```

Open the frontend by launching

```
frontend/index.html
```

or serve it using any local web server.

---

## Future Improvements

Some planned enhancements include:

- Prediction of additional grocery products
- Seasonal demand forecasting
- Weather-based demand prediction
- Festival demand forecasting
- Real-time inventory synchronization
- Dynamic warehouse allocation
- Cloud deployment
- Mobile application support

---

## Acknowledgement

This project was developed during my Summer Internship at the Center of Cognitive Computing and Computational Intelligence, PES University.

I would like to express my sincere gratitude to **Dr. Pooja Agarwal** for her continuous guidance, valuable feedback, and encouragement throughout the development of this project.

---

## Author

**Nanditha A**

B.Tech – Artificial Intelligence and Machine Learning

PES University

GitHub: https://github.com/nandithaa1128-bit

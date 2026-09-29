# SupplySense AI

SupplySense AI is a multi-agent grocery demand forecasting and inventory optimization system developed as part of my Summer Internship at the Center of Cognitive Computing and Computational Intelligence, PES University.

The project focuses on predicting household grocery consumption and helping suppliers make better inventory decisions using Machine Learning and Agentic AI. Instead of relying only on historical sales, the system analyzes household consumption patterns to estimate future demand and supports proactive inventory replenishment.

---

## Project Overview

Traditional grocery inventory systems often struggle with inaccurate demand estimation, leading to stock shortages, overstocking, and food wastage. SupplySense AI addresses this problem by combining Machine Learning models with a multi-agent architecture to forecast household demand and optimize supplier inventory at a hyperlocal level.

The application consists of two modules:

- **User Module** – Predicts household grocery consumption.
- **Admin Module** – Monitors demand, inventory, supplier allocation, and delivery planning.
- <img width="941" height="406" alt="{62341A7D-1CC3-4849-8DA7-43ECADEE5A6F}" src="https://github.com/user-attachments/assets/4c72ef18-7da8-4473-892d-75f51da1a870" />


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
- <img width="930" height="381" alt="{674E5E26-B3EC-4242-9AAA-13229FE14842}" src="https://github.com/user-attachments/assets/801936ac-201b-4b08-aba4-5561fdce544f" />
<img width="870" height="375" alt="{F7F4936E-258B-482C-922E-487C05EDF23E}" src="https://github.com/user-attachments/assets/8f65f356-4d22-447b-92b3-1e90c8d9bc32" />
<img width="440" height="336" alt="{6544CB21-0640-4378-A4DD-9DDFC4E5A859}" src="https://github.com/user-attachments/assets/1a0a9b5a-c855-4afc-a1fb-8562d28b5f1f" />
<img width="445" height="239" alt="{E1C9E485-2966-408F-ACC7-BEF2D863E67A}" src="https://github.com/user-attachments/assets/c35bd427-27d4-41c4-99cd-1feb2547e406" />
<img width="344" height="346" alt="{A739F676-7647-42EF-8708-7124CE9AB632}" src="https://github.com/user-attachments/assets/91f5a947-fb76-4707-a290-d83bb8aa66ce" />
<img width="345" height="414" alt="{13997B25-3476-4010-8382-28080B15D082}" src="https://github.com/user-attachments/assets/0fff68ab-a559-4d3b-9106-1efd80cf1b88" />
<img width="398" height="317" alt="{2736A2AD-544A-4647-93BA-079A34A839F3}" src="https://github.com/user-attachments/assets/f20c0923-b66e-4eb2-8e13-2bab6c097c0d" />








### Admin Module

- Zone-wise demand monitoring
- Locality-wise demand analysis
- Inventory status tracking
- Low-stock and critical inventory detection
- Supplier recommendations
- Warehouse allocation
- Inventory reports
- <img width="377" height="248" alt="{03601768-C247-421A-ACED-6C0845B021FA}" src="https://github.com/user-attachments/assets/02ab9d50-b03e-44f1-b976-f947a05d3db4" />
<img width="398" height="410" alt="{32ECE393-80A7-4DF3-B06F-F2349C617ADC}" src="https://github.com/user-attachments/assets/d4c73518-9d3c-4e73-83c6-49103da67e57" />



---

## Project Workflow
<img width="2093" height="295" alt="image" src="https://github.com/user-attachments/assets/ee3e5d3c-b450-4491-9010-b09b3e12d028" />
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

---

## Multi-Agent Architecture

<img width="3000" height="1459" alt="image" src="https://github.com/user-attachments/assets/a0cc3d72-476e-42bd-9d43-cf216d48cc90" />

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
<img width="3000" height="1350" alt="image" src="https://github.com/user-attachments/assets/d97af6eb-b4ce-40a1-8250-2c7ca408754c" />


The project uses supervised learning models for consumption prediction.

| Model | Purpose |
|--------|----------|
| Random Forest Regressor | Monthly Rice Prediction |
| XG Boost | Weekly Milk Prediction |

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

# AntiFakeAI

AntiFakeAI is a full-stack diploma project for detecting counterfeit cosmetic products using artificial intelligence, computer vision, image similarity analysis, and barcode verification.

Approved diploma topic:

**AI-Based Counterfeit Product Detection System**  
**Система обнаружения контрафактных товаров с использованием технологий искусственного интеллекта**  
**Жасалма интеллект технологиясына негизделген жасалма товарды аныктоо системасы**

## Project Goal

Develop an intelligent web system that helps users verify the authenticity of cosmetic products by analyzing product images and barcode data.

The system compares a user-uploaded product image with reference images stored in the dataset and returns an authenticity result with a confidence score and explanation.

## Main Features

- User registration and authentication
- Public product catalog
- Product authenticity verification by image
- Barcode matching with the selected product
- Product angle selection before verification
- YOLO-based product segmentation
- Siamese Neural Network image similarity comparison
- Additional visual analysis of text, logo, font, and packaging design
- Verification history for users
- Admin review queue
- Admin final decision confirmation
- Product, brand, country, and dataset image management
- Dataset expansion without retraining the Siamese model

## Verification Flow

```text
User selects product
        ↓
User uploads product image and barcode
        ↓
Backend saves image and sends request to AI service
        ↓
YOLO Segmentation crops the product from the image
        ↓
Siamese Neural Network extracts image embeddings
        ↓
Cosine similarity is calculated against reference images
        ↓
Additional visual analysis checks text, logo, font, and design elements
        ↓
Barcode is compared with product data
        ↓
Final result is generated: Original / Fake / Needs Review
```

## Architecture



AntiFakeAI is built using a three-tier architecture:



```text

Frontend  →  Backend  →  AI Service

 React       Spring Boot   FastAPI + PyTorch

```



### System Components



* **Frontend** — React web interface for users and administrators

* **Backend** — Spring Boot REST API, business logic, authentication, database integration

* **AI Service** — FastAPI service for image segmentation, similarity comparison, and visual explanation

* **Database** — PostgreSQL

* **Storage** — Cloudinary for uploaded images

* **AI Models** — YOLO Segmentation and Siamese Neural Network



## Tech Stack



### Frontend



* React

* JavaScript

* Axios

* HTML

* CSS



### Backend



* Java 17

* Spring Boot 3

* Spring Web

* Spring Security

* JWT authentication

* Spring Data JPA

* Hibernate

* PostgreSQL

* Flyway / Liquibase

* Swagger / OpenAPI



### AI Service



* Python 3.11

* FastAPI

* PyTorch

* Torchvision

* OpenCV

* Roboflow YOLO Segmentation

* Siamese Neural Network

* Cosine Similarity

* Gemini visual explanation module



### Storage and Infrastructure



* PostgreSQL

* Cloudinary

* REST API

* Multipart file upload



## Repository Structure



```text

AntiFakeAI/

├── frontend/

├── backend/

├── antifake_ai_service/

├── docs/

│   ├── diagrams/

│   ├── screenshots/

│   └── thesis-notes/

├── .env.example

├── .gitignore

└── README.md

```



## AI Model Logic



The AI module works in several stages.



### 1. Product Segmentation



The uploaded image is processed using YOLO Segmentation.

The goal of this step is to remove background noise and isolate the product itself.



```text

Input image → YOLO Segmentation → Cropped product image

```



### 2. Image Embedding Extraction



The cropped product image is resized, normalized, and passed through the Siamese Neural Network.



The model is based on ResNet18 and produces a 256-dimensional embedding vector.



```text

Image → ResNet18 Feature Extractor → 256-dimensional embedding

```



### 3. Similarity Calculation



The system compares the user image embedding with reference image embeddings using cosine similarity.



```text

User embedding ↔ Reference embedding → Cosine similarity

```



### 4. Decision Rules



```text

Similarity >= 95%  → Auto Original

Similarity >= 80%  → Needs Review

Similarity < 80%   → Auto Fake

```



If the additional visual analysis finds suspicious elements, such as spelling mistakes in the product name, logo differences, or design inconsistencies, the result is moved to **Needs Review**.



### 5. Admin Review



The administrator can review suspicious requests and confirm the final result:



* Confirm original

* Confirm fake

* Reject request



## Dataset



The project uses a custom cosmetic product image dataset.



Dataset images are grouped by:



* product ID

* product angle

* reference image type



Example structure:



```text

dataset_cropped/

└── train/

    └── product_5/

        ├── front/

        ├── back/

        ├── box_front/

        ├── box_back/

        ├── logo/

        ├── barcode/

        └── ingredients/

```



The full dataset and trained model weights are not included in this repository because of size and privacy limitations.



## Environment Variables



Create `.env` files based on `.env.example`.



### Backend



```env

DB_URL=jdbc:postgresql://localhost:5432/antifakeai

DB_USERNAME=postgres

DB_PASSWORD=your_password



JWT_PRIVATE_KEY=your_private_key

JWT_PUBLIC_KEY=your_public_key



CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_cloudinary_key

CLOUDINARY_API_SECRET=your_cloudinary_secret



AI_SERVICE_URL=http://localhost:8000

FRONTEND_URL=http://localhost:3000

```



### AI Service



```env

ROBOFLOW_API_KEY=your_roboflow_api_key

ROBOFLOW_API_URL=https://serverless.roboflow.com

ROBOFLOW_MODEL_ID=your_model_id



GEMINI_API_KEY=your_gemini_api_key

GEMINI_MODEL=gemini-2.5-flash



SIAMESE_MODEL_PATH=./models/siamese_model.pt

ANGLE_DATASET_DIR=./dataset_cropped/train

```



### Frontend



```env

REACT_APP_API_URL=http://localhost:8080

```



## Running Locally



### 1. Backend



```bash

cd backend

mvn clean install

mvn spring-boot:run

```



Backend runs on:



```text

http://localhost:8080

```



### 2. Frontend



```bash

cd frontend

npm install

npm start

```



Frontend runs on:



```text

http://localhost:3000

```



### 3. AI Service



```bash

cd antifake_ai_service

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

```



AI Service runs on:



```text

http://localhost:8000

```



Swagger UI:



```text

http://localhost:8000/docs

```



## Main API Endpoints



### Auth



```text

POST /api/v1/auth/register

POST /api/v1/auth/login

POST /api/v1/auth/refresh

```



### Products



```text

GET    /api/v1/products

GET    /api/v1/products/{id}

GET    /api/v1/products/search

GET    /api/v1/products/barcode

POST   /api/v1/products

PATCH  /api/v1/products/{id}

DELETE /api/v1/products/{id}

```



### Verifications



```text

POST /api/v1/verifications/verify

GET  /api/v1/verifications/my-history



GET  /api/v1/verifications/admin/all

GET  /api/v1/verifications/admin/review

PATCH /api/v1/verifications/admin/{id}/confirm-original

PATCH /api/v1/verifications/admin/{id}/confirm-fake

PATCH /api/v1/verifications/admin/{id}/reject

```



### AI Service



```text

GET  /

POST /api/v1/verify/angle-similarity

POST /api/v1/images/crop-preview

```



## Notes



The repository does not include:



* API keys

* `.env` files

* JWT private/public keys

* trained model weights

* full dataset

* Cloudinary credentials

* database passwords



Use `.env.example` files to configure the project locally.



## Author



**Aizirek Akjol kyzy**

Diploma project — AntiFakeAI

Backend, Frontend, AI Service



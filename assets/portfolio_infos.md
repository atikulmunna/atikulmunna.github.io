# Atikul Islam Munna

House #305, Road #06, E-Block, Bashundhara R/A, Dhaka
[atikulxmunna@gmail.com](mailto:atikulxmunna@gmail.com) | [+880 1401232952](tel:+8801618633319) | [LinkedIn](https://www.linkedin.com/in/aimunna) | [GitHub](https://github.com/atikulmunna)

---

## Profile

AI-driven Software Engineer and Computer Science undergraduate specializing in machine learning, deep learning and intelligent system design. Experienced in developing, fine-tuning and deploying models for computer vision, natural language processing and edge AI applications. Skilled in integrating AI pipelines into production environments.

---

## Education

**North South University**, BS in Computer Science and Engineering — January 2022 – December 2025

- CGPA: 3.18/4.0
- **Major:** Artificial Intelligence

---

## Tools and Technologies

**Languages:** Python, C++, C, Java, Kotlin

**LLM/NLP:** Hugging Face (Transformers, Accelerate), sentence-transformers, spaCy, Ollama, llama.cpp, GGUF

**Deep Learning:** PyTorch, TensorFlow, OpenCV

**Databases:** Qdrant, Elasticsearch, Neo4j, Redis, SQL, MongoDB

**Backend:** FastAPI, Pydantic, HTTPX

**MLOps:** Docker, Docker Compose, OpenTelemetry

**Other:** PyBullet, Pymunk, Git, Linux, LaTeX

---

## Experience

**AI Engineer Intern – Computer Vision Team** — October 2025 – Present

[**The Data Island**](https://thedataisland.com/), Dhaka, Bangladesh

**Responsibilities:**

- Collaborate with the cross-functional AI team to develop and optimize scalable computer vision pipelines for production environments.
- Oversee the end-to-end dataset lifecycle, including data collection, cleaning and annotation, ensuring high-quality inputs for model training.
- Conduct PoC validation for early-stage computer vision projects.

**Key Project Contributions:**

**Retail Analytics Computer Vision System for Unilever Bangladesh:** Contributed to engineering computer vision solutions for Category Visibility Program, Share of Shelf (SOS) analysis, POSM tracking to automate retail execution monitoring. Trained and fine-tuned YOLO models for deployment. Supervised a 4-person team tasked with high-volume data annotation of nearly 350 SKUs. Executed database mapping and integration to enable seamless storage and retrieval of analytical results on the central server.

---

## Notable Projects

**SmartForm: AI-Based Exercise Form & Rep Tracking** — [GitHub](https://github.com/atikulmunna/SmartForm)

Built an on-device Android application that performs real-time human pose and hand tracking to analyze exercise form, count repetitions and provide posture feedback. Designed a low-latency CameraX pipeline integrating ML Kit Pose Detection and MediaPipe Hand Landmarker, with gesture-based controls (pinch/palm) for hands-free start, pause, and mode switching. Implemented per-user calibration, rep quality scoring (depth, tempo), and noise-robust state machines to handle partial visibility and false gesture triggers.

**Tools:** Kotlin, Android (Jetpack Compose), CameraX, ML Kit, MediaPipe

---

**SAG‑RAG: Speculative Agentic Graph Retrieval‑Augmented Generation Platform** — [GitHub](https://github.com/atikulmunna/sagrag)

Built a RAG system that combines speculative query planning, hybrid retrieval, and evidence-grounded synthesis for reliable question answering. The backend uses FastAPI with Qdrant (vector search), Elasticsearch (lexical and structured retrieval) and optional Neo4j graph reasoning to improve answer quality and traceability. Implemented reranking, author-aware retrieval bias, fallback-safe synthesis, and provenance tracking to keep responses natural while preserving technical transparency.

**Tools:** FastAPI, Pydantic, HTTPX, Qdrant, Elasticsearch (BM25), Neo4j, Redis, sentence‑transformers, spaCy, Docker

---

**Multi-Step Research Assistant Platform** — [GitHub](https://github.com/atikulmunna/multistep-research-assistant)

Built a production-style research automation platform that plans complex queries, gathers web evidence, analyzes findings, and generates structured reports. Designed a LangGraph-based multi-node workflow with quality gates (source diversity and reference coverage), adaptive depth controls, and citation normalization for reliable outputs. Implemented a full-stack interface with a Typer CLI, FastAPI backend, and interactive dashboard supporting live progress tracking and report exports (Markdown, HTML, TXT, PDF).

**Tools:** LangGraph, FastAPI, Typer, SQLite, Pytest, GitHub Actions, OpenRouter, Groq, Ollama, Tavily, SerpAPI

---

**High-Throughput Distributed File Service** — [GitHub](https://github.com/atikulmunna/distributed-file-service)

Built a distributed file service that supports resumable, chunk-based uploads and ordered downloads with HTTP Range support. The system enforces reliability through idempotency keys, retry logic, checksum validation (chunk and full-file) and explicit upload state transitions. Added API key/JWT authentication, upload ownership authorization, admin-restricted maintenance endpoints, and structured audit logging.

**Tools:** FastAPI, SQLAlchemy, Alembic, PostgreSQL, SQLite, AWS S3, Cloudflare R2, Redis, AWS SQS, boto3, Prometheus, OpenTelemetry, PyJWT, Docker.

---

**Dataset Quality Analyzer (DQA): CV Data Auditing & CI Quality Gate Platform** — [GitHub](https://github.com/atikulmunna/dataset-quality-analyzer)

Built a Python-based dataset quality auditing system for YOLO/COCO computer vision datasets to detect integrity issues, class imbalance, annotation anomalies, duplicates, and train/validation leakage before model training. Designed a full CLI workflow (audit, explain, validate, diff) with JSON/HTML reporting, schema contract validation, and regression comparison across dataset versions. Implemented remote Roboflow dataset ingestion with caching controls and added segmentation-specific configuration presets to reduce false-positive bbox noise in COCO segmentation pipelines.

**Tools:** Python, argparse, jsonschema, pytest, GitHub Actions, HTML/CSS.

---

**Predictive Maintenance MLOps Platform** — [GitHub](https://github.com/atikulmunna/predictive-maintenance-mlops)

Built an end-to-end predictive maintenance system that forecasts near-term engine failure risk from multivariate time-series sensor data. Developed and compared XGBoost and LSTM pipelines, then implemented a validation-gated ensemble selection policy optimized for F2 score. Productionized inference with FastAPI endpoints and added a Streamlit dashboard for metrics, model decisions, and live inference checks.

**Tools:** XGBoost, TensorFlow/Keras, scikit-learn, FastAPI, Streamlit, Prefect, MLflow, Docker Compose.

---

## Research & Publications

- S. Pramanik, R. R. Antu, **A. I. Munna**, M. I. Khalil, S. M. Abyad, N. M. Sifat, A. F. H. Dhrubo, M. A. Qayum, and M. Sajjad, "High-Accuracy Multimodal Sentiment Classification of Bengali Memes on MemoSen with Custom Fusion Models," *ACM Transactions on Intelligent Systems and Technology*, 2026. (Under Review) [Link](https://doi.org/10.13140/RG.2.2.15836.65921)

- **A. I. Munna**, M. I. Khalil, A. Munna, A. Halder, S. Pramanik, and A. F. Dhrubo, "Bone Fracture Detection Using Vision Transformers: A Comparative Analysis of the Pooling-based Vision Transformer (PiT) and the Causal Transformer (CaFormer) Models," in *2nd IEEE Conference on Secure and Trustworthy Cyberinfrastructure for IoT and Microelectronics (SaTC)*, 2026.

- R. R. Antu, **A. I. Munna**, M. I. Khalil, S. M. Abyad, S. Pramanik, and A. F. H. Dhrubo, "Feature Engineering and Ensemble Classifiers for Robust Cardiovascular Disease Detection," in *5th International Conference on Sentiment Analysis and Deep Learning (ICSADL)*, 2026. [Link](https://doi.org/10.13140/RG.2.2.17953.47208)

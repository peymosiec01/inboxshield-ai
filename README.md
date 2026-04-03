# InboxShield AI

`JS AI Build-a-thon Project`

AI-powered Outlook add-in for detecting financial scam and phishing emails in real time using **Azure OpenAI**, **RAG**, **Microsoft Graph**, and **agentic workflows**.

---

## Overview

InboxShield AI helps users identify suspicious financial emails before taking action.

The solution analyses email content directly within an Outlook-style task pane and provides:

* **Risk Level** (Low / Medium / High)
* **Detected Scam Indicators**
* **AI-generated Explanation**
* **Recommended Action**

This project was built as part of the **JavaScript AI Build-a-thon Hack**.

---

## Problem Statement

Financial scams and phishing emails continue to exploit urgency, trust, and false investment promises.

InboxShield AI brings explainable AI directly into the email workflow to help prevent financial harm.

---

## Architecture

```text
Outlook Ribbon Button
        ↓
Task Pane Add-in (React + Office.js)
        ↓
ngrok HTTPS Tunnel (--pooling-enabled)
        ↓
Node.js / Express API
        ↓
Microsoft Graph API
        ↓
Parser Agent
        ↓
RAG Retrieval Layer
        ↓
MCP Tool Checks
        ↓
Azure OpenAI
        ↓
Advisor Agent
        ↓
JSON Response
        ↓
Task Pane UI
```

---

## Tech Stack

### Frontend

* React
* Office.js
* Outlook Task Pane UI

### Backend

* Node.js
* Express
* Azure OpenAI

### AI Components

* Retrieval-Augmented Generation (RAG)
* Multi-agent workflow
* MCP-style tool checks

### Integrations

* Microsoft Graph API
* ngrok HTTPS tunnel

---

## Key Features

* Real-time email risk assessment
* Scam keyword and urgency detection
* Structured JSON AI responses
* Explainable recommendations
* Outlook workflow integration

---

## Example Output

```json
{
  "risk": "HIGH",
  "indicators": [
    "guaranteed returns",
    "urgency language"
  ],
  "explanation": "This email contains common financial scam patterns.",
  "recommendation": "Do not click links or send money."
}
```

---

## Running Locally

This guide is focused on getting **anyone able to clone, configure, and run the app locally** end-to-end.

### Prerequisites

Before you begin, make sure you have the following installed:

* **Node.js 18+**
* **npm 9+**
* **Outlook Web**
* **Microsoft 365 work / school account** (required for Graph + add-in testing)
* **Azure subscription**
* **ngrok account**

Recommended tools:

* VS Code
* Postman
* Git


### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd inboxshield-ai
```

### 2. Install Dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
npm install
```

### 3. Azure OpenAI Setup

#### Create Azure OpenAI resource

1. Go to Azure Portal
2. Create **Azure OpenAI** resource
3. Deploy a model (recommended: `gpt-4.1-mini`)
4. Copy:

   * endpoint
   * API key
   * deployment name
   * API version

### 4. Microsoft Graph API Setup

#### Create App Registration

1. Go to **Azure Portal → App registrations**
2. Click **New registration**
3. Name: `InboxShieldAI`

#### Create Secret

1. Certificates & secrets
2. New client secret
3. Copy the value immediately

#### API Permissions

Add:

* `Mail.Read`
* `User.Read`
* `offline_access`

Then click **Grant admin consent**.

Copy:

* Client ID
* Tenant ID
* Client Secret

### 5. Backend Environment Variables

Create `backend/.env`

Update with the contents of `backend/.env.example`

USER_ID is the email address and tenant where the add-in will be installed and used

### 6. Frontend Environment Variables

Create `frontend/.env.development.local`

Update with the contents of `frontend/.env.development.local.example`


### 7. Start the Application

#### Start backend

```bash
cd backend
node server.js
```

#### Start frontend

Open a second terminal:

```bash
cd frontend
npm start
```

Frontend usually runs on:

```text
http://localhost:3000
```

### 8. Expose App via ngrok

Required for Outlook add-in sideloading.

Sign-up to https://ngrok.com to setup and install (if you haven't done that before)

Update `WEBHOOK_URL` and `NGROK_AUTHTOKEN` in the `backend/.env` 

#### Frontend tunnel

```bash
ngrok http 3000 --pooling-enabled
```

#### Backend tunnel

```bash
ngrok http 3001 --pooling-enabled
```

### 9. Configure manifest.xml

Create `frontend/manifest.xml`

Update with the contents of `frontend/manifest.template.xml`

Replace `YOUR-PUBLIC-HTTPS-URL` with your ngrok URL endpoint

### 10. Install Outlook Add-in

#### Web Outlook

1. Go to https://outlook.office365.com/mail/inclientstore
2. Wait for the Add-ins box to pop-up
3. My add-ins
4. Add a custom add-in
5. Upload `manifest.xml`


### 11. Test the App

1. Open any email
2. Click More Apps
3. Click InboxShield AI
4. Task pane opens
5. Wait for the analysis to complete
6. View risk result

---

## Impact

InboxShield AI is focused on **financial safety and scam prevention**, helping users make safer decisions at the point of risk.

---

## Future Improvements

* Production Outlook deployment
* Vector database for advanced RAG
* URL reputation API integration
* Offline inference support

---

## Author

**Moses Babalola**

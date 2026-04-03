# InboxShield AI

`JS-AI-Build-a-thon Project`

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

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
npm install
node server.js
```

### Expose via ngrok

```bash
ngrok http 3000 --pooling-enabled
ngrok http 3001 --pooling-enabled
```

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

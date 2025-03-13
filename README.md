[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
# Detoxify

<img src="cover.png?v=2" width="100%" alt="Detoxify Logo">

> Smart Content Filtering for a Better YouTube Experience

Detoxify is an AI-powered Chrome extension that intelligently filters your YouTube feed using Google's advanced Gemini AI model, providing a personalized and focused viewing experience.

## 📑 Table of Contents
- [Quick Start](#-quick-start)
- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Features](#-features)
- [Technical Details](#-technical-details)
- [Workflow](#-workflow)
- [Security & Privacy](#-security--privacy)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## 🚀 Quick Start

### Local Setup

1. **Clone the Repository**
```bash
git clone https://github.com/Saarthakkj/detoxify_yt.git
cd detoxify_yt
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Extension**
- Add your Gemini API key
- Set content preferences
- Enable in Chrome

## 🎯 Overview

Detoxify leverages Google's Gemini AI to provide:
- Intelligent content filtering
- Real-time video processing
- Custom content preferences
- Automatic shorts and news removal

## 🏗️ System Architecture

### 1. Chrome Extension (Frontend)
- Real-time content scraping
- Dynamic video filtering
- Batch processing (15 videos per batch)
- Automatic shorts removal

### 2. Gemini API Integration
- Model: gemini-2.0-flash-lite-preview-02-05
- Average latency: 1.002s
- Real-time inference capabilities
- Custom content filtering

## 🚀 Features

- **Smart Filtering**: Powered by Gemini AI
- **Fast Processing**: ~1 second latency per batch (of 15 videos)
- **Customizable**: User-defined content preferences
- **Automatic**: Real-time content processing
- **Efficient**: 15-video batch processing
- **Shorts Removal**: Automatic YouTube shorts filtering

## 🛠️ Technical Details

### Performance Metrics
- Average API Latency: 1.002s
- Batch Processing: 15 videos
- Real-time processing capability

### System Requirements
- Chrome Browser (latest version)
- Internet connection
- Gemini API key

### Core Dependencies
```json
{
  "dependencies": {
    "@google/generative-ai": "^0.2.0",
    "chrome-types": "^0.1.246"
  }
}
```

## 🔄 Workflow

1. **Initial Setup**
   - Install Chrome extension
   - Configure Gemini API key
   - Set content preferences

2. **Content Processing**
   - Collects videos in batches of 15
   - Sends to Gemini API for analysis
   - Filters based on preferences

3. **Real-time Updates**
   - Processes new content automatically
   - Removes YouTube shorts
   - Updates feed instantly

## 🔒 Security & Privacy

- Secure API key storage using Chrome Storage API
- HTTPS-only communication
- Client-side processing
- No data collection or storage
- See our [Privacy Policy](PRIVACY.md) for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/Enhancement`)
3. Commit changes (`git commit -m 'Add Enhancement'`)
4. Push to branch (`git push origin feature/Enhancement`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 📧 Contact

Prakhar Agrawal 
- Email: prakhar20585@gmail.com

Saarthak Saxena
- Twitter: [@curlydazai](https://x.com/curlydazai)
- Email: saarthaksaxena7@gmail.com

Project: [GitHub Repository](https://github.com/Saarthakkj/detoxify_yt)

---
<p align="center">Made with ❤️ for a cleaner YouTube experience</p>

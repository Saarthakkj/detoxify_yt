[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
# Detoxify

<img src="cover.png?v=2" width="100%" alt="Detoxify Logo">

> Detoxify: Impossible To Be Distracted.

Detoxify is an AI-powered Chrome extension that uses Google's Gemini AI to intelligently filter your YouTube feed based on your preferences, helping you focus on content that matters to you.

## 📑 Table of Contents
- [Quick Start](#-quick-start)
- [Project Inspiration](#-project-inspiration)
- [What Detoxify Does](#-what-detoxify-does)
- [How It Works](#-how-it-works)
- [Key Features](#-key-features)
- [Privacy & Security](#-privacy--security)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## 🚀 Quick Start

### Local Setup

1. **Clone the Repository**
```bash
git clone https://github.com/Saarthakkj/detoxify_yt.git -b multiple_url_handling
cd detoxify_yt
```

2. **Load the Extension in Chrome**

- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode" in the top-right corner
- Click "Load unpacked" and select the `extension` folder from the cloned repository

3. **Configure Gemini API Key**
- Get your Gemini API key from [Google AI Studio](https://t.co/4f9u2bgVlz)
- Click on the Detoxify extension icon in Chrome
- Enter your API key in the settings

4. **Initialize and Use**
- Navigate to [YouTube](https://youtube.com)
- Type your prefered category and toggle the filter on
- Chose batch size per video : 8-12 (ideal)
- The extension will automatically start filtering content based on your preferences

## 💡 Project Inspiration

Detoxify was inspired by [Harkirat Singh's YouTube video](https://www.youtube.com/watch?v=sz9K1e3LO4M) on building Chrome extensions. His guidance and teaching approach provided the foundation for this project. This extension exists as a contribution to the knowledge Harkirat shared, taking his concepts further by implementing AI-powered content filtering for YouTube.

The project aims to continue the spirit of innovation that Harkirat encourages in his content, helping users create more meaningful experiences online.

## 🎯 What Detoxify Does

Detoxify transforms your YouTube browsing experience by:

- Letting you specify exactly what type of content you want to see
- Using Gemini AI to instantly detect videos matching your preferences
- Filtering out content that doesn't align with your specified interests
- Automatically removing distracting shorts and unwanted videos
- Providing a cleaner, more focused YouTube feed tailored to your needs

## ⚙️ How It Works

1. **Set Your Preferences**: Simply type in what categories of content you're interested in
2. **Browse YouTube**: Navigate YouTube as you normally would
3. **Real-time AI Processing**: The extension uses Google's Gemini AI to analyze video content as they load
4. **Smart Filtering**: Videos are instantly filtered based on your preferences
5. **Continuous Updates**: Your feed refreshes automatically as you scroll, with only relevant content

The extension processes videos in batches for efficiency (8-12 videos at a time is optimal) with an average processing time of just 1.59 second per batch.

## 🔑 Key Features

- **True Real-Time Filtering**: Unlike other tools, Detoxify processes content almost instantaneously
- **Simple Preference Setting**: Just type what you want to see, and Gemini handles the rest
- **Personalized Content**: View only the content that matches your specified interests
- **Distraction Removal**: Automatically filters out shorts and other unwanted content
- **Fast Processing**: Efficient batch processing with minimal latency (~1 second)
- **User Control**: Easily toggle filtering on/off as needed
- **Private Operation**: All processing happens on your device

## 🔒 Privacy & Security

- Your API key is securely stored using Chrome's Storage API
- All communication with Google's API uses secure HTTPS
- No user data is collected or stored
- Content analysis happens on-demand and isn't retained

## 🤝 Contributing

We welcome contributions to improve Detoxify:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/enhancement`)
3. Commit your changes (`git commit -m 'Add enhancement'`)
4. Push to the branch (`git push origin feature/enhancement`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

Prakhar Agrawal 
- Email: prakhar20585@gmail.com

Saarthak Saxena
- Twitter: [@curlydazai](https://x.com/curlydazai)
- Email: saarthaksaxena7@gmail.com

Project: [GitHub Repository](https://github.com/Saarthakkj/detoxify_yt)

---
<p align="center">Made with ❤️ for a cleaner YouTube experience</p>

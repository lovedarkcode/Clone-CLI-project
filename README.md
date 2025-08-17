# Clone CLI Project

A powerful CLI tool for cloning websites for offline viewing, with integrated AI agent capabilities.

## 🎬 Demo Video

Check out the project demonstration on YouTube: [Clone CLI Project Demo](https://youtu.be/K8UKvR-1zWc?si=IsOAK0k1dJw7U8GS)

## 🚀 Features

### Website Cloning (`index.js`)
- **Full Website Downloads**: Clone entire websites with all assets (HTML, CSS, JS, images)
- **Offline Viewing**: Rewrite links for local offline browsing
- **Asset Processing**: Automatically download and process stylesheets, scripts, and media files
- **Local Server**: Built-in Express server to serve cloned websites locally
- **Concurrent Downloads**: Efficient parallel downloading with configurable concurrency
- **Smart Path Resolution**: Intelligent handling of relative and absolute URLs

### AI Agent System (`agents.js`)
- **OpenAI Integration**: GPT-4 powered assistant with structured thinking
- **Tool Execution**: Execute system commands, get weather data, and fetch GitHub user info
- **Chain of Thought**: Systematic START → THINK → TOOL → OBSERVE → OUTPUT workflow
- **Available Tools**:
  - `getWeatherDetailsByCity()` - Get current weather for any city
  - `getGithubUserInfoByUsername()` - Fetch GitHub user information
  - `executeCommand()` - Execute system commands safely

## 📦 Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd Clone-Cli-Project
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables** (for AI agent):
```bash
# Create .env file and add your OpenAI API key
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
```

## 🛠️ Usage

### Website Cloning

**Clone a website**:
```bash
# Using npm script
npm start clone <website-url> [options]

# Or directly with node
node index.js clone <website-url> [options]

# Examples
npm start clone https://example.com
npm start clone https://example.com -o ./my-clone
```

**Serve a cloned website**:
```bash
npm start serve <directory> [options]

# Examples
npm start serve ./cloned-site
npm start serve ./cloned-site -p 8080
```

### AI Agent System

Run the AI agent for command execution and assistance:
```bash
node agents.js
```

The agent can help you with:
- Git operations and repository management
- Weather information for any city
- GitHub user profile lookups
- System command execution

## 📁 Project Structure

```
Clone-Cli-Project/
├── index.js              # Main CLI tool for website cloning
├── agents.js             # AI agent system with OpenAI integration
├── package.json          # Project dependencies and scripts
├── hiteshsir-clone/      # Example cloned website
├── piyushsir-clone/      # Example cloned website
├── vscode-clone/         # Example cloned website (VS Code homepage)
└── node_modules/         # Dependencies
```

## 🔧 CLI Commands

### Clone Command
```bash
clone <url> [options]

Arguments:
  url                    Website URL to clone

Options:
  -o, --output <dir>     Output directory (default: "./cloned-site")
  -h, --help            Display help for command
```

### Serve Command
```bash
serve <directory> [options]

Arguments:
  directory             Directory containing the cloned website

Options:
  -p, --port <port>     Port to serve on (default: "3000")
  -h, --help           Display help for command
```

## 🤖 AI Agent Examples

The AI agent follows a structured thinking process:

```
User: "Can you tell me the weather in London?"

🔥 The user wants to know the current weather in London
    🧠 I need to use the weather tool to get this information
    🧠 I'll call getWeatherDetailsByCity with "London" as the parameter
🛠️ getWeatherDetailsByCity(London) = The current weather of London is Clear +15°C
    🧠 I received the weather data for London
🤖 The current weather in London is clear with a temperature of 15°C. Great weather for outdoor activities! ☀️
```

## 🎯 Key Features

- **Smart Asset Detection**: Automatically finds and downloads CSS, JS, images, and other assets
- **Link Rewriting**: Converts absolute URLs to relative paths for offline browsing
- **CSS Processing**: Processes CSS files to download referenced assets (fonts, images)
- **Responsive Design**: Preserved responsive layouts and media queries
- **Error Handling**: Robust error handling with detailed logging
- **Progress Tracking**: Real-time download progress with colored console output

## 🌐 Supported Features

### Website Cloning
- ✅ HTML pages with full DOM structure
- ✅ CSS stylesheets and embedded styles
- ✅ JavaScript files and inline scripts
- ✅ Images (JPG, PNG, GIF, SVG, WebP)
- ✅ Fonts (WOFF, WOFF2, TTF, OTF)
- ✅ Media files referenced in CSS
- ✅ Responsive design preservation
- ✅ Local link rewriting

### AI Agent Capabilities
- ✅ Weather data retrieval
- ✅ GitHub user information
- ✅ System command execution
- ✅ Git operations assistance
- ✅ Structured reasoning process

## 🔒 Security Notes

- The AI agent can execute system commands - use with caution
- Always review commands before execution in production environments
- API keys should be kept secure and not committed to version control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with Node.js and modern ES modules
- Uses Cheerio for HTML parsing and manipulation
- Powered by OpenAI's GPT-4 for AI capabilities
- Express.js for local web server functionality

---

**Made with ❤️ for the web development community**

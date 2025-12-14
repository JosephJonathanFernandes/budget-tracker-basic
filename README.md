# Budget Tracker Pro 💰

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/JosephJonathanFernandes/budget-tracker-basic/graphs/commit-activity)

A full-stack, human-centered expense tracking application designed for simplicity and elegance. Built with Node.js, Express, and modern vanilla JavaScript.

## Features

✨ **Human-Centered Design**

- Intuitive interface with helpful hints and tooltips
- Accessibility-first approach (ARIA labels, keyboard navigation)
- Smart validation with clear error messages
- Onboarding for first-time users

🎨 **Beautiful UI/UX**

- Modern gradient design with smooth animations
- Dark mode support
- Responsive layout for all devices
- Interactive charts and statistics

🔧 **Full-Stack Architecture**

- Node.js/Express backend
- RESTful API
- File-based data storage
- CORS enabled for security

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. For development with auto-reload:

```bash
npm run dev
```

4. Open your browser at `http://localhost:3000`

## API Endpoints

- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/statistics` - Get expense statistics

## Tech Stack

**Frontend:**

- HTML5, CSS3, JavaScript (ES6+)
- Chart.js for visualizations
- Google Fonts (Poppins)

**Backend:**

- Node.js
- Express.js
- File-based JSON storage

## Development

Ensure your code meets professional standards:

- **Linting:** `npm run lint` (Check for errors)
- **Formatting:** `npm run format` (Auto-format code)

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

## Security

For security policy and vulnerability reporting, please see [SECURITY.md](SECURITY.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

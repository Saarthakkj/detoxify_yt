# Contributing to Detoxify

Thank you for your interest in contributing to Detoxify! We welcome contributions from everyone to help make YouTube a better place through intelligent content classification.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please report unacceptable behavior to saarthaksaxena7@gmail.com.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/detoxify_yt.git
   cd detoxify_yt
   ```
3. Set up your development environment following the [Development Setup](#development-setup) section

## How to Contribute

### Reporting Bugs
1. Check if the issue already exists in the [Issues](https://github.com/Saarthakkj/detoxify_yt/issues) section
2. If not, create a new issue using the **Bug Report** template
3. Include:
   - Detailed description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Your environment details (OS, browser version, etc.)

### Requesting Features
1. Check existing [Issues](https://github.com/Saarthakkj/detoxify_yt/issues) for similar feature requests
2. Create a new issue using the **Feature Request** template
3. Clearly describe:
   - The feature's purpose
   - Use cases
   - Expected behavior
   - Any technical considerations

### Documentation Improvements
- Help us improve our documentation by fixing typos, adding examples, or clarifying confusing sections
- Documentation is as important as code!

## Development Setup

1. Install dependencies:
   ```bash
   npm install  # For extension development
   pip install -r requirements.txt  # For backend development
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Run tests:
   ```bash
   python -m pytest
   ```

## Pull Request Process

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "type: brief description"
   ```
   - Use conventional commit messages:
     - `feat:` for features
     - `fix:` for bug fixes
     - `docs:` for documentation
     - `test:` for tests
     - `refactor:` for refactoring

3. Push to your fork:
   ```bash
   git push origin your-branch-name
   ```

4. Open a Pull Request:
   - Fill in the PR template
   - Link relevant issues
   - Add screenshots for UI changes
   - Ensure tests pass
   - Request review from maintainers

## Style Guidelines

### Python Code
- Follow PEP 8 guidelines
- Use type hints
- Maximum line length: 88 characters
- Use docstrings for functions and classes

### JavaScript Code
- Follow ESLint configuration
- Use ES6+ features
- Maximum line length: 80 characters
- Use JSDoc for documentation

### Commit Messages
- Start with type: `feat:`, `fix:`, `docs:`, etc.
- Keep messages clear and concise
- Reference issues when applicable

## Questions?

Feel free to reach out to the maintainers:
- Prakhar Agrawal (prakhar20585@gmail.com)
- Saarthak Saxena (saarthaksaxena7@gmail.com)

---

Thank you for contributing to Detoxify! Your efforts help make YouTube a better place for everyone. ❤️

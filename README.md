# CV CLI

A command-line tool to generate professional CVs from YAML data.

## Features

- ✨ **Example Template** — A clean, single-column layout optimized for readability.
- 🛠️ **YAML Driven** — Keep your CV data separate from the design.
- 🖼️ **Profile Photo** — Automatically embedded from `data/assets/profile.png`.
- 🔗 **Clickable Links** — Email (`mailto:`), Phone (`wa.me`), LinkedIn, GitHub.
- 📱 **QR Codes** — Auto-generated in PDF headers and footers.
- 📄 **Smart Pagination** — Auto page breaks that keep sections intact.
- 🏷️ **Footer** — Name and page numbers on every page.

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- macOS, Linux, or Windows (WSL recommended)

### Setup
```bash
make install
```

### Initialize Data
To get started, copy the example files into the `data/content/` directory:

```bash
# Initialize data from examples
mkdir -p data/content
cp data/examples/content/*.yaml data/content/

# Initialize assets from examples
mkdir -p data/assets
cp data/examples/assets/profile.example.png data/assets/profile.png
```

## Usage

Generating your CV is simple:

```bash
# Generate using the example template
cv -t example
```

The output will be saved as `CV-Example_{Name}_{Timestamp}.pdf`.

## Templates

### Example Template
The `example` template provides a professional, single-column layout. It features:
- Centered header with contact info formatted as `Key: Value | Key: Value`.
- Intelligent WhatsApp link generation using the `phoneDigits` helper.
- Experience entries with activities, expertise, and technologies.
- Automatic page breaks using `break-inside: avoid` to keep job entries together.

## Data Structure

All personal YAML files live in `data/content/` (git-ignored for privacy):

| File | Description |
|---|---|
| `profile.yaml` | Name, title, summary, contact info (email, phone, LinkedIn, GitHub) |
| `experience.yaml` | Work history with activities, expertise, technologies, and optional project nesting |
| `techstack.yaml` | Technical skills grouped by category |
| `education.yaml` | Academic background |
| `languages.yaml` | Spoken languages with proficiency levels |

## Customization

- **Data** — Edit the files in `data/content/`.
- **Photo** — Add your profile photo to `data/assets/profile.png`.
- **Custom Templates** — You can create your own templates in the `templates/` directory. Each template requires an `.hbs` file and a corresponding `.css` file in a `styles/` subdirectory.

## Architecture

```
src/
├── cli.js                          # CLI entry point (Commander.js)
├── core/
│   ├── interfaces/                 # Abstract contracts
│   └── usecases/
│       └── BuildCV.js              # Build pipeline logic
└── infrastructure/
    ├── YamlDataProvider.js          # Loads YAML data
    ├── HandlebarsRenderer.js        # Compiles templates
    └── PuppeteerGenerator.js        # Generates PDF with Puppeteer
```
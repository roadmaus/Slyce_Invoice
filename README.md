# Slyce Invoice

A modern, desktop invoice generation application built with Electron and React. Slyce Invoice helps freelancers and small businesses create, manage, and track invoices efficiently.

![Slyce Invoice Logo](build/icon.png)

## Features

- 📝 Create and manage professional invoices
- 👥 Customer management system
- 💼 Multiple business profile support
- 🏷️ Quick tags for frequent invoice items
- 💾 Automatic data persistence
- 📤 Export/Import functionality
- 🖨️ PDF generation with customizable templates
- 🌍 German language support

## TODO

- 🎨 Template System Improvements
  - Multiple template designs for different business sizes
  - Template preview functionality
  - Enhanced customization options
- 👋 Enhanced Customer Interaction
  - Improved title handling and formal/informal greeting options
  - Customizable salutations based on locale
- 💫 UI Feedback Improvements
  - Non-intrusive success/error notifications
  - Visual indicators for action completion
  - Status indicators for ongoing processes
  - Subtle animation feedback for user interactions

## Installation

1. Clone the repository:
```bash
git clone https://github.com/roadmaus/slyce-invoice.git
cd slyce-invoice
```

2. Install dependencies:
```bash
npm install
```

3. Start the development environment:
```bash
npm run start
```

## Usage

### Business Profiles
- Create multiple business profiles with company details
- Set default profile for quick invoice generation
- Store banking information and tax details

### Customer Management
- Add and manage customer information
- Support for different title formats (Dr., Prof., etc.)
- Business/Private customer distinction

### Quick Tags
- Create preset invoice items for frequent services
- Customize rates and descriptions
- Color-code tags for better organization

### Invoice Generation
1. Select a customer and business profile
2. Add invoice items manually or using quick tags
3. Set invoice dates (single date or date range)
4. Generate PDF invoice
5. Automatically saved in Documents/Invoices/[YEAR]

## Data Management

### Export Data

```970:981:src/components/SlyceInvoice.jsx
                      variant="outline"
                      onClick={async () => {
                        const success = await window.electronAPI.exportData();
                        setShowAlert({
                          show: true,
                          message: success ? 'Data exported successfully!' : 'Failed to export data',
                        });
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
```


### Import Data
Your data can be imported from previously exported backup files through the business profiles section.

## Development

To run the application in development mode:
```bash
npm run dev
```

For production build:
```bash
npm run build
```

## System Requirements

- Windows, macOS, or Linux operating system
- Node.js 18 or higher
- 4GB RAM minimum
- 500MB free disk space

## File Structure

The application automatically organizes generated invoices in:
```
Documents/
└── Invoices/
    └── [YEAR]/
        └── [CUSTOMER]_[INVOICE_NUMBER].pdf
```

## Support

For issues and feature requests, please open an issue in the GitHub repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Built with ❤️ using Electron, React, and shadcn/ui components.

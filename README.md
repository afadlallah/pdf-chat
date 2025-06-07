# PDF Chat

Next.js application that allows you to chat with your PDF files using AI.

## Features

- Modern, mobile-friendly UI
- Secure authentication with Clerk
- PDF file upload and management
- Interactive chat interface with history
- Source citations with page references

## Getting Started

### Prerequisites

Obtain keys from the following services:

- [Bytescale](https://bytescale.com/)
- [Clerk](https://clerk.com/)
- [OpenAI](https://openai.com/)
- [Pinecone](https://www.pinecone.io/)
- [Together AI](https://www.together.ai/)
- [Vercel Postgres](https://vercel.com/storage/postgres)

*Note: Make sure to set the correct dimensions for the Pinecone database. This project uses OpenAI's `text-embedding-3-small` model, which generates embeddings of 1,536 dimensions.*

### Installation

1. Clone the repository:

```bash
git clone https://github.com/afadlallah/pdf-chat.git
```

2. Install dependencies:

```bash
bun install
```

3. Create `.env` file and add the environment variables.

```bash
cp .env.example .env
```

Check [Together AI's models page](https://api.together.ai/models) if you want to use a different chat model (default is `meta-llama/Llama-3.2-3B-Instruct-Turbo`).

4. Generate Prisma client and push database schema:

```bash
bun run prisma generate
bun run prisma db push
```

5. Start the development server:

```bash
bun run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

## Usage

1. Create an account
2. Upload a PDF file (max 5MB)
3. Wait for processing to complete
4. Start chatting with your document
5. Click on page references to jump to specific sections
6. Use the PDF viewer controls to navigate, zoom, and rotate the document

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

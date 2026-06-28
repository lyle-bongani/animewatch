<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Execution Rules

- **Test and Verify Repeatedly**: Always test and verify code adjustments immediately. If a solution fails or causes issues, think critically, form a new hypothesis, adjust the code, and test again and again until it is fully successful. Never stop at a failing state. Iteratively debug and test until success is achieved.
- **Never Start the Server**: Do not start or run the development server (`npm run dev`, etc.) or any other server processes. Always ask the user to start the server manually.

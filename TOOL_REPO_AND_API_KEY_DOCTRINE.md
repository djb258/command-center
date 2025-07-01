# TOOL REPO + API KEY DOCTRINE

✅ All tools created within the system (e.g. watchers, bridges, scrapers, validators) must:

- Be stored in **individual, isolated GitHub repositories**
- Contain **only the code, configs, and documentation** for that specific tool
- **NOT share codebases, repo files, or libraries** across tools unless managed as separate modules or submodules

✅ The only shared elements permitted between tools are:

- API keys (managed securely as described below)
- Shared doctrine references (e.g. a central doctrine repo link or submodule)
- Common CI/CD templates (optional)

✅ API key management:

- **All API keys must be stored in a dedicated file named `template.env` (or similar) in each repo**
- The `template.env` file will contain example variables but no actual secrets
- Actual secrets must be managed via environment variables, encrypted vaults, or secrets managers at runtime
- All tools must be designed to read their keys from these env files or environment variables — no hard-coded keys allowed

🔒 _Purpose:_ Ensure strict modularity, clean versioning, clear auditability, and secure, reusable key management across all system components.

# Setup Guide - AI Automation Toolkit

**Quick Start: Get Running in 5 Minutes**

---

## Step 1: Install Node.js

### Windows/Mac

1. Go to: https://nodejs.org/
2. Click "LTS" (Long Term Support)
3. Download and run the installer
4. Click "Next" through the installation
5. Restart your computer

### Verify Installation

Open Terminal (Mac) or Command Prompt (Windows):

```bash
node -v
```

You should see something like: `v20.11.0`

```bash
npm -v
```

You should see something like: `10.2.4`

---

## Step 2: Extract the Toolkit

1. Find the downloaded ZIP file
2. Right-click → "Extract All" (Windows) or double-click (Mac)
3. Extract to a folder you'll remember (e.g., `AI-Toolkit`)

---

## Step 3: Run Your First Tool

### Example: Headline Magic

1. Open Terminal/Command Prompt
2. Navigate to the tool:
   ```bash
   cd AI-Toolkit/headline-magic
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the tool:
   ```bash
   node index.js "your topic here"
   ```

### Example Output:
```
✨ Headline Magic - Viral Title Generator

Topic: weight loss

🔥 Generated Titles:

1. "I Lost 20lbs in 3 Months With These 5 Habits"
2. "The ONE Thing Nobody Tells You About Weight Loss"
3. "Why Your Diet Isn't Working (And What Actually Does)"
4. "From Size 12 to Size 6: My Journey"
5. "Doctors Hate This One Weird Trick..."

💡 Tip: Use numbers and curiosity gaps for higher CTR!
```

---

## Step 4: Explore Other Tools

Each tool is in its own folder:

```
AI-Toolkit/
├── airdrop-checker/
├── whale-tracker/
├── meme-safe-scanner/
├── crypto-whale-alert/
├── headline-magic/
├── essay-outline-builder/
├── prompt-polisher/
├── ai-avatar-generator/
├── amazon-niche-finder/
├── amazon-fba-calculator/
├── amazon-ppc-optimizer/
└── amazon-keyword-tracker/
```

To use any tool:
```bash
cd [tool-name]
npm install
node index.js [your-input]
```

---

## Common Issues & Solutions

### Issue: "node: command not found"

**Solution**: Node.js not installed or not in PATH
- Reinstall Node.js from https://nodejs.org/
- Restart your computer
- Try again

### Issue: "npm install" takes forever

**Solution**: Slow internet or npm server issue
- Wait patiently (first time can take 5-10 minutes)
- Or try: `npm install --registry https://registry.npmmirror.com`

### Issue: "Cannot find module"

**Solution**: Dependencies not installed
- Run `npm install` again
- Delete `node_modules` folder and run `npm install`

### Issue: Tool runs but gives errors

**Solution**: Check the input format
- Read the tool's README.md for usage examples
- Make sure input is in correct format

---

## Getting Help

### Email Support
- support@youremail.com
- Response within 24 hours

### Discord Community
- [Your Discord invite link]
- Get help from other users
- Share your results

### Video Tutorials
- [Your YouTube playlist link]
- Step-by-step walkthroughs

---

## Next Steps

1. ✅ Try all 12 tools
2. ✅ Watch the video tutorials
3. ✅ Join the Discord community
4. ✅ Start using tools for your business
5. ✅ Or offer services on Fiverr/Upwork

---

## Monetization Ideas

### Freelance Services
- **Airdrop Checks**: $15-50 per report (Fiverr/Upwork)
- **Headline Writing**: $50-200 per project
- **Amazon Research**: $100-500 per analysis

### Resell the Toolkit
- Sell on Gumroad yourself (Pro bundle includes resell rights)
- Price at $49-99
- Keep 100% of profits

### Build a Service Business
- Offer "AI Automation Consulting"
- Charge $200-500/hour
- Use these tools to deliver results

---

**Happy Automating! 🚀**

*Last updated: March 2026*

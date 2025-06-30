# Firebase Setup Guide - Fix Your Private Key

## 🚨 Current Issue

Your Firebase private key is malformed, causing the error:

```
Failed to parse private key: Error: Only 8, 16, 24, or 32 bits supported: 88
```

## 🔧 Step-by-Step Fix

### Step 1: Get Your Firebase Service Account Key

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project (or create one)

2. **Navigate to Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

3. **Go to Service Accounts Tab**
   - Click "Service accounts" tab
   - Click "Firebase Admin SDK"

4. **Generate New Private Key**
   - Click "Generate new private key"
   - Click "Generate key"
   - **IMPORTANT**: This downloads a JSON file

### Step 2: Extract the Private Key

1. **Open the downloaded JSON file**
   - It will look like this:

   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "abc123...",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
     "client_id": "123456789",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com"
   }
   ```

2. **Copy the values you need**:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

### Step 3: Update Your .env File

Replace these lines in your `.env` file:

```bash
# ❌ WRONG (placeholder values)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# ✅ CORRECT (real values from your JSON file)
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### Step 4: Test the Fix

Run this command to test your Firebase connection:

```bash
npm run deerflow-orchestrate:test
```

## 🔍 Verification Steps

### Quick Check

```bash
npm run deerflow-config:check
```

### Full Test

```bash
npm run deerflow-orchestrate:test
```

## 🚨 Common Mistakes to Avoid

1. **Don't use placeholder text** - Use the actual values from your JSON file
2. **Don't remove the quotes** - Keep the private key in quotes
3. **Don't change the format** - Keep the `\n` characters in the private key
4. **Don't share your private key** - Keep it secure and never commit to git

## 🔒 Security Notes

- ✅ Your `.env` file should be in `.gitignore`
- ✅ Never commit the service account JSON file
- ✅ The private key is sensitive - keep it secure
- ✅ You can regenerate the key anytime in Firebase Console

## 🆘 Still Having Issues?

If you're still getting errors after following these steps:

1. **Check the private key format** - Make sure it starts with `-----BEGIN PRIVATE KEY-----` and ends with `-----END PRIVATE KEY-----`
2. **Verify the project ID** - Make sure it matches your Firebase project
3. **Check the client email** - Should end with `@your-project.iam.gserviceaccount.com`
4. **Test with a simple Firebase script** - Create a minimal test to verify the connection

## 📞 Need Help?

If you need assistance:

1. Check that your Firebase project has Firestore enabled
2. Verify your service account has the necessary permissions
3. Make sure you're using the correct project ID

---

**Once you've updated your .env file with the real Firebase credentials, run:**

```bash
npm run deerflow-orchestrate:test
```

This will test the full orchestration system with Firebase whiteboard integration!

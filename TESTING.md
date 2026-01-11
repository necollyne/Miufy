# Testing Checklist for Miufy

## Prerequisites
- [ ] Backend server restarted (to apply environment variable changes)
- [ ] Both backend and Expo are running
- [ ] Mobile device/emulator on same Wi-Fi network

---

## Test 1: Backend Server Status

**Command:**
```bash
cd Miufy-Backend
node server.js
```

**Expected Output:**
```
✅ MiufyDB Connected
🚀 Server live on 0.0.0.0:5000
📱 Access from your device using your local IP on port 5000
```

✅ **Pass** if you see all three messages  
❌ **Fail** if you see connection errors

---

## Test 2: API Endpoint Connectivity

**Test from browser or Postman:**
```
GET http://192.168.1.15:5000/api/notes/test123
```

**Expected:** JSON response (even if empty array `[]`)  
❌ **Fail:** Connection refused or timeout

---

## Test 3: User Authentication

1. Open the app in Expo Go
2. Navigate to **Sign Up** screen
3. Create a test account:
   - Email: `test@example.com`
   - Display Name: `TestUser`
   - Password: `test123`

**Expected:** Success message, redirected to login  
❌ **Fail:** "Cannot connect to server" error

4. Navigate to **Login** screen
5. Log in with the test credentials

**Expected:** Redirected to Home tab  
❌ **Fail:** "Wrong password" or connection error

---

## Test 4: Notes Functionality

1. Navigate to **Notes** tab
2. Tap the **+** button to create a new note
3. Type some test content
4. Tap the **checkmark** to save

**Expected:** Note appears in the list  
❌ **Fail:** Error saving note

5. Tap on the note to edit it
6. Modify the content and save again

**Expected:** Changes persist  
❌ **Fail:** Content doesn't update

7. Tap the **trash icon** to delete the note

**Expected:** Note removed from list  
❌ **Fail:** Note still visible

---

## Test 5: Network Switching

1. Note your current Wi-Fi IP: `192.168.1.15`
2. Disconnect and reconnect to Wi-Fi
3. Run `ipconfig` to check if IP changed
4. If IP changed, update `constants/config.ts`:
   ```typescript
   return 'http://NEW_IP:5000/api';
   ```
5. Reload the Expo app (shake device → Reload)
6. Test login and notes again

**Expected:** App continues to work with new IP  
❌ **Fail:** Connection errors

---

## Test 6: Undo/Redo in Notes

1. Create a new note
2. Type: "First line"
3. Tap **Undo** button (arrow-undo icon)

**Expected:** Text reverts to empty  
❌ **Fail:** Undo doesn't work

4. Tap **Redo** button (arrow-redo icon)

**Expected:** "First line" reappears  
❌ **Fail:** Redo doesn't work

---

## Troubleshooting

### "Cannot connect to server"
1. Check backend is running: `node server.js`
2. Verify IP address matches in `config.ts`
3. Check Windows Firewall allows Node.js
4. Ensure both devices on same Wi-Fi

### "PayloadTooLargeError"
- Should be fixed (10MB limit already set)
- If still occurs, check server.js lines 13-14

### Backend won't start
1. Check if another process is using port 5000:
   ```powershell
   Get-NetTCPConnection -LocalPort 5000
   ```
2. Kill the process or change PORT in `.env`

### TypeScript errors in VS Code
1. Reload VS Code: `Ctrl+Shift+P` → "Reload Window"
2. Check imports are correct
3. Run `npm install` to ensure dependencies

---

## Next Steps After Testing

Once basic functionality is verified:

1. **Deploy Backend to Cloud** (Render, Railway, Heroku)
2. **Update Production URL** in `constants/config.ts`
3. **Implement Video Timestamps** (Phase 3)
4. **Add Image Upload** (Phase 4)

See `implementation_plan.md` for detailed plans.

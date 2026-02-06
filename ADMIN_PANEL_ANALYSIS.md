# 🔍 Admin Panel Access - Complete Analysis

**Date:** February 7, 2026, 2:10 AM  
**Issue:** User cannot access admin panel despite role being set to ADMIN

---

## 📊 Current Status

### ✅ What's Working:
1. Database tables created successfully (6 admin tables)
2. Sample data inserted (5 partners, 4 outlets, 2 activation requests)
3. User role updated from `owner` to `ADMIN`
4. Server running on port 3002
5. Admin pages exist in `pages/admin/`
6. API endpoints created

### ❌ What's NOT Working:
- User cannot see "Admin Panel" button in burger menu
- Clicking dashboard redirects to landing page instead of admin panel

---

## 🔬 Root Cause Analysis

### **Issue 1: Session Not Updated**

**Problem:**
- User role was changed in database to `ADMIN`
- BUT session still contains old role (`owner`)
- NextAuth uses JWT tokens which are cached

**Why This Happens:**
```typescript
// In [...nextauth].ts
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 days - token cached for 30 days!
}
```

**Impact:**
- Even after database update, session.user.role still returns `owner`
- BurgerMenu checks `session.user?.role` which is still `owner`
- Admin Panel button doesn't show because condition fails:
```typescript
{(session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN') && (
  // This never renders because session.user.role is still 'owner'
)}
```

### **Issue 2: Session Refresh Required**

**Current Flow:**
1. ✅ Database: role = `ADMIN` 
2. ❌ JWT Token: role = `owner` (cached)
3. ❌ Session: role = `owner` (from JWT)
4. ❌ UI: No admin button (checks session)

**Required Flow:**
1. ✅ Database: role = `ADMIN`
2. ✅ Logout (destroys old JWT)
3. ✅ Login (creates new JWT with role = `ADMIN`)
4. ✅ Session: role = `ADMIN`
5. ✅ UI: Admin button appears

---

## 🎯 Solutions

### **Solution 1: Force Logout/Login (REQUIRED)**

**Steps:**
1. Open browser at http://localhost:3002
2. Click burger menu → Logout
3. Login again with `demo@bedagang.com`
4. Session will now have role = `ADMIN`
5. Admin Panel button will appear

**Why This Works:**
- Logout destroys old JWT token
- Login creates new JWT with updated role from database
- Session callback gets new role value

### **Solution 2: Clear Browser Cookies (Alternative)**

If logout doesn't work:
1. Open DevTools (F12)
2. Application → Cookies
3. Delete `next-auth.session-token`
4. Refresh page
5. Login again

### **Solution 3: Verify Session in Browser**

Check current session in browser console:
```javascript
// Open DevTools Console (F12)
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => console.log('Current session:', data));
```

Should show:
```json
{
  "user": {
    "email": "demo@bedagang.com",
    "name": "Demo User",
    "role": "ADMIN"  // ← This should be ADMIN, not owner
  }
}
```

---

## 🔧 Technical Details

### **Authentication Flow:**

```
1. User Login
   ↓
2. NextAuth authorize() → Returns user with role from DB
   ↓
3. jwt() callback → Stores role in JWT token
   ↓
4. session() callback → Adds role to session object
   ↓
5. Frontend gets session.user.role
   ↓
6. BurgerMenu checks role → Shows/hides Admin Panel button
```

### **The Problem:**

```
Old Session (Before Role Update):
JWT Token: { role: "owner" }
Session: { user: { role: "owner" } }
UI: No Admin Panel button ❌

New Session (After Logout/Login):
JWT Token: { role: "ADMIN" }
Session: { user: { role: "ADMIN" } }
UI: Admin Panel button appears ✅
```

### **Code References:**

**1. NextAuth Session Callback** (`pages/api/auth/[...nextauth].ts:84-90`):
```typescript
async session({ session, token }) {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.role = token.role as string; // ← Gets role from JWT token
    session.user.businessName = token.businessName as string;
  }
  return session;
}
```

**2. BurgerMenu Role Check** (`components/landing/BurgerMenu.tsx:91-100`):
```typescript
{(session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN') && (
  <motion.button
    onClick={() => handleNavigation('/admin')}
    className="w-full flex items-center space-x-3 text-white hover:bg-white/10 rounded-lg p-3 transition-colors border border-white/30"
    whileHover={{ x: 5 }}
  >
    <LayoutDashboard className="w-5 h-5" />
    <span className="font-medium">Admin Panel</span>
  </motion.button>
)}
```

**3. Admin Page Protection** (`pages/admin/index.tsx:51-65`):
```typescript
useEffect(() => {
  if (status === 'unauthenticated') {
    router.push('/login');
    return;
  }

  if (session && !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role as string)) {
    router.push('/'); // ← Redirects to landing if not admin
    return;
  }

  if (status === 'authenticated') {
    fetchDashboardStats();
  }
}, [status, session, router]);
```

---

## 📋 Verification Checklist

After logout/login, verify:

- [ ] Database role is `ADMIN`:
  ```bash
  node scripts/check-user-status.js
  ```

- [ ] Session role is `ADMIN`:
  ```javascript
  // In browser console
  fetch('/api/auth/session').then(r => r.json()).then(console.log)
  ```

- [ ] Admin Panel button appears in burger menu

- [ ] Can access `/admin` without redirect

- [ ] Dashboard shows statistics

---

## 🚨 Common Mistakes

### ❌ **Mistake 1: Not Logging Out**
- Changing role in database doesn't update session
- Must logout/login to refresh JWT token

### ❌ **Mistake 2: Checking Wrong Port**
- Main app: port 3001
- Admin app: port 3002
- Make sure you're on the right port

### ❌ **Mistake 3: Browser Cache**
- Old session cached in browser
- Clear cookies or use incognito mode

### ❌ **Mistake 4: Case Sensitivity**
- Role must be exactly `ADMIN` (uppercase)
- Not `admin`, `Admin`, or `administrator`

---

## 🎯 Step-by-Step Fix

### **For User: demo@bedagang.com**

```bash
# 1. Verify role is ADMIN in database
node scripts/check-user-status.js
# Output should show: ✅ 1  Demo User  demo@bedagang.com  ADMIN

# 2. Open browser
# http://localhost:3002

# 3. Logout
# Click burger menu → Logout

# 4. Login again
# Email: demo@bedagang.com
# Password: (your password)

# 5. Check burger menu
# "Admin Panel" button should now appear

# 6. Click "Admin Panel"
# Should go to /admin dashboard

# 7. Verify in console (F12)
fetch('/api/auth/session').then(r => r.json()).then(console.log)
# Should show: { user: { role: "ADMIN" } }
```

---

## 🔮 Expected Behavior After Fix

### **Before Logout/Login:**
```
Burger Menu:
├── Beranda
├── Dashboard
└── Logout
```

### **After Logout/Login:**
```
Burger Menu:
├── Beranda
├── Dashboard
├── Admin Panel ← NEW! (with border)
└── Logout
```

### **Clicking Admin Panel:**
```
Current URL: http://localhost:3002/
Click "Admin Panel"
→ Redirects to: http://localhost:3002/admin
→ Shows: Dashboard with statistics
```

---

## 💡 Why This Happened

1. **Initial Setup:**
   - User created with role `owner`
   - Logged in → JWT token created with role `owner`

2. **Role Update:**
   - Database updated: role = `ADMIN`
   - BUT JWT token still has: role = `owner`

3. **Session Mismatch:**
   - Database says: `ADMIN` ✅
   - Session says: `owner` ❌
   - UI checks session → No admin access

4. **Fix:**
   - Logout → Destroys old JWT
   - Login → Creates new JWT with `ADMIN`
   - Session updated → Admin access granted

---

## 🎓 Key Learnings

1. **JWT Tokens are Cached**
   - Changing database doesn't update active sessions
   - Always require logout/login after role changes

2. **Session vs Database**
   - Session = What user currently has (cached)
   - Database = Source of truth (updated)
   - Must sync them via logout/login

3. **Role-Based Access Control**
   - Frontend checks `session.user.role`
   - Backend checks database role
   - Both must match for proper access

---

## ✅ Final Solution

**The ONLY thing user needs to do:**

1. **Logout** from current session
2. **Login** again with same credentials
3. **Admin Panel button** will appear
4. **Click it** to access admin dashboard

That's it! The role is already `ADMIN` in database. Just need to refresh the session.

---

**Status:** ✅ Analysis Complete  
**Next Action:** User must logout and login to refresh session  
**Expected Result:** Admin Panel access granted

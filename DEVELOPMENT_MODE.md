# Development vs Production Mode - Quick Guide

## What Just Happened?

You encountered 500 errors because of the security fix we implemented. Here's what happened:

### The Security Fix

We added a check to `get_optional_user()` that **blocks authentication bypass in production mode**:

```python
# backend/api/auth.py
async def get_optional_user(db: Session = Depends(get_db)) -> User:
    # SECURITY CHECK: Prevent use in production
    if not settings.DEBUG:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication bypass attempted in production mode..."
        )
```

### The Problem

Analytics routes use `get_optional_user()` for convenience during development:

```python
# backend/api/routes/analytics.py
@router.get("/overview")
async def get_overview_stats(
    current_user: User = Depends(get_optional_user),  # ← This was blocked!
    db: Session = Depends(get_db)
):
```

When `DEBUG=false` (or not set), the security check blocks these requests → 500 errors.

---

## The Fix

Added `DEBUG=true` to your `.env` file:

```env
DEBUG=true  # ← This line was added
```

**Now restart your backend** and it will work!

---

## Development vs Production Modes

### Development Mode (`DEBUG=true`)

✅ **Use this for local development and testing**

```env
DEBUG=true
SECRET_KEY=your-secret-key  # Weak key OK for dev
ENCRYPTION_KEY=<any-key>
```

**Features:**
- `get_optional_user()` works (no authentication needed)
- Detailed error messages
- Auto-reload on code changes (if using `--reload`)
- Warnings about weak keys (not errors)

### Production Mode (`DEBUG=false`)

🔒 **Use this for deployment**

```env
DEBUG=false
SECRET_KEY=<strong-generated-key>  # MUST be strong
ENCRYPTION_KEY=<strong-generated-key>  # MUST be set
```

**Features:**
- `get_optional_user()` **blocked** (raises exception)
- Must use proper JWT authentication
- Strong keys **required** (raises error if weak)
- No auto-reload
- Minimal error details (security)

---

## How to Switch Modes

### For Development (Current Setup)

```env
DEBUG=true
```

Restart backend:
```powershell
# Stop with Ctrl+C, then:
python main.py --mode headless
```

### For Production Deployment

1. **Generate strong keys:**
   ```powershell
   # SECRET_KEY
   openssl rand -hex 32
   
   # ENCRYPTION_KEY
   python -c "from api.utils.encryption import EncryptionManager; print(EncryptionManager.generate_key())"
   ```

2. **Update `.env`:**
   ```env
   DEBUG=false
   SECRET_KEY=<generated-secret-key>
   ENCRYPTION_KEY=<generated-encryption-key>
   ```

3. **Update analytics routes** to use proper authentication:
   ```python
   # Change from:
   current_user: User = Depends(get_optional_user)
   
   # To:
   current_user: User = Depends(get_current_active_user)
   ```

---

## Current Status

✅ **Your setup is now configured for DEVELOPMENT**

- `DEBUG=true` in `.env`
- Analytics endpoints will work
- No authentication required for testing
- Perfect for local development

⚠️ **Before production deployment:**
- Set `DEBUG=false`
- Generate strong keys
- Update analytics routes to use proper auth
- Test with real JWT authentication

---

## Testing the Fix

1. **Restart backend:**
   ```powershell
   # Stop current backend (Ctrl+C)
   python main.py --mode headless
   ```

2. **Run Python client:**
   ```powershell
   # In new terminal
   python examples\python_client.py
   ```

3. **Expected output:**
   ```
   🔐 Logging in...
   ✓ Logged in successfully!
   
   📊 Fetching overview statistics...
   ✓ Overview retrieved:
      Active hours today: 0.00
      Sessions today: 0
      Apps tracked: 0
   ```

---

## Summary

| Mode | DEBUG | Authentication | Keys | Use Case |
|------|-------|----------------|------|----------|
| **Development** | `true` | Optional | Weak OK | Local testing |
| **Production** | `false` | Required | Strong required | Deployment |

**Current mode:** Development ✅  
**Action needed:** Restart backend to apply changes

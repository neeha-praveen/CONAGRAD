const AuditLog = require("../Models/AuditLogs");

// Fields that should NEVER be logged (even if accidentally passed in)
const SENSITIVE_KEYS = [
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "email",
  "message",
  "file",
  "fileContent"
];

// Helper to deep-sanitize objects recursively
function sanitize(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const clean = {};
  for (const key in obj) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      clean[key] = "[REDACTED]";
    } else if (typeof obj[key] === "object") {
      clean[key] = sanitize(obj[key]);
    } else if (typeof obj[key] === "string" && obj[key].length > 200) {
      // Avoid storing large strings (e.g., message text)
      clean[key] = "[TRUNCATED]";
    } else {
      clean[key] = obj[key];
    }
  }
  return clean;
}

async function logAction(req, action, details = {}) {
  
  try {
    // Sanitize user-provided data
    const safeDetails = sanitize(details);

    const userModel = req.userType?.toLowerCase() === "expert" ? "Expert" : "Student";

    await AuditLog.create({
      userId: req.userId || null,
      userModel: userModel,
      action,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      details: safeDetails,
      timestamp: new Date(),
    });
    
    console.error("✅ AuditLog created successfully");
  } catch (err) {
    console.error("❌ Audit log error:", err.message, err);
  }
}

module.exports = logAction;

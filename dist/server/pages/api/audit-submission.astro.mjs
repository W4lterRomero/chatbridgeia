export { renderers } from '../../renderers.mjs';

function sanitizeString(input) {
  if (typeof input !== "string") return null;
  let sanitized = input.trim();
  sanitized = sanitized.replace(/<[^>]*>/g, "").replace(/javascript:/gi, "").replace(/on\w+=/gi, "");
  return sanitized;
}
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}
function isValidString(str, minLength = 1, maxLength = 500) {
  return str.length >= minLength && str.length <= maxLength;
}
const N8N_WEBHOOK_URL = "https://n8n.chatbridgeia.com/webhook/new_register";
async function sendToN8N(leadData) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1e4);
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...leadData,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        source: "chatbridge-website",
        webhook_version: "1.0"
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      console.log("[N8N] Lead sent successfully to webhook");
      return true;
    } else {
      console.error("[N8N] Webhook returned error:", response.status);
      return false;
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[N8N] Webhook timeout after 10s");
    } else {
      console.error("[N8N] Failed to send to webhook:", error);
    }
    return false;
  }
}
const POST = async ({ request }) => {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON body",
          code: "INVALID_JSON"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const errors = [];
    const name = sanitizeString(body.name);
    if (!name) {
      errors.push({ field: "name", message: "El nombre es requerido" });
    } else if (!isValidString(name, 2, 100)) {
      errors.push({ field: "name", message: "El nombre debe tener entre 2 y 100 caracteres" });
    }
    const email = sanitizeString(body.email);
    if (!email) {
      errors.push({ field: "email", message: "El correo electrónico es requerido" });
    } else if (!isValidEmail(email)) {
      errors.push({ field: "email", message: "Formato de correo electrónico inválido" });
    }
    const phone = sanitizeString(body.phone);
    if (!phone) {
      errors.push({ field: "phone", message: "El número de teléfono es requerido" });
    } else if (!isValidPhone(phone)) {
      errors.push({ field: "phone", message: "Formato de teléfono inválido" });
    }
    const painPoint = sanitizeString(body.painPoint);
    if (!painPoint) {
      errors.push({ field: "painPoint", message: "Selecciona tu principal problema" });
    } else if (!isValidString(painPoint, 1, 200)) {
      errors.push({ field: "painPoint", message: "Problema inválido" });
    }
    const otherDescription = sanitizeString(body.otherDescription) || "";
    if (painPoint === "otro" && !otherDescription) {
      errors.push({ field: "otherDescription", message: "Por favor describe tu problema" });
    } else if (otherDescription && !isValidString(otherDescription, 5, 1e3)) {
      errors.push({ field: "otherDescription", message: "La descripción debe tener entre 5 y 1000 caracteres" });
    }
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          errors
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    console.log("[AUDIT-SUBMISSION] New lead received:", {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      name,
      email: email?.split("@")[0] + "@***",
      // Masked for logs
      phone: phone?.slice(0, 4) + "****" + phone?.slice(-2),
      // Masked for logs
      painPoint,
      hasOtherDescription: !!otherDescription,
      ip: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent")?.slice(0, 50) || "unknown"
    });
    const leadData = {
      id: `lead_${Date.now()}`,
      name,
      email,
      phone,
      painPoint,
      otherDescription: otherDescription || null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      source: "audit-terminal"
    };
    const webhookSent = await sendToN8N(leadData);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Datos recibidos correctamente. Te contactamos pronto.",
        leadId: leadData.id
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Security headers
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY"
        }
      }
    );
  } catch (error) {
    console.error("[AUDIT-SUBMISSION] Server error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        code: "SERVER_ERROR"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
const ALL = async () => {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Method not allowed",
      code: "METHOD_NOT_ALLOWED"
    }),
    {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Allow": "POST"
      }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    ALL,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

export { renderers } from '../../renderers.mjs';

function sanitizeString(input) {
  if (typeof input !== "string") return null;
  let sanitized = input.trim();
  sanitized = sanitized.replace(/<[^>]*>/g, "").replace(/javascript:/gi, "").replace(/on\w+=/gi, "");
  return sanitized;
}
function isValidWhatsApp(phone) {
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}
function isValidString(str, minLength = 1, maxLength = 500) {
  return str.length >= minLength && str.length <= maxLength;
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
    const whatsapp = sanitizeString(body.whatsapp);
    if (!whatsapp) {
      errors.push({ field: "whatsapp", message: "El WhatsApp es requerido" });
    } else if (!isValidWhatsApp(whatsapp)) {
      errors.push({ field: "whatsapp", message: "Formato de WhatsApp inválido" });
    }
    const painPoint = sanitizeString(body.painPoint);
    if (!painPoint) {
      errors.push({ field: "painPoint", message: "Selecciona tu principal problema" });
    } else if (!isValidString(painPoint, 1, 200)) {
      errors.push({ field: "painPoint", message: "Problema inválido" });
    }
    const business = sanitizeString(body.business) || "";
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
      whatsapp: whatsapp?.slice(0, 4) + "****" + whatsapp?.slice(-2),
      // Masked for logs
      painPoint,
      business: business || "N/A",
      ip: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent")?.slice(0, 50) || "unknown"
    });
    const leadData = {
      id: `lead_${Date.now()}`,
      name,
      whatsapp,
      painPoint,
      business,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      source: "audit-terminal"
    };
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

/**
 * API Endpoint: /api/audit-submission
 * 
 * Secure POST endpoint for capturing leads from AuditTerminal form.
 * All validation happens server-side to prevent client-side tampering.
 * 
 * @security
 * - Input validation with strict type checking
 * - Sanitization of string inputs
 * - Rate limiting ready (TODO: implement in production)
 */

import type { APIRoute } from 'astro';

// Type definitions for request body
interface AuditSubmissionBody {
    name: string;
    whatsapp: string;
    painPoint: string;
    business?: string;
}

// Validation error response type
interface ValidationError {
    field: string;
    message: string;
}

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
function sanitizeString(input: unknown): string | null {
    if (typeof input !== 'string') return null;

    // Trim whitespace
    let sanitized = input.trim();

    // Remove potentially dangerous characters/patterns
    sanitized = sanitized
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove event handlers

    return sanitized;
}

/**
 * Validate phone number format (basic validation)
 */
function isValidWhatsApp(phone: string): boolean {
    // Allow formats: +503 7000-0000, +1234567890, 70000000
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate that string is not empty and within reasonable length
 */
function isValidString(str: string, minLength = 1, maxLength = 500): boolean {
    return str.length >= minLength && str.length <= maxLength;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        // Parse JSON body
        let body: Partial<AuditSubmissionBody>;

        try {
            body = await request.json();
        } catch {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Invalid JSON body',
                    code: 'INVALID_JSON'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Collect validation errors
        const errors: ValidationError[] = [];

        // ========================================
        // STEP 1: Validate required fields exist
        // ========================================

        // Validate 'name' field
        const name = sanitizeString(body.name);
        if (!name) {
            errors.push({ field: 'name', message: 'El nombre es requerido' });
        } else if (!isValidString(name, 2, 100)) {
            errors.push({ field: 'name', message: 'El nombre debe tener entre 2 y 100 caracteres' });
        }

        // Validate 'whatsapp' field
        const whatsapp = sanitizeString(body.whatsapp);
        if (!whatsapp) {
            errors.push({ field: 'whatsapp', message: 'El WhatsApp es requerido' });
        } else if (!isValidWhatsApp(whatsapp)) {
            errors.push({ field: 'whatsapp', message: 'Formato de WhatsApp inválido' });
        }

        // Validate 'painPoint' field
        const painPoint = sanitizeString(body.painPoint);
        if (!painPoint) {
            errors.push({ field: 'painPoint', message: 'Selecciona tu principal problema' });
        } else if (!isValidString(painPoint, 1, 200)) {
            errors.push({ field: 'painPoint', message: 'Problema inválido' });
        }

        // Optional: business name
        const business = sanitizeString(body.business) || '';

        // Return validation errors if any
        if (errors.length > 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    errors
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // ========================================
        // STEP 2: Logging (Development only)
        // ========================================

        // TODO: En producción, evitar loguear PII (Datos personales) sin encriptar.
        // Considerar usar un servicio de logging seguro como Datadog, Sentry, etc.
        // que cumpla con GDPR/CCPA.
        console.log('[AUDIT-SUBMISSION] New lead received:', {
            timestamp: new Date().toISOString(),
            name,
            whatsapp: whatsapp?.slice(0, 4) + '****' + whatsapp?.slice(-2), // Masked for logs
            painPoint,
            business: business || 'N/A',
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent')?.slice(0, 50) || 'unknown'
        });

        // ========================================
        // STEP 3: Store lead data
        // ========================================

        // TODO: En producción, guardar en base de datos
        // Ejemplo: await db.leads.create({ name, whatsapp, painPoint, business });

        // For now, we'll just simulate success
        const leadData = {
            id: `lead_${Date.now()}`,
            name,
            whatsapp,
            painPoint,
            business,
            createdAt: new Date().toISOString(),
            source: 'audit-terminal'
        };

        // ========================================
        // STEP 4: Return success response
        // ========================================

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Datos recibidos correctamente. Te contactamos pronto.',
                leadId: leadData.id
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    // Security headers
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY'
                }
            }
        );

    } catch (error) {
        // Log error securely (sin exponer detalles al cliente)
        console.error('[AUDIT-SUBMISSION] Server error:', error);

        return new Response(
            JSON.stringify({
                success: false,
                error: 'Internal server error',
                code: 'SERVER_ERROR'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};

// Reject other methods
export const ALL: APIRoute = async () => {
    return new Response(
        JSON.stringify({
            success: false,
            error: 'Method not allowed',
            code: 'METHOD_NOT_ALLOWED'
        }),
        {
            status: 405,
            headers: {
                'Content-Type': 'application/json',
                'Allow': 'POST'
            }
        }
    );
};

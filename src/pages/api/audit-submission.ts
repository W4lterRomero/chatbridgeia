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
    email: string;
    phone: string;
    painPoint: string;
    otherDescription?: string;
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
 * Validate email format
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format (basic validation)
 */
function isValidPhone(phone: string): boolean {
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

/**
 * n8n Webhook URL - Configure via environment variable
 * Set N8N_WEBHOOK_URL in your .env file (Runtime)
 */
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';

/**
 * Send lead data to n8n webhook
 * @returns true if successful, false if failed (non-blocking)
 */
async function sendToN8N(leadData: Record<string, unknown>): Promise<boolean> {
    if (!N8N_WEBHOOK_URL) {
        console.log('[N8N] Webhook URL not configured, skipping...');
        return false;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...leadData,
                timestamp: new Date().toISOString(),
                source: 'chatbridge-website',
                webhook_version: '1.0'
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            console.log('[N8N] Lead sent successfully to webhook');
            return true;
        } else {
            console.error('[N8N] Webhook returned error:', response.status);
            return false;
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error('[N8N] Webhook timeout after 10s');
        } else {
            console.error('[N8N] Failed to send to webhook:', error);
        }
        return false;
    }
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

        // Validate 'email' field
        const email = sanitizeString(body.email);
        if (!email) {
            errors.push({ field: 'email', message: 'El correo electrónico es requerido' });
        } else if (!isValidEmail(email)) {
            errors.push({ field: 'email', message: 'Formato de correo electrónico inválido' });
        }

        // Validate 'phone' field
        const phone = sanitizeString(body.phone);
        if (!phone) {
            errors.push({ field: 'phone', message: 'El número de teléfono es requerido' });
        } else if (!isValidPhone(phone)) {
            errors.push({ field: 'phone', message: 'Formato de teléfono inválido' });
        }

        // Validate 'painPoint' field
        const painPoint = sanitizeString(body.painPoint);
        if (!painPoint) {
            errors.push({ field: 'painPoint', message: 'Selecciona tu principal problema' });
        } else if (!isValidString(painPoint, 1, 200)) {
            errors.push({ field: 'painPoint', message: 'Problema inválido' });
        }

        // Validate 'otherDescription' if painPoint is 'otro'
        const otherDescription = sanitizeString(body.otherDescription) || '';
        if (painPoint === 'otro' && !otherDescription) {
            errors.push({ field: 'otherDescription', message: 'Por favor describe tu problema' });
        } else if (otherDescription && !isValidString(otherDescription, 5, 1000)) {
            errors.push({ field: 'otherDescription', message: 'La descripción debe tener entre 5 y 1000 caracteres' });
        }

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
            email: email?.split('@')[0] + '@***', // Masked for logs
            phone: phone?.slice(0, 4) + '****' + phone?.slice(-2), // Masked for logs
            painPoint,
            hasOtherDescription: !!otherDescription,
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent')?.slice(0, 50) || 'unknown'
        });

        // ========================================
        // STEP 3: Store lead data & Send to n8n
        // ========================================

        // Prepare lead data
        const leadData = {
            id: `lead_${Date.now()}`,
            name,
            email,
            phone,
            painPoint,
            otherDescription: otherDescription || null,
            createdAt: new Date().toISOString(),
            source: 'audit-terminal'
        };

        // Send to n8n webhook (non-blocking, won't fail the request if webhook fails)
        const webhookSent = await sendToN8N(leadData);

        // TODO: En producción, también guardar en base de datos
        // Ejemplo: await db.leads.create(leadData);

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

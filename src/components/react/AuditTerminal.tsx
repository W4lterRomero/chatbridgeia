/**
 * AuditTerminal.tsx
 * 
 * Secure form component that connects to /api/audit-submission
 * All validation happens server-side for security.
 * 
 * @security This component does NOT validate on client-side intentionally.
 * Server is the source of truth for validation.
 */

import { useState, type FormEvent } from 'react';

interface FormData {
    name: string;
    email: string;
    phone: string;
    painPoint: string;
    otherDescription: string;
}

interface ValidationError {
    field: string;
    message: string;
}

interface ApiResponse {
    success: boolean;
    message?: string;
    error?: string;
    errors?: ValidationError[];
    leadId?: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function AuditTerminal() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        painPoint: '',
        otherDescription: ''
    });

    const [status, setStatus] = useState<FormStatus>('idle');
    const [errorFields, setErrorFields] = useState<Set<string>>(new Set());
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const painPointOptions = [
        { value: '', label: '¿Cuál es tu mayor dolor?' },
        { value: 'mensajes', label: 'No puedo contestar todos los mensajes' },
        { value: 'excel', label: 'Pierdo tiempo copiando a Excel' },
        { value: 'horario', label: 'Pierdo ventas fuera de horario' },
        { value: 'seguimiento', label: 'No tengo tiempo para dar seguimiento' },
        { value: 'otro', label: 'Otro problema' }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error state when user starts typing
        if (errorFields.has(name)) {
            setErrorFields(prev => {
                const next = new Set(prev);
                next.delete(name);
                return next;
            });
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('loading');
        setErrorFields(new Set());
        setErrorMessage('');

        try {
            const response = await fetch('/api/audit-submission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data: ApiResponse = await response.json();

            if (!response.ok) {
                // Handle validation errors (400)
                if (response.status === 400 && data.errors) {
                    const fields = new Set(data.errors.map(err => err.field));
                    setErrorFields(fields);
                    setErrorMessage(data.errors[0]?.message || 'Por favor corrige los errores');
                } else {
                    setErrorMessage(data.error || 'Error al enviar el formulario');
                }
                setStatus('error');
                return;
            }

            // Success!
            setStatus('success');
            setSuccessMessage(data.message || '¡Datos recibidos! Te contactamos pronto.');

            // Reset form after success
            setFormData({
                name: '',
                email: '',
                phone: '',
                painPoint: '',
                otherDescription: ''
            });

        } catch (error) {
            console.error('Network error:', error);
            setErrorMessage('Error de conexión. Por favor intenta de nuevo.');
            setStatus('error');
        }
    };

    // Input class based on error state
    const getInputClass = (fieldName: string) => {
        const base = 'w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder:text-white/30 focus:outline-none transition-all duration-300';
        const normal = 'border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50';
        const error = 'border-red-500 bg-red-500/10 focus:border-red-500 focus:ring-1 focus:ring-red-500';

        return `${base} ${errorFields.has(fieldName) ? error : normal}`;
    };

    // Check if "otro" is selected
    const showOtherField = formData.painPoint === 'otro';

    // Success state
    if (status === 'success') {
        return (
            <div className="audit-terminal p-8 rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent border border-white/10 backdrop-blur-xl">
                <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">¡Recibido!</h3>
                    <p className="text-white/60 mb-6">{successMessage}</p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="px-6 py-2 text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-all"
                    >
                        Enviar otro
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="audit-terminal p-8 rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent border border-white/10 backdrop-blur-xl">
            {/* Terminal header */}
            <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                </div>
                <span className="ml-4 text-white/40 text-sm font-mono">contact-form v1.0</span>
            </div>

            {/* Terminal content */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">
                    <span className="text-blue-400">$</span> Agenda tu llamada gratis
                </h3>
                <p className="text-white/50 text-sm">
                    15 minutos para diagnosticar tu negocio
                </p>
            </div>

            {/* Error banner */}
            {status === 'error' && errorMessage && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-400 text-sm">{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        className={getInputClass('name')}
                        disabled={status === 'loading'}
                    />
                </div>

                {/* Email */}
                <div>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Tu correo electrónico"
                        className={getInputClass('email')}
                        disabled={status === 'loading'}
                    />
                </div>

                {/* Phone */}
                <div>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Tu número de teléfono (ej: +503 7000-0000)"
                        className={getInputClass('phone')}
                        disabled={status === 'loading'}
                    />
                </div>

                {/* Pain Point */}
                <div>
                    <select
                        name="painPoint"
                        value={formData.painPoint}
                        onChange={handleChange}
                        className={`${getInputClass('painPoint')} appearance-none cursor-pointer`}
                        disabled={status === 'loading'}
                    >
                        {painPointOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-gray-900">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Other Description - Only shows when "otro" is selected */}
                {showOtherField && (
                    <div className="animate-fadeIn">
                        <textarea
                            name="otherDescription"
                            value={formData.otherDescription}
                            onChange={handleChange}
                            placeholder="Describe tu problema..."
                            rows={3}
                            className={`${getInputClass('otherDescription')} resize-none`}
                            disabled={status === 'loading'}
                        />
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="group w-full relative overflow-hidden px-6 py-4 bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>

                    <span className="relative flex items-center justify-center gap-2">
                        {status === 'loading' ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Procesando...</span>
                            </>
                        ) : (
                            <>
                                <span>Solicita nuestros servicios</span>
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </>
                        )}
                    </span>
                </button>

                {/* Trust indicators */}
                <div className="flex justify-center gap-4 text-white/30 text-xs pt-2">
                    <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Datos seguros
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Sin compromiso
                    </span>
                </div>
            </form>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>
        </div>
    );
}

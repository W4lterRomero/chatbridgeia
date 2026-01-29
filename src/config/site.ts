/**
 * ChatBridge IA - Centralized Site Configuration
 * Copy orientado a CEO: puntos de dolor + beneficios claros
 */

export const SITE_CONFIG = {
    // Brand Identity
    name: 'ChatBridge IA',
    tagline: 'Automatización que Vende',

    // Hero - Golpe Directo
    heroTitle: 'Contrata Hoy, Descansa Mañana.',
    heroSubtitle: '¿Cuántos pedidos perdiste esta semana porque no pudiste contestar a tiempo? Nosotros los capturamos todos. Automáticamente.',

    // Social Proof
    socialProof: '+150 negocios ya dejaron de perder ventas',

    // Guarantee
    guarantee: '7 días de prueba',
    guaranteeText: 'Si en 7 días no ves resultados, te devolvemos cada centavo. Sin preguntas.',

    // Contact
    whatsappNumber: '+503 7000-0000',
    whatsappUrl: 'https://wa.me/5037000000?text=Hola,%20quiero%20dejar%20de%20perder%20pedidos',
    email: 'contacto@chatbridge.ia',

    // Tech Stack - NO mostrar, solo para referencia interna
    techStack: [
        { name: 'Python', icon: 'python' },
        { name: 'Docker', icon: 'docker' },
        { name: 'OpenAI', icon: 'openai' },
        { name: 'Twilio', icon: 'twilio' }
    ],

    // Platform Stack - Enterprise partners (credibilidad)
    platformStack: [
        { name: 'Meta', icon: 'meta' },
        { name: 'Google', icon: 'google' },
        { name: 'Supabase', icon: 'supabase' },
        { name: 'n8n', icon: 'n8n' },
        { name: 'Cloudflare', icon: 'cloudflare' },
        { name: 'OpenAI', icon: 'openai' }
    ],

    // Pain Points - CEO habla directo
    painPoints: [
        {
            pain: '¿Contestas WhatsApp mientras comes?',
            agitation: 'Cada mensaje sin responder es un cliente que se va con tu competencia.',
            solution: 'Un bot que responde en 3 segundos. Siempre.'
        },
        {
            pain: '¿Copias pedidos a mano a tu Excel?',
            agitation: 'Errores, pedidos perdidos, horas muertas. Tu tiempo vale más.',
            solution: 'Sincronización automática. Cero errores.'
        },
        {
            pain: '¿Cierras ventas a las 2am?',
            agitation: 'Tu negocio duerme cuando tú duermes. Y pierdes dinero.',
            solution: 'Ventas 24/7. Tú descansas, nosotros vendemos.'
        }
    ],

    // Benefits - Las 3 promesas
    benefits: [
        {
            title: 'Ahorra Tiempo',
            description: 'Deja de contestar los mismos mensajes una y otra vez. El bot responde por ti, tú haces lo que importa.',
            stat: '3hrs',
            statLabel: 'ahorradas cada día',
            icon: 'clock'
        },
        {
            title: 'Ahorra Dinero',
            description: 'Elimina procesos repetitivos que drenan tu nómina. Un bot hace el trabajo de 3 empleados, 24/7.',
            stat: '70%',
            statLabel: 'menos costos operativos',
            icon: 'money'
        },
        {
            title: 'Concéntrate en lo que Importa',
            description: 'Tu tiempo es para estrategia, familia, crecimiento. No para copiar pedidos a Excel.',
            stat: '100%',
            statLabel: 'enfoque en crecer',
            icon: 'focus'
        }
    ],

    // Services - Vendidos como soluciones
    services: [
        {
            title: 'Bot de Ventas WhatsApp',
            description: 'Captura pedidos automáticamente, envía menú, confirma órdenes. Trabaja mientras duermes.',
            hook: 'Nunca más "no te contesté porque estaba ocupado"',
            featured: true
        },
        {
            title: 'Pedidos a Excel Automático',
            description: 'Cada pedido de WhatsApp va directo a tu hoja de cálculo. Organizado, sin errores, instantáneo.',
            hook: 'Adiós a copiar y pegar',
            featured: false
        },
        {
            title: 'Reportes Inteligentes',
            description: 'Sabe qué vendes más, cuándo, y a quién. Decisiones basadas en datos, no en corazonadas.',
            hook: 'Tu negocio en números claros',
            featured: false
        }
    ],

    // Process - Simple y confiable
    process: [
        {
            step: 1,
            title: 'Nos Cuentas',
            description: 'Una llamada de 15 minutos. Entendemos tu negocio, tus dolores, tus metas.'
        },
        {
            step: 2,
            title: 'Lo Construimos',
            description: 'En 5 días hábiles tienes tu sistema funcionando. Sin que tú hagas nada.'
        },
        {
            step: 3,
            title: 'Tú Descansas',
            description: 'Empieza a capturar ventas automáticamente. Nosotros monitoreamos todo.'
        }
    ],

    // Problem/Solution - Contraste dramático
    problem: {
        title: 'Tu Día Hoy',
        points: [
            'Despiertas y ya tienes 20 mensajes sin leer',
            'Pierdes pedidos porque tardaste en contestar',
            'Pasas 3 horas copiando datos a Excel',
            'Cierras el negocio agotado, no realizado'
        ]
    },
    solution: {
        title: 'Tu Día con Nosotros',
        points: [
            'Cada mensaje respondido en segundos',
            'Cero pedidos perdidos, nunca más',
            'Excel actualizado sin tocar el teclado',
            'Tiempo para estrategia, familia, vida'
        ]
    },

    // CTA Copy
    ctaPrimary: 'Quiero Dejar de Perder Ventas',
    ctaSecondary: 'Ver Cómo Funciona',

    // Objection Handlers
    objections: [
        {
            objection: '¿Y si no funciona?',
            answer: '7 días de prueba. Si no ves resultados, te devolvemos todo. Cero riesgo.'
        },
        {
            objection: '¿Es muy técnico?',
            answer: 'Nosotros hacemos todo. Tú solo recibes los pedidos organizados.'
        },
        {
            objection: '¿Cuánto cuesta?',
            answer: 'Menos que las ventas que pierdes cada semana sin contestar a tiempo.'
        }
    ],

    // SEO
    seo: {
        title: 'ChatBridge IA | Deja de Perder Pedidos de WhatsApp',
        description: 'Automatiza tu WhatsApp y captura cada pedido. Respuestas instantáneas 24/7, sincronización con Excel. 7 días de prueba gratis.',
        keywords: ['automatización whatsapp', 'bot whatsapp negocios', 'pedidos automaticos', 'chatbot ventas']
    }
} as const;

export type SiteConfig = typeof SITE_CONFIG;

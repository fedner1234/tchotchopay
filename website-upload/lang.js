/**
 * Tchotcho Pay — Global Language System
 * Supports: EN (English) · HT (Kreyòl Ayisyen) · FR (Français) · ES (Español)
 * Usage: Include <script src="lang.js"></script> on any secondary page.
 *        Language preference is stored in localStorage and shared across all pages.
 */
const TCHOTCHO_LANG = (() => {

  // ── TRANSLATIONS ──
  const T = {

    // ════════════════ FAQ PAGE ════════════════
    faq: {
      en: {
        page_title: "Help Center",
        badge: "Help Center",
        title: "How can we <em>help you?</em>",
        subtitle: "Find answers to common questions about sending money, cashing out, your wallet, and more.",
        search_placeholder: "Search for answers...",
        ql_sending: "Sending Money", ql_cashout: "Cash Out",
        ql_account: "My Account & KYC", ql_usdc: "USDC & Wallet",
        ql_marketplace: "Marketplace", ql_fees: "Fees & Limits",
        ql_security: "Security", ql_troubleshoot: "Troubleshooting",
        section_sending: "Sending Money", section_cashout: "Cash Out",
        section_account: "My Account & KYC", section_usdc: "USDC & Your Wallet",
        section_marketplace: "Marketplace", section_fees: "Fees & Limits",
        section_security: "Security", section_troubleshoot: "Troubleshooting",
        contact_title: "Still have questions?",
        contact_sub: "Our support team is available 8AM – 8PM EST, Monday through Saturday.",
        email_btn: "Email Support", chat_btn: "Live Chat", wa_btn: "WhatsApp",
      },
      ht: {
        page_title: "Sant Asistans",
        badge: "Sant Asistans",
        title: "Kijan nou ka <em>ede ou?</em>",
        subtitle: "Jwenn repons pou kesyon souvan sou voye lajan, retire lajan, pòtfèy ou, ak plis.",
        search_placeholder: "Chèche repons...",
        ql_sending: "Voye Lajan", ql_cashout: "Retire Lajan",
        ql_account: "Kont Mwen & KYC", ql_usdc: "USDC & Pòtfèy",
        ql_marketplace: "Maché a", ql_fees: "Frè & Limit",
        ql_security: "Sekirite", ql_troubleshoot: "Depanaj",
        section_sending: "Voye Lajan", section_cashout: "Retire Lajan",
        section_account: "Kont Mwen & KYC", section_usdc: "USDC & Pòtfèy Ou",
        section_marketplace: "Maché a", section_fees: "Frè & Limit",
        section_security: "Sekirite", section_troubleshoot: "Depanaj",
        contact_title: "Toujou gen kesyon?",
        contact_sub: "Ekip sipò nou disponib 8AM – 8PM EST, Lendi jiska Samdi.",
        email_btn: "Imèl Sipò", chat_btn: "Chat Dirèk", wa_btn: "WhatsApp",
      },
      fr: {
        page_title: "Centre d'Aide",
        badge: "Centre d'Aide",
        title: "Comment pouvons-nous vous <em>aider ?</em>",
        subtitle: "Trouvez des réponses aux questions fréquentes sur l'envoi d'argent, les retraits, votre portefeuille, et plus.",
        search_placeholder: "Rechercher des réponses...",
        ql_sending: "Envoyer de l'Argent", ql_cashout: "Retrait",
        ql_account: "Mon Compte & KYC", ql_usdc: "USDC & Portefeuille",
        ql_marketplace: "Marché", ql_fees: "Frais & Limites",
        ql_security: "Sécurité", ql_troubleshoot: "Dépannage",
        section_sending: "Envoyer de l'Argent", section_cashout: "Retrait",
        section_account: "Mon Compte & KYC", section_usdc: "USDC & Votre Portefeuille",
        section_marketplace: "Marché", section_fees: "Frais & Limites",
        section_security: "Sécurité", section_troubleshoot: "Dépannage",
        contact_title: "Encore des questions ?",
        contact_sub: "Notre équipe est disponible de 8h à 20h EST, du lundi au samedi.",
        email_btn: "Contacter le Support", chat_btn: "Chat en Direct", wa_btn: "WhatsApp",
      },
      es: {
        page_title: "Centro de Ayuda",
        badge: "Centro de Ayuda",
        title: "¿Cómo podemos <em>ayudarte?</em>",
        subtitle: "Encuentra respuestas a preguntas frecuentes sobre envíos, retiros, tu billetera y más.",
        search_placeholder: "Buscar respuestas...",
        ql_sending: "Enviar Dinero", ql_cashout: "Retiro",
        ql_account: "Mi Cuenta & KYC", ql_usdc: "USDC & Billetera",
        ql_marketplace: "Mercado", ql_fees: "Tarifas & Límites",
        ql_security: "Seguridad", ql_troubleshoot: "Solución de Problemas",
        section_sending: "Enviar Dinero", section_cashout: "Retiro",
        section_account: "Mi Cuenta & KYC", section_usdc: "USDC & Tu Billetera",
        section_marketplace: "Mercado", section_fees: "Tarifas & Límites",
        section_security: "Seguridad", section_troubleshoot: "Solución de Problemas",
        contact_title: "¿Aún tienes preguntas?",
        contact_sub: "Nuestro equipo está disponible de 8AM a 8PM EST, lunes a sábado.",
        email_btn: "Soporte por Email", chat_btn: "Chat en Vivo", wa_btn: "WhatsApp",
      },
    },

    // ════════════════ TERMS PAGE ════════════════
    terms: {
      en: {
        page_title: "Legal — Tchotcho Pay",
        badge: "Legal & Compliance",
        title: "Our <em>Legal</em> Documents",
        subtitle: "Transparency is core to Tchotcho Pay. Please read these policies carefully — they govern your use of our platform.",
        tab_tos: "Terms of Service", tab_privacy: "Privacy Policy", tab_aml: "AML & Compliance",
        last_updated: "Last updated:",
        contact_tos_title: "Questions about our Terms?",
        contact_tos_sub: "Our legal team is available to assist with any questions.",
        contact_privacy_title: "Privacy questions?",
        contact_privacy_sub: "Our Data Protection Officer will respond within 30 days.",
        contact_aml_title: "Compliance & Regulatory Inquiries",
        contact_aml_sub: "Law enforcement and regulatory agencies may contact our Compliance Officer directly.",
      },
      ht: {
        page_title: "Legal — Tchotcho Pay",
        badge: "Legal & Konfòmite",
        title: "Dokiman <em>Legal</em> Nou Yo",
        subtitle: "Transparans se fondamantal pou Tchotcho Pay. Tanpri li politik sa yo ak atansyon — yo gouvène itilizasyon ou nan platfòm nou an.",
        tab_tos: "Kondisyon Sèvis", tab_privacy: "Politik Konfidansyalite", tab_aml: "AML & Konfòmite",
        last_updated: "Dènye mizajou:",
        contact_tos_title: "Kesyon sou Kondisyon nou yo?",
        contact_tos_sub: "Ekip legal nou disponib pou reponn nenpòt kesyon.",
        contact_privacy_title: "Kesyon sou konfidansyalite?",
        contact_privacy_sub: "Ofisye Pwoteksyon Done nou pral reponn nan 30 jou.",
        contact_aml_title: "Demann Konfòmite & Regilatif",
        contact_aml_sub: "Fòs lòd ak ajans regilatè ka kontakte Ofisye Konfòmite nou dirèkteman.",
      },
      fr: {
        page_title: "Juridique — Tchotcho Pay",
        badge: "Juridique & Conformité",
        title: "Nos Documents <em>Juridiques</em>",
        subtitle: "La transparence est au cœur de Tchotcho Pay. Veuillez lire attentivement ces politiques — elles régissent votre utilisation de notre plateforme.",
        tab_tos: "Conditions d'Utilisation", tab_privacy: "Politique de Confidentialité", tab_aml: "LBC & Conformité",
        last_updated: "Dernière mise à jour :",
        contact_tos_title: "Questions sur nos Conditions ?",
        contact_tos_sub: "Notre équipe juridique est disponible pour répondre à toutes vos questions.",
        contact_privacy_title: "Questions de confidentialité ?",
        contact_privacy_sub: "Notre Délégué à la Protection des Données répondra dans les 30 jours.",
        contact_aml_title: "Demandes de conformité & réglementaires",
        contact_aml_sub: "Les autorités et agences de réglementation peuvent contacter directement notre Responsable Conformité.",
      },
      es: {
        page_title: "Legal — Tchotcho Pay",
        badge: "Legal y Cumplimiento",
        title: "Nuestros Documentos <em>Legales</em>",
        subtitle: "La transparencia es fundamental en Tchotcho Pay. Por favor lee estas políticas detenidamente — rigen tu uso de nuestra plataforma.",
        tab_tos: "Términos de Servicio", tab_privacy: "Política de Privacidad", tab_aml: "AML y Cumplimiento",
        last_updated: "Última actualización:",
        contact_tos_title: "¿Preguntas sobre nuestros Términos?",
        contact_tos_sub: "Nuestro equipo legal está disponible para responder cualquier pregunta.",
        contact_privacy_title: "¿Preguntas de privacidad?",
        contact_privacy_sub: "Nuestro Delegado de Protección de Datos responderá en 30 días.",
        contact_aml_title: "Consultas de cumplimiento y regulación",
        contact_aml_sub: "Las autoridades pueden contactar directamente a nuestro Oficial de Cumplimiento.",
      },
    },

    // ════════════════ REFERRAL PAGE ════════════════
    referral: {
      en: {
        page_title: "Referral Program — Tchotcho Pay",
        badge: "Referral Program",
        title: "Invite friends.<br/><em>Earn together.</em>",
        subtitle: "Share Tchotcho Pay with your network. You earn $5 USDC for every person who signs up and sends their first transfer. No limit on earnings.",
        you_earn: "You earn per referral", friend_gets: "Friend gets on signup", no_cap: "No earnings cap",
        get_link_btn: "Get My Referral Link", how_btn: "How It Works",
        how_title: "How it works", how_subtitle: "Three steps. No complicated rules. Just share and get paid.",
        step1_title: "Get Your Link", step1_desc: "Every account comes with a unique referral link and code. Find yours below.",
        step2_title: "Share With Friends", step2_desc: "Send your link via WhatsApp, SMS, or anywhere. Your friend gets $5 USDC when they sign up.",
        step3_title: "Earn $5 USDC", step3_desc: "Once your friend completes their first transfer of $10+, you receive $5 USDC instantly.",
        your_code_title: "Your Referral Code",
        your_code_sub: "Share this code or link — your friends enter it when signing up.",
        copy_code: "Copy Code", copy_link: "Copy Link", copied: "Copied!",
        tiers_title: "The more you share, the more you earn",
        tiers_subtitle: "Unlock bonus rewards as you hit milestones.",
        tier_starter: "Starter", tier_power: "Power Referrer", tier_ambassador: "Ambassador",
        per_referral: "per referral",
        tracker_title: "Your Referral Progress",
        tracker_sub: "Demo view — sign up to see your live stats",
        lb_title: "Top Referrers This Month",
        lb_subtitle: "Join our most active community members earning USDC every day.",
        faq_title: "Common Questions",
        share_link_btn: "Share My Link",
        join_btn: "Join Waitlist",
        earn_today: "Start earning today",
        earn_sub: "Every person you invite is money in your wallet. Share your link and watch your USDC grow.",
      },
      ht: {
        page_title: "Pwogram Referans — Tchotcho Pay",
        badge: "Pwogram Referans",
        title: "Envite zanmi.<br/><em>Genyen ansanm.</em>",
        subtitle: "Pataje Tchotcho Pay ak rezo ou. Ou genyen 5 $ USDC pou chak moun ki enskri epi voye premye transfè yo. Pa gen limit.",
        you_earn: "Ou genyen pou chak referans", friend_gets: "Zanmi ou jwenn nan enskrisyon", no_cap: "Pa gen plafon revni",
        get_link_btn: "Jwenn Lyen Referans Mwen", how_btn: "Kijan Li Mache",
        how_title: "Kijan li mache", how_subtitle: "Twa etap. Pa gen règ konplike. Jis pataje epi jwenn lajan.",
        step1_title: "Jwenn Lyen Ou", step1_desc: "Chak kont gen yon lyen referans inik. Jwenn pa ou anba a.",
        step2_title: "Pataje ak Zanmi", step2_desc: "Voye lyen ou via WhatsApp, SMS, oswa nenpòt kote. Zanmi ou jwenn 5 $ USDC lè li enskri.",
        step3_title: "Genyen 5 $ USDC", step3_desc: "Lè zanmi ou fè premye transfè $10+, ou resevwa 5 $ USDC imedyatman.",
        your_code_title: "Kòd Referans Ou",
        your_code_sub: "Pataje kòd oswa lyen sa a — zanmi ou antre li lè yo enskri.",
        copy_code: "Kopye Kòd", copy_link: "Kopye Lyen", copied: "Kopye!",
        tiers_title: "Plis ou pataje, plis ou genyen",
        tiers_subtitle: "Debloke rekonpans bonus lè ou rive nan objetif.",
        tier_starter: "Debitè", tier_power: "Referan Pwisan", tier_ambassador: "Ambassadè",
        per_referral: "pou chak referans",
        tracker_title: "Pwogrè Referans Ou",
        tracker_sub: "Apèsi demo — enskri pou wè estatistik ou an dirèk",
        lb_title: "Pi Bon Referan Mwa Sa a",
        lb_subtitle: "Rantre nan manm kominote ki pi aktif ak genyen USDC chak jou.",
        faq_title: "Kesyon Souvan",
        share_link_btn: "Pataje Lyen Mwen",
        join_btn: "Enskri",
        earn_today: "Kòmanse genyen jodi a",
        earn_sub: "Chak moun ou envite se lajan nan pòtfèy ou. Pataje lyen ou epi gade USDC ou grandi.",
      },
      fr: {
        page_title: "Programme de Parrainage — Tchotcho Pay",
        badge: "Programme de Parrainage",
        title: "Invitez des amis.<br/><em>Gagnez ensemble.</em>",
        subtitle: "Partagez Tchotcho Pay avec votre réseau. Gagnez 5 $ USDC pour chaque personne qui s'inscrit et effectue son premier transfert. Sans limite.",
        you_earn: "Vous gagnez par parrainage", friend_gets: "L'ami reçoit à l'inscription", no_cap: "Pas de plafond de gains",
        get_link_btn: "Obtenir Mon Lien de Parrainage", how_btn: "Comment Ça Marche",
        how_title: "Comment ça marche", how_subtitle: "Trois étapes. Pas de règles compliquées. Partagez et soyez payé.",
        step1_title: "Obtenez Votre Lien", step1_desc: "Chaque compte dispose d'un lien de parrainage unique. Trouvez le vôtre ci-dessous.",
        step2_title: "Partagez avec vos Amis", step2_desc: "Envoyez votre lien via WhatsApp, SMS ou n'importe où. Votre ami reçoit 5 $ USDC en s'inscrivant.",
        step3_title: "Gagnez 5 $ USDC", step3_desc: "Dès que votre ami effectue son premier transfert de 10 $+, vous recevez 5 $ USDC instantanément.",
        your_code_title: "Votre Code de Parrainage",
        your_code_sub: "Partagez ce code ou ce lien — vos amis le saisissent lors de l'inscription.",
        copy_code: "Copier le Code", copy_link: "Copier le Lien", copied: "Copié !",
        tiers_title: "Plus vous partagez, plus vous gagnez",
        tiers_subtitle: "Débloquez des récompenses bonus en atteignant vos objectifs.",
        tier_starter: "Débutant", tier_power: "Parrain Actif", tier_ambassador: "Ambassadeur",
        per_referral: "par parrainage",
        tracker_title: "Votre Progression de Parrainage",
        tracker_sub: "Vue démo — inscrivez-vous pour voir vos statistiques en direct",
        lb_title: "Meilleurs Parrains du Mois",
        lb_subtitle: "Rejoignez les membres les plus actifs qui gagnent des USDC chaque jour.",
        faq_title: "Questions Fréquentes",
        share_link_btn: "Partager Mon Lien",
        join_btn: "Rejoindre la Liste",
        earn_today: "Commencez à gagner aujourd'hui",
        earn_sub: "Chaque personne que vous invitez représente de l'argent dans votre portefeuille. Partagez et regardez vos USDC croître.",
      },
      es: {
        page_title: "Programa de Referidos — Tchotcho Pay",
        badge: "Programa de Referidos",
        title: "Invita amigos.<br/><em>Ganen juntos.</em>",
        subtitle: "Comparte Tchotcho Pay con tu red. Ganas $5 USDC por cada persona que se registre y envíe su primer transferencia. Sin límite.",
        you_earn: "Ganas por referido", friend_gets: "Tu amigo recibe al registrarse", no_cap: "Sin límite de ganancias",
        get_link_btn: "Obtener Mi Enlace de Referido", how_btn: "Cómo Funciona",
        how_title: "Cómo funciona", how_subtitle: "Tres pasos. Sin reglas complicadas. Solo comparte y cobra.",
        step1_title: "Obtén Tu Enlace", step1_desc: "Cada cuenta tiene un enlace de referido único. Encuentra el tuyo abajo.",
        step2_title: "Comparte con Amigos", step2_desc: "Envía tu enlace por WhatsApp, SMS o donde quieras. Tu amigo obtiene $5 USDC al registrarse.",
        step3_title: "Gana $5 USDC", step3_desc: "Cuando tu amigo complete su primer transferencia de $10+, recibes $5 USDC al instante.",
        your_code_title: "Tu Código de Referido",
        your_code_sub: "Comparte este código o enlace — tus amigos lo ingresan al registrarse.",
        copy_code: "Copiar Código", copy_link: "Copiar Enlace", copied: "¡Copiado!",
        tiers_title: "Cuanto más compartes, más ganas",
        tiers_subtitle: "Desbloquea recompensas adicionales al alcanzar hitos.",
        tier_starter: "Principiante", tier_power: "Referidor Activo", tier_ambassador: "Embajador",
        per_referral: "por referido",
        tracker_title: "Tu Progreso de Referidos",
        tracker_sub: "Vista demo — regístrate para ver tus estadísticas en vivo",
        lb_title: "Mejores Referidores del Mes",
        lb_subtitle: "Únete a los miembros más activos que ganan USDC todos los días.",
        faq_title: "Preguntas Frecuentes",
        share_link_btn: "Compartir Mi Enlace",
        join_btn: "Unirse a la Lista",
        earn_today: "Comienza a ganar hoy",
        earn_sub: "Cada persona que invitas es dinero en tu billetera. Comparte tu enlace y mira crecer tus USDC.",
      },
    },

    // ════════════════ THANK YOU PAGE ════════════════
    thankyou: {
      en: {
        page_title: "You're on the list! — Tchotcho Pay",
        badge: "You're in!",
        title: "Welcome to <em>Tchotcho Pay</em>",
        subtitle: "You've secured your spot on the early access waitlist. We're building something special — you'll be among the first to know when we launch.",
        pos_label: "your position",
        pos_strong: "🎉 You joined the waitlist!",
        pos_desc: "Move up the list by referring friends. Each referral bumps you 5 spots and earns you $5 USDC when we launch.",
        slots_label: "Early access slots:", slots_of: "reserved",
        share_title: "📣 Spread the word",
        share_desc: "Share with your network — each friend who joins moves you <strong>5 spots higher</strong> on the waitlist.",
        refer_strong: "Refer friends, earn $5 USDC each",
        refer_desc: "When we launch, every successful referral pays you $5 USDC directly to your wallet. No cap on earnings.",
        get_link_btn: "Get My Link →",
        what_next: "What happens next",
        tl1_s: "✅ You joined the waitlist", tl1_p: "Spot secured. You'll receive a confirmation email shortly.",
        tl2_s: "Welcome email incoming", tl2_p: "Check your inbox for your referral link and early access details. Check spam if you don't see it.",
        tl3_s: "Early access invites go out", tl3_p: "We'll roll out access in batches starting with the top of the waitlist.",
        tl4_s: "Full launch", tl4_p: "Tchotcho Pay goes live. Your $5 USDC referral bonuses are credited to your wallet on day one.",
        back_btn: "← Back to Homepage",
      },
      ht: {
        page_title: "Ou sou lis la! — Tchotcho Pay",
        badge: "Ou sou lis la!",
        title: "Byenveni nan <em>Tchotcho Pay</em>",
        subtitle: "Ou te sere plas ou sou lis aksè bonè a. Nou ap bati yon bagay espesyal — ou pral youn nan premye yo konnen lè nou lanse.",
        pos_label: "pozisyon ou",
        pos_strong: "🎉 Ou te rantre nan lis la!",
        pos_desc: "Monte pi wo nan lis la lè ou refere zanmi. Chak referans pouse ou 5 plas pi wo epi fè ou 5 $ USDC lè nou lanse.",
        slots_label: "Espas aksè bonè:", slots_of: "rezève",
        share_title: "📣 Gaye nouvèl la",
        share_desc: "Pataje ak rezo ou — chak zanmi ki rantre deplase ou <strong>5 plas pi wo</strong> sou lis la.",
        refer_strong: "Refere zanmi, genyen 5 $ USDC chak",
        refer_desc: "Lè nou lanse, chak referans reyisi peye ou 5 $ USDC dirèkteman nan pòtfèy ou. Pa gen plafon.",
        get_link_btn: "Jwenn Lyen Mwen →",
        what_next: "Kisa k ap pase apre",
        tl1_s: "✅ Ou te rantre nan lis la", tl1_p: "Plas sere. Ou pral resevwa yon imèl konfirmasyon.",
        tl2_s: "Imèl byenveni ap vini", tl2_p: "Verifye bwat resepsyon ou pou lyen referans ou ak detay aksè bonè.",
        tl3_s: "Envitasyon aksè bonè yo ap soti", tl3_p: "Nou pral lage aksè an pake kòmanse ak tèt lis la.",
        tl4_s: "Lanse total", tl4_p: "Tchotcho Pay lanse. Bonis referans 5 $ USDC ou yo kredite premye jou a.",
        back_btn: "← Retounen nan Paj Prensipal",
      },
      fr: {
        page_title: "Vous êtes inscrit ! — Tchotcho Pay",
        badge: "Vous êtes inscrit !",
        title: "Bienvenue chez <em>Tchotcho Pay</em>",
        subtitle: "Vous avez réservé votre place sur la liste d'accès anticipé. Nous construisons quelque chose de spécial — vous serez parmi les premiers informés lors du lancement.",
        pos_label: "votre position",
        pos_strong: "🎉 Vous avez rejoint la liste !",
        pos_desc: "Montez dans la liste en parrainant des amis. Chaque parrainage vous fait monter de 5 places et vous rapporte 5 $ USDC au lancement.",
        slots_label: "Places d'accès anticipé :", slots_of: "réservées",
        share_title: "📣 Partagez la nouvelle",
        share_desc: "Partagez avec votre réseau — chaque ami qui s'inscrit vous fait monter de <strong>5 places</strong>.",
        refer_strong: "Parrainez des amis, gagnez 5 $ USDC chacun",
        refer_desc: "Au lancement, chaque parrainage réussi vous rapporte 5 $ USDC directement dans votre portefeuille. Sans limite.",
        get_link_btn: "Obtenir Mon Lien →",
        what_next: "Ce qui se passe ensuite",
        tl1_s: "✅ Vous avez rejoint la liste", tl1_p: "Place réservée. Vous recevrez un email de confirmation.",
        tl2_s: "Email de bienvenue en route", tl2_p: "Vérifiez votre boîte mail pour votre lien de parrainage et les détails d'accès anticipé.",
        tl3_s: "Invitations d'accès anticipé envoyées", tl3_p: "Nous déploierons l'accès par vagues, en commençant par le haut de la liste.",
        tl4_s: "Lancement complet", tl4_p: "Tchotcho Pay est en ligne. Vos bonus de parrainage de 5 $ USDC sont crédités le premier jour.",
        back_btn: "← Retour à l'Accueil",
      },
      es: {
        page_title: "¡Estás en la lista! — Tchotcho Pay",
        badge: "¡Estás dentro!",
        title: "Bienvenido a <em>Tchotcho Pay</em>",
        subtitle: "Has asegurado tu lugar en la lista de acceso anticipado. Estamos construyendo algo especial — serás de los primeros en saber cuando lancemos.",
        pos_label: "tu posición",
        pos_strong: "🎉 ¡Te uniste a la lista!",
        pos_desc: "Sube en la lista refiriendo amigos. Cada referido te sube 5 puestos y te gana $5 USDC al lanzar.",
        slots_label: "Cupos de acceso anticipado:", slots_of: "reservados",
        share_title: "📣 Corre la voz",
        share_desc: "Comparte con tu red — cada amigo que se une te sube <strong>5 puestos</strong> en la lista.",
        refer_strong: "Refiere amigos, gana $5 USDC cada uno",
        refer_desc: "Al lanzar, cada referido exitoso te paga $5 USDC directamente a tu billetera. Sin límite.",
        get_link_btn: "Obtener Mi Enlace →",
        what_next: "Qué pasa después",
        tl1_s: "✅ Te uniste a la lista", tl1_p: "Lugar asegurado. Recibirás un correo de confirmación pronto.",
        tl2_s: "Email de bienvenida en camino", tl2_p: "Revisa tu bandeja de entrada para tu enlace de referido y detalles de acceso anticipado.",
        tl3_s: "Invitaciones de acceso anticipado", tl3_p: "Desplegaremos el acceso por lotes comenzando desde la cima de la lista.",
        tl4_s: "Lanzamiento completo", tl4_p: "Tchotcho Pay se lanza. Tus bonos de referido de $5 USDC se acreditan el primer día.",
        back_btn: "← Volver al Inicio",
      },
    },

    // ════════════════ BLOG PAGE ════════════════
    blog: {
      en: {
        page_title: "Blog — Tchotcho Pay",
        label: "Insights & Updates",
        title: "The Tchotcho Pay <em>Blog</em>",
        subtitle: "Product updates, Haiti economy insights, USDC education, and tips for sending money smarter.",
        search_placeholder: "Search articles…",
        filter_all: "All", filter_product: "Product", filter_haiti: "Haiti",
        filter_usdc: "USDC", filter_tips: "Tips", filter_news: "News",
        nl_title: "📬 Stay in the loop",
        nl_desc: "Get the latest updates on Tchotcho Pay, Haiti fintech news, and USDC insights — delivered to your inbox weekly.",
        nl_placeholder: "your@email.com",
        nl_btn: "Subscribe", nl_done: "✓ Subscribed!",
        popular_title: "Popular This Week",
        topics_title: "Topics",
      },
      ht: {
        page_title: "Blog — Tchotcho Pay",
        label: "Enfòmasyon & Mizajou",
        title: "Blog <em>Tchotcho Pay</em>",
        subtitle: "Mizajou pwodui, enfòmasyon ekonomi Ayiti, edikasyon USDC, ak konsèy pou voye lajan pi entèlijan.",
        search_placeholder: "Chèche atik...",
        filter_all: "Tout", filter_product: "Pwodui", filter_haiti: "Ayiti",
        filter_usdc: "USDC", filter_tips: "Konsèy", filter_news: "Nouvèl",
        nl_title: "📬 Rete nan kourant",
        nl_desc: "Jwenn dènye mizajou sou Tchotcho Pay, nouvèl fintech Ayiti, ak enfòmasyon USDC — chak semèn.",
        nl_placeholder: "ou@imèl.com",
        nl_btn: "Abòne", nl_done: "✓ Abòne!",
        popular_title: "Pi Popilè Semèn Sa a",
        topics_title: "Sijè",
      },
      fr: {
        page_title: "Blog — Tchotcho Pay",
        label: "Insights & Mises à jour",
        title: "Le Blog <em>Tchotcho Pay</em>",
        subtitle: "Mises à jour produit, analyses de l'économie haïtienne, éducation USDC et conseils pour envoyer de l'argent intelligemment.",
        search_placeholder: "Rechercher des articles…",
        filter_all: "Tout", filter_product: "Produit", filter_haiti: "Haïti",
        filter_usdc: "USDC", filter_tips: "Conseils", filter_news: "Actualités",
        nl_title: "📬 Restez informé",
        nl_desc: "Recevez les dernières nouvelles de Tchotcho Pay, l'actualité fintech haïtienne et les insights USDC — chaque semaine.",
        nl_placeholder: "votre@email.com",
        nl_btn: "S'abonner", nl_done: "✓ Abonné !",
        popular_title: "Populaires Cette Semaine",
        topics_title: "Thèmes",
      },
      es: {
        page_title: "Blog — Tchotcho Pay",
        label: "Análisis & Actualizaciones",
        title: "El Blog de <em>Tchotcho Pay</em>",
        subtitle: "Actualizaciones de producto, análisis de la economía haitiana, educación sobre USDC y consejos para enviar dinero de forma inteligente.",
        search_placeholder: "Buscar artículos…",
        filter_all: "Todo", filter_product: "Producto", filter_haiti: "Haití",
        filter_usdc: "USDC", filter_tips: "Consejos", filter_news: "Noticias",
        nl_title: "📬 Mantente informado",
        nl_desc: "Recibe las últimas noticias de Tchotcho Pay, novedades fintech de Haití e insights de USDC — cada semana.",
        nl_placeholder: "tu@email.com",
        nl_btn: "Suscribirse", nl_done: "✓ ¡Suscrito!",
        popular_title: "Populares Esta Semana",
        topics_title: "Temas",
      },
    },

    // ════════════════ MERCHANT SIGNUP ════════════════
    'merchant-signup': {
      en: {
        page_title: "Become a Merchant — Tchotcho Pay",
        badge: "Merchant Program",
        title: "Start accepting <em>USDC payments</em> today",
        subtitle: "Join the Tchotcho Pay marketplace. $0 setup fee. 1–2% processing. Instant settlement.",
        stat1_label: "Setup Fee", stat2_label: "Processing Fee", stat3_label: "Approval Time", stat4_label: "Support",
        start_btn: "Apply Now — It's Free",
        steps_label: "Application Process",
        step1: "Business Info", step2: "Owner Identity", step3: "Documents",
        step4: "Payout Setup", step5: "Review & Submit",
        continue_btn: "Continue", back_btn: "Back", submit_btn: "Submit Application",
        success_title: "Application Submitted!",
        success_sub: "We'll review your application within 24–48 hours and contact you by email.",
      },
      ht: {
        page_title: "Vin Yon Machann — Tchotcho Pay",
        badge: "Pwogram Machann",
        title: "Kòmanse aksepte <em>pèman USDC</em> jodi a",
        subtitle: "Rantre nan maché Tchotcho Pay. $0 frè konfigirasyon. 1–2% trètman. Règleman imedyat.",
        stat1_label: "Frè Konfigirasyon", stat2_label: "Frè Trètman", stat3_label: "Tan Apwobasyon", stat4_label: "Sipò",
        start_btn: "Aplike Kounye a — Gratis",
        steps_label: "Pwosesis Aplikasyon",
        step1: "Info Biznis", step2: "Idantite Pwopriyetè", step3: "Dokiman",
        step4: "Konfigirasyon Pèman", step5: "Revize & Soumèt",
        continue_btn: "Kontinye", back_btn: "Retounen", submit_btn: "Soumèt Aplikasyon",
        success_title: "Aplikasyon Soumèt!",
        success_sub: "Nou pral revize aplikasyon ou nan 24–48 èdtan epi kontakte ou pa imèl.",
      },
      fr: {
        page_title: "Devenir Marchand — Tchotcho Pay",
        badge: "Programme Marchand",
        title: "Commencez à accepter les <em>paiements USDC</em> aujourd'hui",
        subtitle: "Rejoignez le marché Tchotcho Pay. 0 $ de frais de configuration. 1–2 % de traitement. Règlement instantané.",
        stat1_label: "Frais d'installation", stat2_label: "Frais de traitement", stat3_label: "Délai d'approbation", stat4_label: "Support",
        start_btn: "Postuler Maintenant — C'est Gratuit",
        steps_label: "Processus de Candidature",
        step1: "Info sur l'Entreprise", step2: "Identité du Propriétaire", step3: "Documents",
        step4: "Méthode de Paiement", step5: "Révision & Soumission",
        continue_btn: "Continuer", back_btn: "Retour", submit_btn: "Soumettre la Candidature",
        success_title: "Candidature soumise !",
        success_sub: "Nous examinerons votre candidature dans les 24 à 48 heures et vous contacterons par e-mail.",
      },
      es: {
        page_title: "Ser Comerciante — Tchotcho Pay",
        badge: "Programa para Comerciantes",
        title: "Empieza a aceptar <em>pagos USDC</em> hoy",
        subtitle: "Únete al mercado de Tchotcho Pay. $0 de configuración. 1–2% de procesamiento. Liquidación instantánea.",
        stat1_label: "Costo de Configuración", stat2_label: "Comisión de Procesamiento", stat3_label: "Tiempo de Aprobación", stat4_label: "Soporte",
        start_btn: "Aplicar Ahora — Es Gratis",
        steps_label: "Proceso de Solicitud",
        step1: "Info del Negocio", step2: "Identidad del Propietario", step3: "Documentos",
        step4: "Método de Pago", step5: "Revisión y Envío",
        continue_btn: "Continuar", back_btn: "Atrás", submit_btn: "Enviar Solicitud",
        success_title: "¡Solicitud enviada!",
        success_sub: "Revisaremos tu solicitud en 24–48 horas y te contactaremos por correo electrónico.",
      },
    },

    // ════════════════ AGENT SIGNUP ════════════════
    'agent-signup': {
      en: {
        page_title: "Become an Agent — Tchotcho Pay",
        badge: "Agent Program",
        title: "Become a <em>Tchotcho Pay</em> Cash Agent",
        subtitle: "Help your community convert USDC to HTG cash. Earn 1% commission on every withdrawal. We provide the float.",
        how_label: "How It Works",
        step1: "Personal Info", step2: "Zone & Location", step3: "Experience & Float",
        step4: "Identity Docs", step5: "Review & Submit",
        continue_btn: "Continue", back_btn: "Back", submit_btn: "Submit Application",
        success_title: "Application Submitted!",
        success_sub: "Our agent team will review your application within 48 hours.",
      },
      ht: {
        page_title: "Vin Yon Ajan — Tchotcho Pay",
        badge: "Pwogram Ajan",
        title: "Vin yon <em>Tchotcho Pay</em> Ajan Kach",
        subtitle: "Ede kominote ou konvèti USDC an lajan kach HTG. Genyen 1% komisyon sou chak retrè. Nou bay float la.",
        how_label: "Kijan Li Mache",
        step1: "Info Pèsonèl", step2: "Zòn & Kote", step3: "Eksperyans & Float",
        step4: "Dokiman Idantite", step5: "Revize & Soumèt",
        continue_btn: "Kontinye", back_btn: "Retounen", submit_btn: "Soumèt Aplikasyon",
        success_title: "Aplikasyon Soumèt!",
        success_sub: "Ekip ajan nou pral revize aplikasyon ou nan 48 èdtan.",
      },
      fr: {
        page_title: "Devenir Agent — Tchotcho Pay",
        badge: "Programme Agent",
        title: "Devenez Agent de Retrait <em>Tchotcho Pay</em>",
        subtitle: "Aidez votre communauté à convertir les USDC en espèces HTG. Gagnez 1 % de commission sur chaque retrait. Nous fournissons la liquidité.",
        how_label: "Comment Ça Marche",
        step1: "Info Personnelles", step2: "Zone & Localisation", step3: "Expérience & Liquidité",
        step4: "Documents d'Identité", step5: "Révision & Soumission",
        continue_btn: "Continuer", back_btn: "Retour", submit_btn: "Soumettre la Candidature",
        success_title: "Candidature soumise !",
        success_sub: "Notre équipe examinera votre candidature dans les 48 heures.",
      },
      es: {
        page_title: "Ser Agente — Tchotcho Pay",
        badge: "Programa de Agentes",
        title: "Conviértete en Agente de Retiro <em>Tchotcho Pay</em>",
        subtitle: "Ayuda a tu comunidad a convertir USDC en efectivo HTG. Gana 1% de comisión por cada retiro. Nosotros proveemos el capital.",
        how_label: "Cómo Funciona",
        step1: "Info Personal", step2: "Zona & Ubicación", step3: "Experiencia & Capital",
        step4: "Documentos de Identidad", step5: "Revisión y Envío",
        continue_btn: "Continuar", back_btn: "Atrás", submit_btn: "Enviar Solicitud",
        success_title: "¡Solicitud enviada!",
        success_sub: "Nuestro equipo de agentes revisará tu solicitud en 48 horas.",
      },
    },

    // ════════════════ ABOUT PAGE ════════════════
    about: {
      en: {
        page_title: "About Us — Tchotcho Pay",
        hero_title: "Built for Haiti.<br/><em>Powered by the diaspora.</em>",
        hero_sub: "We're a team of Haitian-Americans who got tired of watching families lose 8–12% of every dollar sent home. So we built something better.",
        story_title: "Why we <em>built this</em>",
        values_title: "What <em>drives us</em>",
        timeline_title: "How we got here &amp; <em>where we're going</em>",
        team_title: "The people <em>building it</em>",
        team_sub: "We're Haitian, we're diaspora, and we've lived this problem ourselves.",
        advisors_title: "Advisors",
        cta_title: "Join us in building the future of Haitian finance",
        cta_sub: "Whether you're a user, investor, or partner — there's a place for you.",
        join_btn: "Join Waitlist",
        contact_btn: "Contact Us",
      },
      ht: {
        page_title: "Sou Nou — Tchotcho Pay",
        hero_title: "Bati pou Ayiti.<br/><em>Pwodwi pa dyaspora a.</em>",
        hero_sub: "Nou se yon ekip Ayisyen-Ameriken ki te bouke wè fanmi yo pèdi 8-12% nan chak dola yo voye lakay. Kidonk nou te bati yon bagay pi bon.",
        story_title: "Poukisa nou <em>te bati sa</em>",
        values_title: "Sa ki <em>motive nou</em>",
        timeline_title: "Kijan nou rive isit &amp; <em>kote nou prale</em>",
        team_title: "Moun ki ap <em>bati li</em>",
        team_sub: "Nou se Ayisyen, nou se dyaspora, epi nou menm nou te viv pwoblèm sa a.",
        advisors_title: "Konseye",
        cta_title: "Rantre avèk nou nan konstwi avni finans Ayisyen an",
        cta_sub: "Ke ou se yon itilizatè, envestisè, oswa patnè — gen yon plas pou ou.",
        join_btn: "Enskri sou Lis Atant",
        contact_btn: "Kontakte Nou",
      },
      fr: {
        page_title: "À Propos — Tchotcho Pay",
        hero_title: "Construit pour Haïti.<br/><em>Propulsé par la diaspora.</em>",
        hero_sub: "Nous sommes une équipe d'Haïtiens-Américains qui en avaient assez de voir les familles perdre 8 à 12% de chaque dollar envoyé. Nous avons construit quelque chose de mieux.",
        story_title: "Pourquoi nous <em>avons créé ça</em>",
        values_title: "Ce qui <em>nous anime</em>",
        timeline_title: "Comment nous en sommes arrivés là &amp; <em>où nous allons</em>",
        team_title: "Les personnes qui <em>le construisent</em>",
        team_sub: "Nous sommes haïtiens, nous sommes diaspora, et nous avons vécu ce problème nous-mêmes.",
        advisors_title: "Conseillers",
        cta_title: "Rejoignez-nous pour construire l'avenir de la finance haïtienne",
        cta_sub: "Que vous soyez utilisateur, investisseur ou partenaire — il y a une place pour vous.",
        join_btn: "Rejoindre la liste d'attente",
        contact_btn: "Nous contacter",
      },
      es: {
        page_title: "Sobre Nosotros — Tchotcho Pay",
        hero_title: "Construido para Haití.<br/><em>Impulsado por la diáspora.</em>",
        hero_sub: "Somos un equipo de haitiano-americanos hartos de ver familias perder el 8-12% de cada dólar enviado. Así que construimos algo mejor.",
        story_title: "Por qué lo <em>construimos</em>",
        values_title: "Lo que nos <em>impulsa</em>",
        timeline_title: "Cómo llegamos aquí &amp; <em>hacia dónde vamos</em>",
        team_title: "Las personas que lo <em>están construyendo</em>",
        team_sub: "Somos haitianos, somos diáspora, y hemos vivido este problema nosotros mismos.",
        advisors_title: "Asesores",
        cta_title: "Únete a nosotros para construir el futuro de las finanzas haitianas",
        cta_sub: "Ya seas usuario, inversor o socio — hay un lugar para ti.",
        join_btn: "Unirse a la Lista de Espera",
        contact_btn: "Contáctanos",
      },
    },

    // ════════════════ CONTACT PAGE ════════════════
    contact: {
      en: {
        page_title: "Contact & Support — Tchotcho Pay",
        hero_title: "We're here to <em>help</em>",
        hero_sub: "Our support team speaks English, Haitian Creole, French, and Spanish. We're committed to resolving every issue fast.",
        search_placeholder: "Search for help… (e.g. 'send money', 'cash out')",
        section_label: "Browse by topic",
        form_title: "Send us a message",
        name_placeholder: "Your name",
        email_placeholder: "Your email",
        subject_placeholder: "What's this about?",
        message_placeholder: "Describe your issue or question in detail…",
        send_btn: "Send Message",
        hours_title: "Support Hours",
        hours_text: "Monday – Saturday, 8AM – 8PM EST",
        response_title: "Response Time",
        response_text: "We reply within 2 business hours",
      },
      ht: {
        page_title: "Kontakte & Sipò — Tchotcho Pay",
        hero_title: "Nou la pou <em>ede ou</em>",
        hero_sub: "Ekip sipò nou pale Anglè, Kreyòl Ayisyen, Fransè, ak Panyòl. Nou angaje pou rezoud chak pwoblèm rapidman.",
        search_placeholder: "Chèche èd… (pa egzanp 'voye lajan', 'retire')",
        section_label: "Fè yon chwa pa sijè",
        form_title: "Voye nou yon mesaj",
        name_placeholder: "Non ou",
        email_placeholder: "Imèl ou",
        subject_placeholder: "Sa li konsènan?",
        message_placeholder: "Dekri pwoblèm ou oswa kesyon ou an detay…",
        send_btn: "Voye Mesaj",
        hours_title: "Orè Sipò",
        hours_text: "Lendi – Samdi, 8AM – 8PM EST",
        response_title: "Tan Repons",
        response_text: "Nou reponn nan 2 zèdtan travay",
      },
      fr: {
        page_title: "Contact & Support — Tchotcho Pay",
        hero_title: "Nous sommes là pour <em>vous aider</em>",
        hero_sub: "Notre équipe parle anglais, créole haïtien, français et espagnol. Nous résolvons chaque problème rapidement.",
        search_placeholder: "Rechercher de l'aide… (ex. 'envoyer de l'argent', 'retrait')",
        section_label: "Parcourir par sujet",
        form_title: "Envoyez-nous un message",
        name_placeholder: "Votre nom",
        email_placeholder: "Votre email",
        subject_placeholder: "De quoi s'agit-il ?",
        message_placeholder: "Décrivez votre problème ou question en détail…",
        send_btn: "Envoyer le Message",
        hours_title: "Heures de Support",
        hours_text: "Lundi – Samedi, 8h – 20h EST",
        response_title: "Délai de Réponse",
        response_text: "Nous répondons en 2 heures ouvrables",
      },
      es: {
        page_title: "Contacto & Soporte — Tchotcho Pay",
        hero_title: "Estamos aquí para <em>ayudarte</em>",
        hero_sub: "Nuestro equipo habla inglés, criollo haitiano, francés y español. Nos comprometemos a resolver cada problema rápidamente.",
        search_placeholder: "Buscar ayuda… (ej. 'enviar dinero', 'retiro')",
        section_label: "Explorar por tema",
        form_title: "Envíanos un mensaje",
        name_placeholder: "Tu nombre",
        email_placeholder: "Tu correo",
        subject_placeholder: "¿De qué se trata?",
        message_placeholder: "Describe tu problema o pregunta en detalle…",
        send_btn: "Enviar Mensaje",
        hours_title: "Horario de Soporte",
        hours_text: "Lunes – Sábado, 8AM – 8PM EST",
        response_title: "Tiempo de Respuesta",
        response_text: "Respondemos en 2 horas hábiles",
      },
    },

    // ════════════════ PRICING PAGE ════════════════
    pricing: {
      en: {
        page_title: "Pricing — Tchotcho Pay",
        hero_title: "Simple, <em>transparent</em> pricing",
        hero_sub: "No surprise charges. No confusing tiers. Know exactly what you pay before you send — always lower than banks and traditional remittance companies.",
        toggle_personal: "Personal", toggle_business: "Business",
        fees_title: "Every fee — nothing hidden",
        fees_sub: "We believe in full transparency. Here is every fee, exactly as it applies.",
        compare_title: "How we compare",
        compare_sub: "Sending $200 to Haiti — what does each company actually charge?",
        cta_title: "Ready to save on every transfer?",
        cta_sub: "Join thousands already sending smarter with Tchotcho Pay.",
        join_btn: "Join Waitlist — Free",
      },
      ht: {
        page_title: "Pri — Tchotcho Pay",
        hero_title: "Pri <em>senp ak transparan</em>",
        hero_sub: "Pa gen frè kache. Pa gen nivo konfuzan. Konnen egzakteman sa ou peye anvan ou voye — toujou pi ba pase bank ak konpayi remitans tradisyonèl yo.",
        toggle_personal: "Pèsonèl", toggle_business: "Biznis",
        fees_title: "Tout frè yo — anyen kache",
        fees_sub: "Nou kwè nan transparans total. Men tout frè yo, egzakteman jan yo aplike.",
        compare_title: "Kijan nou konpare",
        compare_sub: "Voye $200 ann Ayiti — ki chak konpayi reyèlman chaje?",
        cta_title: "Pare pou ekonomize sou chak transfè?",
        cta_sub: "Rantre avèk dè milye ki deja ap voye pi entelijan ak Tchotcho Pay.",
        join_btn: "Enskri — Gratis",
      },
      fr: {
        page_title: "Tarifs — Tchotcho Pay",
        hero_title: "Tarifs simples et <em>transparents</em>",
        hero_sub: "Pas de frais surprises. Pas de niveaux confus. Sachez exactement ce que vous payez avant d'envoyer — toujours moins cher que les banques.",
        toggle_personal: "Personnel", toggle_business: "Entreprise",
        fees_title: "Tous les frais — rien de caché",
        fees_sub: "Nous croyons en la transparence totale. Voici tous les frais, exactement tels qu'ils s'appliquent.",
        compare_title: "Comment nous nous comparons",
        compare_sub: "Envoyer 200$ en Haïti — combien chaque entreprise facture-t-elle vraiment?",
        cta_title: "Prêt à économiser sur chaque transfert?",
        cta_sub: "Rejoignez des milliers qui envoient déjà plus intelligemment avec Tchotcho Pay.",
        join_btn: "Rejoindre la liste — Gratuit",
      },
      es: {
        page_title: "Precios — Tchotcho Pay",
        hero_title: "Precios simples y <em>transparentes</em>",
        hero_sub: "Sin cargos sorpresa. Sin niveles confusos. Sabe exactamente lo que pagas antes de enviar — siempre más bajo que los bancos.",
        toggle_personal: "Personal", toggle_business: "Empresa",
        fees_title: "Todas las tarifas — nada oculto",
        fees_sub: "Creemos en la transparencia total. Aquí están todas las tarifas, exactamente como se aplican.",
        compare_title: "Cómo nos comparamos",
        compare_sub: "Enviando $200 a Haití — ¿cuánto cobra realmente cada empresa?",
        cta_title: "¿Listo para ahorrar en cada transferencia?",
        cta_sub: "Únete a miles que ya envían más inteligentemente con Tchotcho Pay.",
        join_btn: "Unirse a la lista — Gratis",
      },
    },

    // ════════════════ SECURITY PAGE ════════════════
    security: {
      en: {
        page_title: "Security — Tchotcho Pay",
        hero_title: "Your money is <em>safe</em><br/>with Tchotcho Pay",
        hero_sub: "We built security into every layer — from the moment you load money to the second it arrives in Haiti. Here's exactly how we protect you.",
        layers_title: "5 layers protecting every dollar",
        layers_sub: "Your money passes through 5 independent security layers before it ever moves.",
        usdc_title: "Why USDC? Why not regular dollars?",
        usdc_sub: "USDC lets us move money faster, cheaper, and more transparently than any traditional bank.",
        features_title: "Every security feature, listed",
        features_sub: "Nothing hidden. Here is everything we do to protect your account and your money.",
        cta_title: "Bank-grade security. Zero bank fees.",
        cta_sub: "Your money is safer with Tchotcho Pay than with most traditional banks.",
        join_btn: "Join Waitlist — Free",
        questions_btn: "Security Questions",
      },
      ht: {
        page_title: "Sekirite — Tchotcho Pay",
        hero_title: "Lajan ou an <em>sekirite</em><br/>ak Tchotcho Pay",
        hero_sub: "Nou te bati sekirite nan chak kouch — depi moman ou chaje lajan jiska segonn li rive ann Ayiti. Men egzakteman kijan nou pwoteje ou.",
        layers_title: "5 kouch k ap pwoteje chak dola",
        layers_sub: "Lajan ou pase nan 5 kouch sekirite endepandan anvan li janm deplase.",
        usdc_title: "Poukisa USDC? Poukisa pa dola regilye?",
        usdc_sub: "USDC pèmèt nou deplase lajan pi vit, pi bon mache, ak plis transparans pase nenpòt bank tradisyonèl.",
        features_title: "Tout karakteristik sekirite yo, nan lis",
        features_sub: "Anyen kache. Men tout sa nou fè pou pwoteje kont ou ak lajan ou.",
        cta_title: "Sekirite nivo bank. Zewo frè bank.",
        cta_sub: "Lajan ou pi an sekirite ak Tchotcho Pay pase ak pifò bank tradisyonèl.",
        join_btn: "Enskri — Gratis",
        questions_btn: "Kesyon Sekirite",
      },
      fr: {
        page_title: "Sécurité — Tchotcho Pay",
        hero_title: "Votre argent est <em>en sécurité</em><br/>avec Tchotcho Pay",
        hero_sub: "Nous avons intégré la sécurité à chaque couche — du moment où vous chargez de l'argent à la seconde où il arrive en Haïti.",
        layers_title: "5 couches protégeant chaque dollar",
        layers_sub: "Votre argent passe par 5 couches de sécurité indépendantes avant tout mouvement.",
        usdc_title: "Pourquoi USDC? Pourquoi pas des dollars ordinaires?",
        usdc_sub: "L'USDC nous permet de déplacer l'argent plus rapidement, moins cher et plus transparemment que toute banque traditionnelle.",
        features_title: "Toutes les fonctionnalités de sécurité, listées",
        features_sub: "Rien de caché. Voici tout ce que nous faisons pour protéger votre compte et votre argent.",
        cta_title: "Sécurité de niveau bancaire. Zéro frais bancaires.",
        cta_sub: "Votre argent est plus sûr avec Tchotcho Pay que dans la plupart des banques traditionnelles.",
        join_btn: "Rejoindre la liste — Gratuit",
        questions_btn: "Questions de Sécurité",
      },
      es: {
        page_title: "Seguridad — Tchotcho Pay",
        hero_title: "Tu dinero está <em>seguro</em><br/>con Tchotcho Pay",
        hero_sub: "Construimos seguridad en cada capa — desde el momento en que cargas dinero hasta el segundo en que llega a Haití.",
        layers_title: "5 capas protegiendo cada dólar",
        layers_sub: "Tu dinero pasa por 5 capas de seguridad independientes antes de moverse.",
        usdc_title: "¿Por qué USDC? ¿Por qué no dólares regulares?",
        usdc_sub: "USDC nos permite mover dinero más rápido, más barato y con más transparencia que cualquier banco tradicional.",
        features_title: "Todas las funciones de seguridad, listadas",
        features_sub: "Nada oculto. Aquí está todo lo que hacemos para proteger tu cuenta y tu dinero.",
        cta_title: "Seguridad de nivel bancario. Cero comisiones bancarias.",
        cta_sub: "Tu dinero está más seguro con Tchotcho Pay que en la mayoría de los bancos tradicionales.",
        join_btn: "Unirse a la lista — Gratis",
        questions_btn: "Preguntas de Seguridad",
      },
    },

    // ════════════════ APP PAGE ════════════════
    app: {
      en: {
        page_title: "Get the App — Tchotcho Pay",
        hero_title: "The Haiti money app<br/>built for <em>real life</em>",
        hero_sub: "Send money, pay bills, top up phones, save in digital dollars, and cash out anywhere in Haiti. One app — everything your family needs.",
        features_title: "Everything in one app",
        features_sub: "Built specifically for the Haitian community — in Haiti and abroad. No bank required.",
        screens_title: "See it in action",
        screens_sub: "Every screen designed for clarity and speed. Works beautifully on any Android or iPhone.",
        ios_btn: "Download on iOS",
        android_btn: "Get on Android",
        notify_btn: "Notify Me at Launch",
        waitlist_title: "Join the waitlist",
        waitlist_sub: "Be first when we launch. No spam, ever.",
        waitlist_btn: "Join Free Waitlist",
      },
      ht: {
        page_title: "Telechaje Aplikasyon an — Tchotcho Pay",
        hero_title: "Aplikasyon lajan Ayiti<br/>bati pou <em>lavi reyèl</em>",
        hero_sub: "Voye lajan, peye fakti, recharge telefòn, ekonomize an dola dijital, epi retire lajan nenpòt kote ann Ayiti. Yon sèl aplikasyon — tout sa fanmi ou bezwen.",
        features_title: "Tout bagay nan yon sèl aplikasyon",
        features_sub: "Bati espesyalman pou kominote Ayisyen an — ann Ayiti ak aletranje. Pa bezwen bank.",
        screens_title: "Wè li an aksyon",
        screens_sub: "Chak ekran fèt pou klète ak vitès. Travay pafètman sou nenpòt Android oswa iPhone.",
        ios_btn: "Telechaje sou iOS",
        android_btn: "Jwenn sou Android",
        notify_btn: "Avèti Mwen nan Lanse",
        waitlist_title: "Rantre nan lis atant",
        waitlist_sub: "Premye lè nou lanse. Pa gen spam, janm.",
        waitlist_btn: "Rantre Gratis",
      },
      fr: {
        page_title: "Télécharger l'App — Tchotcho Pay",
        hero_title: "L'app argent Haïti<br/>construite pour la <em>vraie vie</em>",
        hero_sub: "Envoyez de l'argent, payez des factures, rechargez des téléphones, économisez en dollars numériques et retirez partout en Haïti. Une seule app — tout ce dont votre famille a besoin.",
        features_title: "Tout en une seule app",
        features_sub: "Conçue spécifiquement pour la communauté haïtienne — en Haïti et à l'étranger. Pas de banque requise.",
        screens_title: "Voir en action",
        screens_sub: "Chaque écran conçu pour la clarté et la rapidité. Fonctionne parfaitement sur Android et iPhone.",
        ios_btn: "Télécharger sur iOS",
        android_btn: "Obtenir sur Android",
        notify_btn: "Me notifier au lancement",
        waitlist_title: "Rejoindre la liste d'attente",
        waitlist_sub: "Soyez le premier lors du lancement. Jamais de spam.",
        waitlist_btn: "Rejoindre gratuitement",
      },
      es: {
        page_title: "Obtener la App — Tchotcho Pay",
        hero_title: "La app de dinero Haití<br/>construida para la <em>vida real</em>",
        hero_sub: "Envía dinero, paga facturas, recarga teléfonos, ahorra en dólares digitales y retira en cualquier lugar de Haití. Una sola app — todo lo que tu familia necesita.",
        features_title: "Todo en una sola app",
        features_sub: "Creada específicamente para la comunidad haitiana — en Haití y en el exterior. Sin banco requerido.",
        screens_title: "Verla en acción",
        screens_sub: "Cada pantalla diseñada para claridad y velocidad. Funciona perfectamente en cualquier Android o iPhone.",
        ios_btn: "Descargar en iOS",
        android_btn: "Obtener en Android",
        notify_btn: "Notificarme al lanzamiento",
        waitlist_title: "Unirse a la lista de espera",
        waitlist_sub: "Sé el primero cuando lancemos. Sin spam, nunca.",
        waitlist_btn: "Unirse gratis",
      },
    },

    // ════════════════ CARD PAGE ════════════════
    card: {
      en: {
        page_title: "Visa Debit Card — Tchotcho Pay",
        hero_title: "Your money, <em>everywhere</em><br>you go",
        hero_sub: "Spend your USDC balance anywhere Visa is accepted. Virtual card available now — physical card coming soon.",
        tab_virtual: "Virtual Card", tab_physical: "Physical Card",
        how_title: "From USDC to <em>spending</em> in 4 steps",
        how_sub: "No bank account required. No waiting. Just your phone.",
        security_title: "Built-in card <em>security</em>",
        security_sub: "Every transaction protected. Freeze your card instantly from the app.",
        cta_title: "Ready for a card that works everywhere?",
        join_btn: "Join Waitlist — Free",
      },
      ht: {
        page_title: "Kat Visa Debit — Tchotcho Pay",
        hero_title: "Lajan ou, <em>tout kote</em><br>ou ale",
        hero_sub: "Depanse balans USDC ou nenpòt kote Visa aksepte. Kat vityèl disponib kounye a — kat fizik ap vini byento.",
        tab_virtual: "Kat Vityèl", tab_physical: "Kat Fizik",
        how_title: "Soti USDC rive <em>depanse</em> nan 4 etap",
        how_sub: "Pa bezwen kont bank. Pa bezwen tann. Jis telefòn ou.",
        security_title: "<em>Sekirite</em> kat entegre",
        security_sub: "Chak tranzaksyon pwoteje. Bloke kat ou imedyatman depi aplikasyon an.",
        cta_title: "Pare pou yon kat ki travay tout kote?",
        join_btn: "Enskri — Gratis",
      },
      fr: {
        page_title: "Carte Visa Débit — Tchotcho Pay",
        hero_title: "Votre argent, <em>partout</em><br>où vous allez",
        hero_sub: "Dépensez votre solde USDC partout où Visa est accepté. Carte virtuelle disponible maintenant — carte physique bientôt.",
        tab_virtual: "Carte Virtuelle", tab_physical: "Carte Physique",
        how_title: "De l'USDC aux <em>dépenses</em> en 4 étapes",
        how_sub: "Pas de compte bancaire requis. Pas d'attente. Juste votre téléphone.",
        security_title: "<em>Sécurité</em> intégrée",
        security_sub: "Chaque transaction protégée. Bloquez votre carte instantanément depuis l'app.",
        cta_title: "Prêt pour une carte qui fonctionne partout?",
        join_btn: "Rejoindre la liste — Gratuit",
      },
      es: {
        page_title: "Tarjeta Visa Débito — Tchotcho Pay",
        hero_title: "Tu dinero, <em>en todas partes</em><br>donde vayas",
        hero_sub: "Gasta tu saldo USDC donde Visa sea aceptado. Tarjeta virtual disponible ahora — tarjeta física próximamente.",
        tab_virtual: "Tarjeta Virtual", tab_physical: "Tarjeta Física",
        how_title: "De USDC a <em>gastar</em> en 4 pasos",
        how_sub: "Sin cuenta bancaria. Sin esperas. Solo tu teléfono.",
        security_title: "<em>Seguridad</em> integrada",
        security_sub: "Cada transacción protegida. Bloquea tu tarjeta al instante desde la app.",
        cta_title: "¿Listo para una tarjeta que funciona en todas partes?",
        join_btn: "Unirse a la lista — Gratis",
      },
    },

    // ════════════════ CALCULATOR PAGE ════════════════
    calculator: {
      en: {
        page_title: "Send Money Calculator — Tchotcho Pay",
        hero_title: "See exactly <em>how much</em> arrives",
        send_label: "You send", receive_label: "They receive",
        fee_label: "Our fee", rate_label: "Exchange rate",
        speed_label: "Speed", speed_val: "Under 60 seconds",
        compare_title: "How we compare",
        cta_title: "Ready to send more for less?",
        join_btn: "Join Waitlist — Free",
        start_btn: "Start Sending",
      },
      ht: {
        page_title: "Kalkilatè — Tchotcho Pay",
        hero_title: "Wè egzakteman <em>konbyen</em> ki rive",
        send_label: "Ou voye", receive_label: "Yo resevwa",
        fee_label: "Frè nou an", rate_label: "To echanj",
        speed_label: "Vitès", speed_val: "Mwens pase 60 segonn",
        compare_title: "Kijan nou konpare",
        cta_title: "Pare pou voye plis pou mwens?",
        join_btn: "Enskri — Gratis",
        start_btn: "Kòmanse Voye",
      },
      fr: {
        page_title: "Calculateur d'Envoi — Tchotcho Pay",
        hero_title: "Voyez exactement <em>combien</em> arrive",
        send_label: "Vous envoyez", receive_label: "Ils reçoivent",
        fee_label: "Nos frais", rate_label: "Taux de change",
        speed_label: "Vitesse", speed_val: "Moins de 60 secondes",
        compare_title: "Comment nous nous comparons",
        cta_title: "Prêt à envoyer plus pour moins?",
        join_btn: "Rejoindre la liste — Gratuit",
        start_btn: "Commencer à envoyer",
      },
      es: {
        page_title: "Calculadora de Envío — Tchotcho Pay",
        hero_title: "Ve exactamente <em>cuánto</em> llega",
        send_label: "Tú envías", receive_label: "Ellos reciben",
        fee_label: "Nuestra tarifa", rate_label: "Tipo de cambio",
        speed_label: "Velocidad", speed_val: "Menos de 60 segundos",
        compare_title: "Cómo nos comparamos",
        cta_title: "¿Listo para enviar más por menos?",
        join_btn: "Unirse a la lista — Gratis",
        start_btn: "Empezar a enviar",
      },
    },

    // ════════════════ TOPUP PAGE ════════════════
    topup: {
      en: {
        page_title: "Mobile Top-Up — Tchotcho Pay",
        hero_title: "Top up <em>Haiti phones</em> instantly",
        step1_title: "Choose carrier & amount",
        step2_title: "Enter phone number",
        step3_title: "Confirm & pay",
        done_title: "Top-up sent!",
        done_sub: "The recharge was sent successfully.",
        back_btn: "Back",
        continue_btn: "Continue",
        confirm_btn: "Confirm & Pay",
        another_btn: "Send Another",
      },
      ht: {
        page_title: "Recharge Telefòn — Tchotcho Pay",
        hero_title: "Recharge <em>telefòn Ayiti</em> imedyatman",
        step1_title: "Chwazi operatè & montan",
        step2_title: "Antre nimewo telefòn",
        step3_title: "Konfime & peye",
        done_title: "Recharge voye!",
        done_sub: "Recharge a te voye avèk siksè.",
        back_btn: "Tounen",
        continue_btn: "Kontinye",
        confirm_btn: "Konfime & Peye",
        another_btn: "Voye Yon Lòt",
      },
      fr: {
        page_title: "Recharge Téléphone — Tchotcho Pay",
        hero_title: "Rechargez les <em>téléphones en Haïti</em> instantanément",
        step1_title: "Choisir opérateur & montant",
        step2_title: "Entrer le numéro de téléphone",
        step3_title: "Confirmer & payer",
        done_title: "Recharge envoyée!",
        done_sub: "La recharge a été envoyée avec succès.",
        back_btn: "Retour",
        continue_btn: "Continuer",
        confirm_btn: "Confirmer & Payer",
        another_btn: "Envoyer une autre",
      },
      es: {
        page_title: "Recarga de Teléfono — Tchotcho Pay",
        hero_title: "Recarga <em>teléfonos en Haití</em> al instante",
        step1_title: "Elegir operador y monto",
        step2_title: "Ingresar número de teléfono",
        step3_title: "Confirmar y pagar",
        done_title: "¡Recarga enviada!",
        done_sub: "La recarga fue enviada con éxito.",
        back_btn: "Atrás",
        continue_btn: "Continuar",
        confirm_btn: "Confirmar y Pagar",
        another_btn: "Enviar otra",
      },
    },

    // ════════════════ BILLPAY PAGE ════════════════
    billpay: {
      en: {
        page_title: "Bill Pay — Tchotcho Pay",
        hero_title: "Pay Haiti bills with <em>USDC</em>",
        step1_title: "Choose what to pay",
        step2_title: "Enter account details",
        step3_title: "Confirm payment",
        done_title: "Payment sent!",
        done_sub: "Your bill payment was processed successfully.",
        back_btn: "Back",
        continue_btn: "Continue",
        confirm_btn: "Confirm & Pay",
        another_btn: "Pay Another Bill",
        edh: "Electricity (EDH)", school: "School Fees", natcom: "Natcom Internet", water: "Water (CAMEP)", other: "Other",
      },
      ht: {
        page_title: "Peye Fakti — Tchotcho Pay",
        hero_title: "Peye fakti Ayiti ak <em>USDC</em>",
        step1_title: "Chwazi sa pou peye",
        step2_title: "Antre detay kont",
        step3_title: "Konfime peman",
        done_title: "Peman voye!",
        done_sub: "Peman fakti ou a te trete avèk siksè.",
        back_btn: "Tounen",
        continue_btn: "Kontinye",
        confirm_btn: "Konfime & Peye",
        another_btn: "Peye Yon Lòt Fakti",
        edh: "Elektrisite (EDH)", school: "Frè Lekòl", natcom: "Entènèt Natcom", water: "Dlo (CAMEP)", other: "Lòt",
      },
      fr: {
        page_title: "Paiement de Factures — Tchotcho Pay",
        hero_title: "Payez les factures haïtiennes avec <em>USDC</em>",
        step1_title: "Choisir quoi payer",
        step2_title: "Entrer les détails du compte",
        step3_title: "Confirmer le paiement",
        done_title: "Paiement envoyé!",
        done_sub: "Votre paiement de facture a été traité avec succès.",
        back_btn: "Retour",
        continue_btn: "Continuer",
        confirm_btn: "Confirmer & Payer",
        another_btn: "Payer une autre facture",
        edh: "Électricité (EDH)", school: "Frais Scolaires", natcom: "Internet Natcom", water: "Eau (CAMEP)", other: "Autre",
      },
      es: {
        page_title: "Pago de Facturas — Tchotcho Pay",
        hero_title: "Paga facturas de Haití con <em>USDC</em>",
        step1_title: "Elegir qué pagar",
        step2_title: "Ingresar detalles de cuenta",
        step3_title: "Confirmar pago",
        done_title: "¡Pago enviado!",
        done_sub: "Tu pago de factura fue procesado con éxito.",
        back_btn: "Atrás",
        continue_btn: "Continuar",
        confirm_btn: "Confirmar y Pagar",
        another_btn: "Pagar otra factura",
        edh: "Electricidad (EDH)", school: "Cuotas Escolares", natcom: "Internet Natcom", water: "Agua (CAMEP)", other: "Otro",
      },
    },

    // ════════════════ SIGNUP PAGE ════════════════
    signup: {
      en: {
        page_title: "Sign Up — Tchotcho Pay",
        lp_headline: "Send money to Haiti<br/>with <em>zero hassle</em>",
        lp_sub: "Join thousands of Haitians in the diaspora who send money home faster, cheaper, and smarter with Tchotcho Pay.",
        step1_title: "Welcome to Tchotcho Pay",
        step1_sub: "Create your free account in minutes. No bank account needed.",
        step2_title: "Verify Your Identity",
        step2_sub: "Required by law to keep your money safe.",
        step3_title: "Set Up Your Wallet",
        step3_sub: "Your USDC wallet is ready. Add funds to start sending.",
        fname_placeholder: "First name", lname_placeholder: "Last name",
        email_placeholder: "Email address", phone_placeholder: "Phone number",
        password_placeholder: "Create password",
        next_btn: "Continue", back_btn: "Back", finish_btn: "Create Account",
        or_text: "or continue with",
        login_text: "Already have an account?", login_link: "Log in",
      },
      ht: {
        page_title: "Enskri — Tchotcho Pay",
        lp_headline: "Voye lajan ann Ayiti<br/>san <em>konplikasyon</em>",
        lp_sub: "Rantre avèk dè milye Ayisyen nan dyaspora a ki voye lajan lakay pi vit, pi bon mache, ak plis entelijans ak Tchotcho Pay.",
        step1_title: "Byenveni sou Tchotcho Pay",
        step1_sub: "Kreye kont gratis ou an kèk minit. Pa bezwen kont bank.",
        step2_title: "Verifye Idantite Ou",
        step2_sub: "Obligatwa pa lalwa pou kenbe lajan ou an sekirite.",
        step3_title: "Konfigire Pòtfèy Ou",
        step3_sub: "Pòtfèy USDC ou pare. Ajoute fon pou kòmanse voye.",
        fname_placeholder: "Prenon", lname_placeholder: "Siyati",
        email_placeholder: "Adrès imèl", phone_placeholder: "Nimewo telefòn",
        password_placeholder: "Kreye modpas",
        next_btn: "Kontinye", back_btn: "Tounen", finish_btn: "Kreye Kont",
        or_text: "oswa kontinye ak",
        login_text: "Deja gen yon kont?", login_link: "Konekte",
      },
      fr: {
        page_title: "S'inscrire — Tchotcho Pay",
        lp_headline: "Envoyez de l'argent en Haïti<br/>sans <em>tracas</em>",
        lp_sub: "Rejoignez des milliers d'Haïtiens de la diaspora qui envoient de l'argent chez eux plus vite, moins cher et plus intelligemment avec Tchotcho Pay.",
        step1_title: "Bienvenue sur Tchotcho Pay",
        step1_sub: "Créez votre compte gratuit en quelques minutes. Pas de compte bancaire requis.",
        step2_title: "Vérifiez votre identité",
        step2_sub: "Requis par la loi pour garder votre argent en sécurité.",
        step3_title: "Configurez votre portefeuille",
        step3_sub: "Votre portefeuille USDC est prêt. Ajoutez des fonds pour commencer.",
        fname_placeholder: "Prénom", lname_placeholder: "Nom de famille",
        email_placeholder: "Adresse email", phone_placeholder: "Numéro de téléphone",
        password_placeholder: "Créer un mot de passe",
        next_btn: "Continuer", back_btn: "Retour", finish_btn: "Créer un Compte",
        or_text: "ou continuer avec",
        login_text: "Déjà un compte?", login_link: "Se connecter",
      },
      es: {
        page_title: "Registrarse — Tchotcho Pay",
        lp_headline: "Envía dinero a Haití<br/>sin <em>complicaciones</em>",
        lp_sub: "Únete a miles de haitianos de la diáspora que envían dinero a casa más rápido, más barato y más inteligentemente con Tchotcho Pay.",
        step1_title: "Bienvenido a Tchotcho Pay",
        step1_sub: "Crea tu cuenta gratuita en minutos. No se necesita cuenta bancaria.",
        step2_title: "Verifica tu Identidad",
        step2_sub: "Requerido por ley para mantener tu dinero seguro.",
        step3_title: "Configura tu Billetera",
        step3_sub: "Tu billetera USDC está lista. Agrega fondos para comenzar.",
        fname_placeholder: "Nombre", lname_placeholder: "Apellido",
        email_placeholder: "Correo electrónico", phone_placeholder: "Número de teléfono",
        password_placeholder: "Crear contraseña",
        next_btn: "Continuar", back_btn: "Atrás", finish_btn: "Crear Cuenta",
        or_text: "o continuar con",
        login_text: "¿Ya tienes una cuenta?", login_link: "Iniciar sesión",
      },
    },

    // ════════════════ INVEST PAGE ════════════════
    invest: {
      en: {
        page_title: "Invest — Tchotcho Pay",
        hero_title: "The Financial Infrastructure<br/><span>Haiti Has Been Waiting For</span>",
        hero_sub: "Tchotcho Pay combines USDC on Base, a Visa Debit card, money transfer, and a Haitian marketplace — into one platform for 3M+ diaspora members.",
        problem_title: "The Haitian Diaspora Is Being Overcharged",
        problem_sub: "Sending money to Haiti costs 3× more than it should.",
        market_title: "A $3.8B Market With No Real Digital Winner",
        invest_btn: "Request Investor Deck",
        contact_btn: "Contact Fedner Directly",
      },
      ht: {
        page_title: "Envesti — Tchotcho Pay",
        hero_title: "Enfrastrikti Finansyè<br/><span>Ayiti Te Tann Lan</span>",
        hero_sub: "Tchotcho Pay konbine USDC sou Base, yon Kat Visa Debit, transfè lajan, ak yon mache Ayisyen — nan yon sèl platfòm pou 3M+ manm dyaspora.",
        problem_title: "Dyaspora Ayisyen an Ap Peye Twò Chè",
        problem_sub: "Voye lajan ann Ayiti koute 3× plis pase li ta dwe.",
        market_title: "Yon Mache $3.8B San Okenn Gagnan Dijital Reyèl",
        invest_btn: "Mande Dosye Envestisè",
        contact_btn: "Kontakte Fedner Dirèkteman",
      },
      fr: {
        page_title: "Investir — Tchotcho Pay",
        hero_title: "L'Infrastructure Financière<br/><span>qu'Haïti Attendait</span>",
        hero_sub: "Tchotcho Pay combine USDC sur Base, une carte Visa Débit, le transfert d'argent, et un marché haïtien — en une seule plateforme pour plus de 3M membres de la diaspora.",
        problem_title: "La Diaspora Haïtienne Paie Trop Cher",
        problem_sub: "Envoyer de l'argent en Haïti coûte 3× plus cher que nécessaire.",
        market_title: "Un Marché de 3,8 Mds$ Sans Vrai Gagnant Numérique",
        invest_btn: "Demander le Dossier Investisseur",
        contact_btn: "Contacter Fedner Directement",
      },
      es: {
        page_title: "Invertir — Tchotcho Pay",
        hero_title: "La Infraestructura Financiera<br/><span>que Haití Ha Estado Esperando</span>",
        hero_sub: "Tchotcho Pay combina USDC en Base, una tarjeta Visa Débito, transferencia de dinero y un mercado haitiano — en una plataforma para más de 3M miembros de la diáspora.",
        problem_title: "La Diáspora Haitiana Está Siendo Cobrada de Más",
        problem_sub: "Enviar dinero a Haití cuesta 3× más de lo que debería.",
        market_title: "Un Mercado de $3.8B Sin un Ganador Digital Real",
        invest_btn: "Solicitar Dossier de Inversión",
        contact_btn: "Contactar a Fedner Directamente",
      },
    },

    // ════════════════ COMPARE PAGE ════════════════
    compare: {
      en: {
        page_title: "TchotchoPay vs Competitors — Best Way to Send Money to Haiti",
        hero_title: "We beat every <em>competitor</em><br>sending money to Haiti",
        hero_sub: "Lower fees, faster delivery, and the only service that sends directly to MonCash and NatCash wallets. See for yourself.",
        section1: "How much does your family actually receive?",
        section2: "Feature by feature",
        section3: "Why diaspora families choose us",
        cta_btn: "Start Sending Free",
      },
      ht: {
        page_title: "TchotchoPay vs Konkirans — Meye Fason Voye Lajan Ayiti",
        hero_title: "Nou pi bon pase tout <em>konkirans</em><br>pou voye lajan Ayiti",
        hero_sub: "Frè pi ba, livrezon pi vit, epi sèl sèvis ki voye dirèkteman nan MonCash ak NatCash. Gade ou menm.",
        section1: "Konbyen fanmi ou resevwa vrèman?",
        section2: "Karakteristik pa karakteristik",
        section3: "Poukisa fanmi dyaspora chwazi nou",
        cta_btn: "Kòmanse Voye Gratis",
      },
      fr: {
        page_title: "TchotchoPay vs Concurrents — Meilleur Envoi d'Argent en Haïti",
        hero_title: "Nous battons tous les <em>concurrents</em><br>pour envoyer de l'argent en Haïti",
        hero_sub: "Frais plus bas, livraison plus rapide, et le seul service qui envoie directement vers MonCash et NatCash.",
        section1: "Combien votre famille reçoit-elle vraiment ?",
        section2: "Fonctionnalité par fonctionnalité",
        section3: "Pourquoi les familles de la diaspora nous choisissent",
        cta_btn: "Commencer Gratuitement",
      },
      es: {
        page_title: "TchotchoPay vs Competidores — Mejor Forma de Enviar Dinero a Haití",
        hero_title: "Superamos a todos los <em>competidores</em><br>enviando dinero a Haití",
        hero_sub: "Tarifas más bajas, entrega más rápida, y el único servicio que envía directamente a MonCash y NatCash.",
        section1: "¿Cuánto recibe realmente tu familia?",
        section2: "Función por función",
        section3: "Por qué las familias de la diáspora nos eligen",
        cta_btn: "Empezar Gratis",
      },
    },

    // ════════════════ P2P PAGE ════════════════
    p2p: {
      en: {
        page_title: "P2P USDC Trading — Buy & Sell USDC in Haiti | TchotchoPay",
        hero_title: "Buy & Sell <em>USDC</em><br>directly in Haiti",
        hero_sub: "No exchange needed. Trade USDC with real people using MonCash, bank transfer, or cash — protected by TchotchoPay escrow every time.",
        section1: "Safe trades in 5 simple steps",
        section2: "Your money is always safe",
        section3: "Live offers from real traders",
        section4: "Pay however you want",
        section5: "Built to protect every trade",
        section6: "The smarter way to get USDC in Haiti",
        cta_btn: "Start Trading Now",
      },
      ht: {
        page_title: "Echanj P2P USDC — Achte & Vann USDC ann Ayiti | TchotchoPay",
        hero_title: "Achte & Vann <em>USDC</em><br>dirèkteman ann Ayiti",
        hero_sub: "Pa bezwen echanj. Fè komès USDC ak moun reyèl ak MonCash, virement bancaire, oswa kach — pwoteje pa eskwo TchotchoPay chak fwa.",
        section1: "Echanj san danje an 5 etap senp",
        section2: "Lajan ou toujou an sekirite",
        section3: "Ofri dirèk nan men komèsan reyèl",
        section4: "Peye jan ou vle",
        section5: "Konstwi pou pwoteje chak echanj",
        section6: "Fason pi entèlijan pou jwenn USDC ann Ayiti",
        cta_btn: "Kòmanse Fè Echanj Kounye a",
      },
      fr: {
        page_title: "Trading P2P USDC — Acheter & Vendre des USDC en Haïti | TchotchoPay",
        hero_title: "Achetez & Vendez des <em>USDC</em><br>directement en Haïti",
        hero_sub: "Pas besoin d'échange. Tradez des USDC avec de vraies personnes via MonCash, virement bancaire ou espèces — protégé par l'entiercement TchotchoPay.",
        section1: "Des échanges sûrs en 5 étapes simples",
        section2: "Votre argent est toujours en sécurité",
        section3: "Offres en direct de vrais traders",
        section4: "Payez comme vous voulez",
        section5: "Conçu pour protéger chaque transaction",
        section6: "La façon la plus intelligente d'obtenir des USDC en Haïti",
        cta_btn: "Commencer à Trader",
      },
      es: {
        page_title: "Trading P2P USDC — Comprar & Vender USDC en Haití | TchotchoPay",
        hero_title: "Compra & Vende <em>USDC</em><br>directamente en Haití",
        hero_sub: "No necesitas exchange. Intercambia USDC con personas reales usando MonCash, transferencia bancaria o efectivo — protegido por custodia TchotchoPay.",
        section1: "Intercambios seguros en 5 pasos simples",
        section2: "Tu dinero siempre está seguro",
        section3: "Ofertas en vivo de traders reales",
        section4: "Paga como quieras",
        section5: "Construido para proteger cada intercambio",
        section6: "La forma más inteligente de obtener USDC en Haití",
        cta_btn: "Empezar a Tradear Ahora",
      },
    },

    // ════════════════ SEND PAGE ════════════════
    send: {
      en: {
        page_title: "Send Money to MonCash & NatCash — Tchotcho Pay",
        hero_title: "Send money straight to<br><em>Haitian mobile wallets</em>",
        cta_btn: "Send Money Now",
      },
      ht: {
        page_title: "Voye Lajan nan MonCash & NatCash — Tchotcho Pay",
        hero_title: "Voye lajan dirèkteman nan<br><em>pòtfèy mobil ayisyen</em>",
        cta_btn: "Voye Lajan Kounye a",
      },
      fr: {
        page_title: "Envoyer de l'Argent vers MonCash & NatCash — Tchotcho Pay",
        hero_title: "Envoyez de l'argent directement aux<br><em>portefeuilles mobiles haïtiens</em>",
        cta_btn: "Envoyer Maintenant",
      },
      es: {
        page_title: "Enviar Dinero a MonCash & NatCash — Tchotcho Pay",
        hero_title: "Envía dinero directamente a<br><em>billeteras móviles haitianas</em>",
        cta_btn: "Enviar Dinero Ahora",
      },
    },

    // ════════════════ RECIPIENT PAGE ════════════════
    recipient: {
      en: {
        page_title: "Receive Money in Haiti — Tchotcho Pay",
        hero_title: "Receive money from abroad<br/>in <em>minutes, not days</em>",
        hero_sub: "Your family sends money. You receive USDC — digital dollars that don't lose value. Pay bills, shop, cash out, or save. All from your phone.",
        how_title: "Get your money in 4 easy steps",
        cando_title: "Your wallet does it all",
        agent_title: "Cash out near you",
        cmp_title: "How much does your family really send?",
        test_title: "Haitians trust Tchotcho Pay",
        app_title: "Get Tchotcho Pay on your phone",
      },
      ht: {
        page_title: "Resevwa Lajan ann Ayiti — Tchotcho Pay",
        hero_title: "Resevwa lajan soti lòt bò<br/>nan <em>minit, pa jou</em>",
        hero_sub: "Fanmi ou voye lajan. Ou resevwa USDC — dola dijital ki pa pèdi valè. Peye fakti, achte, kache, oswa ekonomize — tout nan telefòn ou.",
        how_title: "Jwenn lajan ou an 4 etap fasil",
        cando_title: "Pòtfèy ou fè tout bagay",
        agent_title: "Retire lajan pre ou",
        cmp_title: "Konbyen fanmi ou voye vrèman?",
        test_title: "Ayisyen fè konfyans Tchotcho Pay",
        app_title: "Telechaje Tchotcho Pay sou telefòn ou",
      },
      fr: {
        page_title: "Recevoir de l'Argent en Haïti — Tchotcho Pay",
        hero_title: "Recevez de l'argent de l'étranger<br/>en <em>minutes, pas en jours</em>",
        hero_sub: "Votre famille envoie de l'argent. Vous recevez des USDC — des dollars numériques qui ne perdent pas de valeur. Payez des factures, faites vos courses, retirez ou épargnez — tout depuis votre téléphone.",
        how_title: "Recevez votre argent en 4 étapes simples",
        cando_title: "Votre portefeuille fait tout",
        agent_title: "Retirez près de chez vous",
        cmp_title: "Combien votre famille envoie-t-elle vraiment ?",
        test_title: "Les Haïtiens font confiance à Tchotcho Pay",
        app_title: "Téléchargez Tchotcho Pay sur votre téléphone",
      },
      es: {
        page_title: "Recibir Dinero en Haití — Tchotcho Pay",
        hero_title: "Recibe dinero del extranjero<br/>en <em>minutos, no días</em>",
        hero_sub: "Tu familia envía dinero. Tú recibes USDC — dólares digitales que no pierden valor. Paga cuentas, compra, retira o ahorra — todo desde tu teléfono.",
        how_title: "Recibe tu dinero en 4 sencillos pasos",
        cando_title: "Tu billetera lo hace todo",
        agent_title: "Retira cerca de ti",
        cmp_title: "¿Cuánto envía realmente tu familia?",
        test_title: "Los haitianos confían en Tchotcho Pay",
        app_title: "Descarga Tchotcho Pay en tu teléfono",
      },
    },

    // ════════════════ DASHBOARD / WALLET ════════════════
    dashboard: {
      en: {
        page_title: "My Wallet — TchotchoPay",
        sign_out: "Sign out",
        nav_dashboard: "Dashboard",
        nav_send: "Send Money",
        nav_topup: "Top-Up",
        nav_p2p: "P2P Trading",
        nav_billpay: "Bill Pay",
        nav_card: "My Card",
        nav_account: "Account",
        nav_referral: "Referral",
        nav_security: "Security",
        nav_help: "Help",
        balance_label: "USDC Balance",
        btn_send: "Send",
        btn_add_funds: "Add Funds",
        btn_receive: "Receive",
        btn_cash_out: "Cash Out",
        lbl_htg_value: "≈ HTG Value",
        lbl_network: "Network",
        lbl_gas_fees: "Gas Fees",
        lbl_gas_free: "Free ✓",
        ql_send_money: "Send Money",
        ql_topup_phone: "Top-Up Phone",
        ql_p2p_trading: "P2P Trading",
        ql_pay_bills: "Pay Bills",
        card_account_title: "Account",
        lbl_full_name: "Full name",
        lbl_email: "Email",
        lbl_phone: "Phone",
        lbl_kyc_status: "KYC Status",
        lbl_member_since: "Member since",
        btn_edit: "Edit",
        card_bank_title: "Linked Bank",
        bank_empty: "No bank account linked yet.",
        btn_link_bank: "Link Bank",
        wallet_card_title: "USDC Wallet Address (Base Network)",
        wallet_hint: "Send only USDC on Base network to this address.",
        vc_title: "My Virtual Card",
        vc_loading: "Checking card status…",
        vc_none_title: "No virtual card yet",
        vc_none_desc: "Issue your free TchotchoPay virtual card — spend USDC anywhere Visa is accepted.",
        btn_issue_card: "Issue My Card",
        btn_freeze_card: "Freeze Card",
        btn_reveal_number: "Reveal Number",
        vc_security_note: "Card number hidden for security — tap Reveal to view temporarily.",
        btn_retry: "Retry",
        savings_title: "USDC Savings Wallet",
        savings_desc: "Hold digital dollars. Earn while you save.",
        savings_stable: "Stable USDC",
        savings_sub: "≈ 0 HTG · No lock-up · Withdraw anytime",
        btn_move_savings: "Move to Savings",
        btn_withdraw: "Withdraw",
        modal_send_title: "Send Money",
        modal_funds_title: "Add Funds",
        modal_receive_title: "Receive USDC",
        modal_cashout_title: "Cash Out",
        modal_edit_profile_title: "Edit Profile",
        modal_savings_deposit_title: "Move to Savings",
        modal_savings_withdraw_title: "Withdraw from Savings",
        btn_cancel: "Cancel",
        btn_close: "Close",
        btn_done: "Done",
      },
      ht: {
        page_title: "Pòtfèy Mwen — TchotchoPay",
        sign_out: "Dekonekte",
        nav_dashboard: "Tablo de bò",
        nav_send: "Voye Lajan",
        nav_topup: "Rechaje",
        nav_p2p: "Echanj P2P",
        nav_billpay: "Peye Fakti",
        nav_card: "Kat Mwen",
        nav_account: "Kont",
        nav_referral: "Referans",
        nav_security: "Sekirite",
        nav_help: "Èd",
        balance_label: "Balans USDC",
        btn_send: "Voye",
        btn_add_funds: "Ajoute Fon",
        btn_receive: "Resevwa",
        btn_cash_out: "Retire Kach",
        lbl_htg_value: "≈ Valè HTG",
        lbl_network: "Rezo",
        lbl_gas_fees: "Frè Gaz",
        lbl_gas_free: "Gratis ✓",
        ql_send_money: "Voye Lajan",
        ql_topup_phone: "Rechaje Telefòn",
        ql_p2p_trading: "Echanj P2P",
        ql_pay_bills: "Peye Fakti",
        card_account_title: "Kont",
        lbl_full_name: "Non konplè",
        lbl_email: "Imèl",
        lbl_phone: "Telefòn",
        lbl_kyc_status: "Estati KYC",
        lbl_member_since: "Manm depi",
        btn_edit: "Modifye",
        card_bank_title: "Bank Konekte",
        bank_empty: "Pa gen kont bank konekte ankò.",
        btn_link_bank: "Konekte Bank",
        wallet_card_title: "Adrès Pòtfèy USDC (Rezo Base)",
        wallet_hint: "Voye sèlman USDC sou rezo Base nan adrès sa a.",
        vc_title: "Kat Vityèl Mwen",
        vc_loading: "Ap tcheke estati kat…",
        vc_none_title: "Pa gen kat vityèl ankò",
        vc_none_desc: "Kreye kat vityèl TchotchoPay gratis ou — depanse USDC nenpòt kote Visa aksepte.",
        btn_issue_card: "Kreye Kat Mwen",
        btn_freeze_card: "Bloke Kat",
        btn_reveal_number: "Montre Nimewo",
        vc_security_note: "Nimewo kat kache pou sekirite — tapote Montre pou wè tanporèman.",
        btn_retry: "Eseye ankò",
        savings_title: "Pòtfèy Ekonomi USDC",
        savings_desc: "Kenbe dola dijital. Ekonomize san pèdi valè.",
        savings_stable: "USDC Estab",
        savings_sub: "≈ 0 HTG · Pa bloke · Retire nenpòt ki lè",
        btn_move_savings: "Mete nan Ekonomi",
        btn_withdraw: "Retire",
        modal_send_title: "Voye Lajan",
        modal_funds_title: "Ajoute Fon",
        modal_receive_title: "Resevwa USDC",
        modal_cashout_title: "Retire Kach",
        modal_edit_profile_title: "Modifye Pwofil",
        modal_savings_deposit_title: "Mete nan Ekonomi",
        modal_savings_withdraw_title: "Retire nan Ekonomi",
        btn_cancel: "Anile",
        btn_close: "Fèmen",
        btn_done: "Fini",
      },
      fr: {
        page_title: "Mon Portefeuille — TchotchoPay",
        sign_out: "Déconnexion",
        nav_dashboard: "Tableau de bord",
        nav_send: "Envoyer de l'argent",
        nav_topup: "Recharger",
        nav_p2p: "Trading P2P",
        nav_billpay: "Payer les factures",
        nav_card: "Ma carte",
        nav_account: "Compte",
        nav_referral: "Parrainage",
        nav_security: "Sécurité",
        nav_help: "Aide",
        balance_label: "Solde USDC",
        btn_send: "Envoyer",
        btn_add_funds: "Ajouter des fonds",
        btn_receive: "Recevoir",
        btn_cash_out: "Retirer",
        lbl_htg_value: "≈ Valeur HTG",
        lbl_network: "Réseau",
        lbl_gas_fees: "Frais de gaz",
        lbl_gas_free: "Gratuit ✓",
        ql_send_money: "Envoyer de l'argent",
        ql_topup_phone: "Recharger le téléphone",
        ql_p2p_trading: "Trading P2P",
        ql_pay_bills: "Payer les factures",
        card_account_title: "Compte",
        lbl_full_name: "Nom complet",
        lbl_email: "E-mail",
        lbl_phone: "Téléphone",
        lbl_kyc_status: "Statut KYC",
        lbl_member_since: "Membre depuis",
        btn_edit: "Modifier",
        card_bank_title: "Banque liée",
        bank_empty: "Aucun compte bancaire lié.",
        btn_link_bank: "Lier une banque",
        wallet_card_title: "Adresse du portefeuille USDC (Réseau Base)",
        wallet_hint: "Envoyez uniquement des USDC sur le réseau Base à cette adresse.",
        vc_title: "Ma Carte Virtuelle",
        vc_loading: "Vérification du statut de la carte…",
        vc_none_title: "Aucune carte virtuelle",
        vc_none_desc: "Émettez votre carte virtuelle TchotchoPay gratuite — dépensez des USDC partout où Visa est accepté.",
        btn_issue_card: "Émettre ma carte",
        btn_freeze_card: "Bloquer la carte",
        btn_reveal_number: "Afficher le numéro",
        vc_security_note: "Numéro de carte masqué par sécurité — appuyez sur Afficher pour voir temporairement.",
        btn_retry: "Réessayer",
        savings_title: "Portefeuille d'épargne USDC",
        savings_desc: "Conservez des dollars numériques. Économisez sans perdre.",
        savings_stable: "USDC Stable",
        savings_sub: "≈ 0 HTG · Sans blocage · Retrait à tout moment",
        btn_move_savings: "Déplacer vers l'épargne",
        btn_withdraw: "Retirer",
        modal_send_title: "Envoyer de l'argent",
        modal_funds_title: "Ajouter des fonds",
        modal_receive_title: "Recevoir USDC",
        modal_cashout_title: "Retirer des fonds",
        modal_edit_profile_title: "Modifier le profil",
        modal_savings_deposit_title: "Déplacer vers l'épargne",
        modal_savings_withdraw_title: "Retirer de l'épargne",
        btn_cancel: "Annuler",
        btn_close: "Fermer",
        btn_done: "Terminé",
      },
      es: {
        page_title: "Mi Billetera — TchotchoPay",
        sign_out: "Cerrar sesión",
        nav_dashboard: "Panel",
        nav_send: "Enviar dinero",
        nav_topup: "Recargar",
        nav_p2p: "Trading P2P",
        nav_billpay: "Pagar facturas",
        nav_card: "Mi tarjeta",
        nav_account: "Cuenta",
        nav_referral: "Referidos",
        nav_security: "Seguridad",
        nav_help: "Ayuda",
        balance_label: "Saldo USDC",
        btn_send: "Enviar",
        btn_add_funds: "Agregar fondos",
        btn_receive: "Recibir",
        btn_cash_out: "Retirar",
        lbl_htg_value: "≈ Valor HTG",
        lbl_network: "Red",
        lbl_gas_fees: "Tarifas de gas",
        lbl_gas_free: "Gratis ✓",
        ql_send_money: "Enviar dinero",
        ql_topup_phone: "Recargar teléfono",
        ql_p2p_trading: "Trading P2P",
        ql_pay_bills: "Pagar facturas",
        card_account_title: "Cuenta",
        lbl_full_name: "Nombre completo",
        lbl_email: "Correo electrónico",
        lbl_phone: "Teléfono",
        lbl_kyc_status: "Estado KYC",
        lbl_member_since: "Miembro desde",
        btn_edit: "Editar",
        card_bank_title: "Banco vinculado",
        bank_empty: "Ninguna cuenta bancaria vinculada.",
        btn_link_bank: "Vincular banco",
        wallet_card_title: "Dirección de billetera USDC (Red Base)",
        wallet_hint: "Envía solo USDC en la red Base a esta dirección.",
        vc_title: "Mi Tarjeta Virtual",
        vc_loading: "Verificando el estado de la tarjeta…",
        vc_none_title: "Sin tarjeta virtual",
        vc_none_desc: "Emite tu tarjeta virtual TchotchoPay gratis — gasta USDC en cualquier lugar que acepte Visa.",
        btn_issue_card: "Emitir mi tarjeta",
        btn_freeze_card: "Bloquear tarjeta",
        btn_reveal_number: "Revelar número",
        vc_security_note: "Número de tarjeta oculto por seguridad — toca Revelar para verlo temporalmente.",
        btn_retry: "Reintentar",
        savings_title: "Billetera de ahorro USDC",
        savings_desc: "Guarda dólares digitales. Ahorra sin perder.",
        savings_stable: "USDC Estable",
        savings_sub: "≈ 0 HTG · Sin bloqueo · Retiro en cualquier momento",
        btn_move_savings: "Mover a ahorros",
        btn_withdraw: "Retirar",
        modal_send_title: "Enviar dinero",
        modal_funds_title: "Agregar fondos",
        modal_receive_title: "Recibir USDC",
        modal_cashout_title: "Retirar fondos",
        modal_edit_profile_title: "Editar perfil",
        modal_savings_deposit_title: "Mover a ahorros",
        modal_savings_withdraw_title: "Retirar de ahorros",
        btn_cancel: "Cancelar",
        btn_close: "Cerrar",
        btn_done: "Listo",
      },
    },

    // ════════════════ LOGIN PAGE ════════════════
    login: {
      en: {
        page_title: "Sign In — TchotchoPay",
        logo_sub: "Sign in to your wallet",
        email_label: "Email address",
        password_label: "Password",
        submit_btn: "Sign In",
        no_account: "Don't have an account?",
        signup_link: "Create a free TchotchoPay wallet →",
      },
      ht: {
        page_title: "Konekte — TchotchoPay",
        logo_sub: "Konekte nan pòtfèy ou",
        email_label: "Adrès imèl",
        password_label: "Modpas",
        submit_btn: "Konekte",
        no_account: "Ou pa gen yon kont?",
        signup_link: "Kreye yon pòtfèy TchotchoPay gratis →",
      },
      fr: {
        page_title: "Se connecter — TchotchoPay",
        logo_sub: "Connectez-vous à votre portefeuille",
        email_label: "Adresse e-mail",
        password_label: "Mot de passe",
        submit_btn: "Se connecter",
        no_account: "Vous n'avez pas de compte ?",
        signup_link: "Créer un portefeuille TchotchoPay gratuit →",
      },
      es: {
        page_title: "Iniciar sesión — TchotchoPay",
        logo_sub: "Inicia sesión en tu billetera",
        email_label: "Correo electrónico",
        password_label: "Contraseña",
        submit_btn: "Iniciar sesión",
        no_account: "¿No tienes una cuenta?",
        signup_link: "Crea una billetera TchotchoPay gratis →",
      },
    },

  };

  // ── DETECT PAGE ──
  function getPageId() {
    const path = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    return path;
  }

  // ── LANG STORAGE ──
  let currentLang = localStorage.getItem('tchotcho_lang') || 'en';

  // ── HELPER FNS ──
  function q(sel) { return document.querySelector(sel); }
  function qa(sel) { return document.querySelectorAll(sel); }
  function setText(sel, text) { const el = q(sel); if (el) el.textContent = text; }
  function setHTML(sel, html, directEl) { const el = directEl || (sel ? q(sel) : null); if (el) el.innerHTML = html; }
  function setPlaceholder(sel, txt) { const el = q(sel); if (el) el.placeholder = txt; }

  // ── PAGE TRANSLATORS ──
  const translators = {

    faq(t) {
      document.title = t.page_title;
      setHTML('.help-badge', '<i class="ti ti-help-circle"></i> ' + t.badge);
      setHTML('.help-title', t.title);
      setText('.help-sub', t.subtitle);
      setPlaceholder('#search-input', t.search_placeholder);
      const qlLabels = [t.ql_sending,t.ql_cashout,t.ql_account,t.ql_usdc,t.ql_marketplace,t.ql_fees,t.ql_security,t.ql_troubleshoot];
      qa('.ql-label').forEach((el,i) => { if(qlLabels[i]) el.textContent = qlLabels[i]; });
      // Section titles in sidebar
      const sidebarLinks = qa('.help-sidebar ul li a');
      const sidebarLabels = [t.section_sending,t.section_cashout,t.section_account,t.section_usdc,t.section_marketplace,t.section_fees,t.section_security,t.section_troubleshoot];
      sidebarLinks.forEach((el,i) => {
        if(sidebarLabels[i]) {
          const icon = el.querySelector('i');
          el.innerHTML = '';
          if(icon) el.appendChild(icon);
          el.append(' ' + sidebarLabels[i]);
        }
      });
      // Section headings
      const sectionTitles = qa('.section-title');
      const secLabels = [t.section_sending,t.section_cashout,t.section_account,t.section_usdc,t.section_marketplace,t.section_fees,t.section_security,t.section_troubleshoot];
      sectionTitles.forEach((el,i) => { if(secLabels[i]) el.textContent = secLabels[i]; });
      setText('.contact-bar h3', t.contact_title);
      setText('.contact-bar>p', t.contact_sub);
      const cBtns = qa('.contact-btn');
      if(cBtns[0]) cBtns[0].innerHTML = '<i class="ti ti-mail"></i> ' + t.email_btn;
      if(cBtns[1]) cBtns[1].innerHTML = '<i class="ti ti-message-circle"></i> ' + t.chat_btn;
      if(cBtns[2]) cBtns[2].innerHTML = '<i class="ti ti-brand-whatsapp"></i> ' + t.wa_btn;
    },

    terms(t) {
      document.title = t.page_title;
      setHTML('.legal-badge', '<i class="ti ti-scale"></i> ' + t.badge);
      setHTML('.legal-hero h1', t.title);
      setText('.legal-hero p', t.subtitle);
      const tabs = qa('.tab-btn');
      if(tabs[0]) tabs[0].innerHTML = '<i class="ti ti-file-text"></i> ' + t.tab_tos;
      if(tabs[1]) tabs[1].innerHTML = '<i class="ti ti-lock"></i> ' + t.tab_privacy;
      if(tabs[2]) tabs[2].innerHTML = '<i class="ti ti-shield-check"></i> ' + t.tab_aml;
    },

    referral(t) {
      document.title = t.page_title;
      setHTML('.ref-badge', '<i class="ti ti-gift"></i> ' + t.badge);
      setHTML('.ref-hero h1', t.title);
      // subtitle is the direct p after h1 inside .ref-hero
      const heroP = q('.ref-hero > p');
      if(heroP) heroP.textContent = t.subtitle;
      // reward labels
      const rLabels = qa('.reward-label');
      if(rLabels[0]) rLabels[0].textContent = t.you_earn;
      if(rLabels[1]) rLabels[1].textContent = t.friend_gets;
      if(rLabels[2]) rLabels[2].textContent = t.no_cap;
      // hero buttons
      const heroBtns = qa('.hero-cta button, .hero-cta a');
      if(heroBtns[0]) heroBtns[0].innerHTML = '<i class="ti ti-share"></i> ' + t.get_link_btn;
      if(heroBtns[1]) heroBtns[1].innerHTML = '<i class="ti ti-info-circle"></i> ' + t.how_btn;
      // steps
      const stepTitles = qa('.step h3');
      if(stepTitles[0]) stepTitles[0].textContent = t.step1_title;
      if(stepTitles[1]) stepTitles[1].textContent = t.step2_title;
      if(stepTitles[2]) stepTitles[2].textContent = t.step3_title;
      // share box
      setText('.share-section h3', t.your_code_title);
      setText('.share-section>p', t.your_code_sub);
      const copyCodeBtn = document.getElementById('copy-code-btn');
      if(copyCodeBtn && !copyCodeBtn.classList.contains('copied')) {
        copyCodeBtn.innerHTML = '<i class="ti ti-copy"></i> ' + t.copy_code;
      }
      // tiers
      const tierNames = qa('.tier-name');
      if(tierNames[0]) tierNames[0].textContent = t.tier_starter;
      if(tierNames[1]) tierNames[1].textContent = t.tier_power;
      if(tierNames[2]) tierNames[2].textContent = t.tier_ambassador;
      qa('.tier-per').forEach(el => el.textContent = t.per_referral);
      // tracker
      setText('.tracker-section h3', t.tracker_title);
      // leaderboard
      const lbHeadings = qa('.section-title');
      // bottom CTA
      const bottomH2 = q('.bottom-cta h2');
      if(bottomH2) bottomH2.innerHTML = t.earn_today;
      setText('.bottom-cta p', t.earn_sub);
      const bottomBtns = qa('.bottom-cta button, .bottom-cta a');
      if(bottomBtns[0]) bottomBtns[0].innerHTML = '<i class="ti ti-share"></i> ' + t.share_link_btn;
      if(bottomBtns[1]) bottomBtns[1].innerHTML = '<i class="ti ti-user-plus"></i> ' + t.join_btn;
    },

    thankyou(t) {
      document.title = t.page_title;
      // badge - preserve icon
      const badge = q('.ty-badge');
      if(badge) { const icon = badge.querySelector('i'); badge.innerHTML = ''; if(icon) badge.appendChild(icon); badge.append(' ' + t.badge); }
      setHTML('.ty-card h1', t.title);
      const tyP = q('.ty-card > p');
      if(tyP) tyP.textContent = t.subtitle;
      const posSpan = q('.pos-number span');
      if(posSpan) posSpan.textContent = t.pos_label;
      setText('.pos-text strong', t.pos_strong);
      setText('.pos-text p', t.pos_desc);
      // waitlist caption rebuild
      const wlCap = q('.waitlist-caption');
      if(wlCap) {
        const slotEl = document.getElementById('slots-filled');
        const val = slotEl ? slotEl.textContent : '1,847';
        wlCap.innerHTML = t.slots_label + ' <strong id="slots-filled">' + val + '</strong> / 3,000 ' + t.slots_of;
      }
      setText('.share-section h3', t.share_title);
      const shareP = q('.share-section p');
      if(shareP) shareP.innerHTML = t.share_desc;
      setText('.refer-text strong', t.refer_strong);
      setText('.refer-text p', t.refer_desc);
      setText('.refer-btn', t.get_link_btn);
      setText('.timeline h3', t.what_next);
      const tls = qa('.tl-content');
      const tlData = [[t.tl1_s,t.tl1_p],[t.tl2_s,t.tl2_p],[t.tl3_s,t.tl3_p],[t.tl4_s,t.tl4_p]];
      tls.forEach((tl,i) => {
        if(tlData[i]) {
          const s = tl.querySelector('strong'); if(s) s.textContent = tlData[i][0];
          const p = tl.querySelector('p'); if(p) p.textContent = tlData[i][1];
        }
      });
      const backBtn = q('.back-btn');
      if(backBtn) { const icon = backBtn.querySelector('i'); backBtn.innerHTML = ''; if(icon) backBtn.appendChild(icon); backBtn.append(' ' + t.back_btn.replace('← ','').replace('← ','')); }
    },

    blog(t) {
      document.title = t.page_title;
      setText('.blog-hero-label', t.label);
      setHTML('.blog-hero h1', t.title);
      setText('.blog-hero p', t.subtitle);
      setPlaceholder('#search-input', t.search_placeholder);
      const pills = qa('.pill');
      const pillLabels = [t.filter_all,t.filter_product,t.filter_haiti,t.filter_usdc,t.filter_tips,t.filter_news];
      pills.forEach((p,i) => { if(pillLabels[i]) p.textContent = pillLabels[i]; });
      setText('.newsletter-card h3', t.nl_title);
      setText('.newsletter-card p', t.nl_desc);
      setPlaceholder('#nl-email', t.nl_placeholder);
      const subBtn = document.getElementById('sub-btn');
      if(subBtn && !subBtn.classList.contains('done')) subBtn.textContent = t.nl_btn;
      const sTitles = qa('.sidebar-title');
      if(sTitles[0]) sTitles[0].textContent = t.popular_title;
      if(sTitles[1]) sTitles[1].textContent = t.topics_title;
    },

    'merchant-signup'(t) {
      document.title = t.page_title;
      const badge = q('.signup-badge, .badge, [class*="badge"]');
      // Translate intro screen elements
      const introTitle = q('.intro-title, h1');
      if(introTitle) setHTML('h1', t.title);
      // Steps - translate step dot labels if present
      const stepLabels = qa('.step-label, .dot-label');
      const steps = [t.step1, t.step2, t.step3, t.step4, t.step5];
      stepLabels.forEach((el,i) => { if(steps[i]) el.textContent = steps[i]; });
    },


    about(t) {
      document.title = t.page_title;
      setHTML('#hero-title', t.hero_title);
      setText('#hero-sub', t.hero_sub);
      setHTML('#story-title', t.story_title);
      setHTML('#values-title', t.values_title);
      setHTML('#timeline-title', t.timeline_title);
      setHTML('#team-title', t.team_title);
      setText('#team-sub', t.team_sub);
      setText('#advisors-title', t.advisors_title);
      setHTML('.cta-title, .about-cta h2', t.cta_title);
      setText('.cta-sub, .about-cta p', t.cta_sub);
      const btns = qa('.cta-btn, .btn-primary, .btn-outline');
      if(btns[0]) btns[0].textContent = t.join_btn;
      if(btns[1]) { const icon = btns[1].querySelector('i'); btns[1].innerHTML = ''; if(icon) btns[1].appendChild(icon); btns[1].append(' '+t.contact_btn); }
    },

    contact(t) {
      document.title = t.page_title;
      setHTML('h1', t.hero_title);
      setText('.hero-sub', t.hero_sub);
      setPlaceholder('#search-input', t.search_placeholder);
      setText('.section-label', t.section_label);
      setText('.form-title, .contact-form h3', t.form_title);
      setPlaceholder('#contact-name, input[name="name"]', t.name_placeholder);
      setPlaceholder('#contact-email, input[name="email"]', t.email_placeholder);
      setPlaceholder('#contact-subject, input[name="subject"]', t.subject_placeholder);
      setPlaceholder('#contact-message, textarea[name="message"]', t.message_placeholder);
      setText('.send-btn, button[type="submit"]', t.send_btn);
    },

    pricing(t) {
      document.title = t.page_title;
      setHTML('h1', t.hero_title);
      setText('.hero-sub', t.hero_sub);
      const toggles = qa('.toggle-btn');
      if(toggles[0]) toggles[0].textContent = t.toggle_personal;
      if(toggles[1]) toggles[1].textContent = t.toggle_business;
      const secTitles = qa('.section-title');
      if(secTitles[0]) secTitles[0].textContent = t.fees_title;
      if(secTitles[1]) secTitles[1].textContent = t.compare_title;
      const secSubs = qa('.section-sub');
      if(secSubs[0]) secSubs[0].textContent = t.fees_sub;
      if(secSubs[1]) secSubs[1].textContent = t.compare_sub;
      setText('.cta-title, .pricing-cta h2', t.cta_title);
      setText('.cta-sub, .pricing-cta p', t.cta_sub);
      setText('.join-btn, .cta-btn', t.join_btn);
    },

    security(t) {
      document.title = t.page_title;
      setHTML('h1', t.hero_title);
      setText('.hero-sub', t.hero_sub);
      const secTitles = qa('.section-title');
      if(secTitles[0]) setHTML(null, t.layers_title, secTitles[0]);
      if(secTitles[1]) setHTML(null, t.usdc_title, secTitles[1]);
      if(secTitles[2]) setHTML(null, t.features_title, secTitles[2]);
      const secSubs = qa('.section-sub');
      if(secSubs[0]) secSubs[0].textContent = t.layers_sub;
      if(secSubs[1]) secSubs[1].textContent = t.usdc_sub;
      if(secSubs[2]) secSubs[2].textContent = t.features_sub;
      setText('.cta-title, .security-cta h2', t.cta_title);
      setText('.cta-sub, .security-cta p', t.cta_sub);
      setText('.join-btn, .cta-btn', t.join_btn);
    },

    app(t) {
      document.title = t.page_title;
      setHTML('h1', t.hero_title);
      setText('.hero-sub', t.hero_sub);
      const secTitles = qa('.section-title');
      if(secTitles[0]) secTitles[0].textContent = t.features_title;
      if(secTitles[1]) secTitles[1].textContent = t.screens_title;
      const secSubs = qa('.section-sub');
      if(secSubs[0]) secSubs[0].textContent = t.features_sub;
      if(secSubs[1]) secSubs[1].textContent = t.screens_sub;
      setText('.ios-btn', t.ios_btn);
      setText('.android-btn', t.android_btn);
      setText('.notify-btn', t.notify_btn);
      setText('.waitlist-title, .wl-title', t.waitlist_title);
      setText('.waitlist-sub, .wl-sub', t.waitlist_sub);
      setText('.waitlist-btn, .wl-btn', t.waitlist_btn);
    },

    card(t) {
      document.title = t.page_title;
      setHTML('h1', t.hero_title);
      setText('.hero-sub', t.hero_sub);
      const typeTabs = qa('.type-tab');
      if(typeTabs[0]) typeTabs[0].textContent = t.tab_virtual;
      if(typeTabs[1]) typeTabs[1].textContent = t.tab_physical;
      const secTitles = qa('.section-title');
      if(secTitles[0]) setHTML(null, t.how_title, secTitles[0]);
      if(secTitles[1]) setHTML(null, t.security_title, secTitles[1]);
      const secSubs = qa('.section-sub');
      if(secSubs[0]) secSubs[0].textContent = t.how_sub;
      if(secSubs[1]) secSubs[1].textContent = t.security_sub;
      setText('.cta-title', t.cta_title);
      setText('.join-btn, .cta-btn', t.join_btn);
    },

    calculator(t) {
      document.title = t.page_title;
      setHTML('#hero-title', t.hero_title);
      setText('.send-label', t.send_label);
      setText('.receive-label', t.receive_label);
      setText('.fee-label', t.fee_label);
      setText('.rate-label', t.rate_label);
      setText('.speed-label', t.speed_label);
      setText('.speed-val', t.speed_val);
      setText('.section-title', t.compare_title);
      setText('.cta-title', t.cta_title);
      setText('.join-btn, .cta-btn', t.join_btn);
      setText('.start-btn', t.start_btn);
    },

    topup(t) {
      document.title = t.page_title;
      setHTML('#hero-title', t.hero_title);
      setText('#step1-title', t.step1_title);
      setText('#step2-title', t.step2_title);
      setText('#step3-title', t.step3_title);
      setText('#done-title', t.done_title);
      setText('#done-sub', t.done_sub);
      qa('.btn-secondary').forEach(b => { if(b.textContent.includes('Back') || b.textContent.includes('Tounen') || b.textContent.includes('Retour') || b.textContent.includes('Atrás')) b.textContent = t.back_btn; });
      setText('#btn1', t.continue_btn);
      setText('#btn2', t.continue_btn);
      setText('#btn3', t.confirm_btn);
      const doneBtn = q('.done-btn, button[onclick*="reset"]');
      if(doneBtn) doneBtn.textContent = t.another_btn;
    },

    billpay(t) {
      document.title = t.page_title;
      setHTML('#hero-title', t.hero_title);
      setText('#step1-title', t.step1_title);
      setText('#step2-title', t.step2_title);
      setText('#step3-title', t.step3_title);
      setText('#done-title', t.done_title);
      setText('#done-sub', t.done_sub);
      qa('.btn-secondary').forEach(b => { if(b.textContent.trim().match(/^(Back|Tounen|Retour|Atrás)/)) b.textContent = t.back_btn; });
      setText('#btn1', t.continue_btn);
      setText('#btn2', t.continue_btn);
      setText('#btn3', t.confirm_btn);
    },

    signup(t) {
      document.title = t.page_title;
      setHTML('.lp-headline', t.lp_headline);
      setText('.lp-sub', t.lp_sub);
      setText('.step-title', t.step1_title);
      setText('.step-sub', t.step1_sub);
      setPlaceholder('#fname', t.fname_placeholder);
      setPlaceholder('#lname', t.lname_placeholder);
      setPlaceholder('#email', t.email_placeholder);
      setPlaceholder('#phone', t.phone_placeholder);
      setPlaceholder('#password', t.password_placeholder);
      qa('.next-btn, .continue-btn').forEach(b => b.textContent = t.next_btn);
      qa('.back-btn').forEach(b => b.textContent = t.back_btn);
      setText('.finish-btn, button[type="submit"]', t.finish_btn);
      setText('.or-text', t.or_text);
      setText('.login-text', t.login_text);
      setText('.login-link', t.login_link);
    },

    invest(t) {
      document.title = t.page_title;
      setHTML('h1', t.hero_title);
      setText('.hero-sub', t.hero_sub);
      const secTitles = qa('.section-title');
      if(secTitles[0]) secTitles[0].textContent = t.problem_title;
      if(secTitles[1]) secTitles[1].textContent = t.market_title;
      const secSubs = qa('.section-sub');
      if(secSubs[0]) secSubs[0].textContent = t.problem_sub;
      setText('.invest-btn, .deck-btn', t.invest_btn);
      const contactBtn = q('a[href*="mailto:fedner"], .contact-direct-btn');
      if(contactBtn) contactBtn.textContent = t.contact_btn;
    },

    'agent-signup'(t) {
      document.title = t.page_title;
      const introTitle = q('h1');
      if(introTitle) setHTML('h1', t.title);
    },

    compare(t) {
      document.title = t.page_title;
      setHTML('h1', t.hero_title);
      setText('.hero-sub', t.hero_sub);
      const secs = qa('.section-title');
      if(secs[0]) secs[0].textContent = t.section1;
      if(secs[1]) secs[1].textContent = t.section2;
      if(secs[2]) secs[2].textContent = t.section3;
      setText('.cta-btn, .join-btn, .start-btn', t.cta_btn);
    },

    p2p(t) {
      document.title = t.page_title;
      setHTML('h1', t.hero_title);
      setText('.hero-sub', t.hero_sub);
      const secs = qa('.section-title');
      if(secs[0]) secs[0].textContent = t.section1;
      if(secs[1]) secs[1].textContent = t.section2;
      if(secs[2]) secs[2].textContent = t.section3;
      if(secs[3]) secs[3].textContent = t.section4;
      if(secs[4]) secs[4].textContent = t.section5;
      if(secs[5]) secs[5].textContent = t.section6;
      setText('.cta-btn, .join-btn, .start-btn', t.cta_btn);
    },

    send(t) {
      document.title = t.page_title;
      setHTML('h1', t.hero_title);
      setText('.cta-btn, .join-btn, .send-btn', t.cta_btn);
    },

    recipient(t) {
      document.title = t.page_title;
      setHTML('#hero-title', t.hero_title);
      setText('#hero-sub', t.hero_sub);
      setText('#how-title', t.how_title);
      setText('#cando-title', t.cando_title);
      setText('#agent-title', t.agent_title);
      setText('#cmp-title', t.cmp_title);
      setText('#test-title', t.test_title);
      setText('#app-title', t.app_title);
    },

    dashboard(t) {
      document.title = t.page_title;

      // Helper: update element with icon + text
      function setNavItem(el, text) {
        if (!el) return;
        const icon = el.querySelector('i');
        const badge = el.querySelector('span');
        el.innerHTML = '';
        if (icon) el.appendChild(icon);
        el.append(' ' + text);
        if (badge) el.appendChild(badge);
      }

      // Topbar & sidebar sign-out buttons
      qa('.logout-btn').forEach(btn => {
        const icon = btn.querySelector('i');
        btn.innerHTML = '';
        if (icon) btn.appendChild(icon);
        btn.append(' ' + t.sign_out);
      });

      // Sidebar nav links (by href)
      setNavItem(q('.sidebar a[href="dashboard.html"]'), t.nav_dashboard);
      setNavItem(q('.sidebar a[href="send.html"]'), t.nav_send);
      setNavItem(q('.sidebar a[href="topup.html"]'), t.nav_topup);
      setNavItem(q('.sidebar a[href="p2p.html"]'), t.nav_p2p);
      setNavItem(q('.sidebar a[href="billpay.html"]'), t.nav_billpay);
      // My Card button (preserve New badge)
      const cardBtn = q('.sidebar button[onclick*="scrollToCard"]');
      setNavItem(cardBtn, t.nav_card);
      // Account section label
      const navSec = q('.nav-section');
      if (navSec) navSec.textContent = t.nav_account;
      setNavItem(q('.sidebar a[href="referral.html"]'), t.nav_referral);
      setNavItem(q('.sidebar a[href="security.html"]'), t.nav_security);
      setNavItem(q('.sidebar a[href="faq.html"]'), t.nav_help);

      // Balance card
      setText('.balance-label', t.balance_label);
      // Action buttons (by icon class — keep icons, replace text)
      const actionBtns = qa('.balance-actions .action-btn');
      actionBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        if (!icon) return;
        const cls = icon.className;
        let label = null;
        if (cls.includes('ti-send')) label = t.btn_send;
        else if (cls.includes('ti-plus')) label = t.btn_add_funds;
        else if (cls.includes('ti-qrcode')) label = t.btn_receive;
        else if (cls.includes('ti-cash')) label = t.btn_cash_out;
        if (label) { btn.innerHTML = ''; btn.appendChild(icon); btn.append(' ' + label); }
      });
      // Balance sub-row labels
      const bsrLabels = qa('.bsr-label');
      if (bsrLabels[0]) bsrLabels[0].textContent = t.lbl_htg_value;
      if (bsrLabels[1]) bsrLabels[1].textContent = t.lbl_network;
      if (bsrLabels[2]) bsrLabels[2].textContent = t.lbl_gas_fees;
      // Gas fees value
      const bsrVals = qa('.bsr-val');
      if (bsrVals[2]) bsrVals[2].textContent = t.lbl_gas_free;

      // Quick links
      const qlLabels = qa('.quick-card-label');
      if (qlLabels[0]) qlLabels[0].textContent = t.ql_send_money;
      if (qlLabels[1]) qlLabels[1].textContent = t.ql_topup_phone;
      if (qlLabels[2]) qlLabels[2].textContent = t.ql_p2p_trading;
      if (qlLabels[3]) qlLabels[3].textContent = t.ql_pay_bills;

      // Account info card
      const infoCardTitles = qa('.info-card-title');
      if (infoCardTitles[0]) {
        const icon = infoCardTitles[0].querySelector('i');
        const editBtn = infoCardTitles[0].querySelector('button');
        if (editBtn) { const eIcon = editBtn.querySelector('i'); editBtn.innerHTML = ''; if (eIcon) editBtn.appendChild(eIcon); editBtn.append(' ' + t.btn_edit); }
        infoCardTitles[0].innerHTML = '';
        if (icon) infoCardTitles[0].appendChild(icon);
        infoCardTitles[0].append(' ' + t.card_account_title + ' ');
        if (editBtn) infoCardTitles[0].appendChild(editBtn);
      }
      if (infoCardTitles[1]) {
        const icon = infoCardTitles[1].querySelector('i');
        infoCardTitles[1].innerHTML = '';
        if (icon) infoCardTitles[1].appendChild(icon);
        infoCardTitles[1].append(' ' + t.card_bank_title);
      }
      if (infoCardTitles[2]) {
        const icon = infoCardTitles[2].querySelector('i');
        infoCardTitles[2].innerHTML = '';
        if (icon) infoCardTitles[2].appendChild(icon);
        infoCardTitles[2].append(' ' + t.wallet_card_title);
      }
      // Account info row labels
      const infoRowLabels = qa('.info-row-label');
      if (infoRowLabels[0]) infoRowLabels[0].textContent = t.lbl_full_name;
      if (infoRowLabels[1]) infoRowLabels[1].textContent = t.lbl_email;
      if (infoRowLabels[2]) infoRowLabels[2].textContent = t.lbl_phone;
      if (infoRowLabels[3]) infoRowLabels[3].textContent = t.lbl_kyc_status;
      if (infoRowLabels[4]) infoRowLabels[4].textContent = t.lbl_member_since;
      // Bank empty state
      const bankEmptyP = q('.bank-empty p');
      if (bankEmptyP) bankEmptyP.textContent = t.bank_empty;
      const linkBankBtn = q('.bank-empty .action-btn');
      if (linkBankBtn) {
        const icon = linkBankBtn.querySelector('i');
        linkBankBtn.innerHTML = '';
        if (icon) linkBankBtn.appendChild(icon);
        linkBankBtn.append(' ' + t.btn_link_bank);
      }
      // Wallet address hint
      const walletHint = q('#card-section ~ .info-card p, .info-card[style*="margin-bottom"] p');
      // fallback — find the <p> with "Send only USDC"
      qa('.info-card p').forEach(p => {
        if (p.textContent.includes('Send only USDC') || p.textContent.includes('USDC on Base')) {
          const icon = p.querySelector('i');
          p.innerHTML = '';
          if (icon) p.appendChild(icon);
          p.append(' ' + t.wallet_hint);
        }
      });

      // Virtual card section
      const vcTitle = q('#card-section h2');
      if (vcTitle) vcTitle.textContent = t.vc_title;
      const vcLoadingP = q('#vc-loading p');
      if (vcLoadingP) vcLoadingP.textContent = t.vc_loading;
      const vcNoneTitle = q('#vc-none h3');
      if (vcNoneTitle) vcNoneTitle.textContent = t.vc_none_title;
      const vcNoneDesc = q('#vc-none p');
      if (vcNoneDesc) vcNoneDesc.textContent = t.vc_none_desc;
      const issueBtn = q('#vc-none button');
      if (issueBtn) { const icon = issueBtn.querySelector('i'); issueBtn.innerHTML = ''; if (icon) issueBtn.appendChild(icon); issueBtn.append(' ' + t.btn_issue_card); }
      // Freeze / Reveal buttons
      const freezeBtn = document.getElementById('vc-freeze-btn');
      if (freezeBtn) { const icon = freezeBtn.querySelector('i'); freezeBtn.innerHTML = ''; if (icon) freezeBtn.appendChild(icon); freezeBtn.append(' ' + t.btn_freeze_card); }
      const revealBtn = q('#vc-card button[onclick*="revealCard"]');
      if (revealBtn) { const icon = revealBtn.querySelector('i'); revealBtn.innerHTML = ''; if (icon) revealBtn.appendChild(icon); revealBtn.append(' ' + t.btn_reveal_number); }
      const vcSecNote = q('#vc-card > p');
      if (vcSecNote) vcSecNote.textContent = t.vc_security_note;
      const retryBtn = q('#vc-error button');
      if (retryBtn) retryBtn.textContent = t.btn_retry;

      // Savings section
      const savingsTitle = q('.savings-header-text h3');
      if (savingsTitle) savingsTitle.textContent = t.savings_title;
      const savingsDesc = q('.savings-header-text p');
      if (savingsDesc) savingsDesc.textContent = t.savings_desc;
      const savingsApy = q('.savings-apy');
      if (savingsApy) { const icon = savingsApy.querySelector('i'); savingsApy.innerHTML = ''; if (icon) savingsApy.appendChild(icon); savingsApy.append(' ' + t.savings_stable); }
      const savingsSub = document.getElementById('savings-sub');
      if (savingsSub && savingsSub.textContent.includes('HTG')) savingsSub.textContent = t.savings_sub;
      const savingsBtns = qa('.savings-btn');
      if (savingsBtns[0]) { const icon = savingsBtns[0].querySelector('i'); savingsBtns[0].innerHTML = ''; if (icon) savingsBtns[0].appendChild(icon); savingsBtns[0].append(' ' + t.btn_move_savings); }
      if (savingsBtns[1]) { const icon = savingsBtns[1].querySelector('i'); savingsBtns[1].innerHTML = ''; if (icon) savingsBtns[1].appendChild(icon); savingsBtns[1].append(' ' + t.btn_withdraw); }

      // Modal titles
      const modalTitles = qa('.modal-title');
      modalTitles.forEach(mt => {
        const icon = mt.querySelector('i');
        const txt = mt.textContent.trim();
        let newTxt = null;
        if (txt.includes('Send Money') || txt.includes('Voye') || txt.includes('Envoyer') || txt.includes('Enviar')) newTxt = t.modal_send_title;
        else if (txt.includes('Add Funds') || txt.includes('Ajoute') || txt.includes('Ajouter') || txt.includes('Agregar')) newTxt = t.modal_funds_title;
        else if (txt.includes('Receive') || txt.includes('Resevwa') || txt.includes('Recevoir') || txt.includes('Recibir')) newTxt = t.modal_receive_title;
        else if (txt.includes('Cash Out') || txt.includes('Retire') || txt.includes('Retirer') || txt.includes('Retirar')) newTxt = t.modal_cashout_title;
        else if (txt.includes('Edit Profile') || txt.includes('Modifye') || txt.includes('Modifier') || txt.includes('Editar')) newTxt = t.modal_edit_profile_title;
        else if (txt.includes('Move to Savings') || txt.includes('Mete') || txt.includes('Déplacer') || txt.includes('Mover')) newTxt = t.modal_savings_deposit_title;
        else if (txt.includes('Withdraw from') || txt.includes('Retire nan') || txt.includes('Retirer de') || txt.includes('Retirar de')) newTxt = t.modal_savings_withdraw_title;
        if (newTxt) { mt.innerHTML = ''; if (icon) mt.appendChild(icon); mt.append(' ' + newTxt); }
      });

      // Cancel / Close / Done buttons
      qa('.action-btn.cancel-btn').forEach(btn => { btn.textContent = t.btn_cancel; });
      qa('button[onclick*="closeSendModal"], button[onclick*="closeReceiveModal"], button[onclick*="closeFundModal"], button[onclick*="closeCashOutModal"]').forEach(btn => {
        if (btn.classList.contains('action-btn') || btn.textContent.trim().match(/^(Close|Fèmen|Fermer|Cerrar|Cancel|Anile|Annuler|Cancelar)$/)) {
          const txt = btn.textContent.trim();
          if (txt.match(/^(Close|Fèmen|Fermer|Cerrar)$/)) btn.textContent = t.btn_close;
        }
      });
      // Close button in receive modal
      const closeReceiveBtn = q('#receive-modal .action-btn.cancel-btn');
      if (closeReceiveBtn) closeReceiveBtn.textContent = t.btn_close;
      // Done button in send success panel
      const doneBtn = q('#send-panel-4 button');
      if (doneBtn) doneBtn.textContent = t.btn_done;
    },

    login(t) {
      document.title = t.page_title;
      setText('.logo-sub', t.logo_sub);
      setText('label[for="email"]', t.email_label);
      setText('label[for="password"]', t.password_label);
      const btn = q('#submit-btn');
      if (btn) btn.innerHTML = '<i class="ti ti-login"></i> ' + t.submit_btn;
      setText('.divider', t.no_account);
      setText('.signup-link a', t.signup_link);
    },
  };

  // ── APPLY TRANSLATIONS ──
  function applyTranslations(lang) {
    const pageId = getPageId();
    const pageTr = T[pageId];
    if (!pageTr) return;
    const t = pageTr[lang] || pageTr.en;
    const translator = translators[pageId];
    if (translator) translator(t);
  }

  // ── SET LANG ──
  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('tchotcho_lang', lang);
    applyTranslations(lang);
    updateSwitcherUI(lang);
  }

  function updateSwitcherUI(lang) {
    qa('.tc-lang-btn').forEach(btn => {
      const isActive = btn.dataset.lang === lang;
      btn.style.background = isActive ? 'linear-gradient(135deg,#1055CC,#00AEEF)' : 'none';
      btn.style.color = isActive ? '#fff' : '#8FA8CC';
      btn.style.borderColor = isActive ? 'transparent' : 'rgba(0,174,239,.3)';
    });
    document.documentElement.lang = lang;
  }

  // ── INJECT SWITCHER ──
  function injectSwitcher() {
    const nav = q('nav');
    if (!nav) return;
    // Don't inject if already present or on index.html
    if (nav.querySelector('.tc-lang-switcher')) return;
    if (getPageId() === 'index') return;

    const sw = document.createElement('div');
    sw.className = 'tc-lang-switcher';
    sw.style.cssText = 'display:flex;gap:4px;margin-left:auto;flex-shrink:0;';
    ['EN','HT','FR','ES'].forEach(code => {
      const btn = document.createElement('button');
      btn.className = 'tc-lang-btn';
      btn.dataset.lang = code.toLowerCase();
      btn.textContent = code;
      btn.onclick = () => setLang(code.toLowerCase());
      btn.style.cssText = 'padding:5px 10px;border-radius:6px;border:1.5px solid rgba(0,174,239,.3);background:none;color:#8FA8CC;font-size:.75rem;font-weight:700;cursor:pointer;font-family:inherit;transition:.15s;white-space:nowrap;';
      btn.onmouseenter = () => { if(btn.dataset.lang !== currentLang) { btn.style.color='#fff'; btn.style.borderColor='rgba(0,174,239,.6)'; } };
      btn.onmouseleave = () => { if(btn.dataset.lang !== currentLang) { btn.style.color='#8FA8CC'; btn.style.borderColor='rgba(0,174,239,.3)'; } };
      sw.appendChild(btn);
    });

    // Find nav-links ul or right side; append after last nav item
    const navLinks = nav.querySelector('.nav-links, ul');
    if (navLinks) {
      navLinks.after(sw);
    } else {
      nav.appendChild(sw);
    }
  }

  // ── INIT ──
  function init() {
    injectSwitcher();
    setLang(currentLang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { setLang, getLang: () => currentLang };
})();

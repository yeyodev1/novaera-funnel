<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import RegistrationModal from '@/components/RegistrationModal.vue'
import { captureFbParams } from '@/utils/fbclid'

const router = useRouter()
const modalOpen = ref(false)
const IS_DEV = window.location.hostname === 'localhost'

const openModal = () => {
  if (!IS_DEV) {
    const disqAt = localStorage.getItem('os_disq_at')
    if (disqAt && Date.now() - Number(disqAt) < 48 * 60 * 60 * 1000) {
      router.push('/sin-espacio')
      return
    }
  }
  ; (window as any).fbq?.('track', 'CompleteRegistration', {
    content_name: 'cta-abrir-registro',
    value: 1,
    currency: 'USD',
  })
  modalOpen.value = true
}

const stats = [
  {
    icon: 'fa-solid fa-building',
    number: '19+',
    text: 'Años de experiencia comprobada en el mercado nacional corporativo e industrial',
  },
  {
    icon: 'fa-solid fa-chart-line',
    number: '22%',
    text: 'Incremento en el flujo de clientes premium reportado tras optimizar la infraestructura',
  },
  {
    icon: 'fa-solid fa-award',
    number: '40%',
    text: 'Aumento inmediato del valor percibido del inmueble y de tu marca comercial',
  },
]

const before = [
  'Fachadas desgastadas o genéricas que ahuyentan clientes premium en los primeros 3 segundos',
  'Presupuesto quemado en campañas digitales mientras tu imagen física destruye tu credibilidad',
  'Adecuaciones tratadas como "gasto" con proveedores informales, sobrecostos y retrasos',
  'Materiales baratos que se decoloran y degradan ante el clima en menos de un año',
  'Perder contratos y licitaciones rentables frente a competidores que se ven "más sólidos"',
]

const pillars = [
  {
    num: '01',
    icon: 'fa-solid fa-building',
    title: 'Ingeniería de fachadas de alto impacto',
    body: 'Diseñamos e instalamos fachadas monumentales con paneles compuestos (alucobond), vidrios templados de seguridad y logos corpóreos luminosos para capturar el tráfico visual y transformar tu edificio en un hito de alta autoridad.',
  },
  {
    num: '02',
    icon: 'fa-solid fa-couch',
    title: 'Adecuación interior y mobiliario comercial de estatus',
    body: 'Optimizamos los flujos de tránsito, diseñamos iluminación de precisión y fabricamos mobiliario premium a medida (counters, viniles HD). Cada centímetro acelera cierres de negocios y proyecta solidez inquebrantable.',
  },
  {
    num: '03',
    icon: 'fa-solid fa-truck-fast',
    title: 'Blindaje de marca exterior y branding vehicular',
    body: 'Transformamos cada camión o vehículo corporativo en una valla publicitaria móvil de alto impacto con viniles automotrices importados de alta durabilidad, garantizando uniformidad de marca en toda tu flota.',
  },
]

const testimonials = [
  {
    quote: 'Pasamos de la constante improvisación, los sobrecostos ocultos y los interminables retrasos con proveedores informales a una ejecución técnica perfecta, directa de fábrica. Incrementó el flujo de clientes premium en un 22% durante el primer trimestre.',
    author: 'Director de Operaciones',
    role: 'Grupo Corporativo — Sector Automotriz',
  },
  {
    quote: 'Si mañana retiro mi marca y coloco el letrero de mi competencia, nadie notaría la diferencia. Entendimos que necesitábamos dominar visualmente el mercado, no solo cumplir. NOVAERA transformó nuestras fachadas en verdaderos activos comerciales.',
    author: 'Director General',
    role: 'Corporación Multinacional',
  },
  {
    quote: 'Nuestros espacios estaban muertos comercialmente y atrapados en una guerra de precios. Gracias a la ingeniería de alto valor comercial de NOVAERA, elevamos drásticamente nuestro valor percibido y facturamos con fluidez.',
    author: 'Gerente General',
    role: 'Franquicia en expansión',
  },
]

const activeTestimonial = ref(0)

const BLOCK_HOURS = 6
const hours = ref('00')
const minutes = ref('00')
const seconds = ref('00')
let interval: ReturnType<typeof setInterval>

const computeRemaining = () => {
  const now = new Date()
  const blockStartHour = Math.floor(now.getHours() / BLOCK_HOURS) * BLOCK_HOURS
  const blockStart = new Date(now)
  blockStart.setHours(blockStartHour, 0, 0, 0)
  const blockEndMs = blockStart.getTime() + BLOCK_HOURS * 3600 * 1000
  return Math.max(0, Math.floor((blockEndMs - now.getTime()) / 1000))
}

const tick = () => {
  const total = computeRemaining()
  hours.value = String(Math.floor(total / 3600)).padStart(2, '0')
  minutes.value = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  seconds.value = String(total % 60).padStart(2, '0')
}

onMounted(() => {
  captureFbParams()
  sessionStorage.setItem('alu_page_entry', String(Date.now()))
  tick()
  interval = setInterval(tick, 1000)
  startProofRotation()
})

onUnmounted(() => {
  clearInterval(interval)
  stopProofRotation()
})

type Proof = { who: string; where: string; minutesAgo: number }

const PROOFS: Proof[] = [
  { who: 'Grupo Corporativo M&B', where: 'Guayaquil', minutesAgo: 3 },
  { who: 'Concesionaria Automotriz', where: 'Quito', minutesAgo: 8 },
  { who: 'Franquicia Gastronómica', where: 'Manta', minutesAgo: 14 },
  { who: 'Corporación Industrial', where: 'Guayaquil', minutesAgo: 19 },
  { who: 'Cadena de Retail S.A.', where: 'Cuenca', minutesAgo: 25 },
  { who: 'Importadora y Distribuidora', where: 'Quito', minutesAgo: 31 },
  { who: 'Consorcio Empresarial', where: 'Machala', minutesAgo: 38 },
  { who: 'Centro Médico Especializado', where: 'Guayaquil', minutesAgo: 44 },
  { who: 'Distribuidora y Almacenes Sierra', where: 'Quito', minutesAgo: 50 },
  { who: 'Sector Inmobiliario Corporativo', where: 'Guayaquil', minutesAgo: 57 },
]

const proofVisible = ref(false)
const proofIndex = ref(0)
const currentProof = ref<Proof | null>(null)
let proofShowTimer: ReturnType<typeof setTimeout> | null = null
let proofHideTimer: ReturnType<typeof setTimeout> | null = null
let proofDismissed = false

const SHOW_AFTER_MS = 3000
const VISIBLE_FOR_MS = 5000
const GAP_BETWEEN_MS = 2000

const showNextProof = () => {
  if (proofDismissed) return
  currentProof.value = PROOFS[proofIndex.value % PROOFS.length]
  proofIndex.value++
  proofVisible.value = true
  proofHideTimer = setTimeout(() => {
    proofVisible.value = false
    proofShowTimer = setTimeout(showNextProof, GAP_BETWEEN_MS)
  }, VISIBLE_FOR_MS)
}

const startProofRotation = () => {
  proofShowTimer = setTimeout(showNextProof, SHOW_AFTER_MS)
}

const stopProofRotation = () => {
  if (proofShowTimer) clearTimeout(proofShowTimer)
  if (proofHideTimer) clearTimeout(proofHideTimer)
  proofShowTimer = null
  proofHideTimer = null
}

const dismissProof = () => {
  proofDismissed = true
  proofVisible.value = false
  stopProofRotation()
}
</script>

<template>
  <div class="funnel">

    <header class="funnel__topbar">
      <img src="@/assets/logos/logo.png" class="funnel__logo-img" alt="NOVAERA Logo" />
      <p class="funnel__logo-sub">Ingeniería de Marca - Infraestructura Comercial</p>
    </header>

    <div class="funnel__urgency" role="banner">
      <div class="funnel__urgency-info">
        <span class="funnel__urgency-dot" aria-hidden="true" />
        <i class="fa-solid fa-bolt funnel__urgency-icon" aria-hidden="true"></i>
        <span class="funnel__urgency-text">CUPOS PARA <strong>DIAGNÓSTICO DE INFRAESTRUCTURA GRATUITO</strong> — Cierran en:</span>
        <div class="funnel__timer" aria-live="polite" aria-label="Tiempo restante">
          <span class="funnel__timer-block"><strong>{{ hours }}</strong><small>h</small></span>
          <span class="funnel__timer-sep" aria-hidden="true">:</span>
          <span class="funnel__timer-block"><strong>{{ minutes }}</strong><small>m</small></span>
          <span class="funnel__timer-sep" aria-hidden="true">:</span>
          <span class="funnel__timer-block"><strong>{{ seconds }}</strong><small>s</small></span>
        </div>
      </div>
      <button
        type="button"
        class="funnel__urgency-cta"
        aria-label="Agendar diagnóstico"
        @click="openModal()"
      >
        AGENDAR MI DIAGNÓSTICO
        <span aria-hidden="true">→</span>
      </button>
    </div>

    <Transition name="proof-fade">
      <div v-if="proofVisible && currentProof" class="funnel__proof" role="status" aria-live="polite">
        <div class="funnel__proof-icon" aria-hidden="true">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <div class="funnel__proof-body">
          <p class="funnel__proof-title">
            <strong>{{ currentProof.who }}</strong>
            <span>{{ currentProof.where }}</span>
          </p>
          <p class="funnel__proof-text">
            Acaba de agendar un <strong>diagnóstico comercial</strong>
          </p>
          <p class="funnel__proof-meta">
            <i class="fa-solid fa-clock" aria-hidden="true"></i>
            Hace {{ currentProof.minutesAgo }} min
          </p>
        </div>
        <button
          type="button"
          class="funnel__proof-close"
          aria-label="Cerrar notificación"
          @click="dismissProof"
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    </Transition>

    <section class="funnel__hero" aria-labelledby="funnel-headline">
      <div class="funnel__container">

        <p class="funnel__eyebrow">
          <i class="fa-solid fa-building-shield" aria-hidden="true"></i>
          Infraestructura Comercial Premium
        </p>

        <h1 id="funnel-headline" class="funnel__headline">
          Deja de perder contratos de alto valor por culpa de una infraestructura que no
          <span class="funnel__headline-accent">refleja tu verdadero nivel de éxito</span>
        </h1>

        <p class="funnel__hero-sub">
          Descubre cómo el sistema premium de NOVAERA transforma las fachadas y los espacios comerciales de empresas líderes,
          eliminando los retrasos de proveedores informales y convirtiendo tu infraestructura en una 
          máquina de atracción comercial masiva.
        </p>

        <ul class="funnel__benefits" role="list">
          <li class="funnel__benefit">
            <i class="fa-solid fa-check-circle" aria-hidden="true"></i>
            Sin retrasos ni improvisación de talleres artesanales.
          </li>
          <li class="funnel__benefit">
            <i class="fa-solid fa-check-circle" aria-hidden="true"></i>
            Garantía técnica directa de fábrica con materiales de alta durabilidad.
          </li>
          <li class="funnel__benefit">
            <i class="fa-solid fa-check-circle" aria-hidden="true"></i>
            Incremento automático del valor percibido de tus servicios y productos.
          </li>
          <li class="funnel__benefit">
            <i class="fa-solid fa-check-circle" aria-hidden="true"></i>
            Dominio visual absoluto frente a tus competidores directos.
          </li>
        </ul>

        <div class="funnel__urgency-callout" role="note">
          <i class="fa-solid fa-fire" aria-hidden="true"></i>
          <span>Exclusivo para <strong>empresas consolidadas y líderes comerciales</strong> — no atendemos proyectos residenciales ni búsquedas de "la cotización más barata".</span>
        </div>

        <div class="funnel__vsl-wrap">
          <div class="funnel__vsl" @click="openModal()" role="button" aria-label="Ver video" tabindex="0">
            <div class="funnel__vsl-bg">
              <img src="https://fast.wistia.com/embed/medias/uejodz5qm2/swatch" class="funnel__vsl-thumb" alt="" />
              <div class="funnel__vsl-blur-overlay"></div>
            </div>
            <div class="funnel__vsl-overlay">
              <div class="funnel__vsl-play">
                <i class="fa-solid fa-play" aria-hidden="true"></i>
              </div>
              <p class="funnel__vsl-caption">Mira el video y descubre cómo dominar visualmente tu mercado</p>
            </div>
          </div>
        </div>

        <div class="funnel__cta-wrap">
          <button class="funnel__cta-btn" @click="openModal()">
            <i class="fa-solid fa-calendar-check" aria-hidden="true"></i>
            AGENDAR DIAGNÓSTICO GRATUITO
          </button>
          <p class="funnel__cta-sub">
            <i class="fa-solid fa-lock" aria-hidden="true"></i>
            100% gratuito &nbsp;·&nbsp; Sin compromiso &nbsp;·&nbsp; Cupos limitados
          </p>
        </div>

      </div>
    </section>

    <section class="funnel__stats" aria-label="Resultados comprobados">
      <div class="funnel__container">
        <p class="funnel__section-label funnel__section-label--light">Resultados reales — clientes reales</p>
        <div class="funnel__stats-grid">
          <div v-for="stat in stats" :key="stat.number" class="funnel__stat">
            <div class="funnel__stat-icon" aria-hidden="true">
              <i :class="stat.icon"></i>
            </div>
            <strong class="funnel__stat-number">{{ stat.number }}</strong>
            <p class="funnel__stat-text">{{ stat.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="funnel__problem" aria-labelledby="problem-heading">
      <div class="funnel__container">
        <p class="funnel__section-label">¿Te identificas con esto?</p>
        <h2 id="problem-heading" class="funnel__section-title">
          El mito de que las adecuaciones son un "gasto estético"
        </h2>
        <p class="funnel__problem-intro">
          Contratar a un maestro de obra informal o un taller reactivo no es un ahorro — es un pasivo 
          que pagas al perder clientes de alto valor, proyectar desconfianza y retrasar tus aperturas. 
          Esto es lo que realmente estás pagando:
        </p>
        <div class="funnel__problem-grid">
          <div v-for="(item, i) in before" :key="i" class="funnel__problem-item">
            <i class="fa-solid fa-triangle-exclamation funnel__problem-icon" aria-hidden="true"></i>
            <div>
              <strong>{{ item.split(' — ')[0] || item }}</strong>
              <p>{{ item.includes(' — ') ? item.split(' — ')[1] : '' }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="funnel__method" aria-labelledby="method-heading">
      <div class="funnel__container">
        <p class="funnel__section-label">Sistema NOVAERA</p>
        <h2 id="method-heading" class="funnel__section-title">
          Infraestructura de alto valor comercial en 3 pilares
        </h2>

        <div class="funnel__pillar-card">
          <div class="funnel__pillar-num" aria-hidden="true">01</div>
          <div class="funnel__pillar-content">
            <div class="funnel__pillar-icon" aria-hidden="true">
              <i class="fa-solid fa-search"></i>
            </div>
            <h3 class="funnel__pillar-title">Auditoría Técnica y Levantamiento Digital en Sitio</h3>
            <p class="funnel__pillar-body">
              Realizamos un análisis estructural detallado, control fotogramétrico y escaneo de tu
              fachada o local actual antes de iniciar la producción. Detectamos vicios ocultos y
              restricciones de zonificación municipal para garantizar viabilidad absoluta.
              Resultado: cero retrasos por trámites u omisiones técnicas.
            </p>
          </div>
        </div>

        <div class="funnel__pillar-card">
          <div class="funnel__pillar-num" aria-hidden="true">02</div>
          <div class="funnel__pillar-content">
            <div class="funnel__pillar-icon" aria-hidden="true">
              <i class="fa-solid fa-arrows-spin"></i>
            </div>
            <h3 class="funnel__pillar-title">Ingeniería de Detalle y Sincronización de Obra</h3>
            <p class="funnel__pillar-body">
              Unificamos el diseño arquitectónico, la fabricación industrializada en planta y el
              montaje especializado en sitio. Coordinamos cuadrillas de obra civil, iluminación
              de marca e instalaciones en paralelo bajo una sola dirección de proyecto.
              Optimizamos los tiempos de entrega hasta en un 32%.
            </p>
          </div>
        </div>

        <div class="funnel__pillar-card">
          <div class="funnel__pillar-num" aria-hidden="true">03</div>
          <div class="funnel__pillar-content">
            <div class="funnel__pillar-icon" aria-hidden="true">
              <i class="fa-solid fa-shield"></i>
            </div>
            <h3 class="funnel__pillar-title">Materiales de Alto Rendimiento y Garantía Directa</h3>
            <p class="funnel__pillar-body">
              Seleccionamos exclusivamente paneles composite de aluminio (ACM) de grado premium,
              vidrios de alta seguridad con protección UV y sistemas LED de bajo consumo. Garantizamos
              resistencia al desgaste climático extremo y ofrecemos un respaldo de hasta 5 años
              en la estructura comercial.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="funnel__testimonials" aria-labelledby="testimonials-heading">
      <div class="funnel__container">
        <p class="funnel__section-label">Liderazgo de Mercado</p>
        <h2 id="testimonials-heading" class="funnel__section-title">
          Empresas que confían en NOVAERA
        </h2>

        <div class="funnel__test-carousel">
          <div
            v-for="(t, i) in testimonials"
            :key="i"
            class="funnel__test-card"
            :class="{ active: activeTestimonial === i }"
          >
            <i class="fa-solid fa-quote-left funnel__test-quote" aria-hidden="true"></i>
            <blockquote class="funnel__test-text">{{ t.quote }}</blockquote>
            <footer class="funnel__test-author">
              <div class="funnel__test-avatar" aria-hidden="true">
                <i class="fa-solid fa-user-tie"></i>
              </div>
              <div>
                <strong>{{ t.author }}</strong>
                <span>{{ t.role }}</span>
              </div>
            </footer>
          </div>
        </div>

        <div class="funnel__test-dots" role="tablist" aria-label="Navegar testimonios">
          <button
            v-for="(_, i) in testimonials"
            :key="i"
            type="button"
            class="funnel__test-dot"
            :class="{ active: activeTestimonial === i }"
            :aria-label="`Testimonio ${i + 1}`"
            :aria-selected="activeTestimonial === i"
            role="tab"
            @click="activeTestimonial = i"
          />
        </div>
      </div>
    </section>

    <section class="funnel__authority" aria-labelledby="authority-heading">
      <div class="funnel__container funnel__authority-inner">
        <div class="funnel__authority-photo-wrap">
          <div class="funnel__authority-avatar" aria-hidden="true">
            <i class="fa-solid fa-helmet-safety"></i>
          </div>
        </div>
        <div class="funnel__authority-content">
          <p class="funnel__authority-eyebrow">Nuestro Respaldo</p>
          <h2 id="authority-heading" class="funnel__authority-name">Ingeniería & Marca</h2>
          <p class="funnel__authority-role">Más de 19 años de dominio en el mercado nacional</p>
          <p class="funnel__authority-bio">
            Durante décadas, hemos presenciado cómo empresas líderes queman su presupuesto en publicidad y licitaciones, solo para perder frente a competidores que proyectan una imagen superior. 
            El mercado ha aceptado que el diseño sea tratado como un gasto menor con materiales dudosos. En <strong>NOVAERA</strong> nacimos para resolver ese vacío. Hemos transformado los espacios de firmas como <strong>Agripac, Kia, Primax, Dacar, Corpei, y Wendy's</strong>, entregando calidad premium directa de fábrica sin excusas ni improvisaciones.
          </p>
          <ul class="funnel__authority-creds" role="list">
            <li><i class="fa-solid fa-check-circle" aria-hidden="true"></i> 19 años de experiencia corporativa e industrial.</li>
            <li><i class="fa-solid fa-check-circle" aria-hidden="true"></i> Fábrica propia y control de calidad premium directo.</li>
            <li><i class="fa-solid fa-check-circle" aria-hidden="true"></i> Dominio absoluto de Neuromarketing e Ingeniería Civil.</li>
            <li><i class="fa-solid fa-check-circle" aria-hidden="true"></i> Solo aceptamos proyectos corporativos premium de gran escala.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="funnel__scarcity" aria-labelledby="scarcity-heading">
      <div class="funnel__container">
        <div class="funnel__scarcity-badge">
          <i class="fa-solid fa-gem" aria-hidden="true"></i>
          Ingeniería Comercial Premium
        </div>
        <h2 id="scarcity-heading" class="funnel__scarcity-title">
          Solo abrimos espacio para <span class="funnel__scarcity-accent">un número limitado de corporaciones</span>
        </h2>
        <p class="funnel__scarcity-sub">
          Debido al riguroso control técnico, la planificación de ingeniería y la ejecución directa de fábrica, procesamos un cupo limitado de proyectos de gran escala al mes para garantizar la excelencia que nos caracteriza.
        </p>
        <p class="funnel__scarcity-cta-text">
          Agenda hoy tu <strong>Diagnóstico de Infraestructura Comercial</strong>
          sin costo — analizaremos de manera exhaustiva tu infraestructura actual y te diremos con precisión 
          científica dónde estás perdiendo autoridad en el mercado.
        </p>
        <button class="funnel__cta-btn funnel__cta-btn--final" @click="openModal()">
          <i class="fa-solid fa-calendar-check" aria-hidden="true"></i>
          AGENDAR MI DIAGNÓSTICO GRATUITO
        </button>
        <p class="funnel__cta-sub">
          <i class="fa-solid fa-lock" aria-hidden="true"></i>
          100% gratuito &nbsp;·&nbsp; Sin compromiso &nbsp;·&nbsp; Cupos limitados
        </p>
      </div>
    </section>

    <footer class="funnel__footer">
      <div class="funnel__container funnel__footer-inner">
        <img src="@/assets/logos/logo.png" class="funnel__footer-logo-img" alt="NOVAERA Logo" />
        <p class="funnel__footer-desc">Ingeniería de Marca e Infraestructura Comercial</p>
        <nav class="funnel__footer-links" aria-label="Legal">
          <RouterLink to="/politicas-privacidad">Política de Privacidad</RouterLink>
          <RouterLink to="/aviso-legal">Aviso Legal</RouterLink>
        </nav>
        <p class="funnel__footer-copy">
          © {{ new Date().getFullYear() }} NOVAERA. Todos los derechos reservados.
        </p>
      </div>
    </footer>

  </div>

  <RegistrationModal :open="modalOpen" @close="modalOpen = false" />
</template>

<style lang="scss" scoped>
@use '@/styles/fonts.modules.scss' as fonts;
@use '@/styles/colorVariables.module.scss' as colors;

.funnel {
  background: #000000;
  color: colors.$OS-DARK;
  min-height: 100vh;
  font-family: fonts.$font-secondary;

  &__container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1.5rem;

    @media (min-width: 768px) {
      padding: 0 2rem;
    }
  }
}

.funnel__topbar {
  background: #000000;
  border-bottom: 1px solid #222222;
  padding: 0.9rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.06);
}

.funnel__logo-img {
  height: 35px;
  width: auto;
  object-fit: contain;
  @include fonts.heading-font(800);
  font-size: 1.3rem;
  letter-spacing: 0.1em;
  color: colors.$OS-NAVY;
  margin: 0;
}

.funnel__logo-sub {
  font-size: 0.68rem;
  color: #CCCCCC;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0;
}

.funnel__urgency {
  position: sticky;
  top: 0;
  z-index: 50;
  background: colors.$QS-URGENT;
  color: #ffffff;
  padding: 0.65rem 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  font-family: fonts.$font-interface;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  border-bottom: 2px solid colors.$QS-URGENT-LIGHT;
  box-shadow: 0 2px 12px rgba(colors.$QS-URGENT, 0.35);
  text-transform: uppercase;

  @media (min-width: 768px) {
    padding: 0.85rem 1.5rem;
    font-size: 0.95rem;
    justify-content: space-between;
    flex-wrap: nowrap;
  }
}

.funnel__urgency-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (min-width: 768px) {
    flex-wrap: nowrap;
  }
}

.funnel__urgency-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #000000;
  color: #ffffff;
  border: 2px solid colors.$QS-URGENT-LIGHT;
  border-radius: 999px;
  padding: 0.45rem 1rem;
  font-family: fonts.$font-accent;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  animation: cta-bounce 2.4s ease-in-out infinite;
  transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;

  span {
    font-size: 0.95rem;
    transition: transform 0.18s ease;
  }

  &:hover {
    background: #FFF5F5;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);

    span {
      transform: translateX(3px);
    }
  }

  &:active {
    transform: translateY(0);
  }

  @media (min-width: 768px) {
    padding: 0.55rem 1.2rem;
    font-size: 0.85rem;
  }
}

@keyframes cta-bounce {

  0%,
  100% {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    transform: scale(1);
  }

  50% {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    transform: scale(1.04);
  }
}

.funnel__proof {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  z-index: 1100;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #000000;
  border: 1px solid #333333;
  border-left: 4px solid colors.$OS-BLUE;
  border-radius: 12px;
  padding: 0.75rem 0.9rem 0.75rem 0.85rem;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.18);
  max-width: 320px;
  font-family: fonts.$font-secondary;

  @media (min-width: 768px) {
    bottom: 1.5rem;
    left: 1.5rem;
    max-width: 360px;
    padding: 0.9rem 1rem 0.9rem 0.95rem;
  }
}

.funnel__proof-icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(colors.$OS-BLUE, 0.14);
  color: colors.$OS-BLUE;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  margin-top: 2px;
}

.funnel__proof-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.funnel__proof-title {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  font-family: fonts.$font-interface;
  font-size: 0.86rem;
  line-height: 1.3;
  color: #FFFFFF;

  strong {
    font-weight: 800;
  }

  span {
    font-size: 0.74rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
  }
}

.funnel__proof-text {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.85);

  strong {
    color: #FFFFFF;
    font-weight: 700;
  }
}

.funnel__proof-meta {
  margin: 4px 0 0;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  display: inline-flex;
  align-items: center;
  gap: 4px;

  i {
    font-size: 0.66rem;
  }
}

.funnel__proof-close {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(colors.$OS-NAVY, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  transition: background 0.15s, color 0.15s;

  &:hover {
    color: #FFFFFF;
  }
}

.proof-fade-enter-active {
  transition: opacity 0.32s ease, transform 0.42s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.proof-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.25s ease;
}

.proof-fade-enter-from {
  opacity: 0;
  transform: translateY(14px) translateX(-8px);
}

.proof-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.funnel__urgency-icon {
  color: colors.$QS-URGENT-LIGHT;
  font-size: 1.1rem;
  filter: drop-shadow(0 0 6px rgba(colors.$QS-URGENT-LIGHT, 0.6));
  animation: bolt-flash 1.8s infinite;
}

@keyframes bolt-flash {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.55;
    transform: scale(0.92);
  }
}

.funnel__urgency-text {
  strong {
    font-weight: 900;
    color: #FFE4E4;
    letter-spacing: 0.04em;
  }
}

.funnel__urgency-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: colors.$QS-URGENT-LIGHT;
  flex-shrink: 0;
  animation: dot-pulse 1.5s infinite;
  box-shadow: 0 0 0 0 rgba(colors.$QS-URGENT-LIGHT, 0.6);
}

@keyframes dot-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
    transform: scale(1);
  }

  70% {
    box-shadow: 0 0 0 8px rgba(255, 107, 107, 0);
    transform: scale(1.1);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
    transform: scale(1);
  }
}

.funnel__timer {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background: rgba(0, 0, 0, 0.18);
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.funnel__timer-block {
  display: flex;
  align-items: baseline;
  gap: 2px;

  strong {
    font-size: 1.6rem;
    font-weight: 900;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: #ffffff;

    @media (min-width: 768px) {
      font-size: 2rem;
    }
  }

  small {
    font-size: 0.72rem;
    opacity: 0.85;
    font-weight: 700;
    text-transform: uppercase;
  }
}

.funnel__timer-sep {
  font-weight: 900;
  font-size: 1.4rem;
  opacity: 0.7;
  padding: 0 2px;
  line-height: 1;

  @media (min-width: 768px) {
    font-size: 1.7rem;
  }
}

.funnel__urgency-callout {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: rgba(colors.$QS-BLUE, 0.08);
  border-left: 4px solid colors.$QS-BLUE;
  border-radius: 8px;
  padding: 0.85rem 1rem;
  margin: 1.25rem 0 1.5rem;
  font-family: fonts.$font-interface;
  font-size: 0.92rem;
  color: colors.$OS-DARK;
  font-weight: 600;

  i {
    color: colors.$QS-BLUE;
    font-size: 1.15rem;
    flex-shrink: 0;
  }

  strong {
    color: colors.$OS-DARK;
    font-weight: 800;
  }

  @media (min-width: 768px) {
    font-size: 1rem;
    padding: 1rem 1.25rem;
  }
}

.funnel__hero {
  padding: 3.5rem 0 3rem;
  background: #000000;
}

.funnel__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(colors.$QS-BLUE, 0.08);
  border: 1px solid rgba(colors.$QS-BLUE, 0.25);
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  color: #E2E8F0;
  font-family: fonts.$font-interface;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0 0 1.4rem;

  i {
    font-size: 0.8rem;
  }
}

.funnel__headline {
  @include fonts.heading-font(800);
  font-size: clamp(2rem, 5vw, 3.1rem);
  line-height: 1.15;
  color: colors.$OS-DARK;
  margin: 0 0 1rem;
  letter-spacing: -0.025em;

  &-accent {
    color: colors.$OS-RED;
  }
}

.funnel__hero-sub {
  font-size: 1rem;
  color: #FFFFFF;
  line-height: 1.65;
  margin: 0 0 1.5rem;
  max-width: 720px;

  strong {
    color: colors.$OS-DARK;
    font-weight: 700;
  }
}

.funnel__benefits {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.funnel__benefit {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.93rem;
  color: #FFFFFF;

  i {
    color: colors.$OS-BLUE;
    font-size: 0.82rem;
    flex-shrink: 0;
  }
}

.funnel__vsl-wrap {
  margin-bottom: 2rem;
}

.funnel__vsl {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #D8E6F5;
  box-shadow: 0 8px 40px rgba(0, 82, 165, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 48px rgba(0, 82, 165, 0.2);
  }

  &:focus-visible {
    outline: 3px solid colors.$OS-BLUE;
    outline-offset: 2px;
  }
}

.funnel__vsl-bg {
  position: absolute;
  inset: 0;
  background: colors.$OS-NAVY;
  display: flex;
  align-items: center;
  justify-content: center;
}

.funnel__vsl-thumb {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(8px) brightness(0.6);
  transform: scale(1.1);
  transition: filter 0.4s ease, transform 0.4s ease, brightness 0.4s ease;

  .funnel__vsl:hover & {
    filter: blur(4px) brightness(0.75);
    transform: scale(1.05);
  }
}

.funnel__vsl-blur-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(colors.$OS-NAVY, 0.2) 0%, rgba(colors.$OS-NAVY, 0.6) 100%);
  z-index: 1;
}

.funnel__vsl-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  z-index: 2;
}

.funnel__vsl-play {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
  transition: transform 0.2s ease;

  .funnel__vsl:hover & {
    transform: scale(1.1);
  }

  i {
    color: colors.$OS-RED;
    font-size: 1.7rem;
    margin-left: 5px;
  }
}

.funnel__vsl-caption {
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
  padding: 0 2rem;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
  max-width: 420px;
}

.funnel__cta-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.funnel__cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: colors.$OS-RED;
  color: #000000;
  border: none;
  border-radius: 12px;
  padding: 1.1rem 2.5rem;
  font-family: fonts.$font-accent;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  cursor: pointer;
  width: 100%;
  max-width: 520px;
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 20px rgba(240, 180, 41, 0.3);

  &:hover {
    background: #D49A1E;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(240, 180, 41, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.funnel__cta-sub {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: #CCCCCC;
  margin: 0;

  i {
    font-size: 0.72rem;
  }
}

.funnel__stats {
  background: colors.$OS-NAVY;
  padding: 3rem 0;
}

.funnel__section-label {
  font-family: fonts.$font-interface;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: colors.$OS-RED;
  margin: 0 0 1rem;

  &--light {
    color: rgba(#ffffff, 0.75);
  }
}

.funnel__stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 580px) {
    grid-template-columns: 1fr;
    gap: 1.75rem;
  }
}

.funnel__stat {
  text-align: center;
}

.funnel__stat-icon {
  font-size: 1.6rem;
  color: rgba(#ffffff, 0.35);
  margin-bottom: 0.5rem;
}

.funnel__stat-number {
  display: block;
  @include fonts.heading-font(800);
  font-size: 2.6rem;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 0.4rem;
  letter-spacing: -0.03em;
}

.funnel__stat-text {
  font-size: 0.83rem;
  color: rgba(#ffffff, 0.7);
  line-height: 1.45;
  margin: 0;
}

.funnel__problem {
  padding: 4rem 0;
  background: #000000;
}

.funnel__section-title {
  @include fonts.heading-font(800);
  font-size: clamp(1.6rem, 3.5vw, 2.2rem);
  color: colors.$OS-DARK;
  margin: 0.25rem 0 1rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.funnel__problem-intro {
  font-size: 0.95rem;
  color: #FFFFFF;
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.funnel__problem-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.funnel__problem-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.25rem;
  background: #111111;
  border: 1px solid #222222;
  border-radius: 12px;

  strong {
    display: block;
    color: colors.$OS-DARK;
    font-size: 0.93rem;
    font-weight: 700;
    margin-bottom: 0.2rem;
  }

  p {
    font-size: 0.86rem;
    color: #FFFFFF;
    line-height: 1.5;
    margin: 0;
  }
}

.funnel__problem-icon {
  font-size: 1.2rem;
  color: colors.$QS-BLUE;
  flex-shrink: 0;
  margin-top: 2px;
}

.funnel__method {
  padding: 4rem 0;
  background: #111111;
}

.funnel__method .funnel__container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.funnel__pillar-card {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  background: #000000;
  border: 1px solid #222222;
  border-radius: 16px;
  padding: 1.75rem 2rem;
  position: relative;
  box-shadow: 0 2px 12px rgba(0, 82, 165, 0.05);

  @media (max-width: 640px) {
    flex-direction: column;
    padding: 1.5rem;
  }
}

.funnel__pillar-num {
  flex-shrink: 0;
  @include fonts.heading-font(800);
  font-size: 2.8rem;
  color: rgba(colors.$OS-NAVY, 0.07);
  line-height: 1;
  user-select: none;
  width: 48px;
}

.funnel__pillar-content {
  flex: 1;
}

.funnel__pillar-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: colors.$OS-NAVY;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.85rem;

  i {
    color: #ffffff;
    font-size: 1.1rem;
  }
}

.funnel__pillar-title {
  @include fonts.heading-font(700);
  font-size: 1.05rem;
  color: colors.$OS-DARK;
  margin: 0 0 0.5rem;
}

.funnel__pillar-body {
  font-size: 0.9rem;
  color: #FFFFFF;
  line-height: 1.6;
  margin: 0;
}

.funnel__testimonials {
  padding: 4rem 0;
  background: #000000;
}

.funnel__test-carousel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.funnel__test-card {
  background: #111111;
  border: 1px solid rgba(colors.$OS-NAVY, 0.1);
  border-left: 4px solid colors.$OS-NAVY;
  border-radius: 16px;
  padding: 2rem;
  max-width: 720px;
  margin: 0 auto;
  box-shadow: 0 4px 24px rgba(0, 82, 165, 0.07);
}

.funnel__test-quote {
  font-size: 2.2rem;
  color: rgba(colors.$OS-NAVY, 0.12);
  display: block;
  margin-bottom: 0.75rem;
  line-height: 1;
}

.funnel__test-text {
  font-size: 1rem;
  color: colors.$OS-DARK;
  line-height: 1.65;
  margin: 0 0 1.5rem;
  font-style: italic;
}

.funnel__test-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  strong {
    display: block;
    color: colors.$OS-DARK;
    font-size: 0.9rem;
    font-weight: 700;
  }

  span {
    font-size: 0.78rem;
    color: #CCCCCC;
  }
}

.funnel__test-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: colors.$OS-NAVY;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    color: #ffffff;
    font-size: 1.2rem;
  }
}

.funnel__test-dots {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 1.25rem;
}

.funnel__test-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: #D0DBE8;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  padding: 0;

  &.active {
    background: colors.$OS-NAVY;
    transform: scale(1.3);
  }

  &:hover {
    background: colors.$OS-BLUE;
  }
}

.funnel__authority {
  padding: 4rem 0;
  background: #000000;
  border-top: 1px solid #E4EDF7;
  border-bottom: 1px solid #E4EDF7;
}

.funnel__authority-inner {
  display: flex;
  gap: 2.5rem;
  align-items: flex-start;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
  }
}

.funnel__authority-photo-wrap {
  flex-shrink: 0;
}

.funnel__authority-avatar {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: colors.$OS-NAVY;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #ffffff;
  box-shadow: 0 4px 20px rgba(0, 82, 165, 0.2);

  i {
    color: rgba(#ffffff, 0.7);
    font-size: 3rem;
  }
}

.funnel__authority-content {
  flex: 1;
}

.funnel__authority-eyebrow {
  font-family: fonts.$font-interface;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: colors.$OS-BLUE;
  margin: 0 0 0.35rem;
}

.funnel__authority-name {
  @include fonts.heading-font(800);
  font-size: 2rem;
  color: colors.$OS-DARK;
  margin: 0 0 0.2rem;
  letter-spacing: -0.02em;
}

.funnel__authority-role {
  font-size: 0.88rem;
  color: #CCCCCC;
  margin: 0 0 1rem;
}

.funnel__authority-bio {
  font-size: 0.93rem;
  color: #FFFFFF;
  line-height: 1.65;
  margin: 0 0 1rem;

  strong {
    color: colors.$OS-DARK;
    font-weight: 700;
  }
}

.funnel__authority-creds {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.86rem;
    color: #FFFFFF;

    i {
      color: colors.$OS-BLUE;
      font-size: 0.82rem;
      flex-shrink: 0;
    }
  }
}

.funnel__scarcity {
  padding: 4.5rem 0;
  background: colors.$OS-NAVY;
  text-align: center;
}

.funnel__scarcity-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 1rem;
  border-radius: 999px;
  background: rgba(#ffffff, 0.08);
  border: 1px solid rgba(#ffffff, 0.18);
  font-family: fonts.$font-interface;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(#ffffff, 0.75);
  margin-bottom: 1rem;

  i {
    color: rgba(#ffffff, 0.5);
    font-size: 0.8rem;
  }
}

.funnel__scarcity-title {
  @include fonts.heading-font(800);
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  color: #ffffff;
  margin: 0 0 1rem;
  letter-spacing: -0.025em;
  line-height: 1.15;
}

.funnel__scarcity-accent {
  color: colors.$OS-RED;
}

.funnel__scarcity-sub {
  font-size: 1rem;
  color: rgba(#ffffff, 0.65);
  margin: 0 auto 1.5rem;
  max-width: 560px;
  line-height: 1.6;
}

.funnel__scarcity-cta-text {
  font-size: 1.05rem;
  color: rgba(#ffffff, 0.85);
  margin: 0 auto 2rem;
  max-width: 560px;
  line-height: 1.55;

  strong {
    color: #ffffff;
    font-weight: 700;
  }
}

.funnel__cta-btn--final {
  margin: 0 auto 1rem;
  background: colors.$OS-RED;
  box-shadow: 0 4px 24px rgba(240, 180, 41, 0.35);
  max-width: 560px;

  &:hover {
    background: #D49A1E;
  }
}

.funnel__scarcity .funnel__cta-sub {
  color: rgba(#ffffff, 0.5);
}

.funnel__footer {
  background: #000000;
  padding: 2rem 1.5rem;
}

.funnel__footer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}

.funnel__footer-logo-img {
  height: 32px;
  width: auto;
  object-fit: contain;
  margin: 0;
}

.funnel__footer-desc {
  font-size: 0.72rem;
  color: rgba(#ffffff, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}

.funnel__footer-links {
  display: flex;
  gap: 1.5rem;

  a {
    font-size: 0.78rem;
    color: rgba(#ffffff, 0.45);
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: rgba(#ffffff, 0.85);
    }
  }
}

.funnel__footer-copy {
  font-size: 0.72rem;
  color: rgba(#ffffff, 0.28);
  margin: 0;
}
</style>

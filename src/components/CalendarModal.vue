<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { trackStage, generateEventId } from '@/utils/ghl'
import { useContactStore } from '@/stores/contact'
import { getStoredFbParams } from '@/utils/fbclid'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const router = useRouter()
const contactStore = useContactStore()
const IS_DEV = window.location.hostname === 'localhost'

const submitting = ref(false)
const touched = ref(false)

const form = ref({
  tipo: '',
  volumen: '',
  presupuesto: '',
  reto: '',
  consent: false,
})

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

const isValid = () =>
  !!form.value.tipo &&
  !!form.value.volumen &&
  !!form.value.presupuesto &&
  wordCount(form.value.reto) >= 10 &&
  form.value.consent

const qualifies = () => {
  if (form.value.tipo === 'residencial' || form.value.presupuesto === 'bajo') return false
  return true
}

const handleSubmit = async () => {
  touched.value = true
  if (!isValid()) return

  submitting.value = true
  const contact = contactStore.get()
  const califica = qualifies()
  const scheduleEventId = generateEventId('schedule')

  const tipoLabel: Record<string, string> = {
    fachadas: 'Fachadas corporativas y exteriores',
    interiores: 'Adecuación interior y mobiliario comercial',
    vehicular: 'Branding de flota vehicular',
    residencial: 'Proyecto residencial / Vivienda',
  }
  const volumenLabel: Record<string, string> = {
    gran: 'Gran corporación / Multinacional',
    mediana: 'Mediana empresa',
    pequena: 'Pequeña empresa',
    micro: 'Microempresa / Emprendimiento',
  }
  const presupuestoLabel: Record<string, string> = {
    premium: 'Presupuesto premium (Inversión alta)',
    intermedio: 'Presupuesto intermedio (Desde $1,200)',
    bajo: 'Cotización más barata / Menos de $1,200',
  }

  const etiquetas = [
    'funnel-novaera',
    'step-2-cualificacion',
    califica ? 'califica-novaera' : 'no-califica-novaera',
    `tipo-${form.value.tipo}`,
    `tamano-${form.value.volumen}`,
    `budget-${form.value.presupuesto}`,
  ]

  const notas = `
━━━━━━━━━━━━━━━━━━━━━━━━
NOVA ERA — Cualificación
━━━━━━━━━━━━━━━━━━━━━━━━
👤 ${contact.nombre} ${contact.apellido}
📧 ${contact.email}
📱 ${contact.telefono}
━━━━━━━━━━━━━━━━━━━━━━━━
🏗 Tipo: ${tipoLabel[form.value.tipo] ?? form.value.tipo}
🏢 Empresa: ${volumenLabel[form.value.volumen] ?? form.value.volumen}
💰 Enfoque: ${presupuestoLabel[form.value.presupuesto] ?? form.value.presupuesto}
💡 Reto: ${form.value.reto}
━━━━━━━━━━━━━━━━━━━━━━━━
${califica ? '✅ CALIFICA' : '❌ NO CALIFICA — No cumple perfil premium'}
  `.trim()

  const pageEntry = Number(sessionStorage.getItem('alu_page_entry')) || Date.now()
  const pageDuration = Math.floor((Date.now() - pageEntry) / 1000)
  const notasConTiempo = `${notas}\n⏳ Tiempo total en página: ${Math.floor(pageDuration / 60)}m ${pageDuration % 60}s`

  const etiquetasStr = etiquetas.join(', ')
  const payload: Record<string, string> = {
    nombre: contact.nombre,
    apellido: contact.apellido,
    email: contact.email,
    telefono: contact.telefono,
    phone: contact.telefono,
    paso: '2-cualificacion',
    tipo: form.value.tipo,
    volumen: form.value.volumen,
    presupuesto: form.value.presupuesto,
    reto: form.value.reto,
    cualifica: califica ? 'true' : 'false',
    etiquetas: etiquetasStr,
    tags: etiquetasStr,
    notas: notasConTiempo,
    nota: notasConTiempo,
    pageDuration: String(pageDuration),
    event_id: scheduleEventId,
    ...getStoredFbParams(),
  }

  trackStage('cualificacion_completada', payload)

  const webhookUrl = import.meta.env.VITE_WEBHOOK_CALIFICACION ?? 'https://services.leadconnectorhq.com/hooks/8EtBNOULhyS8OpxPByOJ/webhook-trigger/WszpAhg0mv14AhIgrnl9'
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {})

  ;(window as any).fbq?.('track', 'CompleteRegistration',
    {
      content_name: 'cualificacion-step2',
      status: califica ? 'califica' : 'no-califica',
      value: 1,
      currency: 'USD',
    },
    { eventID: scheduleEventId }
  )

  submitting.value = false
  emit('close')

  if (califica) {
    ;(window as any).fbq?.('track', 'Lead')
    router.push('/agendar')
  } else {
    if (!IS_DEV) localStorage.setItem('os_disq_at', String(Date.now()))
    router.push('/sin-espacio')
  }
}

const onKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') emit('close') }

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

watch(() => props.open, (v) => {
  if (v) {
    touched.value = false
    form.value = { tipo: '', volumen: '', presupuesto: '', reto: '', consent: false }
  }
  document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="cal-fade">
      <div v-if="open" class="cal-backdrop" @click.self="emit('close')" role="dialog" aria-modal="true" aria-labelledby="cal-title">

        <div class="cal-modal">

          <button class="cal-close" @click="emit('close')" aria-label="Cerrar">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="cal-header">
            <div class="cal-header-icon" aria-hidden="true">
              <i class="fa-solid fa-building-shield"></i>
            </div>
            <h2 id="cal-title" class="cal-title">
              Antes de agendar, cuéntanos sobre
              <span class="cal-accent">tu proyecto</span>
            </h2>
            <p class="cal-subtitle">4 preguntas para preparar tu diagnóstico — 60 segundos.</p>
          </div>

          <form class="cal-form" @submit.prevent="handleSubmit" novalidate>

            <!-- Q1 — Tipo -->
            <fieldset class="cal-fieldset" :class="{ 'has-error': touched && !form.tipo }">
              <legend class="cal-legend">
                <span class="cal-q-num">01</span>
                ¿Qué tipo de proyecto necesitas desarrollar?
              </legend>
              <div class="cal-options">
                <label v-for="opt in [
                  { value: 'fachadas', label: 'Fachadas corporativas y exteriores' },
                  { value: 'interiores', label: 'Adecuación interior y mobiliario comercial' },
                  { value: 'vehicular', label: 'Branding de flota vehicular' },
                  { value: 'residencial', label: 'Proyecto residencial / Vivienda' },
                ]" :key="opt.value" class="cal-option" :class="{ selected: form.tipo === opt.value }">
                  <input type="radio" :value="opt.value" v-model="form.tipo" hidden />
                  <span class="cal-option__radio" aria-hidden="true" />
                  <span class="cal-option__label">{{ opt.label }}</span>
                </label>
              </div>
              <span v-if="touched && !form.tipo" class="cal-error">Selecciona una opción</span>
            </fieldset>

            <!-- Q2 — Volumen -->
            <fieldset class="cal-fieldset" :class="{ 'has-error': touched && !form.volumen }">
              <legend class="cal-legend">
                <span class="cal-q-num">02</span>
                ¿Cuál es el tamaño de tu empresa?
              </legend>
              <div class="cal-options">
                <label v-for="opt in [
                  { value: 'gran', label: 'Gran corporación / Multinacional' },
                  { value: 'mediana', label: 'Mediana empresa' },
                  { value: 'pequena', label: 'Pequeña empresa' },
                  { value: 'micro', label: 'Microempresa / Emprendimiento' },
                ]" :key="opt.value" class="cal-option" :class="{ selected: form.volumen === opt.value }">
                  <input type="radio" :value="opt.value" v-model="form.volumen" hidden />
                  <span class="cal-option__radio" aria-hidden="true" />
                  <span class="cal-option__label">{{ opt.label }}</span>
                </label>
              </div>
              <span v-if="touched && !form.volumen" class="cal-error">Selecciona una opción</span>
            </fieldset>

            <!-- Q3 — Presupuesto de proyecto -->
            <fieldset class="cal-fieldset cal-fieldset--budget" :class="{ 'has-error': touched && !form.presupuesto, 'has-investment': form.presupuesto && form.presupuesto !== 'bajo' }">
              <legend class="cal-legend cal-legend--budget">
                <span class="cal-q-num cal-q-num--budget">03</span>
                <span>¿Qué nivel de inversión buscas para este proyecto?</span>
                <i class="fa-solid fa-chart-line cal-legend-chart" aria-hidden="true"></i>
              </legend>
              <div class="cal-options">
                <label v-for="opt in [
                  { value: 'premium', label: 'Inversión alta (Materiales premium y garantía directa)', premium: true },
                  { value: 'intermedio', label: 'Presupuesto intermedio (Desde $1,200)', premium: false },
                  { value: 'bajo', label: 'Busco la cotización más barata del mercado (Menos de $1,200)', premium: false },
                ]" :key="opt.value" class="cal-option" :class="{
                  selected: form.presupuesto === opt.value,
                  'cal-option--premium': opt.premium && form.presupuesto === opt.value,
                  'cal-option--low': opt.value === 'bajo' && form.presupuesto === 'bajo',
                  'cal-option--premium-hover': opt.premium && form.presupuesto !== opt.value,
                }">
                  <input type="radio" :value="opt.value" v-model="form.presupuesto" hidden />
                  <span class="cal-option__radio" aria-hidden="true" />
                  <i v-if="opt.premium" class="fa-solid fa-gem cal-option__gem" aria-hidden="true"></i>
                  <span class="cal-option__label">{{ opt.label }}</span>
                </label>
              </div>
              <span v-if="touched && !form.presupuesto" class="cal-error">Selecciona un rango</span>
            </fieldset>

            <!-- Q4 — Reto -->
            <fieldset class="cal-fieldset" :class="{ 'has-error': touched && wordCount(form.reto) < 10 }">
              <legend class="cal-legend">
                <span class="cal-q-num">04</span>
                ¿Cuál es tu principal desafío con tu infraestructura actual?
              </legend>
              <textarea
                v-model="form.reto"
                class="cal-textarea"
                placeholder="Ej: Nuestra fachada se ve desgastada y estamos perdiendo contratos frente a competidores que proyectan mejor imagen..."
                rows="4"
                aria-describedby="q4-hint"
              ></textarea>
              <span id="q4-hint" class="cal-hint">
                {{ wordCount(form.reto) }}/10 palabras mínimo
              </span>
              <span v-if="touched && wordCount(form.reto) < 10" class="cal-error">
                Describe tu desafío con al menos 10 palabras
              </span>
            </fieldset>

            <!-- Consent -->
            <label class="cal-consent" :class="{ 'has-error': touched && !form.consent }">
              <input type="checkbox" v-model="form.consent" />
              <span class="cal-consent__box" aria-hidden="true" />
              <span class="cal-consent__text">
                Acepto que Nova Era me contacte para brindarme una sesión de diagnóstico de infraestructura.
              </span>
            </label>
            <span v-if="touched && !form.consent" class="cal-error">Debes aceptar para continuar</span>

            <button type="submit" class="cal-submit" :disabled="submitting">
              <span v-if="!submitting">
                <i class="fa-solid fa-calendar-check" aria-hidden="true"></i>
                Ver disponibilidad
              </span>
              <span v-else>
                <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                Procesando...
              </span>
            </button>

          </form>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '@/styles/fonts.modules.scss' as fonts;
@use '@/styles/colorVariables.module.scss' as colors;

.cal-fade-enter-active,
.cal-fade-leave-active { transition: opacity 0.25s ease; }
.cal-fade-enter-from,
.cal-fade-leave-to { opacity: 0; }

.cal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 900;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
}

.cal-modal {
  background: #000000;
  border-radius: 20px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
  border: 1px solid #222222;
}

.cal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #111111;
  color: #CCCCCC;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: background 0.2s, color 0.2s;
  z-index: 1;
  &:hover { background: #222222; color: colors.$OS-DARK; }
}

.cal-header {
  padding: 2rem 2rem 1.25rem;
  border-bottom: 1px solid #222222;
  text-align: center;
}

.cal-header-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: colors.$OS-NAVY;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  i { color: #ffffff; font-size: 1.4rem; }
}

.cal-title {
  @include fonts.heading-font(800);
  font-size: 1.45rem;
  color: colors.$OS-DARK;
  margin: 0 0 0.5rem;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.cal-accent { color: colors.$OS-RED; }

.cal-subtitle {
  font-size: 0.86rem;
  color: #CCCCCC;
  margin: 0;
}

.cal-form {
  padding: 1.5rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cal-fieldset {
  border: none;
  padding: 0;
  margin: 0;

  &.has-error .cal-options { border-color: colors.$OS-RED; border-radius: 10px; }

  &--budget {
    border: 1.5px solid transparent;
    border-radius: 12px;
    padding: 1rem 0.85rem;
    margin: 0 -0.85rem;
    transition: all 0.25s ease;

    &.has-investment {
      border-color: rgba(colors.$OS-BLUE, 0.2);
      background: rgba(colors.$OS-BLUE, 0.02);
      box-shadow: 0 0 20px rgba(colors.$OS-BLUE, 0.05);
    }
  }
}

.cal-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: fonts.$font-interface;
  font-size: 0.88rem;
  font-weight: 700;
  color: colors.$OS-DARK;
  margin-bottom: 0.75rem;

  &--budget {
    gap: 0.4rem;
  }
}

.cal-legend-chart {
  color: colors.$OS-BLUE;
  font-size: 0.8rem;
  margin-left: auto;
  animation: chart-pulse 2s ease-in-out infinite;

  .cal-fieldset--budget.has-investment & {
    animation: chart-pulse 1s ease-in-out infinite;
  }
}

@keyframes chart-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

.cal-q-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: colors.$OS-NAVY;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  flex-shrink: 0;

  &--budget {
    background: colors.$OS-BLUE;
    box-shadow: 0 0 12px rgba(colors.$OS-BLUE, 0.3);
  }
}

.cal-options {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.cal-option {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1.15rem;
  border: 1.5px solid #333333;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #151515;

  &:hover { 
    border-color: #555555; 
    background: #1e1e1e; 
    transform: translateY(-1px);
  }

  &.selected {
    border-color: colors.$OS-BLUE;
    background: rgba(colors.$OS-BLUE, 0.08);
    box-shadow: 0 4px 15px rgba(colors.$OS-BLUE, 0.15);
  }

  &__radio {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #555555;
    flex-shrink: 0;
    position: relative;
    transition: all 0.2s ease;

    .cal-option.selected & {
      border-color: colors.$OS-BLUE;
      background: rgba(colors.$OS-BLUE, 0.1);
      &::after {
        content: '';
        position: absolute;
        inset: 4px;
        border-radius: 50%;
        background: colors.$OS-BLUE;
        box-shadow: 0 0 8px colors.$OS-BLUE;
      }
    }
  }

  &__label {
    font-size: 0.92rem;
    color: #DDDDDD;
    font-weight: 500;
    transition: color 0.2s ease;
    .cal-option.selected & { color: #FFFFFF; font-weight: 600; text-shadow: 0 0 1px rgba(255,255,255,0.3); }
  }
}

.cal-textarea {
  width: 100%;
  border: 1.5px solid #333333;
  border-radius: 12px;
  padding: 1rem 1.15rem;
  font-family: fonts.$font-secondary;
  font-size: 0.92rem;
  color: #FFFFFF;
  background: #151515;
  resize: vertical;
  outline: none;
  transition: all 0.2s ease;
  line-height: 1.55;
  box-sizing: border-box;
  &::placeholder { color: rgba(255, 255, 255, 0.35); }
  &:focus { 
    border-color: colors.$OS-BLUE; 
    background: #1a1a1a; 
    box-shadow: 0 0 0 4px rgba(colors.$OS-BLUE, 0.1);
  }
}

.cal-hint {
  display: block;
  font-size: 0.76rem;
  color: #EEEEEE;
  margin-top: 0.35rem;
}

.cal-error {
  display: block;
  font-size: 0.78rem;
  color: colors.$OS-RED;
  margin-top: 0.35rem;
}

.cal-consent {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  cursor: pointer;
  padding: 0.5rem 0;

  input { display: none; }

  &__box {
    width: 20px;
    height: 20px;
    border: 2px solid #555555;
    border-radius: 6px;
    flex-shrink: 0;
    margin-top: 2px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    input:checked ~ & {
      background: colors.$OS-BLUE;
      border-color: colors.$OS-BLUE;
      box-shadow: 0 0 10px rgba(colors.$OS-BLUE, 0.3);
      &::after { content: '✓'; color: #ffffff; font-size: 0.8rem; font-weight: 900; }
    }
  }

  &__text {
    font-size: 0.82rem;
    color: #DDDDDD;
    line-height: 1.5;
  }
}

.cal-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: colors.$OS-RED;
  color: #000000;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-family: fonts.$font-accent;
  font-size: 0.97rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s ease, transform 0.15s ease;
  box-shadow: 0 4px 16px rgba(240, 180, 41, 0.3);
  &:hover:not(:disabled) { background: #D49A1E; transform: translateY(-1px); }
  &:disabled { opacity: 0.65; cursor: not-allowed; }
}
</style>

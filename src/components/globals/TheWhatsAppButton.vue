<script setup lang="ts">
const WHATSAPP_NUMBER = '593998602030'
const WHATSAPP_MESSAGE = 'Hola NOVAERA, quiero información sobre sus servicios.'

const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
</script>

<template>
  <a
    class="wa-float"
    :href="whatsappUrl"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Escríbenos por WhatsApp"
  >
    <span class="wa-float__pulse" aria-hidden="true"></span>
    <i class="fa-brands fa-whatsapp wa-float__icon" aria-hidden="true"></i>
    <span class="wa-float__label">Escríbenos por WhatsApp</span>
  </a>
</template>

<style lang="scss" scoped>
@use '@/styles/fonts.modules.scss' as fonts;

$WA-GREEN: #25d366;
$WA-GREEN-DARK: #1ebe5b;

.wa-float {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 850;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 58px;
  height: 58px;
  border-radius: 999px;
  background: $WA-GREEN;
  color: #ffffff;
  text-decoration: none;
  box-shadow: 0 10px 28px rgba($WA-GREEN, 0.4);
  transition:
    transform 0.2s ease,
    background 0.2s ease;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: $WA-GREEN-DARK;
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: 3px solid #ffffff;
    outline-offset: 3px;
  }

  @media (min-width: 768px) {
    right: 1.5rem;
    bottom: 1.5rem;
    width: auto;
    height: auto;
    padding: 0.85rem 1.4rem 0.85rem 1.1rem;
  }
}

.wa-float__icon {
  position: relative;
  font-size: 1.9rem;
  line-height: 1;

  @media (min-width: 768px) {
    font-size: 1.6rem;
  }
}

.wa-float__label {
  display: none;
  position: relative;
  font-family: fonts.$font-secondary;
  font-size: 0.95rem;
  font-weight: 700;
  white-space: nowrap;

  @media (min-width: 768px) {
    display: inline;
  }
}

.wa-float__pulse {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: $WA-GREEN;
  animation: wa-pulse 2.4s ease-out infinite;
  pointer-events: none;
}

@keyframes wa-pulse {
  0% {
    transform: scale(1);
    opacity: 0.55;
  }
  70%,
  100% {
    transform: scale(1.35);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wa-float__pulse {
    animation: none;
    display: none;
  }
}
</style>

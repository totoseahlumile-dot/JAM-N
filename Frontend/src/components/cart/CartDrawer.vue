<template>
  <div class="cart-overlay" :class="{ open: isOpen }" @click.self="close">
    <div class="cart-drawer">
      <header class="cart-header">
        <h2>Your Cart ({{ items.length }})</h2>
        <button class="close-btn" @click="close">✕</button>
      </header>

      <div v-if="items.length === 0" class="empty-cart">
        <p>Your cart is empty.</p>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div v-for="(item, index) in items" :key="index" class="cart-item">
            <div class="item-info">
              <p class="item-title">{{ item.beat.title }}</p>
              <p class="item-details">
                {{ item.beat.producer }} •
                <span class="license-tag">{{ item.licenseType }}</span>
              </p>
            </div>
            <div class="item-right">
              <span class="item-price">R{{ item.price }}</span>
              <button class="remove-btn" @click="$emit('remove-item', index)">✕</button>
            </div>
          </div>
        </div>

        <footer class="cart-footer">
          <div class="cart-total">
            <span>Total:</span>
            <span class="total-price">R{{ totalPrice }}</span>
          </div>
          <button class="checkout-btn" @click="handleCheckout">
            Proceed to Checkout
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  items: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:isOpen', 'remove-item', 'checkout'])

const totalPrice = computed(() => {
  return props.items.reduce((sum, item) => sum + item.price, 0)
})

function close() {
  emit('update:isOpen', false)
}

function handleCheckout() {
  alert(`Proceeding to checkout with ${props.items.length} item(s) total: R${totalPrice.value}`)
  emit('checkout')
}
</script>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: flex-end;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 999;
}

.cart-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.cart-drawer {
  width: 100%;
  max-width: 380px;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  padding: 1.5rem;
  box-sizing: border-box;
}

.cart-overlay.open .cart-drawer {
  transform: translateX(0);
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.cart-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.empty-cart {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
}

.cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  margin-top: 1rem;
}

.cart-items {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.item-title {
  font-weight: 700;
  font-size: 0.9rem;
  margin: 0;
}

.item-details {
  font-size: 0.75rem;
  color: #666;
  margin: 0.2rem 0 0;
}

.license-tag {
  text-transform: capitalize;
  font-weight: 600;
  color: #333;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-price {
  font-weight: 700;
  font-size: 0.9rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
}

.remove-btn:hover {
  color: #d00;
}

.cart-footer {
  border-top: 1px solid #eee;
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
  font-weight: 700;
}

.checkout-btn {
  width: 100%;
  padding: 0.85rem;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
</style>
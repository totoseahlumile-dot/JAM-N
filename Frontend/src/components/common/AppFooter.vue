<script setup></script>

<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-brand">
        <h2>JAM'N</h2>
        <p>Promoting local South African music talent.</p>
      </div>
      <div class="footer-links">
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 JAM'N. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background-color: var(--color-black);
  color: var(--color-off-white);
  padding: 2.5rem 1.5rem 1.5rem;
  margin-top: auto;
  border-top: 1px solid rgba(250, 250, 253, 0.1);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.footer-brand h2 {
  color: var(--color-wisteria);
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.footer-brand p {
  color: var(--color-off-white);
  opacity: 0.7;
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: var(--color-off-white);
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--color-frosted-blue);
}

.footer-bottom {
  max-width: 1200px;
  margin: 2rem auto 0;
  padding-top: 1rem;
  border-top: 1px solid rgba(250, 250, 253, 0.05);
  text-align: center;
  font-size: 0.8rem;
  opacity: 0.5;
}
</style>

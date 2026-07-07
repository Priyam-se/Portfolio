document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initCustomCursor();
  initTypewriter();
  initMobileMenu();
  initCardSpotlight();
  initScrollAnimations();
  initParticleCanvas();
  initTerminalWidget();
  initContactFormConsole();
});

/**
 * Custom Cursor Glow Tracking
 */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const glow = document.getElementById('custom-cursor-glow');
  
  if (!cursor || !glow) return;

  window.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    
    glow.animate({
      left: `${e.clientX}px`,
      top: `${e.clientY}px`
    }, { duration: 500, fill: 'forwards' });
  });

  const interactives = document.querySelectorAll('a, button, input, textarea, .work-card, #terminal-widget');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
}

/**
 * Typewriter Effect for Hero Section
 */
function initTypewriter() {
  const element = document.getElementById('typewriter');
  if (!element) return;

  const words = JSON.parse(element.getAttribute('data-words') || '[]');
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let currentText = '';

  const cursorSpan = document.createElement('span');
  cursorSpan.classList.add('typewriter-cursor');
  cursorSpan.textContent = '|';
  element.parentNode.insertBefore(cursorSpan, element.nextSibling);

  function type() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      currentText = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      currentText = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    element.textContent = currentText;

    let typeSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
  }

  setTimeout(type, 1000);
}

/**
 * Mobile Navigation Toggle
 */
function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  const links = document.querySelectorAll('.mobile-link');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('open');
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('open');
    });
  });
}

/**
 * Card Spotlight Mouse Glow effect
 */
function initCardSpotlight() {
  const cards = document.querySelectorAll('.work-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);
    });
  });
}

/**
 * Intersection Observer Reveal Animations & Skill progress
 */
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  const progressBars = document.querySelectorAll('.skill-progress');

  // Reveal observer
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => revealObserver.observe(el));

  // Active Nav link observer
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(section => navObserver.observe(section));

  // Skill bar loader observer
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        progressBars.forEach(bar => bar.classList.add('animate'));
        skillsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    skillsObserver.observe(skillsSection);
  }
}

/**
 * Dynamic Interactive Particle Canvas
 */
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  // Track size
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const particleCount = 45;
  const connectionDistance = 110;
  const mouse = { x: null, y: null, radius: 150 };

  // Mouse move listener
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Construct particle model
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce borders
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      // Mouse warp interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.hypot(dx, dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          // Warp gently towards cursor
          this.x -= dx * force * 0.03;
          this.y -= dy * force * 0.03;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212, 140, 106, 0.45)';
      ctx.fill();
    }
  }

  // Populate particles array
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Animation cycle
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      // Lines link mesh
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < connectionDistance) {
          const alpha = (connectionDistance - dist) / connectionDistance * 0.15;
          ctx.strokeStyle = `rgba(139, 156, 140, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }
  animate();
}

/**
 * About Section Mock Interactive Terminal
 */
function initTerminalWidget() {
  const terminal = document.getElementById('terminal-widget');
  const input = document.getElementById('terminal-input');
  const history = document.getElementById('terminal-history');
  
  if (!terminal || !input || !history) return;

  // Make terminal clickable to focus input
  terminal.addEventListener('click', () => input.focus());

  const commandResponses = {
    help: () => `
      <div class="terminal-line text-system">Available commands:</div>
      <div class="terminal-line">  <span class="text-highlight">bio</span>      - Display professional developer bio</div>
      <div class="terminal-line">  <span class="text-highlight">stack</span>    - Show technologies and coding stack</div>
      <div class="terminal-line">  <span class="text-highlight">origin</span>   - Display location / origin details</div>
      <div class="terminal-line">  <span class="text-highlight">contact</span>  - Print primary contact channels</div>
      <div class="terminal-line">  <span class="text-highlight">clear</span>    - Clear terminal shell console log</div>
    `,
    bio: () => `
      <div class="terminal-line">Priyam is a Full Stack Developer based in Odisha, India. He builds clean, robust interfaces and optimized backend systems using the MERN stack. Believes in unified design schemas and fast API architectures.</div>
    `,
    stack: () => `
      <div class="terminal-line text-system">MongoDB, Express.js, React.js, Node.js, REST APIs, Socket.io, Git, Docker.</div>
    `,
    origin: () => `
      <div class="terminal-line">Location: <span class="text-highlight">Odisha, India</span>. Known for ancient stone architecture, gorgeous coastlines, and pristine backend logic.</div>
    `,
    contact: () => `
      <div class="terminal-line">Email: <span class="text-highlight">priyampratyushpanda@gmail.com</span></div>
      <div class="terminal-line">GitHub: <a href="https://github.com/Priyam-SE" target="_blank" style="color: var(--accent-secondary); text-decoration: underline;">github.com/Priyam-SE</a></div>
    `
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const rawCmd = input.value.trim();
      const cmd = rawCmd.toLowerCase();
      input.value = '';

      if (cmd === '') return;

      // Log input prompt
      const promptLine = document.createElement('div');
      promptLine.className = 'terminal-line';
      promptLine.innerHTML = `<span class="terminal-prompt">priyam-se:~$</span> ${rawCmd}`;
      history.appendChild(promptLine);

      // Execute command response
      if (cmd === 'clear') {
        history.innerHTML = '';
      } else if (commandResponses[cmd]) {
        const responseDiv = document.createElement('div');
        responseDiv.innerHTML = commandResponses[cmd]();
        history.appendChild(responseDiv);
      } else {
        const errorLine = document.createElement('div');
        errorLine.className = 'terminal-line text-error';
        errorLine.innerHTML = `command not found: ${rawCmd}. Type <span class="text-highlight">'help'</span> for instructions.`;
        history.appendChild(errorLine);
      }

      // Auto scroll
      const body = document.getElementById('terminal-body');
      if (body) {
        body.scrollTop = body.scrollHeight;
      }
    }
  });
}

/**
 * Contact Form API Integration and Console Logs
 */
function initContactFormConsole() {
  const form = document.getElementById('contact-form');
  const consoleLog = document.getElementById('form-feedback-console');
  
  if (!form || !consoleLog) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    consoleLog.style.display = 'block';
    consoleLog.innerHTML = `
      <div class="text-system">> Connecting to local Node.js server...</div>
    `;

    try {
      // Step 1: Client side packaging logs
      await new Promise(r => setTimeout(r, 450));
      const line1 = document.createElement('div');
      line1.innerHTML = `> Packaging data payload: { name: "${name}", email: "${email}" }`;
      consoleLog.appendChild(line1);

      await new Promise(r => setTimeout(r, 450));
      const line2 = document.createElement('div');
      line2.innerHTML = `> POST /api/contact - Sending headers & JSON body...`;
      consoleLog.appendChild(line2);

      // Perform real API call
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      });

      const data = await response.json();

      await new Promise(r => setTimeout(r, 500));
      const statusLine = document.createElement('div');
      
      if (response.ok) {
        statusLine.innerHTML = `> Server Response: <span class="text-highlight">${response.status} OK</span>`;
        consoleLog.appendChild(statusLine);

        await new Promise(r => setTimeout(r, 400));
        const finalLine = document.createElement('div');
        finalLine.innerHTML = `> System: ${data.message || 'Logged successfully.'}`;
        consoleLog.appendChild(finalLine);
        
        // Reset input fields on success
        form.reset();
      } else {
        statusLine.innerHTML = `> Server Response: <span class="text-error">${response.status} ${response.statusText}</span>`;
        consoleLog.appendChild(statusLine);

        await new Promise(r => setTimeout(r, 400));
        const finalLine = document.createElement('div');
        finalLine.className = 'text-error';
        finalLine.innerHTML = `> Error: ${data.error || 'Failed to dispatch payload.'}`;
        consoleLog.appendChild(finalLine);
      }

    } catch (err) {
      const errorLine = document.createElement('div');
      errorLine.className = 'text-error';
      errorLine.innerHTML = `> Connection failed: Could not reach backend server. Make sure Node.js server is running.`;
      consoleLog.appendChild(errorLine);
    }
  });
}

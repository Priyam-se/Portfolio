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
  initMagneticButtons();
});

/**
 * Custom Cursor Glow Tracking
 */
function initCustomCursor() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const cursor = document.getElementById('custom-cursor');
  const glow = document.getElementById('custom-cursor-glow');
  
  if (!cursor || !glow) return;

  let cursorX = 0;
  let cursorY = 0;
  let isTicking = false;
  
  // Custom cursor trail for the glow
  let glowX = 0;
  let glowY = 0;

  function updateCursor() {
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    
    // Smooth trailing effect for the glow
    glowX += (cursorX - glowX) * 0.15;
    glowY += (cursorY - glowY) * 0.15;
    glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
    
    if (Math.abs(cursorX - glowX) > 0.1 || Math.abs(cursorY - glowY) > 0.1) {
      requestAnimationFrame(updateCursor);
    } else {
      isTicking = false;
    }
  }

  window.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(updateCursor);
    }
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
  // textContent removed to use CSS block cursor instead of character
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
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const cards = document.querySelectorAll('.work-card');
  
  cards.forEach(card => {
    const cardInner = card.querySelector('.work-card-inner');
    if (!cardInner) return;

    let isTicking = false;

    card.addEventListener('mousemove', (e) => {
      // Read phase
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (!isTicking) {
        isTicking = true;
        // Write phase
        requestAnimationFrame(() => {
          card.style.setProperty('--x', `${x}px`);
          card.style.setProperty('--y', `${y}px`);
          
          // 3D Tilt calculation
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -5; // max 5deg tilt
          const rotateY = ((x - centerX) / centerX) * 5; // max 5deg tilt
          
          cardInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;
          
          isTicking = false;
        });
      }
    });
    
    card.addEventListener('mouseleave', () => {
      cardInner.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)`;
      // Restore all transitions to prevent snapping
      cardInner.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    card.addEventListener('mouseenter', () => {
      // Keep hover transitions intact, add tiny smoothing to transform to eliminate jitter
      cardInner.style.transition = 'transform 0.1s ease-out, box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
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

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => {
    // Add staggered delay index for elements inside grids
    if (el.parentElement) {
      const siblings = Array.from(el.parentElement.querySelectorAll('.reveal'));
      const localIndex = siblings.indexOf(el);
      if (localIndex > -1) {
        el.style.setProperty('--reveal-idx', localIndex);
      }
    }
    revealObserver.observe(el);
  });

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
  const colors = ['#d48c6a', '#8b9c8c', '#e2e8f0', '#ffffff'];
  
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 2.5 + 1;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.originalVx = this.vx;
      this.originalVy = this.vy;
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
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1.0;
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
          const alpha = (connectionDistance - dist) / connectionDistance * 0.25;
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
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

  // Update custom block cursor position based on input length
  input.addEventListener('input', () => {
    input.parentElement.style.setProperty('--caret-pos', input.value.length);
  });

  // Make terminal clickable to focus input
  terminal.addEventListener('click', () => input.focus());

  const commandResponses = {
    help: [
      '<div class="terminal-line text-system">Available commands:</div>',
      '<div class="terminal-line">  <span class="text-highlight">bio</span>      - Display professional developer bio</div>',
      '<div class="terminal-line">  <span class="text-highlight">stack</span>    - Show technologies and coding stack</div>',
      '<div class="terminal-line">  <span class="text-highlight">origin</span>   - Display location / origin details</div>',
      '<div class="terminal-line">  <span class="text-highlight">contact</span>  - Print primary contact channels</div>',
      '<div class="terminal-line">  <span class="text-highlight">whoami</span>   - Identify current shell user</div>',
      '<div class="terminal-line">  <span class="text-highlight">sudo</span>     - Superuser execution</div>',
      '<div class="terminal-line">  <span class="text-highlight">clear</span>    - Clear terminal shell console log</div>'
    ],
    bio: [
      '<div class="terminal-line">Priyam is a Full Stack Developer based in Odisha, India. He builds clean, robust interfaces and optimized backend systems using the MERN stack. Believes in unified design schemas and fast API architectures.</div>'
    ],
    stack: [
      '<div class="terminal-line text-system">MongoDB, Express.js, React.js, Node.js, REST APIs, Socket.io, Git, Docker.</div>'
    ],
    origin: [
      '<div class="terminal-line">Location: <span class="text-highlight">Odisha, India</span>. Known for ancient stone architecture, gorgeous coastlines, and pristine backend logic.</div>'
    ],
    contact: [
      '<div class="terminal-line">Email: <span class="text-highlight">priyampratyushpanda@gmail.com</span></div>',
      '<div class="terminal-line">GitHub: <a href="https://github.com/Priyam-SE" target="_blank" style="color: var(--term-highlight); text-decoration: underline;">github.com/Priyam-SE</a></div>'
    ],
    whoami: [
      '<div class="terminal-line">guest_user_xyz</div>'
    ],
    sudo: [
      '<div class="terminal-line text-error">Permission denied. This incident will be reported.</div>'
    ]
  };

  async function typeOutLine(htmlString, parent) {
    const line = document.createElement('div');
    line.className = 'terminal-line typing-fx';
    parent.appendChild(line);
    
    // Auto scroll as line is added
    const body = document.getElementById('terminal-body');
    if (body) body.scrollTop = body.scrollHeight;

    // Simple hack to type text but inject html quickly
    // For a real parser we'd need to handle tags, but we will just type text content and then snap to HTML, 
    // or type text and render tags instantly.
    
    let isTag = false;
    let currentHTML = "";
    
    for (let i = 0; i < htmlString.length; i++) {
      const char = htmlString[i];
      if (char === '<') isTag = true;
      currentHTML += char;
      if (char === '>') isTag = false;
      
      line.innerHTML = currentHTML + (i < htmlString.length - 1 ? '<span style="opacity: 0.5">█</span>' : '');
      
      if (!isTag) {
        await new Promise(r => setTimeout(r, 15)); // typing speed
        if (body) body.scrollTop = body.scrollHeight;
      }
    }
    line.innerHTML = htmlString;
  }

  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const rawCmd = input.value.trim();
      const cmd = rawCmd.toLowerCase();
      input.value = '';
      input.parentElement.style.setProperty('--caret-pos', 0);

      if (cmd === '') return;

      // Log input prompt
      const promptLine = document.createElement('div');
      promptLine.className = 'terminal-line';
      promptLine.innerHTML = `<span class="terminal-prompt">priyam-se:~$</span> ${rawCmd}`;
      history.appendChild(promptLine);

      // Disable input during typing
      input.disabled = true;

      if (cmd === 'clear') {
        history.innerHTML = '';
      } else {
        const responseLines = commandResponses[cmd] 
          ? commandResponses[cmd] 
          : [`<div class="terminal-line text-error">command not found: ${rawCmd}. Type <span class="text-highlight">'help'</span> for instructions.</div>`];
        
        for (const lineHTML of responseLines) {
          await typeOutLine(lineHTML, history);
        }
      }

      input.disabled = false;
      input.focus();
      
      const body = document.getElementById('terminal-body');
      if (body) body.scrollTop = body.scrollHeight;
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

/**
 * Magnetic Buttons Interaction
 */
function initMagneticButtons() {
  const magnets = document.querySelectorAll('.btn');
  magnets.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Reduce magnetic pull for subtleness
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      // Reset is handled gracefully via CSS transition
      btn.style.transform = '';
    });
  });
}

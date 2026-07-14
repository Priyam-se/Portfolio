document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initCustomCursor();
  initTypewriter();
  initMobileMenu();
  initCardSpotlight();
  initScrollAnimations();
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
  }, { passive: true });

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
    const inner = card.querySelector('.work-card-inner');
    let isTicking = false;

    card.addEventListener('mouseenter', () => {
      if (inner) {
        // Disable transform transition for instant mouse tracking, keep others
        inner.style.transition = 'border-color var(--transition-normal), box-shadow var(--transition-normal)';
      }
    });

    card.addEventListener('mousemove', (e) => {
      // Read phase on the non-moving container (.work-card) to avoid feedback loops
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate 3D tilt angles (max 10 degrees)
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      if (!isTicking) {
        isTicking = true;
        // Write phase
        requestAnimationFrame(() => {
          card.style.setProperty('--x', `${x}px`);
          card.style.setProperty('--y', `${y}px`);
          
          if (inner) {
            // Include translateY(-5px) to preserve hover lift from CSS
            inner.style.transform = `perspective(1000px) translateY(-5px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
          }
          isTicking = false;
        });
      }
    }, { passive: true });
    
    card.addEventListener('mouseleave', () => {
      if (inner) {
        // Reset to CSS transition and clear inline transform
        inner.style.transition = '';
        inner.style.transform = '';
      }
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

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
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
    let rect = null;
    let isTicking = false;

    btn.addEventListener('mouseenter', () => {
      // Cache bounding rect on enter to avoid layout thrashing during mousemove
      rect = btn.getBoundingClientRect();
      btn.style.transition = 'none'; // disable CSS transition during mouse tracking
    });

    btn.addEventListener('mousemove', (e) => {
      if (!rect) return;
      
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(() => {
          // Reduce magnetic pull for subtleness
          btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
          isTicking = false;
        });
      }
    }, { passive: true });
    
    btn.addEventListener('mouseleave', () => {
      rect = null;
      // Reset is handled gracefully via CSS transition
      btn.style.transition = '';
      btn.style.transform = '';
    });
  });
}

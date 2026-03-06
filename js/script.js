function getMobileMenuElements() {
    return {
        nav: document.getElementById('mobileNav'),
        overlay: document.getElementById('mobileNavOverlay'),
        btn: document.getElementById('hamburgerBtn'),
        closeBtn: document.querySelector('.mobile-nav-close')
    };
}

const menuScrollLockState = {
    isLocked: false,
    scrollY: 0,
    prev: {
        overflow: '',
        position: '',
        top: '',
        left: '',
        right: '',
        width: '',
        touchAction: ''
    }
};

function lockBodyScroll() {
    if (menuScrollLockState.isLocked) return;

    const bodyStyle = document.body.style;
    menuScrollLockState.scrollY = window.scrollY || window.pageYOffset || 0;
    menuScrollLockState.prev.overflow = bodyStyle.overflow;
    menuScrollLockState.prev.position = bodyStyle.position;
    menuScrollLockState.prev.top = bodyStyle.top;
    menuScrollLockState.prev.left = bodyStyle.left;
    menuScrollLockState.prev.right = bodyStyle.right;
    menuScrollLockState.prev.width = bodyStyle.width;
    menuScrollLockState.prev.touchAction = bodyStyle.touchAction;

    bodyStyle.overflow = 'hidden';
    bodyStyle.position = 'fixed';
    bodyStyle.top = `-${menuScrollLockState.scrollY}px`;
    bodyStyle.left = '0';
    bodyStyle.right = '0';
    bodyStyle.width = '100%';
    bodyStyle.touchAction = 'none';

    menuScrollLockState.isLocked = true;
}

function unlockBodyScroll() {
    if (!menuScrollLockState.isLocked) return;

    const bodyStyle = document.body.style;
    bodyStyle.overflow = menuScrollLockState.prev.overflow;
    bodyStyle.position = menuScrollLockState.prev.position;
    bodyStyle.top = menuScrollLockState.prev.top;
    bodyStyle.left = menuScrollLockState.prev.left;
    bodyStyle.right = menuScrollLockState.prev.right;
    bodyStyle.width = menuScrollLockState.prev.width;
    bodyStyle.touchAction = menuScrollLockState.prev.touchAction;

    window.scrollTo(0, menuScrollLockState.scrollY);
    menuScrollLockState.isLocked = false;
}

function applyMobileMenuState(isOpen) {
    const { nav, overlay, btn } = getMobileMenuElements();
    if (!nav || !overlay || !btn) return;

    nav.classList.toggle('active', isOpen);
    overlay.classList.toggle('active', isOpen);
    btn.classList.toggle('active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    if (isOpen) {
        lockBodyScroll();
    } else {
        unlockBodyScroll();
    }
}

function toggleMobileMenu() {
    const { nav } = getMobileMenuElements();
    if (!nav) return;
    applyMobileMenuState(!nav.classList.contains('active'));
}

function closeMobileMenu() {
    applyMobileMenuState(false);
}

function bindMobileMenuEvents() {
    const { btn, overlay, closeBtn } = getMobileMenuElements();
    if (btn) btn.addEventListener('click', toggleMobileMenu);
    if (overlay) overlay.addEventListener('click', closeMobileMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);

    document.querySelectorAll('.mobile-nav-link, .mobile-nav .btn, .header-nav .nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) closeMobileMenu();
    });

    window.addEventListener('orientationchange', () => {
        setTimeout(closeMobileMenu, 120);
    });

    window.addEventListener('pageshow', closeMobileMenu);
    window.addEventListener('load', closeMobileMenu);

    document.addEventListener('click', (event) => {
        if (!document.body.classList.contains('menu-open')) return;

        const { nav, btn } = getMobileMenuElements();
        const target = event.target;
        if (!(target instanceof Element)) return;

        const clickedNav = nav ? nav.contains(target) : false;
        const clickedBtn = btn ? btn.contains(target) : false;
        if (!clickedNav && !clickedBtn) closeMobileMenu();
    }, true);
}

function initRevealAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in-up');
    if (!fadeElements.length) return;

    if (!('IntersectionObserver' in window)) {
        fadeElements.forEach(el => el.classList.add('visible'));
        return;
    }

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    fadeElements.forEach(el => fadeObserver.observe(el));
}

function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const answerInner = item.querySelector('.faq-answer-inner');
        if (!question || !answer || !answerInner) return;

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            faqItems.forEach(faq => {
                faq.classList.remove('active');
                const faqAnswer = faq.querySelector('.faq-answer');
                if (faqAnswer) faqAnswer.style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answerInner.scrollHeight + 'px';
            }
        });
    });
}

function initBriefingForm() {
    const form = document.getElementById('briefingForm');
    if (!form) return;

    const steps = Array.from(document.querySelectorAll('.form-step'));
    const stepIndicators = Array.from(document.querySelectorAll('.step-indicator'));
    const nextBtns = document.querySelectorAll('.btn-next');
    const prevBtns = document.querySelectorAll('.btn-prev');
    let currentStep = 0;

    function updateStepper() {
        stepIndicators.forEach((ind, index) => {
            if (index < currentStep) {
                ind.classList.add('completed');
                ind.classList.remove('active');
            } else if (index === currentStep) {
                ind.classList.add('active');
                ind.classList.remove('completed');
            } else {
                ind.classList.remove('active', 'completed');
            }
        });
    }

    function showStep(index) {
        const clampedIndex = Math.max(0, Math.min(index, steps.length - 1));
        currentStep = clampedIndex;
        steps.forEach((step, i) => {
            step.classList.toggle('active', i === currentStep);
        });
        updateStepper();
    }

    function validateStep(index) {
        const step = steps[index];
        if (!step) return false;

        const inputs = step.querySelectorAll('input[required], select[required]');
        let valid = true;

        inputs.forEach(input => {
            const errorMsg = input.parentElement ? input.parentElement.querySelector('.error-msg') : null;
            const isInvalid = !input.value.trim() || (input.type === 'checkbox' && !input.checked);

            input.classList.toggle('invalid', isInvalid);
            if (errorMsg) errorMsg.style.display = isInvalid ? 'block' : 'none';
            if (isInvalid) valid = false;
        });

        if (index === 1) {
            const checkboxes = step.querySelectorAll('input[name="ambiente"]:checked');
            const error = document.getElementById('ambienteError');
            if (error) {
                error.style.display = checkboxes.length === 0 ? 'block' : 'none';
            }
            if (checkboxes.length === 0) valid = false;
        }

        return valid;
    }

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                showStep(currentStep + 1);
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showStep(currentStep - 1);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateStep(currentStep)) return;

        const nome = document.getElementById('nome') ? document.getElementById('nome').value : '';
        const telefone = document.getElementById('telefone') ? document.getElementById('telefone').value : '';
        const cep = document.getElementById('cep') ? document.getElementById('cep').value : '';
        const tipoImovelSelect = document.getElementById('tipoImovel');
        const faseObraSelect = document.getElementById('faseObra');
        const investimentoSelect = document.getElementById('investimento');
        const prazoSelect = document.getElementById('prazo');
        const pagamentoInput = document.getElementById('pagamento');
        const observacoesInput = document.getElementById('observacoes');

        const tipoImovel = tipoImovelSelect ? tipoImovelSelect.options[tipoImovelSelect.selectedIndex].text : '';
        const faseObra = faseObraSelect ? faseObraSelect.options[faseObraSelect.selectedIndex].text : '';
        const investimento = investimentoSelect ? investimentoSelect.options[investimentoSelect.selectedIndex].text : '';
        const prazo = prazoSelect ? prazoSelect.options[prazoSelect.selectedIndex].text : '';
        const pagamento = pagamentoInput && pagamentoInput.value ? pagamentoInput.value : 'NÃ£o informado';
        const observacoes = observacoesInput && observacoesInput.value ? observacoesInput.value : 'Nenhuma observaÃ§Ã£o';

        const ambientesElements = document.querySelectorAll('input[name="ambiente"]:checked');
        const ambientes = Array.from(ambientesElements).map(cb => cb.value).join(', ');

        let msg = `OlÃ¡, Duo Conceito! Meu nome Ã© *${nome}* e gostaria de um orÃ§amento para mÃ³veis planejados.\n\n`;
        msg += `*ImÃ³vel:* ${tipoImovel} (${faseObra})\n`;
        msg += `*CEP:* ${cep}\n`;
        msg += `*Ambientes:* ${ambientes}\n`;
        msg += `*Investimento Previsto:* ${investimento}\n`;
        msg += `*Prazo para Fechamento:* ${prazo}\n`;
        msg += `*Pagamento Ideal:* ${pagamento}\n\n`;
        msg += `*ObservaÃ§Ãµes Extras:*\n${observacoes}\n\n`;
        msg += `Meu WhatsApp para contato: ${telefone}\n`;
        msg += `Aguardo o retorno!`;

        const wppUrl = `https://wa.me/5515991219995?text=${encodeURIComponent(msg)}`;
        window.open(wppUrl, '_blank');

        const stepper = document.querySelector('.stepper');
        const sectionHeader = document.querySelector('.briefing-box .section-header');
        const formSuccess = document.getElementById('formSuccess');

        form.style.display = 'none';
        if (stepper) stepper.style.display = 'none';
        if (sectionHeader) sectionHeader.style.display = 'none';
        if (formSuccess) formSuccess.style.display = 'block';
    });
}

function initGalleryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (!filterButtons.length || !galleryItems.length) return;

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');
            const galeria = document.getElementById('galeria');
            if (galeria) {
                galeria.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                const show = filterValue === 'all' || filterValue === itemCategory;
                item.classList.toggle('hide', !show);
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindMobileMenuEvents();
    closeMobileMenu();
    initRevealAnimations();
    initFaqAccordion();
    initBriefingForm();
    initGalleryFilters();
});

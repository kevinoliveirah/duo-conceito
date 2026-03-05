document.addEventListener('DOMContentLoaded', () => {
    // Reveal Animations on Scroll
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(faq => {
                faq.classList.remove('active');
                faq.querySelector('.faq-answer').style.maxHeight = null;
            });
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.querySelector('.faq-answer-inner').scrollHeight + "px";
            }
        });
    });

    // Multi-Step Form
    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const nextBtns = document.querySelectorAll('.btn-next');
    const prevBtns = document.querySelectorAll('.btn-prev');
    const form = document.getElementById('briefingForm');
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
        steps.forEach((step, i) => {
            step.classList.toggle('active', i === index);
        });
        updateStepper();
    }

    function validateStep(index) {
        const step = steps[index];
        const inputs = step.querySelectorAll('input[required], select[required]');
        let valid = true;

        inputs.forEach(input => {
            const errorMsg = input.parentElement.querySelector('.error-msg');
            if (!input.value.trim() || (input.type === 'checkbox' && !input.checked)) {
                input.classList.add('invalid');
                if (errorMsg) errorMsg.style.display = 'block';
                valid = false;
            } else {
                input.classList.remove('invalid');
                if (errorMsg) errorMsg.style.display = 'none';
            }
        });

        if (index === 1) { // Check at least one environment
            const checkboxes = step.querySelectorAll('input[name="ambiente"]:checked');
            const error = document.getElementById('ambienteError');
            if (checkboxes.length === 0) {
                error.style.display = 'block';
                valid = false;
            } else {
                error.style.display = 'none';
            }
        }

        return valid;
    }

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            showStep(currentStep);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
            // Collect Form Data
            const nome = document.getElementById('nome').value;
            const telefone = document.getElementById('telefone').value;
            const cep = document.getElementById('cep').value;
            const tipoImovel = document.getElementById('tipoImovel').options[document.getElementById('tipoImovel').selectedIndex].text;
            const faseObra = document.getElementById('faseObra').options[document.getElementById('faseObra').selectedIndex].text;

            const ambientesElements = document.querySelectorAll('input[name="ambiente"]:checked');
            const ambientes = Array.from(ambientesElements).map(cb => cb.value).join(', ');

            const investimento = document.getElementById('investimento').options[document.getElementById('investimento').selectedIndex].text;
            const prazo = document.getElementById('prazo').options[document.getElementById('prazo').selectedIndex].text;
            const pagamento = document.getElementById('pagamento').value || 'Não informado';
            const observacoes = document.getElementById('observacoes').value || 'Nenhuma observação';

            // Construct WhatsApp Message
            let msg = `Olá, Duo Conceito! Meu nome é *${nome}* e gostaria de um orçamento para móveis planejados.\n\n`;
            msg += `*Imóvel:* ${tipoImovel} (${faseObra})\n`;
            msg += `*CEP:* ${cep}\n`;
            msg += `*Ambientes:* ${ambientes}\n`;
            msg += `*Investimento Previsto:* ${investimento}\n`;
            msg += `*Prazo para Fechamento:* ${prazo}\n`;
            msg += `*Pagamento Ideal:* ${pagamento}\n\n`;
            msg += `*Observações Extras:*\n${observacoes}\n\n`;
            msg += `Meu WhatsApp para contato: ${telefone}\n`;
            msg += `Aguardo o retorno!`;

            // Encode and Open WhatsApp
            const wppUrl = `https://wa.me/5515991219995?text=${encodeURIComponent(msg)}`;
            window.open(wppUrl, '_blank');

            // Success State
            form.style.display = 'none';
            document.querySelector('.stepper').style.display = 'none';
            document.querySelector('.briefing-box .section-header').style.display = 'none';
            document.getElementById('formSuccess').style.display = 'block';
        }
    });

    // Gallery Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and add to clicked
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // Scroll to the top of the gallery section
            document.getElementById('galeria').scrollIntoView({ behavior: 'smooth', block: 'start' });

            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');

                if (filterValue === 'all' || filterValue === itemCategory) {
                    item.classList.remove('hide');
                } else {
                    item.classList.add('hide');
                }
            });
        });
    });

    // Reveal Animations on Scroll (Intersection Observer enhancement)
    const fadeObserverOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, fadeObserverOptions);

    document.querySelectorAll('.fade-in-up').forEach(el => fadeObserver.observe(el));
});

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzwABDqu051sibw2NtZPgxyRD9S0Coj3a5fvbMRlgHB3-oK8JRgXAddGRxS_bMvdPjnzQ/exec";
const MODULE_MAX = { 1: 4, 2: 3 };

let selectedModule = null;
let memberCount = 0;

const membersContainer = document.getElementById('membersContainer');
const addBtn = document.getElementById('addMemberBtn');
const memberHint = document.getElementById('memberHint');
const moduleValueInput = document.getElementById('moduleValue');
const moduleError = document.getElementById('moduleError');
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_RE = /^(0092|\+92|0)3\d{9}$/;
const CNIC_RE = /^\d{5}-\d{7}-\d{1}$/;

document.querySelectorAll('.module-opt').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.module-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        moduleError.classList.remove('show');
        selectedModule = parseInt(opt.dataset.module, 10);
        moduleValueInput.value = opt.dataset.fee + ' (Module ' + selectedModule + ')';
        resetMembers();
    });
});

function resetMembers() {
    membersContainer.innerHTML = '';
    memberCount = 0;
    addMember();
    updateAddBtn();
    const max = MODULE_MAX[selectedModule];
    memberHint.textContent = 'Add up to ' + (max - 1) + ' more member(s) — team size 2 to ' + max + ' including the lead.';
}

function formatCnic(el) {
    let digits = el.value.replace(/\D/g, '').slice(0, 13);
    let out = digits;
    if (digits.length > 5) out = digits.slice(0, 5) + '-' + digits.slice(5);
    if (digits.length > 12) out = digits.slice(0, 5) + '-' + digits.slice(5, 12) + '-' + digits.slice(12);
    el.value = out;
}

function formatPhone(el) {
    let digits = el.value.replace(/[^\d+]/g, '');
    el.value = digits;
}

document.getElementById('leadCnic').addEventListener('input', e => formatCnic(e.target));
document.getElementById('leadPhone').addEventListener('input', e => formatPhone(e.target));

function addMember() {
    const max = MODULE_MAX[selectedModule] || 3;
    if (memberCount >= max - 1) return;
    memberCount++;
    const idx = memberCount;
    const block = document.createElement('div');
    block.className = 'member-block';
    block.dataset.idx = idx;
    block.innerHTML =
        '<div class="m-head"><span>Member ' + (idx + 1) + '</span>' +
        (idx > 1 ? '<button type="button" class="remove-btn">Remove</button>' : '') +
        '</div>' +
        '<div class="field">' +
        '<label>Full name</label>' +
        '<input type="text" class="mem-name" placeholder="e.g. Ahmed">' +
        '<div class="err-msg show-target">Enter this member&#39;s full name.</div>' +
        '</div>' +
        '<div class="row2">' +
        '<div class="field">' +
        '<label>Email</label>' +
        '<input type="email" class="mem-email" placeholder="e.g. ahmed@gmail.com">' +
        '<div class="err-msg show-target">Enter a valid email, e.g. name@example.com</div>' +
        '</div>' +
        '<div class="field">' +
        '<label>WhatsApp number</label>' +
        '<input type="tel" class="mem-phone" placeholder="03XX-XXXXXXX" maxlength="12">' +
        '<div class="err-msg show-target">Enter a valid Pakistani mobile number, e.g. 0301-2345678</div>' +
        '</div>' +
        '</div>' +
        '<div class="field">' +
        '<label>CNIC</label>' +
        '<input type="text" class="mem-cnic" placeholder="42101-1234567-1" maxlength="15">' +
        '<div class="err-msg show-target">Enter a valid 13-digit CNIC, e.g. 42101-1234567-1</div>' +
        '</div>' +
        '<div class="row2">' +
        '<div class="field">' +
        '<label>GPA</label>' +
        '<input type="number" class="mem-gpa" placeholder="e.g. 3.25" min="0" max="4" step="0.01">' +
        '<div class="err-msg show-target">Enter a valid GPA between 0.00 and 4.00.</div>' +
        '</div>' +
        '<div class="field">' +
        '<label>Experience Level</label>' +
        '<select class="mem-experience">' +
        '<option value="" disabled selected>Select experience level</option>' +
        '<option value="beginner">Beginner (0–1 year)</option>' +
        '<option value="intermediate">Intermediate (1–2 years)</option>' +
        '<option value="advanced">Advanced (2–4 years)</option>' +
        '<option value="expert">Expert (4+ years)</option>' +
        '</select>' +
        '<div class="err-msg show-target">Please select your experience level.</div>' +
        '</div>' +
        '</div>';
    const removeBtn = block.querySelector('.remove-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            block.remove();
            memberCount--;
            updateAddBtn();
        });
    }
    block.querySelector('.mem-cnic').addEventListener('input', e => formatCnic(e.target));
    block.querySelector('.mem-phone').addEventListener('input', e => formatPhone(e.target));
    membersContainer.appendChild(block);
    updateAddBtn();
}

function updateAddBtn() {
    const max = MODULE_MAX[selectedModule] || 0;
    addBtn.disabled = !selectedModule || memberCount >= max - 1;
}

addBtn.addEventListener('click', addMember);
function setFieldState(input, errEl, bad) {
    input.classList.toggle('invalid', bad);
    if (errEl) errEl.classList.toggle('show', bad);
}


function validate() {
    let ok = true;
    if (!selectedModule) {
        ok = false;
        moduleError.classList.add('show');
    } else {
        moduleError.classList.remove('show');
    }
    const checks = [
        ['teamName', v => v.trim().length > 1],
        ['university', v => v.trim().length > 1],
        ['leadName', v => v.trim().length > 1],
        ['leadEmail', v => EMAIL_RE.test(v.trim())],
        ['leadPhone', v => PHONE_RE.test(v.trim())],
        ['leadCnic', v => CNIC_RE.test(v.trim())]
    ];
    checks.forEach(([id, test]) => {
        const el = document.getElementById(id);
        const errEl = document.getElementById('err-' + id);
        const bad = !test(el.value);
        setFieldState(el, errEl, bad);
        if (bad) ok = false;
    });
    const leadGpa = document.getElementById('leadGpa');
    const leadGpaError = document.getElementById('err-leadGpa');
    const gpaValue = parseFloat(leadGpa.value);
    const invalidLeadGpa = isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4;
    setFieldState(leadGpa, leadGpaError, invalidLeadGpa);
    if (invalidLeadGpa) ok = false;
    const leadExperience = document.getElementById('leadExperience');
    const leadExperienceError = document.getElementById('err-leadExperience');
    const invalidLeadExperience = !leadExperience.value;
    setFieldState(leadExperience, leadExperienceError, invalidLeadExperience);
    if (invalidLeadExperience) ok = false;
    document.querySelectorAll('.member-block').forEach(block => {
        const name = block.querySelector('.mem-name');
        const email = block.querySelector('.mem-email');
        const phone = block.querySelector('.mem-phone');
        const cnic = block.querySelector('.mem-cnic');
        const gpa = block.querySelector('.mem-gpa');
        const experience = block.querySelector('.mem-experience');
        const nameValid = name.value.trim().length > 1;
        setFieldState(name, name.nextElementSibling, !nameValid);
        if (!nameValid) ok = false;
        const emailValid = EMAIL_RE.test(email.value.trim());
        setFieldState(email, email.nextElementSibling, !emailValid);
        if (!emailValid) ok = false;
        const phoneValid = PHONE_RE.test(phone.value.trim());
        setFieldState(phone, phone.nextElementSibling, !phoneValid);
        if (!phoneValid) ok = false;
        const cnicValid = CNIC_RE.test(cnic.value.trim());
        setFieldState(cnic, cnic.nextElementSibling, !cnicValid);
        if (!cnicValid) ok = false;
        const memberGpaValue = parseFloat(gpa.value);
        const gpaValid = !isNaN(memberGpaValue) && memberGpaValue >= 0 && memberGpaValue <= 4;
        setFieldState(gpa, gpa.nextElementSibling, !gpaValid);
        if (!gpaValid) ok = false;
        const experienceValid = !!experience.value;
        setFieldState(experience, experience.nextElementSibling, !experienceValid);
        if (!experienceValid) ok = false;
    });
    return ok;
}


function collectData() {
    const members = [];
    document.querySelectorAll('.member-block').forEach(block => {
        members.push({
            name: block.querySelector('.mem-name').value.trim(),
            email: block.querySelector('.mem-email').value.trim(),
            phone: block.querySelector('.mem-phone').value.trim(),
            cnic: block.querySelector('.mem-cnic').value.trim(),
            gpa: block.querySelector('.mem-gpa').value,
            experience: block.querySelector('.mem-experience').value
        });
    });
    return {
        timestamp: new Date().toISOString(),
        module: selectedModule,
        fee: document.querySelector('.module-opt.selected .m-fee').textContent,
        teamName: document.getElementById('teamName').value.trim(),
        university: document.getElementById('university').value.trim(),
        leadName: document.getElementById('leadName').value.trim(),
        leadEmail: document.getElementById('leadEmail').value.trim(),
        leadPhone: document.getElementById('leadPhone').value.trim(),
        leadCnic: document.getElementById('leadCnic').value.trim(),
        leadGpa: document.getElementById('leadGpa').value,
        leadExperience: document.getElementById('leadExperience').value,
        teamSize: 1 + members.length,
        members: members
    };
}


function showStatus(msg, isOk) {
    const box = document.getElementById('statusBox');
    box.textContent = msg;
    box.className = 'status show ' + (isOk ? 'ok' : 'err');
}

const form = document.getElementById('regForm');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('statusBox').className = 'status';
    if (!validate()) {
        showStatus('Please fix the highlighted fields before submitting.', false);
        const firstInvalid = document.querySelector('.invalid');
        if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    const data = collectData();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    async function attemptSubmit(retry) {
        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(data)
            });
            showStatus('Registration submitted successfully! Shortlisted teams will be contacted via email/WhatsApp with further details.', true);
            form.reset();
            document.querySelectorAll('.module-opt').forEach(o => o.classList.remove('selected'));
            document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
            document.querySelectorAll('.err-msg.show').forEach(el => el.classList.remove('show'));
            selectedModule = null;
            membersContainer.innerHTML = '';
            memberHint.textContent = 'Select a module above to add members.';
            updateAddBtn();
        } catch (err) {
            if (!retry) {
                await attemptSubmit(true);
            } else {
                showStatus('Please check your connection and try again.', false);
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit registration';
        }
    }
    attemptSubmit(false);
});








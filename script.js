const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzwABDqu051sibw2NtZPgxyRD9S0Coj3a5fvbMRlgHB3-oK8JRgXAddGRxS_bMvdPjnzQ/exec";

const MODULE_ID = 1;
const FEE = 'PKR 2000';
const MAX_TEAM_SIZE = 4;                 // including the lead
const MAX_EXTRA_MEMBERS = MAX_TEAM_SIZE - 1;

const RULES = {
    text: v => v.trim().length > 1,
    email: v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v.trim()),
    phone: v => /^(0092|\+92|0)3\d{9}$/.test(v.trim()),
    cnic: v => /^\d{5}-\d{7}-\d{1}$/.test(v.trim()),
    gpa: v => { const n = parseFloat(v); return !isNaN(n) && n >= 0 && n <= 4; },
    select: v => !!v
};

const $ = id => document.getElementById(id);
const form = $('regForm');
const membersContainer = $('membersContainer');
const addBtn = $('addMemberBtn');
const memberHint = $('memberHint');
const submitBtn = $('submitBtn');
const statusBox = $('statusBox');

/* ---------- Input formatting ---------- */

function formatCnic(el) {
    const d = el.value.replace(/\D/g, '').slice(0, 13);
    let out = d;
    if (d.length > 5) out = d.slice(0, 5) + '-' + d.slice(5);
    if (d.length > 12) out = d.slice(0, 5) + '-' + d.slice(5, 12) + '-' + d.slice(12);
    el.value = out;
}

function formatPhone(el) {
    el.value = el.value.replace(/[^\d+]/g, '');
}

function attachFormatters(root) {
    root.querySelectorAll('[data-fmt="cnic"], .mem-cnic, #leadCnic')
        .forEach(el => el.addEventListener('input', () => formatCnic(el)));
    root.querySelectorAll('[data-fmt="phone"], .mem-phone, #leadPhone')
        .forEach(el => el.addEventListener('input', () => formatPhone(el)));
}

/* ---------- Members ---------- */

function memberCount() {
    return membersContainer.querySelectorAll('.member-block').length;
}

function updateAddBtn() {
    addBtn.disabled = memberCount() >= MAX_EXTRA_MEMBERS;
}

function renumberMembers() {
    membersContainer.querySelectorAll('.member-block').forEach((block, i) => {
        block.querySelector('.m-head span').textContent = 'Member ' + (i + 2);
    });
}

function addMember() {
    if (memberCount() >= MAX_EXTRA_MEMBERS) return;

    const isFirst = memberCount() === 0;   // first extra member is required (min team size 2)
    const block = document.createElement('div');
    block.className = 'member-block';
    block.innerHTML = `
        <div class="m-head"><span></span>${isFirst ? '' : '<button type="button" class="remove-btn">Remove</button>'}</div>
        <div class="field">
            <label>Full name</label>
            <input type="text" class="mem-name" placeholder="e.g. Ahmed">
            <div class="err-msg">Enter this member's full name.</div>
        </div>
        <div class="row2">
            <div class="field">
                <label>Email</label>
                <input type="email" class="mem-email" placeholder="e.g. ahmed@gmail.com">
                <div class="err-msg">Enter a valid email, e.g. name@example.com</div>
            </div>
            <div class="field">
                <label>WhatsApp number</label>
                <input type="tel" class="mem-phone" placeholder="03XX-XXXXXXX" maxlength="12">
                <div class="err-msg">Enter a valid Pakistani mobile number, e.g. 0301-2345678</div>
            </div>
        </div>
        <div class="field">
            <label>CNIC</label>
            <input type="text" class="mem-cnic" placeholder="42101-1234567-1" maxlength="15">
            <div class="err-msg">Enter a valid 13-digit CNIC, e.g. 42101-1234567-1</div>
        </div>
        <div class="row2">
            <div class="field">
                <label>GPA</label>
                <input type="number" class="mem-gpa" placeholder="e.g. 3.25" min="0" max="4" step="0.01">
                <div class="err-msg">Enter a valid GPA between 0.00 and 4.00.</div>
            </div>
            <div class="field">
                <label>Experience Level</label>
                <select class="mem-experience">
                    <option value="" disabled selected>Select experience level</option>
                    <option value="beginner">Beginner (0–1 year)</option>
                    <option value="intermediate">Intermediate (1–2 years)</option>
                    <option value="advanced">Advanced (2–4 years)</option>
                    <option value="expert">Expert (4+ years)</option>
                </select>
                <div class="err-msg">Please select your experience level.</div>
            </div>
        </div>`;

    const removeBtn = block.querySelector('.remove-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            block.remove();
            renumberMembers();
            updateAddBtn();
        });
    }

    attachFormatters(block);
    membersContainer.appendChild(block);
    renumberMembers();
    updateAddBtn();
}

function resetMembers() {
    membersContainer.innerHTML = '';
    addMember(); // team needs at least 1 member besides the lead
    memberHint.textContent =
        'Add up to ' + MAX_EXTRA_MEMBERS + ' more member(s) — team size 2 to ' + MAX_TEAM_SIZE + ' including the lead.';
}

/* ---------- Validation ---------- */

function setFieldState(input, bad) {
    input.classList.toggle('invalid', bad);
    const err = input.nextElementSibling;
    if (err && err.classList.contains('err-msg')) err.classList.toggle('show', bad);
}

function validate() {
    let ok = true;

    const fields = [
        ['teamName', 'text'], ['university', 'text'], ['leadName', 'text'],
        ['leadEmail', 'email'], ['leadPhone', 'phone'], ['leadCnic', 'cnic'],
        ['leadGpa', 'gpa'], ['leadExperience', 'select']
    ].map(([id, rule]) => [$(id), rule]);

    membersContainer.querySelectorAll('.member-block').forEach(block => {
        fields.push(
            [block.querySelector('.mem-name'), 'text'],
            [block.querySelector('.mem-email'), 'email'],
            [block.querySelector('.mem-phone'), 'phone'],
            [block.querySelector('.mem-cnic'), 'cnic'],
            [block.querySelector('.mem-gpa'), 'gpa'],
            [block.querySelector('.mem-experience'), 'select']
        );
    });

    fields.forEach(([el, rule]) => {
        const bad = !RULES[rule](el.value);
        setFieldState(el, bad);
        if (bad) ok = false;
    });

    return ok;
}

/* ---------- Data ---------- */

function collectData() {
    const members = [...membersContainer.querySelectorAll('.member-block')].map(b => ({
        name: b.querySelector('.mem-name').value.trim(),
        email: b.querySelector('.mem-email').value.trim(),
        phone: b.querySelector('.mem-phone').value.trim(),
        cnic: b.querySelector('.mem-cnic').value.trim(),
        gpa: b.querySelector('.mem-gpa').value,
        experience: b.querySelector('.mem-experience').value
    }));

    return {
        timestamp: new Date().toISOString(),
        module: MODULE_ID,
        fee: FEE,
        teamName: $('teamName').value.trim(),
        university: $('university').value.trim(),
        leadName: $('leadName').value.trim(),
        leadEmail: $('leadEmail').value.trim(),
        leadPhone: $('leadPhone').value.trim(),
        leadCnic: $('leadCnic').value.trim(),
        leadGpa: $('leadGpa').value,
        leadExperience: $('leadExperience').value,
        teamSize: 1 + members.length,
        members
    };
}

/* ---------- Submit ---------- */

function showStatus(msg, isOk) {
    statusBox.textContent = msg;
    statusBox.className = 'status show ' + (isOk ? 'ok' : 'err');
}

async function postData(data) {
    const options = {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
    };
    try {
        await fetch(SCRIPT_URL, options);
    } catch (err) {
        await fetch(SCRIPT_URL, options); // one retry; throws if it fails again
    }
}

function resetForm() {
    form.reset();
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    form.querySelectorAll('.err-msg.show').forEach(el => el.classList.remove('show'));
    resetMembers();
}

form.addEventListener('submit', async e => {
    e.preventDefault();
    statusBox.className = 'status';

    if (!validate()) {
        showStatus('Please fix the highlighted fields before submitting.', false);
        const firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
        await postData(collectData());
        showStatus('Registration submitted successfully! Shortlisted teams will be contacted via email/WhatsApp with further details.', true);
        resetForm();
    } catch (err) {
        showStatus('Please check your connection and try again.', false);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit registration';
    }
});

/* ---------- Init ---------- */

attachFormatters(document);
addBtn.addEventListener('click', addMember);
resetMembers();
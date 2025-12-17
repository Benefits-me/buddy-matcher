// buddy-matcher.js

let matchResults = null;

// File input handler
document.getElementById('fileInput').addEventListener('change', handleFileSelect);

// Drag and drop handlers
const uploadSection = document.getElementById('uploadSection');

uploadSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadSection.classList.add('dragover');
});

uploadSection.addEventListener('dragleave', () => {
    uploadSection.classList.remove('dragover');
});

uploadSection.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadSection.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (!file.name.endsWith('.json')) {
        showError('Bitte wählen Sie eine JSON-Datei aus.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            processData(data);
        } catch (error) {
            showError('Fehler beim Parsen der JSON-Datei: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function processData(data) {
    try {
        // C-Level Parsing
        let cLevel = {};
        if (data["C-Level"] && typeof data["C-Level"] === "object") {
            cLevel = data["C-Level"];
            delete data["C-Level"];
        }

        // Parse departments and employees
        const departments = [];
        let totalEmployees = 0;
        const cLevelManagers = [];
        const cLevelDeptMap = {};

        // C-Level-Manager als eigene Personen anlegen
        for (const [manager, obj] of Object.entries(cLevel)) {
            cLevelManagers.push({
                name: manager,
                email: obj.email || '',
                isCLevel: true,
                departments: obj.departments
            });
            obj.departments.forEach(d => {
                if (!cLevelDeptMap[d]) cLevelDeptMap[d] = [];
                cLevelDeptMap[d].push(manager);
            });
        }

        for (const [deptName, employees] of Object.entries(data)) {
            if (!Array.isArray(employees)) {
                showError(`Abteilung "${deptName}" muss ein Array von Mitarbeitern enthalten.`);
                return;
            }
            employees.forEach(emp => {
                if (!emp.name) {
                    showError(`Alle Mitarbeiter müssen ein "name" Feld haben.`);
                    return;
                }
                departments.push({
                    department: deptName,
                    employee: emp,
                    isCLevel: false
                });
                totalEmployees++;
            });
        }
        // C-Level-Manager zu departments hinzufügen
        cLevelManagers.forEach(manager => {
            departments.push({
                department: 'C-Level',
                employee: manager,
                isCLevel: true,
                cLevelDepartments: manager.departments
            });
            totalEmployees++;
        });

        if (totalEmployees === 0) {
            showError('Es wurden keine Mitarbeiter gefunden.');
            return;
        }
        if (Object.keys(data).length < 2) {
            showError('Es werden mindestens 2 Abteilungen benötigt.');
            return;
        }

        // Create matches
        const matches = createMatches(departments, cLevelDeptMap);
        // Display results
        displayResults(matches, Object.keys(data).length, totalEmployees);
    } catch (error) {
        showError(error.message);
    }
}

function createMatches(departments, cLevelDeptMap) {
    // Shuffle departments to randomize matching using Fisher-Yates algorithm
    const shuffled = [...departments];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const matches = [];
    const matched = new Set();

    // 1. C-Level zuerst matchen
    for (let i = 0; i < shuffled.length; i++) {
        const person1 = shuffled[i];
        if (!person1.isCLevel || matched.has(i)) continue;
        let buddyIndex = -1;
        for (let j = 0; j < shuffled.length; j++) {
            if (i === j || matched.has(j)) continue;
            const person2 = shuffled[j];
            // Buddy darf kein C-Level sein
            if (person2.isCLevel) continue;
            // Buddy darf nicht aus einer der eigenen Abteilungen sein
            if (person1.cLevelDepartments && person1.cLevelDepartments.includes(person2.department)) continue;
            // Normale Abteilungsregel
            if (person2.department !== 'C-Level') {
                buddyIndex = j;
                break;
            }
        }
        if (buddyIndex !== -1) {
            const buddy = shuffled[buddyIndex];
            matches.push({
                employee1: {
                    name: person1.employee.name,
                    email: person1.employee.email,
                    department: person1.department
                },
                employee2: {
                    name: buddy.employee.name,
                    email: buddy.employee.email,
                    department: buddy.department
                }
            });
            matched.add(i);
            matched.add(buddyIndex);
        } else {
            matches.push({
                employee1: {
                    name: person1.employee.name,
                    email: person1.employee.email,
                    department: person1.department
                },
                employee2: null
            });
            matched.add(i);
        }
    }
    // 2. Restliche Mitarbeitende matchen
    for (let i = 0; i < shuffled.length; i++) {
        if (matched.has(i)) continue;
        const person1 = shuffled[i];
        let buddyIndex = -1;
        for (let j = i + 1; j < shuffled.length; j++) {
            if (matched.has(j)) continue;
            const person2 = shuffled[j];
            // C-Level darf nicht als Buddy gewählt werden
            if (person2.isCLevel || person1.isCLevel) continue;
            // Normale Abteilungsregel
            if (person1.department !== person2.department) {
                // Person1 darf nicht mit C-Level gematcht werden, der für ihre Abteilung zuständig ist
                if (cLevelDeptMap[person1.department] && cLevelDeptMap[person1.department].includes(person2.name)) continue;
                if (cLevelDeptMap[person2.department] && cLevelDeptMap[person2.department].includes(person1.name)) continue;
                buddyIndex = j;
                break;
            }
        }
        // Fallback: Suche nach beliebigem passenden Buddy
        if (buddyIndex === -1) {
            for (let j = 0; j < shuffled.length; j++) {
                if (matched.has(j) || j === i) continue;
                const person2 = shuffled[j];
                if (person2.isCLevel || person1.isCLevel) continue;
                if (person1.department !== person2.department) {
                    if (cLevelDeptMap[person1.department] && cLevelDeptMap[person1.department].includes(person2.name)) continue;
                    if (cLevelDeptMap[person2.department] && cLevelDeptMap[person2.department].includes(person1.name)) continue;
                    buddyIndex = j;
                    break;
                }
            }
        }
        if (buddyIndex !== -1) {
            const buddy = shuffled[buddyIndex];
            matches.push({
                employee1: {
                    name: person1.employee.name,
                    email: person1.employee.email,
                    department: person1.department
                },
                employee2: {
                    name: buddy.employee.name,
                    email: buddy.employee.email,
                    department: buddy.department
                }
            });
            matched.add(i);
            matched.add(buddyIndex);
        } else {
            matches.push({
                employee1: {
                    name: person1.employee.name,
                    email: person1.employee.email,
                    department: person1.department
                },
                employee2: null
            });
            matched.add(i);
        }
    }
    return matches;
}

function displayResults(matches, deptCount, totalEmployees) {
    matchResults = matches;
    // Calculate stats
    const successfulMatches = matches.filter(m => m.employee2 !== null).length;
    const unmatched = matches.filter(m => m.employee2 === null).length;
    // Display stats
    document.getElementById('stats').innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${totalEmployees}</div>
                <div class="stat-label">Mitarbeiter</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${deptCount}</div>
                <div class="stat-label">Abteilungen</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${successfulMatches}</div>
                <div class="stat-label">Matches</div>
            </div>
            ${unmatched > 0 ? `
            <div class="stat-card buddy-missing">
                <div class="stat-number">${unmatched}</div>
                <div class="stat-label">Ohne Buddy</div>
            </div>
            ` : ''}
        `;
    // Display matches
    document.getElementById('matchList').innerHTML = matches.map(match => {
        if (match.employee2) {
            return `
                    <div class="match-item">
                        <div class="match-person">
                            <div class="match-person-name">${escapeHtml(match.employee1.name)}</div>
                            <div class="match-person-dept">${escapeHtml(match.employee1.department)}${match.employee1.email ? ' • ' + escapeHtml(match.employee1.email) : ''}</div>
                        </div>
                        <div class="match-arrow">↔️</div>
                        <div class="match-person">
                            <div class="match-person-name">${escapeHtml(match.employee2.name)}</div>
                            <div class="match-person-dept">${escapeHtml(match.employee2.department)}${match.employee2.email ? ' • ' + escapeHtml(match.employee2.email) : ''}</div>
                        </div>
                    </div>
                `;
        } else {
            return `
                    <div class="match-item" style="opacity: 0.6;">
                        <div class="match-person">
                            <div class="match-person-name">${escapeHtml(match.employee1.name)}</div>
                            <div class="match-person-dept">${escapeHtml(match.employee1.department)}${match.employee1.email ? ' • ' + escapeHtml(match.employee1.email) : ''}</div>
                        </div>
                        <div class="match-arrow">⚠️</div>
                        <div class="match-person">
                            <div class="match-person-name">Kein Buddy gefunden</div>
                            <div class="match-person-dept">Keine passende Abteilung verfügbar</div>
                        </div>
                    </div>
                `;
        }
    }).join('');
    // Show results section
    document.getElementById('uploadSection').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    hideError();
}

function downloadResults() {
    if (!matchResults) return;

    const dataStr = JSON.stringify(matchResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buddy-matches-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadResultsCSV() {
    if (!matchResults) return;
    // CSV Header
    const header = [
        'Name 1','E-Mail 1','Abteilung 1','Name 2','E-Mail 2','Abteilung 2'
    ];
    // CSV Rows
    const rows = matchResults.map(match => [
        match.employee1.name || '',
        match.employee1.email || '',
        match.employee1.department || '',
        match.employee2 ? (match.employee2.name || '') : '',
        match.employee2 ? (match.employee2.email || '') : '',
        match.employee2 ? (match.employee2.department || '') : ''
    ]);
    // CSV String (mit BOM für Excel)
    const csvContent = '\uFEFF' + [header, ...rows].map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buddy-matches-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function resetApp() {
    matchResults = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('results').classList.add('hidden');
    document.getElementById('uploadSection').classList.remove('hidden');
    hideError();
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = '❌ ' + message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    document.getElementById('errorMessage').classList.add('hidden');
}

function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

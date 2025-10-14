// Global variables
let currentTab = 'dashboard';
let scanningInProgress = false;
let progressInterval = null;
let currentStep = 1;
let scanProgress = 0;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    setupEventListeners();
    showTab('dashboard');
});

// Setup all event listeners
function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            showTab(tabName);
        });
    });

    // Chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }

    // Query input
    const queryInput = document.getElementById('queryInput');
    if (queryInput) {
        queryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                executeQuery();
            }
        });
    }
}

// Tab navigation function
function showTab(tabName) {
    // Remove active class from all tabs and buttons
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab and mark button as active
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    currentTab = tabName;
}

// Initialize charts
function initializeCharts() {
    // Vulnerability Trends Chart
    const vulnerabilityCtx = document.getElementById('vulnerabilityChart');
    if (vulnerabilityCtx) {
        new Chart(vulnerabilityCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Vulnerabilities Found',
                    data: [146, 161, 122, 181, 224, 195],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f0f0f0'
                        }
                    },
                    x: {
                        grid: {
                            color: '#f0f0f0'
                        }
                    }
                }
            }
        });
    }

    // Risk Distribution Chart
    const riskCtx = document.getElementById('riskChart');
    if (riskCtx) {
        new Chart(riskCtx, {
            type: 'doughnut',
            data: {
                labels: ['Critical', 'High', 'Medium', 'Low'],
                datasets: [{
                    data: [23, 67, 134, 89],
                    backgroundColor: [
                        '#e74c3c',
                        '#f39c12',
                        '#f1c40f',
                        '#27ae60'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }
}

// Query execution function
function executeQuery() {
    const queryText = document.getElementById('queryInput').value.trim();
    if (!queryText) {
        alert('Please enter a security query');
        return;
    }

    console.log('Executing query:', queryText);
    startScan('query');
}

// Fill query from example
function fillQuery(exampleText) {
    document.getElementById('queryInput').value = exampleText;
}

// Start scan function
function startScan(scanType) {
    if (scanningInProgress) {
        alert('A scan is already in progress. Please wait for it to complete.');
        return;
    }

    console.log('Starting scan type:', scanType);
    openScanModal();
    initializeScan();
}

// Open scanning modal
function openScanModal() {
    const modal = document.getElementById('scanningModal');
    modal.style.display = 'block';

    // Reset progress
    resetScanProgress();
}

// Close scanning modal
function closeScanModal() {
    const modal = document.getElementById('scanningModal');
    modal.style.display = 'none';

    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }

    scanningInProgress = false;
    resetScanProgress();
}

// Initialize scanning process
function initializeScan() {
    scanningInProgress = true;
    currentStep = 1;
    scanProgress = 0;

    const steps = [
        { text: 'Initializing scan engine...', duration: 3 },
        { text: 'Discovering targets...', duration: 8 },
        { text: 'Port scanning...', duration: 12 },
        { text: 'Service enumeration...', duration: 10 },
        { text: 'Vulnerability detection...', duration: 20 },
        { text: 'Analysis and reporting...', duration: 8 },
        { text: 'Finalizing results...', duration: 4 }
    ];

    let totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    let elapsed = 0;

    progressInterval = setInterval(() => {
        elapsed += 0.5;
        scanProgress = Math.min((elapsed / totalDuration) * 100, 100);

        // Update progress circle
        updateProgressCircle(scanProgress);

        // Update current step
        let stepElapsed = 0;
        let newCurrentStep = 1;

        for (let i = 0; i < steps.length; i++) {
            if (elapsed > stepElapsed + steps[i].duration) {
                stepElapsed += steps[i].duration;
                newCurrentStep = i + 2;
            } else {
                break;
            }
        }

        if (newCurrentStep !== currentStep && newCurrentStep <= steps.length) {
            updateCurrentStep(newCurrentStep, steps);
        }

        // Update metrics
        updateScanMetrics(scanProgress);

        // Check completion
        if (scanProgress >= 100) {
            completeScan();
        }
    }, 500);
}

// Update progress circle
function updateProgressCircle(percentage) {
    const circle = document.getElementById('progressCircle');
    const percentageText = document.getElementById('progressPercentage');

    if (circle && percentageText) {
        const circumference = 2 * Math.PI * 50; // radius = 50
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        percentageText.textContent = Math.round(percentage) + '%';
    }
}

// Update current step
function updateCurrentStep(stepNum, steps) {
    // Mark previous steps as completed
    for (let i = 1; i < stepNum; i++) {
        const stepElement = document.getElementById(`step${i}`);
        if (stepElement) {
            stepElement.classList.remove('active');
            stepElement.classList.add('completed');
        }
    }

    // Mark current step as active
    const currentStepElement = document.getElementById(`step${stepNum}`);
    if (currentStepElement && stepNum <= steps.length) {
        currentStepElement.classList.add('active');
        document.getElementById('currentStep').textContent = steps[stepNum - 1].text;
    }

    currentStep = stepNum;
}

// Update scan metrics
function updateScanMetrics(progress) {
    const hostsScanned = Math.floor((progress / 100) * 45);
    const vulnerabilities = Math.floor((progress / 100) * 23);
    const ports = Math.floor((progress / 100) * 156);

    document.getElementById('hostsScanned').textContent = hostsScanned;
    document.getElementById('vulnerabilitiesFound').textContent = vulnerabilities;
    document.getElementById('portsFound').textContent = ports;
}

// Complete scan
function completeScan() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }

    // Mark all steps as completed
    for (let i = 1; i <= 7; i++) {
        const stepElement = document.getElementById(`step${i}`);
        if (stepElement) {
            stepElement.classList.remove('active');
            stepElement.classList.add('completed');
        }
    }

    document.getElementById('currentStep').textContent = 'Scan completed successfully!';
    scanningInProgress = false;

    // Auto-close modal after 2 seconds
    setTimeout(() => {
        closeScanModal();
        showTab('results');
    }, 2000);
}

// Reset scan progress
function resetScanProgress() {
    scanProgress = 0;
    currentStep = 1;

    // Reset progress circle
    updateProgressCircle(0);

    // Reset all steps
    for (let i = 1; i <= 7; i++) {
        const stepElement = document.getElementById(`step${i}`);
        if (stepElement) {
            stepElement.classList.remove('active', 'completed');
            if (i === 1) {
                stepElement.classList.add('active');
            }
        }
    }

    // Reset text and metrics
    document.getElementById('currentStep').textContent = 'Initializing scan engine...';
    document.getElementById('hostsScanned').textContent = '0';
    document.getElementById('vulnerabilitiesFound').textContent = '0';
    document.getElementById('portsFound').textContent = '0';
}

// RAG Bot functions
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (message) {
        sendMessage(message);
        input.value = '';
    }
}

function sendMessage(message) {
    const chatMessages = document.getElementById('chatMessages');

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'message user-message';
    userMsg.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
        </div>
        <span class="message-time">Now</span>
    `;
    chatMessages.appendChild(userMsg);

    // Simulate bot response
    setTimeout(() => {
        const botResponse = generateBotResponse(message);
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot-message';
        botMsg.innerHTML = `
            <div class="message-content">
                <p>${botResponse}</p>
            </div>
            <span class="message-time">Now</span>
        `;
        chatMessages.appendChild(botMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Generate bot response
function generateBotResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('critical') || lowerMessage.includes('vulnerabilities')) {
        return "Based on the latest scan results, I've identified 23 critical vulnerabilities requiring immediate attention. The most urgent include CVE-2024-1086 (Linux Kernel Privilege Escalation) affecting 12 systems with a CVSS score of 9.8. I recommend applying security patches immediately and isolating affected systems.";
    }

    if (lowerMessage.includes('attack path') || lowerMessage.includes('cve-2024-1086')) {
        return "CVE-2024-1086 presents a significant attack path: Initial Access → Low-privilege user account → Exploit netfilter vulnerability → Privilege escalation to root → System compromise → Lateral movement. This vulnerability has a 96% success rate in lab environments and is actively exploited by APT groups.";
    }

    if (lowerMessage.includes('recommendations') || lowerMessage.includes('security')) {
        return "My top security recommendations: 1) Patch critical vulnerabilities within 24 hours 2) Implement network segmentation to limit lateral movement 3) Deploy endpoint detection and response (EDR) solutions 4) Conduct regular security assessments 5) Train staff on security awareness. Current security score is 87% - we can improve this to 95% with these measures.";
    }

    if (lowerMessage.includes('scan') || lowerMessage.includes('results')) {
        return "The latest scan results show 1,247 total scans completed with 23 critical findings and 67 high-severity issues across 892 monitored assets. Network infrastructure shows the highest vulnerability concentration, particularly in web-facing services. Would you like me to prioritize these findings by exploitability?";
    }

    return "I understand your query about cybersecurity. As your Advanced Risk Intelligence Assistant, I can help analyze vulnerabilities, explain attack vectors, provide mitigation strategies, and assess security posture. Could you be more specific about what aspect of security you'd like me to focus on?";
}

// Quick action functions
function startEmergencyScan() {
    console.log('Starting emergency scan...');
    startScan('emergency');
}

function openThreatIntelligence() {
    console.log('Opening threat intelligence...');
    showTab('pipeline');
}

function generateReport() {
    console.log('Generating security report...');
    showTab('reports');
    alert('Security report generation initiated. Report will be available in the Reports tab.');
}

function exportResults() {
    console.log('Exporting scan results...');
    alert('Scan results exported successfully. Download will begin shortly.');
}

function scheduleScan() {
    console.log('Scheduling new scan...');
    alert('Scan scheduling interface opened. Configure your scan parameters.');
}

function viewScanDetails(scanId) {
    console.log('Viewing scan details for:', scanId);
    alert(`Viewing detailed results for scan ${scanId}`);
}

function generateNewReport() {
    console.log('Generating new report...');
    alert('New security report generation started. This may take a few minutes.');
}

function exportAllReports() {
    console.log('Exporting all reports...');
    alert('All reports exported successfully. Archive download will begin shortly.');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('scanningModal');
    if (event.target === modal) {
        closeScanModal();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + numbers for tab switching
    if (e.ctrlKey && e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        const tabs = ['dashboard', 'query', 'ragbot', 'results', 'pipeline', 'reports'];
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
            showTab(tabs[tabIndex]);
        }
    }

    // Escape to close modal
    if (e.key === 'Escape') {
        closeScanModal();
    }
});

// Auto-refresh functionality for real-time updates
setInterval(() => {
    if (currentTab === 'dashboard') {
        // Simulate metric updates
        updateDashboardMetrics();
    }
}, 30000); // Update every 30 seconds

function updateDashboardMetrics() {
    // This would normally fetch real data from the backend
    console.log('Updating dashboard metrics...');
}
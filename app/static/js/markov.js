let currentStates = ['Estado 1', 'Estado 2', 'Estado 3'];
let currentMatrix = [];

// Generar matriz vacía
function generateMatrix() {
    const numStates = parseInt(document.getElementById('numStates').value);
    const container = document.getElementById('matrixContainer');

    currentStates = [];
    for (let i = 1; i <= numStates; i++) {
        currentStates.push(`Estado ${i}`);
    }

    document.getElementById('stateNames').value = currentStates.join(', ');

    let html = '<table class="matrix-table mx-auto">';

    // Encabezados de columna
    html += '<thead><tr><th class="p-2 text-white">P</th>';
    for (let j = 0; j < numStates; j++) {
        html += `<th class="p-2 text-blue-200 text-sm">${currentStates[j]}</th>`;
    }
    html += '</tr></thead><tbody>';

    // Filas de la matriz
    for (let i = 0; i < numStates; i++) {
        html += `<tr><td class="p-2 text-blue-200 text-sm font-medium">${currentStates[i]}</td>`;
        for (let j = 0; j < numStates; j++) {
            html += `<td class="p-1">
                <input type="number" 
                       class="matrix-cell" 
                       id="cell_${i}_${j}" 
                       min="0" 
                       max="1" 
                       step="0.01" 
                       onchange="validateRow(${i})"
                       placeholder="0.00">
            </td>`;
        }
        html += '</tr>';
    }

    html += '</tbody></table>';
    container.innerHTML = html;

    currentMatrix = Array(numStates).fill().map(() => Array(numStates).fill(0));
}

// Actualizar nombres de estados
function updateStateNames() {
    const names = document.getElementById('stateNames').value.split(',').map(s => s.trim());
    const numStates = parseInt(document.getElementById('numStates').value);

    if (names.length === numStates) {
        currentStates = names;
        generateMatrix();
    }
}

// Validar que una fila sume 1
function validateRow(rowIndex) {
    const numStates = currentStates.length;
    let sum = 0;

    for (let j = 0; j < numStates; j++) {
        const cell = document.getElementById(`cell_${rowIndex}_${j}`);
        const value = parseFloat(cell.value) || 0;
        sum += value;
        currentMatrix[rowIndex][j] = value;
    }

    // Cambiar color según validación
    for (let j = 0; j < numStates; j++) {
        const cell = document.getElementById(`cell_${rowIndex}_${j}`);
        if (Math.abs(sum - 1.0) < 0.001) {
            cell.style.borderColor = '#10b981'; // Verde
        } else {
            cell.style.borderColor = '#ef4444'; // Rojo
        }
    }

    return Math.abs(sum - 1.0) < 0.001;
}

// Llenar matriz con valores aleatorios
function fillRandomMatrix() {
    const numStates = currentStates.length;

    for (let i = 0; i < numStates; i++) {
        let row = [];
        let sum = 0;

        // Generar valores aleatorios
        for (let j = 0; j < numStates - 1; j++) {
            const value = Math.random() * (1 - sum);
            row.push(value);
            sum += value;
        }
        row.push(1 - sum); // Último valor para que sume 1

        // Asignar a las celdas
        for (let j = 0; j < numStates; j++) {
            document.getElementById(`cell_${i}_${j}`).value = row[j].toFixed(3);
            currentMatrix[i][j] = row[j];
        }

        validateRow(i);
    }
}

// Limpiar matriz
function clearMatrix() {
    const numStates = currentStates.length;

    for (let i = 0; i < numStates; i++) {
        for (let j = 0; j < numStates; j++) {
            document.getElementById(`cell_${i}_${j}`).value = '';
            currentMatrix[i][j] = 0;
        }
    }
}

// Validar y analizar la cadena
function validateAndAnalyze() {
    const numStates = currentStates.length;
    let isValid = true;
    let messages = [];

    // Validar matriz
    for (let i = 0; i < numStates; i++) {
        if (!validateRow(i)) {
            isValid = false;
            messages.push(`La fila ${i + 1} (${currentStates[i]}) no suma 1.0`);
        }
    }

    const messageContainer = document.getElementById('validationMessages');

    if (!isValid) {
        messageContainer.innerHTML = `
            <div class="bg-red-500/20 border border-red-400/30 text-red-200 p-3 rounded-lg">
                <h4 class="font-semibold mb-2">Errores de validación:</h4>
                <ul class="list-disc list-inside text-sm">
                    ${messages.map(msg => `<li>${msg}</li>`).join('')}
                </ul>
            </div>
        `;
        return;
    }

    messageContainer.innerHTML = `
        <div class="bg-green-500/20 border border-green-400/30 text-green-200 p-3 rounded-lg">
            <p class="text-sm">✓ Matriz válida. Analizando cadena de Markov...</p>
        </div>
    `;

    // Enviar para análisis
    analyzeMarkovChain();
}

// Analizar cadena de Markov
async function analyzeMarkovChain() {
    const data = {
        states: currentStates,
        transition_matrix: currentMatrix,
        name: document.getElementById('problemName').value || 'Análisis sin nombre',
        description: '',
        initial_state: currentStates[0],
        n_steps: parseInt(document.getElementById('nSteps').value) || 10
    };

    try {
        const response = await fetch('/markov/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const results = await response.json();

        if (response.ok) {
            displayResults(results);
            generateTransitionDiagram();
        } else {
            throw new Error(results.error || 'Error en el análisis');
        }
    } catch (error) {
        document.getElementById('validationMessages').innerHTML = `
            <div class="bg-red-500/20 border border-red-400/30 text-red-200 p-3 rounded-lg">
                <p class="text-sm">Error: ${error.message}</p>
            </div>
        `;
    }
}

// Mostrar resultados del análisis
function displayResults(results) {
    // Clasificación de estados
    displayStateClassification();

    // Propiedades de la cadena
    displayChainProperties(results);

    // Estados estables
    if (results.steady_state) {
        displaySteadyState(results.steady_state);
    }
}

// Mostrar clasificación de estados
function displayStateClassification() {
    const container = document.getElementById('stateClassification');
    const numStates = currentStates.length;

    let html = '<div class="space-y-3">';

    for (let i = 0; i < numStates; i++) {
        const state = currentStates[i];
        const classification = classifyState(i);

        html += `
            <div class="bg-white/5 p-3 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="text-white font-medium">${state}</h4>
                    <div class="flex space-x-2">
                        ${classification.map(cls => `<span class="classification-badge ${cls.toLowerCase()}">${cls}</span>`).join('')}
                    </div>
                </div>
                <p class="text-white/70 text-sm">${getStateDescription(classification)}</p>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

// Clasificar un estado individual
function classifyState(stateIndex) {
    const classification = [];

    // Verificar si es absorbente
    if (currentMatrix[stateIndex][stateIndex] === 1) {
        classification.push('Absorbente');
        return classification;
    }

    // Verificar recurrencia vs transitoriedad
    const fii = calculateReturnProbability(stateIndex);
    if (fii >= 0.95) { // Aproximación
        classification.push('Recurrente');
    } else {
        classification.push('Transitorio');
    }

    // Verificar periodicidad
    if (isPeriodic(stateIndex)) {
        classification.push('Periódico');
    } else {
        classification.push('Aperiódico');
    }

    return classification;
}

// Calcular probabilidad de retorno (aproximación)
function calculateReturnProbability(stateIndex) {
    // Implementación simplificada
    let prob = 0;
    const maxSteps = 10;

    for (let n = 1; n <= maxSteps; n++) {
        const pn = matrixPower(currentMatrix, n);
        prob += calculateFirstReturnProb(stateIndex, n, pn);
    }

    return prob;
}

// Verificar si un estado es periódico
function isPeriodic(stateIndex) {
    // Implementación simplificada - busca patrones en los retornos
    const returns = [];
    for (let n = 1; n <= 20; n++) {
        const pn = matrixPower(currentMatrix, n);
        if (pn[stateIndex][stateIndex] > 0.001) {
            returns.push(n);
        }
    }

    if (returns.length < 2) return false;

    // Verificar si hay un patrón periódico
    const gcd = returns.reduce((a, b) => gcdFunction(a, b));
    return gcd > 1;
}

// Función auxiliar para GCD
function gcdFunction(a, b) {
    return b === 0 ? a : gcdFunction(b, a % b);
}

// Calcular probabilidad de primer retorno
function calculateFirstReturnProb(stateIndex, n, pnMatrix) {
    if (n === 1) {
        return pnMatrix[stateIndex][stateIndex];
    }

    let sum = 0;
    for (let k = 1; k < n; k++) {
        const pkMatrix = matrixPower(currentMatrix, k);
        const pnkMatrix = matrixPower(currentMatrix, n - k);
        sum += calculateFirstReturnProb(stateIndex, k, pkMatrix) * pnkMatrix[stateIndex][stateIndex];
    }

    return pnMatrix[stateIndex][stateIndex] - sum;
}

// Potencia de matriz
function matrixPower(matrix, n) {
    if (n === 1) return matrix;
    if (n === 0) return identityMatrix(matrix.length);

    let result = matrix;
    for (let i = 1; i < n; i++) {
        result = multiplyMatrices(result, matrix);
    }
    return result;
}

// Multiplicación de matrices
function multiplyMatrices(a, b) {
    const rows = a.length;
    const cols = b[0].length;
    const result = Array(rows).fill().map(() => Array(cols).fill(0));

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            for (let k = 0; k < a[0].length; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return result;
}

// Matriz identidad
function identityMatrix(size) {
    const matrix = Array(size).fill().map(() => Array(size).fill(0));
    for (let i = 0; i < size; i++) {
        matrix[i][i] = 1;
    }
    return matrix;
}

// Obtener descripción del estado
function getStateDescription(classification) {
    if (classification.includes('Absorbente')) {
        return 'Una vez que se entra a este estado, nunca se sale de él.';
    }
    if (classification.includes('Recurrente')) {
        return 'El proceso definitivamente regresará a este estado.';
    }
    if (classification.includes('Transitorio')) {
        return 'Es posible que el proceso nunca regrese a este estado.';
    }
    return '';
}

// Generar diagrama de transición
function generateTransitionDiagram() {
    const container = document.getElementById('transitionDiagram');
    const width = container.clientWidth;
    const height = 320;

    container.innerHTML = `<svg width="${width}" height="${height}" id="diagramSvg"></svg>`;

    const svg = document.getElementById('diagramSvg');
    const numStates = currentStates.length;

    // Posiciones de los estados en círculo
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    const positions = [];
    for (let i = 0; i < numStates; i++) {
        const angle = (2 * Math.PI * i) / numStates - Math.PI / 2;
        positions.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }

    // Dibujar transiciones
    for (let i = 0; i < numStates; i++) {
        for (let j = 0; j < numStates; j++) {
            const prob = currentMatrix[i][j];
            if (prob > 0.001) {
                drawTransition(svg, positions[i], positions[j], prob, i === j);
            }
        }
    }

    // Dibujar estados
    for (let i = 0; i < numStates; i++) {
        drawState(svg, positions[i], currentStates[i], i);
    }
}

// Dibujar estado
function drawState(svg, position, label, index) {
    // Círculo del estado
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', position.x);
    circle.setAttribute('cy', position.y);
    circle.setAttribute('r', 25);
    circle.setAttribute('fill', 'rgba(59, 130, 246, 0.3)');
    circle.setAttribute('stroke', '#60a5fa');
    circle.setAttribute('stroke-width', 2);
    circle.setAttribute('class', 'state-node');
    svg.appendChild(circle);

    // Texto del estado
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', position.x);
    text.setAttribute('y', position.y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '12');
    text.setAttribute('font-weight', 'bold');
    text.textContent = `S${index + 1}`;
    svg.appendChild(text);
}

// Dibujar transición
function drawTransition(svg, from, to, probability, isSelfLoop) {
    if (isSelfLoop) {
        drawSelfLoop(svg, from, probability);
        return;
    }

    // Calcular puntos de conexión en el borde de los círculos
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / distance;
    const unitY = dy / distance;

    const startX = from.x + unitX * 25;
    const startY = from.y + unitY * 25;
    const endX = to.x - unitX * 25;
    const endY = to.y - unitY * 25;

    // Línea de transición
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', startX);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', endX);
    line.setAttribute('y2', endY);
    line.setAttribute('stroke', '#60a5fa');
    line.setAttribute('stroke-width', Math.max(1, probability * 3));
    line.setAttribute('class', 'transition-arrow');
    svg.appendChild(line);

    // Etiqueta de probabilidad
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const offsetX = -unitY * 15; // Perpendicular para evitar solapamiento
    const offsetY = unitX * 15;

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', midX + offsetX);
    text.setAttribute('y', midY + offsetY);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#fbbf24');
    text.setAttribute('font-size', '10');
    text.setAttribute('font-weight', 'bold');
    text.textContent = probability.toFixed(2);
    svg.appendChild(text);
}

// Dibujar auto-transición
function drawSelfLoop(svg, position, probability) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const r = 20; // Radio del loop
    const d = `M ${position.x + 25} ${position.y} 
               A ${r} ${r} 0 1 1 ${position.x} ${position.y - 25}`;

    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#60a5fa');
    path.setAttribute('stroke-width', Math.max(1, probability * 3));
    svg.appendChild(path);

    // Etiqueta
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', position.x + 30);
    text.setAttribute('y', position.y - 30);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#fbbf24');
    text.setAttribute('font-size', '10');
    text.setAttribute('font-weight', 'bold');
    text.textContent = probability.toFixed(2);
    svg.appendChild(text);
}

// Mostrar propiedades de la cadena
function displayChainProperties(results) {
    const container = document.getElementById('chainProperties');

    // Determinar si la cadena es irreducible
    const isIrreducible = checkIrreducibility();

    let html = `
        <div class="space-y-3">
            <div class="flex justify-between items-center">
                <span class="text-white">Irreducible:</span>
                <span class="classification-badge ${isIrreducible ? 'recurrent' : 'transient'}">
                    ${isIrreducible ? 'Sí' : 'No'}
                </span>
            </div>
    `;

    if (results.steady_state) {
        html += `
            <div>
                <h4 class="text-white font-medium mb-2">Probabilidades de Estado Estable:</h4>
                <div class="grid grid-cols-2 gap-2">
        `;

        for (const [state, prob] of Object.entries(results.steady_state)) {
            html += `
                <div class="bg-white/5 p-2 rounded">
                    <span class="text-white text-sm">${state}:</span>
                    <span class="text-blue-300 font-mono text-sm">${prob.toFixed(4)}</span>
                </div>
            `;
        }

        html += '</div></div>';
    }

    html += '</div>';
    container.innerHTML = html;
}

// Verificar irreducibilidad
function checkIrreducibility() {
    const numStates = currentStates.length;

    // Una cadena es irreducible si todos los estados se comunican
    for (let i = 0; i < numStates; i++) {
        for (let j = 0; j < numStates; j++) {
            if (i !== j && !statesCommunicate(i, j)) {
                return false;
            }
        }
    }
    return true;
}

// Verificar si dos estados se comunican
function statesCommunicate(i, j) {
    return isAccessible(i, j) && isAccessible(j, i);
}

// Verificar si el estado j es accesible desde i
function isAccessible(i, j, maxSteps = 10) {
    if (i === j) return true;

    for (let n = 1; n <= maxSteps; n++) {
        const pn = matrixPower(currentMatrix, n);
        if (pn[i][j] > 0.001) {
            return true;
        }
    }
    return false;
}

// Calcular matriz en n pasos
function calculateNSteps() {
    const n = parseInt(document.getElementById('nSteps').value);
    const container = document.getElementById('nStepMatrix');

    if (currentMatrix.length === 0) {
        container.innerHTML = '<p class="text-white/60">Configure primero la matriz de transición</p>';
        return;
    }

    const pn = matrixPower(currentMatrix, n);

    let html = `<div class="mb-2"><h4 class="text-white font-medium">P^${n} (Probabilidades en ${n} pasos)</h4></div>`;
    html += '<table class="w-full text-sm">';

    // Encabezados
    html += '<thead><tr><th class="p-1 text-white">P^' + n + '</th>';
    for (let j = 0; j < currentStates.length; j++) {
        html += `<th class="p-1 text-blue-200">${currentStates[j]}</th>`;
    }
    html += '</tr></thead><tbody>';

    // Filas
    for (let i = 0; i < currentStates.length; i++) {
        html += `<tr><td class="p-1 text-blue-200 font-medium">${currentStates[i]}</td>`;
        for (let j = 0; j < currentStates.length; j++) {
            html += `<td class="p-1 text-center text-white font-mono">${pn[i][j].toFixed(4)}</td>`;
        }
        html += '</tr>';
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Cargar problema guardado
async function loadProblem(problemId) {
    try {
        const response = await fetch(`/markov/load/${problemId}`);
        const data = await response.json();

        document.getElementById('problemName').value = data.name;
        document.getElementById('numStates').value = data.states.length;

        currentStates = data.states;
        document.getElementById('stateNames').value = currentStates.join(', ');

        generateMatrix();

        // Llenar matriz con datos cargados
        for (let i = 0; i < data.states.length; i++) {
            for (let j = 0; j < data.states.length; j++) {
                document.getElementById(`cell_${i}_${j}`).value = data.transition_matrix[i][j];
                currentMatrix[i][j] = data.transition_matrix[i][j];
            }
            validateRow(i);
        }

        document.getElementById('nSteps').value = data.n_steps;

    } catch (error) {
        console.error('Error cargando problema:', error);
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    generateMatrix();
});
let editor;
let pyodide;

require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

require(['vs/editor/editor.main'], async function () {
    editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: 'import numpy as np\n\nX = np.array([1, 2, 3])\nprint(f"Data: {X}")\nprint("System Ready.")',
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false }
    });

    pyodide = await loadPyodide();
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('run-btn').disabled = false;
    document.getElementById('output').innerText = "READY.";
});

document.getElementById('run-btn').addEventListener('click', async () => {
    const out = document.getElementById('output');
    out.innerText = "EXECUTING...";
    try {
        await pyodide.loadPackage(['numpy', 'scikit-learn']);
        pyodide.setStdout({ batched: (msg) => { out.innerText += "\n" + msg; } });
        await pyodide.runPythonAsync(editor.getValue());
    } catch (err) {
        out.innerText += "\nERROR: " + err.message;
    }
});

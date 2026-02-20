let editor;
let pyodide;

require.config({ 
    paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } 
});

window.MonacoEnvironment = {
    getWorkerUrl: function(workerId, label) {
        return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = { baseUrl: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' };
            importScripts('https://unpkg.com/monaco-editor@0.44.0/min/vs/base/worker/workerMain.js');`
        )}`;
    }
};

require(['vs/editor/editor.main'], async function () {
    editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: 'import numpy as np\n\nprint("SYSTEM READY.")',
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false }
    });

    try {
        pyodide = await loadPyodide();
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('run-btn').disabled = false;
        document.getElementById('output').innerText = "READY.";
    } catch (err) {
        document.getElementById('output').innerText = "PYODIDE LOAD ERROR: " + err.message;
    }
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

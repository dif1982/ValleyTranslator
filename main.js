let xmlDoc;

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const parser = new DOMParser();
            xmlDoc = parser.parseFromString(e.target.result, "text/xml");
            loadEntries();
        };
        reader.readAsText(file);
    }
});

function highlightCodes(text) {
    return text.replace(/(&lt;.*?&gt;)/g, '<span class="blue">$1</span>');
}

function loadEntries() {
    const container = document.getElementById('entries');
    container.innerHTML = '';
    const values = xmlDoc.getElementsByTagName('value');
    
    Array.from(values).forEach((value, index) => {
        const textWithCodes = value.innerHTML;
        const dataElement = value.closest('data');
        const nameAttribute = dataElement ? dataElement.getAttribute('name') : 'XML HEADERS';
        
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('entry');

        // Label do campo original
        const indexLabel = document.createElement('div');
        indexLabel.classList.add('index-label');
        indexLabel.textContent = index + 1;
        
        const textContainerOriginal = document.createElement('div');
        textContainerOriginal.classList.add('text-container');
        
        // Exibir atributo name dentro do textContainerOriginal
        const nameLabel = document.createElement('div');
        nameLabel.classList.add('name-label');
        nameLabel.textContent = nameAttribute;
        textContainerOriginal.appendChild(nameLabel);
        
        const styledTextOriginal = document.createElement('div');
        styledTextOriginal.classList.add('styled-text', 'readonly');
        styledTextOriginal.innerHTML = highlightCodes(textWithCodes);
        textContainerOriginal.appendChild(styledTextOriginal);

        const copyButton = document.createElement('button');
        copyButton.textContent = '⮕';
        copyButton.classList.add('copy-btn');
        copyButton.title = 'Copy Text';
        
        const textContainerTranslation = document.createElement('div');
        textContainerTranslation.classList.add('text-container', 'translate');
        const translationDiv = document.createElement('div');
        translationDiv.classList.add('styled-text');
        
        translationDiv.contentEditable = index >= 4;
        translationDiv.dataset.index = index;
        textContainerTranslation.appendChild(translationDiv);
        
        if (index < 4) {
            translationDiv.innerHTML = highlightCodes(textWithCodes);
        }
        
        copyButton.addEventListener('click', () => {
            translationDiv.innerHTML = styledTextOriginal.innerHTML;
        });
        
        entryDiv.appendChild(indexLabel);
        entryDiv.appendChild(textContainerOriginal);
        entryDiv.appendChild(copyButton);
        entryDiv.appendChild(textContainerTranslation);
        container.appendChild(entryDiv);
    });
}

document.getElementById('saveBtn').addEventListener('click', function() {
    const entries = document.querySelectorAll('#entries .entry .text-container:not(.readonly) .styled-text');
    const values = xmlDoc.getElementsByTagName('value');
    
    entries.forEach(entry => {
        const index = entry.dataset.index;
        if (index !== undefined && values[index]) {
            // Get the HTML content and strip HTML tags while preserving XML entities
            let content = entry.innerHTML;
            
            // Remove HTML span tags used for highlighting
            content = content.replace(/<span class="blue">(.*?)<\/span>/g, '$1');
            
            // Remove any other HTML tags but preserve XML entities
            content = content.replace(/<[^>]+>/g, '');
            
            // Decode HTML entities except XML entities
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            content = tempDiv.textContent;
            
            // Re-encode < and > as XML entities if they're not already encoded
            content = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            // Set the cleaned content back to the XML document
            values[index].innerHTML = content.trim() || values[index].innerHTML;
        }
    });
    downloadModifiedXML();
});

function downloadModifiedXML() {
    const serializer = new XMLSerializer();
    const xmlString = serializer.serializeToString(xmlDoc);
    const blob = new Blob([xmlString], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.getElementById('downloadLink');
    link.href = url;
    link.download = 'traduzido.xml';
    link.textContent = 'Baixar XML Modificado';
    
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

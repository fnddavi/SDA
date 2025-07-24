// Gerenciamento de contatos

let currentEditingContact = null;

// Carrega todos os contatos
async function loadContacts() {
    try {
        UI.showLoading();
        const response = await API.getContacts();
        
        if (response.success) {
            appState.setContacts(response.data);
            renderContacts(response.data);
            updateContactsCount(response.data.length);
        } else {
            UI.showToast('Erro ao carregar contatos', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar contatos:', error);
        UI.showToast('Erro ao carregar contatos', 'error');
    } finally {
        UI.hideLoading();
    }
}

// Renderiza lista de contatos
function renderContacts(contacts) {
    const contactsList = document.getElementById('contactsList');
    
    if (!contacts || contacts.length === 0) {
        contactsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-address-book"></i>
                <h3>Nenhum contato encontrado</h3>
                <p>Clique em "Novo Contato" para adicionar seu primeiro contato.</p>
            </div>
        `;
        return;
    }

    contactsList.innerHTML = contacts.map(contact => `
        <div class="contact-item" data-contact-id="${contact.id}">
            <div class="contact-info">
                <div class="contact-name">${escapeHtml(contact.name)}</div>
                <div class="contact-details">
                    ${contact.email ? `<span><i class="fas fa-envelope"></i> ${escapeHtml(contact.email)}</span>` : ''}
                    ${contact.phone ? `<span><i class="fas fa-phone"></i> ${escapeHtml(contact.phone)}</span>` : ''}
                    ${contact.address ? `<span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(contact.address)}</span>` : ''}
                </div>
            </div>
            <div class="contact-actions">
                <button onclick="editContact('${contact.id}')" class="btn btn-secondary">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button onclick="deleteContact('${contact.id}')" class="btn btn-danger">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `).join('');
}

// Atualiza contador de contatos
function updateContactsCount(count) {
    const countElement = document.getElementById('contactsCount');
    countElement.textContent = `${count} ${count === 1 ? 'contato' : 'contatos'}`;
}

// Mostra modal para novo contato
function showAddContactModal() {
    currentEditingContact = null;
    document.getElementById('modalTitle').textContent = 'Novo Contato';
    UI.clearForm('contactForm');
    document.getElementById('contactModal').classList.add('active');
}

// Edita contato existente
async function editContact(contactId) {
    try {
        UI.showLoading();
        const response = await API.getContact(contactId);
        
        if (response.success) {
            currentEditingContact = contactId;
            document.getElementById('modalTitle').textContent = 'Editar Contato';
            UI.setFormData('contactForm', response.data);
            document.getElementById('contactModal').classList.add('active');
        } else {
            UI.showToast('Erro ao carregar contato', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar contato:', error);
        UI.showToast('Erro ao carregar contato', 'error');
    } finally {
        UI.hideLoading();
    }
}

// Fecha modal de contato
function closeContactModal() {
    document.getElementById('contactModal').classList.remove('active');
    currentEditingContact = null;
    UI.clearForm('contactForm');
}

// Manipulador de submissão do formulário de contato
async function handleContactSubmit(event) {
    event.preventDefault();
    UI.showLoading();

    try {
        const formData = new FormData(event.target);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email') || undefined,
            phone: formData.get('phone') || undefined,
            address: formData.get('address') || undefined,
            notes: formData.get('notes') || undefined
        };

        // Remove campos vazios
        Object.keys(contactData).forEach(key => {
            if (contactData[key] === '' || contactData[key] === undefined) {
                delete contactData[key];
            }
        });

        let response;
        if (currentEditingContact) {
            // Atualiza contato existente
            response = await API.updateContact(currentEditingContact, contactData);
            if (response.success) {
                UI.showToast('Contato atualizado com sucesso!', 'success');
                appState.updateContact(currentEditingContact, contactData);
            }
        } else {
            // Cria novo contato
            response = await API.createContact(contactData);
            if (response.success) {
                UI.showToast('Contato criado com sucesso!', 'success');
                // Recarrega a lista para obter o ID correto
                await loadContacts();
            }
        }

        if (response.success) {
            closeContactModal();
            if (!currentEditingContact) {
                // Se foi criação, recarrega a lista
                await loadContacts();
            } else {
                // Se foi edição, re-renderiza com os dados atuais
                renderContacts(appState.contacts);
            }
        } else {
            UI.showToast(response.message || 'Erro ao salvar contato', 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar contato:', error);
        UI.showToast(error.message || 'Erro ao salvar contato', 'error');
    } finally {
        UI.hideLoading();
    }
}

// Deleta contato
async function deleteContact(contactId) {
    if (!confirm('Tem certeza que deseja excluir este contato?')) {
        return;
    }

    try {
        UI.showLoading();
        const response = await API.deleteContact(contactId);
        
        if (response.success) {
            UI.showToast('Contato excluído com sucesso!', 'success');
            appState.removeContact(contactId);
            renderContacts(appState.contacts);
            updateContactsCount(appState.contacts.length);
        } else {
            UI.showToast('Erro ao excluir contato', 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir contato:', error);
        UI.showToast('Erro ao excluir contato', 'error');
    } finally {
        UI.hideLoading();
    }
}

// Busca contatos
async function searchContacts() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();

    if (!query) {
        // Se não há busca, mostra todos os contatos
        renderContacts(appState.contacts);
        return;
    }

    try {
        UI.showLoading();
        const response = await API.searchContacts(query);
        
        if (response.success) {
            renderContacts(response.data);
            updateContactsCount(response.data.length);
        } else {
            UI.showToast('Erro na busca', 'error');
        }
    } catch (error) {
        console.error('Erro na busca:', error);
        UI.showToast('Erro na busca', 'error');
    } finally {
        UI.hideLoading();
    }
}

// Limpa busca
function clearSearch() {
    document.getElementById('searchInput').value = '';
    renderContacts(appState.contacts);
    updateContactsCount(appState.contacts.length);
}

// Utilitário para escapar HTML
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Carrega estatísticas de contatos
async function loadContactStats() {
    try {
        const response = await API.getContactStats();
        if (response.success) {
            updateContactsCount(response.data.totalContacts);
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

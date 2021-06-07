const FORMS = {
    getForm(name) {
        return document.querySelector(`[form="${name}"]`);
    },
    getForms() {
        return [...document.querySelectorAll('[form]')]
    },
    ensureIsElement(nameOrElement) {
        if (typeof (nameOrElement) === 'string') {
            nameOrElement = this.getForm(nameOrElement);
        }
        if (nameOrElement instanceof HTMLElement && nameOrElement.hasAttribute('form')) {
            return nameOrElement;
        } else {
            throw 'Invalid form name or element';
        }
    },
    register(nameOrElement, formSubmitHandler) {
        const element = this.ensureIsElement(nameOrElement);
        element.formSubmitHandler = formSubmitHandler;
    },
    clearDisplay(nameOrElement) {
        const element = this.ensureIsElement(nameOrElement);
        const messages = element.querySelector('[formMessages]');
        if (messages) {
            while (messages.lastChild) messages.lastChild.remove();
        }
    },
    display(nameOrElement, message, type, clear = true) {
        const element = this.ensureIsElement(nameOrElement);
        const messages = element.querySelector('[formMessages]');
        if (!messages) {
            console.warn('Attempted to display form message without display element');
            return;
        }
        if (clear) this.clearDisplay(element);
        const messageElement = document.createElement('span');
        messageElement.classList.add(type);
        messageElement.innerText = message;
        messages.appendChild(messageElement);
    },
    load() {
        for (const form of this.getForms()) {
            form.onsubmit = () => {
                if (form.formSubmitHandler) {
                    const formData = {};
                    new FormData(form).forEach((value, key) => {
                        if (!(key in formData)) {
                            formData[key] = value;
                        } else {
                            if (Array.isArray(formData[key])) {
                                formData[key].push(value);
                            } else {
                                const existingValue = formData[key];
                                formData[key] = [existingValue, value];
                            }
                        }
                    });
                    try {
                        const result = form.formSubmitHandler(formData);
                        if (result instanceof Promise) {
                            form.classList.add('waiting');
                            result.then(result => {
                                if (result) {
                                    form.reset();
                                    this.clearDisplay(form);
                                }
                            }).catch(console.error).finally(() => {
                                form.classList.remove('waiting');
                            });
                        } else {
                            if (result) {
                                form.reset();
                                this.clearDisplay(form);
                            }
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
                return false;
            };
        }
    }
};
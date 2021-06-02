const PAGES = {
    currentPage: null,
    getCurrentPageName() {
        return this.currentPage.getAttribute('page');
    },
    getCurrentPage() {
        return this.currentPage;
    },
    getPage(name) {
        return document.querySelector(`[page="${name}"]`);
    },
    getPages() {
        return [...document.querySelectorAll(`[page]`)];
    },
    ensureIsElement(nameOrElement) {
        if (typeof (nameOrElement) === 'string') {
            return this.getPage(nameOrElement);
        } else if (nameOrElement instanceof HTMLElement && nameOrElement.hasAttribute('page')) {
            return nameOrElement;
        } else {
            throw 'Invalid page name or element';
        }
    },
    setPage(nameOrElement) {
        if (this.currentPage) {
            this.currentPage.removeAttribute('active');
        }
        this.currentPage = this.ensureIsElement(nameOrElement);
        if (this.currentPage) {
            this.currentPage.setAttribute('active', '');
            const name = this.currentPage.getAttribute('page');
            history.pushState(null, name, name);
        } else {
            console.warn(`Page "${nameOrElement}" does not exist`);
        }
    },
    resetPageForms(nameOrElement) {
        const element = this.ensureIsElement(nameOrElement);
        const forms = element.querySelectorAll('form');
        for (const form of forms) {
            form.reset();
        }
    },
    updatePageLinks() {
        const pageLinks = document.querySelectorAll('[page-link]');
        for (const pageLink of pageLinks) {
            pageLink.onclick = () => this.setPage(pageLink.getAttribute('page-link'));
        }
    },
    load() {
        const desiredPageName = window.location.pathname.substring(1);
        this.setPage(desiredPageName);
        this.updatePageLinks();
    }

};
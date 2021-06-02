const TABS = {
    getTabContainer(name) {
        return document.querySelector(`[tab-container="${name}"]`);
    },
    getTabContainers() {
        return document.querySelectorAll('[tab-container]');
    },
    ensureIsContainerElement(containerNameOrElement) {
        if (typeof (containerNameOrElement) === 'string') {
            return this.getTabContainer(containerNameOrElement);
        } else if (containerNameOrElement instanceof HTMLElement && containerNameOrElement.hasAttribute('tab-container')) {
            return containerNameOrElement;
        } else {
            throw 'Invalid form name or element';
        }
    },
    getTabs(containerNameOrElement) {
        const containerElement = this.ensureIsContainerElement(containerNameOrElement);
        return [...containerElement.querySelectorAll('[tab]')];
    },
    getTab(containerNameOrElement, tabName) {
        const containerElement = this.ensureIsContainerElement(containerNameOrElement);
        return containerElement.querySelector(`[tab="${tabName}"]`);
    },
    setTab(containerNameOrElement, tabName) {
        const containerElement = this.ensureIsContainerElement(containerNameOrElement);

        if (containerElement.activeTab) containerElement.activeTab.removeAttribute('active');
        containerElement.activeTab = this.getTab(containerElement, tabName);
        if (containerElement.activeTab) {
            containerElement.activeTab.setAttribute('active', '');

            if (containerElement.activeTabButton) containerElement.activeTabButton.removeAttribute('active');
            containerElement.activeTabButton = containerElement.querySelector(`[tab-button="${tabName}"]`);
            containerElement.activeTabButton.setAttribute('active', '');
        } else {
            console.warn(`No tab named "${tabName}" in "${containerElement.getAttribute('tab-container')}"`);
        }
    },
    load() {
        for (const container of this.getTabContainers()) {
            const tabBar = container.querySelector('[tab-bar]');
            if (tabBar) {
                for (const tab of this.getTabs(container)) {
                    const tabName = tab.getAttribute('tab');
                    const button = document.createElement('button');
                    button.innerText = tabName;
                    button.onclick = () => this.setTab(container, tabName);
                    button.setAttribute('tab-button', tabName);
                    tabBar.appendChild(button);
                }
            }

            let activeTab = container.querySelector(`[tab][active]`);
            if (!activeTab) {
                activeTab = container.querySelector('[tab]');
            }
            if (activeTab) {
                this.setTab(container, activeTab.getAttribute('tab'));
            }
        }
    }
};
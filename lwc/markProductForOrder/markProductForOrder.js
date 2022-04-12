import { LightningElement, api, wire, track } from 'lwc';
import getRelatedFulfillmentLocations from '@salesforce/apex/PicklistOptionsController.getRelatedFulfillmentLocations';
import getRelatedContacts from '@salesforce/apex/PicklistOptionsController.getRelatedContacts';
import getOrders from '@salesforce/apex/FetchRecordLists.getOrders';
import { FlowNavigationNextEvent, FlowNavigationBackEvent } from 'lightning/flowSupport';
const DELAY = 300;

export default class MarkProductForOrder extends LightningElement {
    @api availableActions = [];
    @api locationId;
    @api contactId;
    @api accountId;
    @api orderId;
    @api value = 'existing';

    @track locations = [];
    @track data = [];
    @track relatedContacts = [];

    totalRecords;
    rowLimit = 5;
    rowOffSet = 0;
    error;
    isLoading;
    queryTerm = '';

    async handleKeyChange(event) {
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.queryTerm = searchKey;
        }, DELAY);
        if (this.queryTerm.length >= 2) {
            this.totalRecords = 0;
            this.isLoading = true;
            this.rowLimit = 5;
            this.rowOffSet = 0;
            await this.loadData([]).then(() => {
                this.isLoading = false;
            });
        }
    }

    connectedCallback() {
        try {
            this.isLoading = true;
            this.loadData([]).then(() => {
                this.isLoading = false;
            });
        } catch (error) {
            console.error(error);
        }
    }

    get options() {
        return [
            { label: 'Link an existing Order', value: 'existing' },
            { label: 'Create New', value: 'new' },
        ];
    }

    @wire(getRelatedFulfillmentLocations, { accId: '$accountId' }) wiredLocations({ data, error }) {
        this.locations = [];
        if (data) {
            if (data && data.length) {
                for (let i = 0; i < data.length; i++) {
                    this.locations.push({ 'label': data[i].Name, 'value': data[i].Id });
                }
            }
            else {
                this.locations.push({ 'label': 'None', 'value': '' });
            }
        } else if (error) {
            this.locations.push({ 'label': 'None', 'value': '' });
            console.error(error);
        }
    }

    @wire(getRelatedContacts, { accId: '$accountId' }) wiredContacts({ data, error }) {
        this.relatedContacts = [];
        if (data) {
            if (data && data.length) {
                for (let i = 0; i < data.length; i++) {
                    this.relatedContacts.push({ 'label': data[i].Name, 'value': data[i].Id });
                }
            } else {
                this.relatedContacts.push({ 'label': 'None', 'value': '' });
            }
        } else if (error) {
            this.relatedContacts.push({ 'label': 'None', 'value': '' });
            console.error(error);
        }
    }

    get isNew() {
        return this.value === 'new'
    }

    get isExisting() {
        return this.value === 'existing'
    }

    get getNextButton() {
        return this.accountId ? false : true;
    }

    handleChange(event) {
        if (event.target.dataset.label === 'location')
            this.locationId = event.detail.value;
        else if (event.target.dataset.label === 'contact')
            this.contactId = event.detail.value;
        else if (event.target.dataset.label === 'radioGroup') {
            this.value = event.detail.value;
            this.locationId = '';
            this.contactId = '';
        }
    }

    handleSelected(event) {
        let detail = event.detail;
        this[detail.label] = detail.value ? detail.value[0] : '';
    }

    loadMore(event) {
        const { target } = event;
        target.isLoading = true;
        this.rowOffSet = this.rowOffSet + this.rowLimit;
        this.loadData(this.data)
            .then(() => {
                target.isLoading = false;
            });
    }

    loadData(data) {
        return getOrders({
            queryTerm: this.queryTerm,
            limitSize: this.rowLimit,
            offset: this.rowOffSet
        }).then(result => {
            let newData = result.records.map(row => { return { ...row, AccountName: row.Account?.Name, checked: row.Id == this.orderId ? true : false } });
            this.data = [...data, ...newData];
            this.totalRecords = result.totalRecords;
            this.error = undefined;
        }).catch(error => {
            this.error = error;
            this.data = undefined;
        });
    }

    get loadMoreButton() {
        return this.totalRecords > (this.data && this.data.length);
    }

    handleRadioChange(event) {
        this.orderId = event.target.dataset.value;
        this.accountId = event.target.dataset.id;
    }

    handleGoNext() {
        // check if NEXT is allowed on this screen
        if (this.availableActions.find((action) => action === 'NEXT')) {
            // navigate to the next screen
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }

    handleGoBack() {
        if (this.availableActions.find((action) => action === 'BACK')) {
            // navigate to the next screen
            const navigateBackEvent = new FlowNavigationBackEvent();
            this.dispatchEvent(navigateBackEvent);
        }
    }

}